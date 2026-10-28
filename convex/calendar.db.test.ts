import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import type { ExamDateInput } from "../lib/calendar"
import { readCalendar } from "./calendar"
import { applyDatePublished, applySaveDate } from "./calendarAdmin"
import { internal } from "./_generated/api"
import { findVerifiedPerson } from "./persons"
import schema from "./schema"

/** The owner-edited exam calendar and its public face. */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

type T = ReturnType<typeof convexTest>

async function viewer(
  t: T,
  phone: string,
  role: "student" | "staff" | "owner"
) {
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name: "Test Person",
  })
  await t.run((ctx) => ctx.db.patch(id, { role }))
  return t.run((ctx) =>
    findVerifiedPerson(ctx, { phoneNumber: phone, phoneNumberVerified: true })
  )
}

const fields: ExamDateInput = {
  exam: "adre",
  kind: "exam",
  title: "Grade III, graduate level",
  titleAs: "",
  starts: "2026-11-15",
  ends: "",
  tentative: true,
  source: "https://slrcg3.sebaonline.org",
}

describe("editing dates", () => {
  test("only the owner saves; staff are refused", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    const staff = await viewer(t, "+919876700002", "staff")
    expect(await t.run((ctx) => applySaveDate(ctx, owner!, fields))).toEqual(
      expect.objectContaining({ ok: true, revision: 0 })
    )
    expect(await t.run((ctx) => applySaveDate(ctx, staff!, fields))).toEqual({
      ok: false,
      reason: "forbidden",
    })
  })

  test("a date without a source link is refused", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    expect(
      await t.run((ctx) =>
        applySaveDate(ctx, owner!, { ...fields, source: "" })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "source" })
  })

  test("empty optional fields are stored absent, not as empty strings", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    const saved = await t.run((ctx) => applySaveDate(ctx, owner!, fields))
    if (!saved.ok) throw new Error("expected a saved date")
    const row = await t.run((ctx) => ctx.db.get(saved.id))
    expect(row?.titleAs).toBeUndefined()
    expect(row?.ends).toBeUndefined()
  })

  test("a stale edit is refused with the current revision", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    const saved = await t.run((ctx) => applySaveDate(ctx, owner!, fields))
    if (!saved.ok) throw new Error("expected a saved date")
    expect(
      await t.run((ctx) =>
        applySaveDate(ctx, owner!, {
          ...fields,
          id: saved.id,
          expectedRevision: 3,
        })
      )
    ).toEqual({ ok: false, reason: "revision-conflict", current: 0 })
  })

  test("publishing writes the audit row with the flip", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    const saved = await t.run((ctx) => applySaveDate(ctx, owner!, fields))
    if (!saved.ok) throw new Error("expected a saved date")
    await t.run((ctx) =>
      applyDatePublished(ctx, owner!, {
        id: saved.id,
        published: true,
        expectedRevision: 0,
      })
    )
    const rows = await t.run((ctx) =>
      ctx.db
        .query("auditLog")
        .withIndex("by_action", (q) => q.eq("action", "publish"))
        .collect()
    )
    expect(rows[0]).toMatchObject({
      actorId: owner!.id,
      entity: "examDate",
      entityId: saved.id,
      from: "draft",
      to: "published",
    })
  })
})

describe("the public read", () => {
  test("shows published dates from the given day on, earliest first", async () => {
    const t = convexTest(schema, modules)
    const owner = await viewer(t, "+919876700001", "owner")
    const publish = async (starts: string, title: string) => {
      const saved = await t.run((ctx) =>
        applySaveDate(ctx, owner!, { ...fields, starts, title })
      )
      if (!saved.ok) throw new Error("expected a saved date")
      await t.run((ctx) =>
        applyDatePublished(ctx, owner!, {
          id: saved.id,
          published: true,
          expectedRevision: 0,
        })
      )
    }
    await publish("2026-12-01", "Later")
    await publish("2026-10-01", "Sooner")
    await publish("2026-05-01", "Long gone")
    await t.run((ctx) =>
      applySaveDate(ctx, owner!, { ...fields, title: "Draft only" })
    )

    const dates = await t.run((ctx) => readCalendar(ctx, "2026-06-01"))
    expect(dates.map((d) => d.title)).toEqual(["Sooner", "Later"])
    expect(Object.keys(dates[0])).not.toContain("published")
  })
})
