import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { eraseAccount } from "./account"
import { findVerifiedPerson } from "./persons"
import { applyQuestionnaire } from "./profile"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import schema from "./schema"

const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

const PHONE = "+919876543210"

async function setup(role: "student" | "staff" | "owner" = "student") {
  const t = convexTest(schema, modules)
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone: PHONE,
    name: "Anjali Gogoi",
  })
  await t.run((ctx) =>
    ctx.db.patch(id, {
      role,
      leadStatus: "interested",
      lastEnquiryAt: Date.now(),
      interestTrack: "APSC",
      questionnaire: { targetExam: "APSC", attempt: "repeat" },
    })
  )
  const viewer = await t.run((ctx) =>
    findVerifiedPerson(ctx, { phoneNumber: PHONE, phoneNumberVerified: true })
  )
  if (!viewer) throw new Error("fixture Person not found")
  return { t, id, viewer }
}

async function order(
  t: ReturnType<typeof convexTest>,
  personId: Id<"persons">,
  status: "paid" | "delivered" | "cancelled" | "awaiting_payment"
) {
  return t.run(async (ctx) =>
    ctx.db.insert("orders", {
      personId,
      reference: `ICT-${status}`,
      status,
      fulfilment: "delivery",
      contact: { name: "Asha", phone: "+919876543210" },
      lines: [
        {
          bundleId: await ctx.db.insert("bundles", {
            slug: "gk-set",
            exam: "ADRE",
            title: { en: "GK set" },
            description: { en: "" },
            bookIds: [],
            variants: {
              en: { pricePaise: 25000, available: true },
              as: { pricePaise: 25000, available: true },
            },
            soldCount: 0,
            sortOrder: 0,
            published: true,
            revision: 0,
            updatedAt: 0,
          }),
          slug: "gk-set",
          title: "GK set",
          language: "en",
          books: ["Assam GK"],
          quantity: 1,
          unitPaise: 25000,
        },
      ],
      itemsPaise: 25000,
      deliveryPaise: 6000,
      totalPaise: 31000,
      address: { line1: "Ward 3", city: "North Lakhimpur", pin: "787001" },
      placedAt: Date.now(),
    })
  )
}

describe("account deletion", () => {
  test("erases the Person, keeps a tombstone, and records it", async () => {
    const { t, id, viewer } = await setup()
    await t.run((ctx) =>
      ctx.db.insert("activities", {
        personId: id,
        kind: "note",
        body: "Wants the night batch, call after 7",
      })
    )

    const result = await t.run((ctx) => eraseAccount(ctx, viewer, "DELETE"))
    expect(result.ok).toBe(true)

    const tomb = await t.run((ctx) => ctx.db.get(id))
    expect(tomb?.phone).toBe(`deleted:${id}`)
    expect(tomb?.name).toBe("")
    expect(tomb?.deletedAt).toBeNumber()
    expect(tomb?.verifiedAt).toBeUndefined()
    expect(tomb?.leadStatus).toBeUndefined()
    expect(tomb?.lastEnquiryAt).toBeUndefined()
    expect(tomb?.questionnaire).toBeUndefined()

    const rows = await t.run((ctx) =>
      ctx.db
        .query("activities")
        .withIndex("by_person", (q) => q.eq("personId", id))
        .collect()
    )
    expect(rows.every((row) => row.body === undefined)).toBe(true)
    const audit = await t.run((ctx) =>
      ctx.db
        .query("auditLog")
        .withIndex("by_action", (q) => q.eq("action", "account_deleted"))
        .collect()
    )
    expect(audit.some((row) => row.entityId === id)).toBe(true)
  })

  test("the number signs up again as a new Person", async () => {
    const { t, id, viewer } = await setup()
    await t.run((ctx) => eraseAccount(ctx, viewer, "DELETE"))

    const again = await t.mutation(internal.persons.recordVerifiedPerson, {
      phone: PHONE,
      name: "",
    })
    expect(again).not.toBe(id)
  })

  test("refuses without the typed confirmation", async () => {
    const { t, id, viewer } = await setup()
    const result = await t.run((ctx) => eraseAccount(ctx, viewer, "delete me"))
    expect(result).toMatchObject({ ok: false, field: "confirmation" })
    expect((await t.run((ctx) => ctx.db.get(id)))?.phone).toBe(PHONE)
  })

  test("refuses staff and owners", async () => {
    for (const role of ["staff", "owner"] as const) {
      const { t, viewer } = await setup(role)
      const result = await t.run((ctx) => eraseAccount(ctx, viewer, "DELETE"))
      expect(result).toMatchObject({ ok: false, reason: "forbidden" })
    }
  })

  test("waits while an order is still moving", async () => {
    const { t, id, viewer } = await setup()
    await order(t, id, "paid")
    const result = await t.run((ctx) => eraseAccount(ctx, viewer, "DELETE"))
    expect(result).toMatchObject({ ok: false, field: "orders-in-progress" })
  })

  test("keeps finished orders without the address", async () => {
    const { t, id, viewer } = await setup()
    const orderId = await order(t, id, "delivered")
    await t.run((ctx) => eraseAccount(ctx, viewer, "DELETE"))

    const kept = await t.run((ctx) => ctx.db.get(orderId))
    expect(kept?.totalPaise).toBe(31000)
    expect(kept?.address).toBeUndefined()
    expect(kept?.contact).toEqual({ name: "", phone: "" })
  })
})

describe("account deletion and unpaid orders", () => {
  test("an order still awaiting payment is cancelled, so a late payment is refunded", async () => {
    const { t, id, viewer } = await setup()
    const orderId = await order(t, id, "awaiting_payment")
    await t.run((ctx) =>
      ctx.db.insert("carts", {
        personId: id,
        lines: [{ slug: "gk-set", language: "en", quantity: 1, at: 1 }],
        updatedAt: 0,
      })
    )
    await t.run((ctx) => eraseAccount(ctx, viewer, "DELETE"))
    const cancelled = await t.run((ctx) => ctx.db.get(orderId))
    expect(cancelled?.status).toBe("cancelled")
    // Cancelled, not expired: a payment that still arrives is not revived.
    expect(cancelled?.expiredAt).toBeUndefined()
    const carts = await t.run((ctx) => ctx.db.query("carts").collect())
    expect(carts).toHaveLength(0)
  })

  test("the name given with each enquiry goes with the account", async () => {
    const { t, id, viewer } = await setup()
    await t.run((ctx) =>
      ctx.db.insert("enquiries", {
        personId: id,
        channel: "website",
        name: "Anjali's brother",
        referrer: "https://facebook.com/",
      })
    )
    await t.run((ctx) => eraseAccount(ctx, viewer, "DELETE"))
    const [kept] = await t.run((ctx) => ctx.db.query("enquiries").collect())
    expect(kept?.name).toBeUndefined()
    expect(kept?.referrer).toBeUndefined()
    expect(kept?.channel).toBe("website")
  })
})

describe("onboarding questionnaire", () => {
  test("saves known answers and refuses an unknown one", async () => {
    const { t, id, viewer } = await setup()
    const saved = await t.run((ctx) =>
      applyQuestionnaire(ctx, viewer, {
        targetExam: "APSC",
        attempt: "first",
        preferredBatch: "Night",
        skip: false,
        expectedRevision: viewer.revision,
      })
    )
    expect(saved.ok).toBe(true)
    const person = await t.run((ctx) => ctx.db.get(id))
    expect(person?.questionnaire).toMatchObject({
      targetExam: "APSC",
      attempt: "first",
      preferredBatch: "Night",
    })

    const refused = await t.run((ctx) =>
      applyQuestionnaire(ctx, viewer, {
        targetExam: "UPSC Moon Mission",
        skip: false,
        expectedRevision: saved.ok ? saved.revision : 0,
      })
    )
    expect(refused).toMatchObject({ ok: false, field: "answers" })
  })

  test("skipping keeps earlier answers and records the skip", async () => {
    const { t, id, viewer } = await setup()
    const result = await t.run((ctx) =>
      applyQuestionnaire(ctx, viewer, {
        skip: true,
        expectedRevision: viewer.revision,
      })
    )
    expect(result.ok).toBe(true)
    const person = await t.run((ctx) => ctx.db.get(id))
    expect(person?.questionnaire?.targetExam).toBe("APSC")
    expect(person?.questionnaire?.skippedAt).toBeNumber()
  })

  test("a stale screen gets a conflict, not an overwrite", async () => {
    const { t, viewer } = await setup()
    const result = await t.run((ctx) =>
      applyQuestionnaire(ctx, viewer, {
        targetExam: "APSC",
        skip: false,
        expectedRevision: viewer.revision - 1,
      })
    )
    expect(result).toMatchObject({ ok: false, reason: "revision-conflict" })
  })
})
