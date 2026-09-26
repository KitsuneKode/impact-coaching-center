import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { internal } from "./_generated/api"
import {
  appendLeadActivity,
  applyFollowUp,
  applyLeadStatus,
  NOTE_MAX,
  readInboxPage,
  readLeadCounts,
  readLeadDetail,
} from "./leads"
import schema from "./schema"
import { endOfTodayIst } from "../lib/ist"

/**
 * Who may read the leads inbox, and what they see.
 *
 * `readInboxPage` takes the already-resolved viewer (or null) rather than a
 * session, so the role and data decisions are testable without standing up
 * the Better Auth component. The live path's other half - session freshness
 * - is covered by `sessionStale` in people.db.test.ts; the glue between them
 * is `inboxPage` → `requireStaff`, which needs a real deployment to observe.
 */
const modules: Record<string, () => Promise<unknown>> = {}
for (const file of new Bun.Glob("**/*.ts").scanSync({ cwd: import.meta.dir })) {
  if (file.endsWith(".test.ts")) continue
  modules[`./${file}`] = () => import(`./${file}`)
}

const PHONE = "+919876543210"
const PAGE = { numItems: 25, cursor: null }

/** A verified Person at the given role, with an enquiry only when asked. */
async function seed(
  t: ReturnType<typeof convexTest>,
  role: "student" | "staff" | "owner",
  {
    phone = PHONE,
    leadStatus,
    lastEnquiryAt,
  }: {
    phone?: string
    leadStatus?: "new" | "contacted" | "interested" | "enrolled" | "lost"
    lastEnquiryAt?: number
  } = {}
) {
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name: "Rituparna",
  })
  await t.run((ctx) =>
    ctx.db.patch(id, {
      role,
      ...(leadStatus !== undefined ? { leadStatus } : {}),
      ...(lastEnquiryAt !== undefined ? { lastEnquiryAt } : {}),
    })
  )
  return id
}

/** The viewer shape findVerifiedPerson returns, minus the DB round trip. */
async function viewer(
  t: ReturnType<typeof convexTest>,
  id: unknown
): Promise<Parameters<typeof readInboxPage>[1]> {
  const doc = await t.run((ctx) => ctx.db.get(id as never))
  if (!doc) return null
  return {
    id: doc._id,
    name: doc.name,
    phone: doc.phone,
    role: doc.role,
    verifiedAt: doc.verifiedAt,
    revision: doc.revision ?? 0,
  }
}

describe("leads inbox authorization", () => {
  test("an anonymous caller gets an empty page", async () => {
    const t = convexTest(schema, modules)
    await seed(t, "staff")
    const result = await t.run((ctx) => readInboxPage(ctx, null, PAGE))
    expect(result.page).toEqual([])
  })

  test("a verified STUDENT is refused, session and all", async () => {
    // The whole reason the check lives in the query rather than the page.
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "student"))
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE))
    expect(result.page).toEqual([])
  })

  test("staff sees the queue", async () => {
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "staff", { leadStatus: "new" }))
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE))
    expect(result.page).toHaveLength(1)
    expect(result.page[0]!.phone).toBe(PHONE)
  })

  test("an owner sees the queue too", async () => {
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "owner", { leadStatus: "new" }))
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE))
    expect(result.page).toHaveLength(1)
  })
})

describe("the queue's order and shape", () => {
  test("most recently active first, across statuses", async () => {
    // Regression: by_leadStatus groups the queue by the status string, which
    // sorts "lost" ahead of "interested" - an old "lost" lead used to sit
    // above a fresh "new" one. The inbox order is time, not status.
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff")
    const old = Date.now() - 1000
    await seed(t, "student", {
      phone: "+919000000001",
      leadStatus: "lost",
      lastEnquiryAt: old,
    })
    await seed(t, "student", {
      phone: "+919000000002",
      leadStatus: "new",
      lastEnquiryAt: old + 500,
    })
    const me = await viewer(t, staffId)
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE))
    expect(result.page.map((row) => row.phone)).toEqual([
      "+919000000002",
      "+919000000001",
    ])
  })

  test("the projection never leaks the synthetic address or free text", async () => {
    // ADR-0001: the placeholder email must never be presented as contactable.
    const t = convexTest(schema, modules)
    const id = await seed(t, "staff", { leadStatus: "new" })
    await t.run((ctx) =>
      ctx.db.patch(id, { email: "placeholder@person.ict.invalid" })
    )
    const me = await viewer(t, id)
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE))
    const row = result.page[0]!
    // An allowed set, not an exact list: the point is that nothing escapes
    // the projection, and an exact list would fail every time a field the
    // screen legitimately shows is added.
    const allowed = [
      "id",
      "interestTrack",
      "lastEnquiryAt",
      "leadStatus",
      "name",
      "nextFollowUpAt",
      "phone",
      "revision",
      "verifiedAt",
    ]
    for (const key of Object.keys(row)) expect(allowed).toContain(key)
    expect(Object.keys(row)).not.toContain("email")
    expect(JSON.stringify(row)).not.toContain("person.ict.invalid")
  })

  test("a Person with no lead status is not in the follow-up queue", async () => {
    // Reading a Resource creates a Person but not a lead, or staff drown in
    // casual readers and stop trusting the queue.
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "staff"))
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE))
    expect(result.page).toEqual([])
  })

  test("pages stay full while more leads exist behind them", async () => {
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff")
    for (let i = 0; i < 4; i++) {
      await seed(t, "student", {
        phone: `+9190000010${i}0`,
        leadStatus: "new",
        lastEnquiryAt: Date.now() + i,
      })
    }
    const me = await viewer(t, staffId)
    const first = await t.run((ctx) =>
      readInboxPage(ctx, me, { numItems: 2, cursor: null })
    )
    expect(first.page).toHaveLength(2)
    expect(first.isDone).toBe(false)
    const second = await t.run((ctx) =>
      readInboxPage(ctx, me, { numItems: 2, cursor: first.continueCursor })
    )
    expect(second.page).toHaveLength(2)
    // A page that exactly fills numItems cannot know it is the last - Convex
    // only reports done when the index scan comes back short, so the queue
    // drains with one empty page rather than a falsely confident total.
    expect(second.isDone).toBe(false)
    const third = await t.run((ctx) =>
      readInboxPage(ctx, me, { numItems: 2, cursor: second.continueCursor })
    )
    expect(third.page).toEqual([])
    expect(third.isDone).toBe(true)
  })
})

describe("working a lead", () => {
  type Staff = NonNullable<Parameters<typeof readInboxPage>[1]>

  async function setup() {
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff", { phone: "+919876500001" })
    const studentId = await seed(t, "student", { phone: "+919876500002" })
    const leadId = await seed(t, "student", {
      phone: "+919876500003",
      leadStatus: "new",
      lastEnquiryAt: 1,
    })
    const staff = (await viewer(t, staffId)) as Staff
    const student = (await viewer(t, studentId)) as Staff
    return { t, leadId, staff, student }
  }

  test("staff move a lead and the move is audited with who did it", async () => {
    const { t, leadId, staff } = await setup()
    const result = await t.run((ctx) =>
      applyLeadStatus(ctx, staff, {
        personId: leadId,
        status: "contacted",
        expectedRevision: 0,
      })
    )
    expect(result).toEqual({ ok: true, revision: 1 })

    const detail = await t.run((ctx) => readLeadDetail(ctx, staff, leadId))
    if (!detail.ok) throw new Error("expected detail")
    expect(detail.value.lead.leadStatus).toBe("contacted")
    expect(detail.value.activities[0]).toMatchObject({
      kind: "status_change",
      fromStatus: "new",
      toStatus: "contacted",
      actorName: "Rituparna",
    })
  })

  test("a stale screen gets a conflict carrying the current revision", async () => {
    const { t, leadId, staff } = await setup()
    await t.run((ctx) =>
      applyLeadStatus(ctx, staff, {
        personId: leadId,
        status: "contacted",
        expectedRevision: 0,
      })
    )
    const stale = await t.run((ctx) =>
      applyLeadStatus(ctx, staff, {
        personId: leadId,
        status: "lost",
        expectedRevision: 0,
      })
    )
    expect(stale).toEqual({
      ok: false,
      reason: "revision-conflict",
      current: 1,
    })
  })

  test("a student can neither read nor change a lead", async () => {
    const { t, leadId, student } = await setup()
    expect(await t.run((ctx) => readLeadDetail(ctx, student, leadId))).toEqual({
      ok: false,
      reason: "forbidden",
    })
    expect(
      await t.run((ctx) =>
        appendLeadActivity(ctx, student, {
          personId: leadId,
          kind: "note",
          body: "hi",
        })
      )
    ).toEqual({ ok: false, reason: "forbidden" })
  })

  test("notes must say something and stay short; calls may be bare", async () => {
    const { t, leadId, staff } = await setup()
    const note = (body: string) =>
      t.run((ctx) =>
        appendLeadActivity(ctx, staff, { personId: leadId, kind: "note", body })
      )
    expect(await note("   ")).toEqual({
      ok: false,
      reason: "invalid-input",
      field: "body",
    })
    expect((await note("x".repeat(NOTE_MAX + 1))).ok).toBe(false)
    expect(await note("  Asked about the night batch.  ")).toEqual({ ok: true })
    expect(
      await t.run((ctx) =>
        appendLeadActivity(ctx, staff, { personId: leadId, kind: "call" })
      )
    ).toEqual({ ok: true })

    const detail = await t.run((ctx) => readLeadDetail(ctx, staff, leadId))
    if (!detail.ok) throw new Error("expected detail")
    expect(detail.value.activities.map((a) => [a.kind, a.body])).toEqual([
      ["call", undefined],
      ["note", "Asked about the night batch."],
    ])
  })

  test("a follow-up can be set and cleared, but not a year and more away", async () => {
    const { t, leadId, staff } = await setup()
    const now = Date.UTC(2026, 8, 22)
    const set = await t.run((ctx) =>
      applyFollowUp(
        ctx,
        staff,
        { personId: leadId, at: now + 86_400_000, expectedRevision: 0 },
        now
      )
    )
    expect(set).toEqual({ ok: true, revision: 1 })
    const far = await t.run((ctx) =>
      applyFollowUp(
        ctx,
        staff,
        { personId: leadId, at: now + 400 * 86_400_000, expectedRevision: 1 },
        now
      )
    )
    expect(far).toEqual({ ok: false, reason: "invalid-input", field: "at" })
    const cleared = await t.run((ctx) =>
      applyFollowUp(ctx, staff, { personId: leadId, expectedRevision: 1 }, now)
    )
    expect(cleared).toEqual({ ok: true, revision: 2 })
    const lead = await t.run((ctx) => ctx.db.get(leadId))
    expect(lead?.nextFollowUpAt).toBeUndefined()
  })

  test("a missing lead is reported as missing, not as an error", async () => {
    const { t, leadId, staff } = await setup()
    await t.run((ctx) => ctx.db.delete(leadId))
    expect(await t.run((ctx) => readLeadDetail(ctx, staff, leadId))).toEqual({
      ok: false,
      reason: "missing-record",
    })
  })
})

describe("the admin home counts", () => {
  test("new enquiries and follow-ups due today, excluding settled leads", async () => {
    const t = convexTest(schema, modules)
    const now = Date.UTC(2026, 8, 22, 6, 0)
    const staffId = await seed(t, "staff", { phone: "+919876500010" })
    const staff = (await viewer(t, staffId))!
    await seed(t, "student", { phone: "+919876500011", leadStatus: "new" })
    const dueId = await seed(t, "student", {
      phone: "+919876500012",
      leadStatus: "contacted",
    })
    const laterId = await seed(t, "student", {
      phone: "+919876500013",
      leadStatus: "interested",
    })
    const settledId = await seed(t, "student", {
      phone: "+919876500014",
      leadStatus: "enrolled",
    })
    await t.run(async (ctx) => {
      await ctx.db.patch(dueId, { nextFollowUpAt: now - 3_600_000 })
      await ctx.db.patch(laterId, {
        nextFollowUpAt: endOfTodayIst(now) + 3_600_000,
      })
      await ctx.db.patch(settledId, { nextFollowUpAt: now - 3_600_000 })
    })
    expect(await t.run((ctx) => readLeadCounts(ctx, staff, now))).toEqual({
      fresh: 1,
      due: 1,
      capped: false,
    })
  })
})
