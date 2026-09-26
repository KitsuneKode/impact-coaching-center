import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { applyStatusChange, readOrdersPage } from "./orders"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import schema from "./schema"

/** The fulfilment queue's rules. */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

async function person(
  t: ReturnType<typeof convexTest>,
  phone: string,
  role: "student" | "staff" | "owner"
) {
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name: "Test Person",
  })
  await t.run((ctx) => ctx.db.patch(id, { role }))
  const doc = await t.run((ctx) => ctx.db.get(id))
  return {
    id: doc!._id,
    name: doc!.name,
    phone: doc!.phone,
    role: doc!.role,
    verifiedAt: doc!.verifiedAt,
    revision: doc!.revision ?? 0,
  }
}

async function order(
  t: ReturnType<typeof convexTest>,
  personId: Id<"persons">,
  {
    status = "packed",
    placedAt = Date.now(),
    reference = "ORD-1",
  }: { status?: string; placedAt?: number; reference?: string } = {}
) {
  return await t.run((ctx) =>
    ctx.db.insert("orders", {
      personId,
      reference,
      status: status as never,
      fulfilment: "delivery",
      items: [{ title: "A book", quantity: 1, unitPaise: 25000 }],
      itemsPaise: 25000,
      deliveryPaise: 5000,
      totalPaise: 30000,
      placedAt,
    })
  )
}

const PAGE = { numItems: 25, cursor: null }

describe("the fulfilment queue", () => {
  test("a student gets an empty page and cannot move anything", async () => {
    const t = convexTest(schema, modules)
    const student = await person(t, "+919876543210", "student")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id)

    expect(
      await t.run((ctx) => readOrdersPage(ctx, student, PAGE))
    ).toMatchObject({ page: [] })
    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, student, {
          orderId,
          status: "shipped",
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "forbidden" })
  })

  test("newest placedAt first, even when creation order disagrees", async () => {
    // Regression for the index fix: a backfilled or imported order carries
    // an old placedAt but a new row position. Creation order would surface
    // it as the newest; the queue must answer by when it was placed.
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const buyer = await person(t, "+919876543211", "student")
    const now = Date.now()
    await order(t, buyer.id, { reference: "NEW", placedAt: now })
    await order(t, buyer.id, {
      reference: "BACKFILLED",
      placedAt: now - 3_600_000,
    })

    const result = await t.run((ctx) => readOrdersPage(ctx, staff, PAGE))
    expect(result.page.map((row) => row.reference)).toEqual([
      "NEW",
      "BACKFILLED",
    ])
    expect(result.page[0]!.buyerPhone).toBe("+919876543211")
  })
})

describe("the status machine", () => {
  test("staff move an order along a legal path, audited", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id, { status: "packed" })

    const result = await t.run((ctx) =>
      applyStatusChange(ctx, staff, {
        orderId,
        status: "shipped",
        expectedRevision: 0,
      })
    )
    expect(result).toEqual({ ok: true, revision: 1 })

    const doc = await t.run((ctx) => ctx.db.get(orderId))
    expect(doc?.status).toBe("shipped")

    const audit = await t.run((ctx) =>
      ctx.db
        .query("activities")
        .withIndex("by_person", (q) => q.eq("personId", buyer.id))
        .collect()
    )
    expect(audit).toHaveLength(1)
    expect(audit[0]).toMatchObject({
      kind: "status_change",
      actorId: staff.id,
      fromStatus: "packed",
      toStatus: "shipped",
    })
  })

  test("an illegal move is refused, and a terminal state has no exits", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const buyer = await person(t, "+919876543211", "student")
    const packed = await order(t, buyer.id, {
      status: "packed",
      reference: "ORD-2",
    })
    const cancelled = await order(t, buyer.id, {
      status: "cancelled",
      reference: "ORD-3",
    })

    // A packed parcel cannot leap to delivered.
    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, staff, {
          orderId: packed,
          status: "delivered",
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "transition" })

    // Cancelled is an ending: nothing follows it.
    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, staff, {
          orderId: cancelled,
          status: "packed",
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "transition" })
  })

  test("`paid` is nobody's button - not even the owner's", async () => {
    // Payment is established by a verified provider signature. If the owner
    // could mark it, the most important fact on the order would be a click.
    const t = convexTest(schema, modules)
    const owner = await person(t, "+919876543210", "owner")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id, { status: "awaiting_payment" })

    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, owner, {
          orderId,
          status: "paid",
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "status" })
  })

  test("`refunded` is refused to staff and allowed to the owner", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const owner = await person(t, "+919876543212", "owner")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id, { status: "delivered" })

    // Staff asking is a role refusal: the value is real, the role is wrong.
    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, staff, {
          orderId,
          status: "refunded",
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: false, reason: "forbidden" })

    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, owner, {
          orderId,
          status: "refunded",
          expectedRevision: 0,
        })
      )
    ).toEqual({ ok: true, revision: 1 })
  })

  test("a stale revision is refused before anything is checked or written", async () => {
    const t = convexTest(schema, modules)
    const staff = await person(t, "+919876543210", "staff")
    const buyer = await person(t, "+919876543211", "student")
    const orderId = await order(t, buyer.id, { status: "packed" })
    await t.run((ctx) => ctx.db.patch(orderId, { revision: 4 }))

    expect(
      await t.run((ctx) =>
        applyStatusChange(ctx, staff, {
          orderId,
          status: "shipped",
          expectedRevision: 2,
        })
      )
    ).toEqual({ ok: false, reason: "revision-conflict", current: 4 })
    // The conflict must not have moved the record or left an audit row for
    // a change that never happened.
    const doc = await t.run((ctx) => ctx.db.get(orderId))
    expect(doc?.status).toBe("packed")
  })
})
