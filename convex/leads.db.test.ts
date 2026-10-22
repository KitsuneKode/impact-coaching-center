import { convexTest } from "convex-test"
import { describe, expect, test } from "bun:test"

import { internal } from "./_generated/api"
import {
  appendLeadActivity,
  applyCreateLead,
  applyFollowUp,
  applyLeadStatus,
  NOTE_MAX,
  readInboxPage,
  readLeadCounts,
  readLeadDetail,
} from "./leads"
import schema from "./schema"
import { endOfTodayIst } from "../lib/ist"

/** Who may read the leads inbox, and what they see. */
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
    name = "Rituparna",
    leadStatus,
    lastEnquiryAt,
    nextFollowUpAt,
    interestTrack,
  }: {
    phone?: string
    name?: string
    leadStatus?: "new" | "contacted" | "interested" | "enrolled" | "lost"
    lastEnquiryAt?: number
    nextFollowUpAt?: number
    interestTrack?: string
  } = {}
) {
  const id = await t.mutation(internal.persons.recordVerifiedPerson, {
    phone,
    name,
  })
  await t.run((ctx) =>
    ctx.db.patch(id, {
      role,
      ...(leadStatus !== undefined ? { leadStatus } : {}),
      ...(lastEnquiryAt !== undefined ? { lastEnquiryAt } : {}),
      ...(nextFollowUpAt !== undefined ? { nextFollowUpAt } : {}),
      ...(interestTrack !== undefined ? { interestTrack } : {}),
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
    grants: doc.grants ?? [],
    locale: doc.locale,
    verifiedAt: doc.verifiedAt,
    revision: doc.revision ?? 0,
  }
}

describe("leads inbox authorization", () => {
  test("an anonymous caller gets an empty page", async () => {
    const t = convexTest(schema, modules)
    await seed(t, "staff")
    const result = await t.run((ctx) => readInboxPage(ctx, null, PAGE, {}))
    expect(result.page).toEqual([])
  })

  test("a verified STUDENT is refused, session and all", async () => {
    // The whole reason the check lives in the query rather than the page.
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "student"))
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE, {}))
    expect(result.page).toEqual([])
  })

  test("staff sees the queue", async () => {
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "staff", { leadStatus: "new" }))
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE, {}))
    expect(result.page).toHaveLength(1)
    expect(result.page[0]!.phone).toBe(PHONE)
  })

  test("an owner sees the queue too", async () => {
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "owner", { leadStatus: "new" }))
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE, {}))
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
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE, {}))
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
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE, {}))
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
    const result = await t.run((ctx) => readInboxPage(ctx, me, PAGE, {}))
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
      readInboxPage(ctx, me, { numItems: 2, cursor: null }, {})
    )
    expect(first.page).toHaveLength(2)
    expect(first.isDone).toBe(false)
    const second = await t.run((ctx) =>
      readInboxPage(ctx, me, { numItems: 2, cursor: first.continueCursor }, {})
    )
    expect(second.page).toHaveLength(2)
    // A page that exactly fills numItems cannot know it is the last - Convex
    // only reports done when the index scan comes back short, so the queue
    // drains with one empty page rather than a falsely confident total.
    expect(second.isDone).toBe(false)
    const third = await t.run((ctx) =>
      readInboxPage(ctx, me, { numItems: 2, cursor: second.continueCursor }, {})
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

describe("the queue's server-side filters", () => {
  test("a status filter reaches rows beyond the first page window", async () => {
    // The bug this guards: the table used to filter only what it had loaded,
    // so a status match behind the loaded pages never appeared.
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff", { phone: "+919876500020" })
    const me = await viewer(t, staffId)
    const now = Date.now()
    for (let i = 0; i < 4; i++) {
      await seed(t, "student", {
        phone: `+9198765003${i}0`,
        leadStatus: "new",
        lastEnquiryAt: now - i,
      })
    }
    for (let i = 0; i < 3; i++) {
      await seed(t, "student", {
        phone: `+9198765004${i}0`,
        leadStatus: "contacted",
        lastEnquiryAt: now - 10 - i,
      })
    }
    const first = await t.run((ctx) =>
      readInboxPage(
        ctx,
        me,
        { numItems: 2, cursor: null },
        { view: "contacted" }
      )
    )
    expect(first.page).toHaveLength(2)
    expect(first.isDone).toBe(false)
    expect(first.page.every((row) => row.leadStatus === "contacted")).toBe(true)
    const second = await t.run((ctx) =>
      readInboxPage(
        ctx,
        me,
        { numItems: 2, cursor: first.continueCursor },
        { view: "contacted" }
      )
    )
    expect(second.page.map((row) => row.phone)).toEqual(["+919876500420"])
  })

  test('"action" is new enquiries plus due follow-ups, not settled leads', async () => {
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff", { phone: "+919876500030" })
    const me = await viewer(t, staffId)
    const now = Date.UTC(2026, 8, 27, 6, 0)
    const end = endOfTodayIst(now)
    await seed(t, "student", {
      phone: "+919876500031",
      leadStatus: "new",
      lastEnquiryAt: now,
    })
    await seed(t, "student", {
      phone: "+919876500032",
      leadStatus: "contacted",
      lastEnquiryAt: now - 1,
      nextFollowUpAt: now - 3_600_000,
    })
    // Settled with a due follow-up: closed work must not resurface.
    await seed(t, "student", {
      phone: "+919876500033",
      leadStatus: "enrolled",
      lastEnquiryAt: now - 2,
      nextFollowUpAt: now - 3_600_000,
    })
    // Future follow-up: not due today.
    await seed(t, "student", {
      phone: "+919876500034",
      leadStatus: "interested",
      lastEnquiryAt: now - 3,
      nextFollowUpAt: end + 3_600_000,
    })
    const action = await t.run((ctx) =>
      readInboxPage(ctx, me, PAGE, { view: "action" }, now)
    )
    expect(action.page.map((row) => row.phone).sort()).toEqual([
      "+919876500031",
      "+919876500032",
    ])
    const due = await t.run((ctx) =>
      readInboxPage(ctx, me, PAGE, { view: "due" }, now)
    )
    expect(due.page.map((row) => row.phone)).toEqual(["+919876500032"])
  })

  test("the track filter narrows to one exam", async () => {
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff", { phone: "+919876500040" })
    const me = await viewer(t, staffId)
    const now = Date.now()
    await seed(t, "student", {
      phone: "+919876500041",
      leadStatus: "new",
      lastEnquiryAt: now,
      interestTrack: "APSC",
    })
    await seed(t, "student", {
      phone: "+919876500042",
      leadStatus: "new",
      lastEnquiryAt: now + 1,
      interestTrack: "ADRE and Assam Police",
    })
    const result = await t.run((ctx) =>
      readInboxPage(ctx, me, PAGE, { view: "all", track: "APSC" })
    )
    expect(result.page.map((row) => row.phone)).toEqual(["+919876500041"])
  })

  test("a full phone number finds the one Person it names", async () => {
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff", { phone: "+919876500050" })
    const me = await viewer(t, staffId)
    await seed(t, "student", {
      phone: "+919876500051",
      leadStatus: "new",
      lastEnquiryAt: 1,
    })
    await seed(t, "student", {
      phone: "+919876500052",
      leadStatus: "new",
      lastEnquiryAt: 2,
    })
    const result = await t.run((ctx) =>
      readInboxPage(ctx, me, PAGE, { view: "all", search: "98765 00051" })
    )
    expect(result.page.map((row) => row.phone)).toEqual(["+919876500051"])
    expect(result.isDone).toBe(true)
  })

  test("a name search finds the Person and respects the status filter", async () => {
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff", {
      phone: "+919876500060",
      name: "Staff Member",
    })
    const me = await viewer(t, staffId)
    await seed(t, "student", {
      phone: "+919876500061",
      name: "Dipika Bora",
      leadStatus: "new",
      lastEnquiryAt: 1,
    })
    await seed(t, "student", {
      phone: "+919876500062",
      name: "Dipika Sharma",
      leadStatus: "enrolled",
      lastEnquiryAt: 2,
    })
    const all = await t.run((ctx) =>
      readInboxPage(ctx, me, PAGE, { view: "all", search: "Dipika" })
    )
    expect(all.page).toHaveLength(2)
    const fresh = await t.run((ctx) =>
      readInboxPage(ctx, me, PAGE, { view: "new", search: "Dipika" })
    )
    expect(fresh.page.map((row) => row.name)).toEqual(["Dipika Bora"])
  })

  test("a phone fragment finds the leads whose numbers contain it", async () => {
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff", { phone: "+919876500070" })
    const me = await viewer(t, staffId)
    await seed(t, "student", {
      phone: "+919435261113",
      leadStatus: "new",
      lastEnquiryAt: 1,
    })
    await seed(t, "student", {
      phone: "+919876500071",
      leadStatus: "new",
      lastEnquiryAt: 2,
    })
    const result = await t.run((ctx) =>
      readInboxPage(ctx, me, PAGE, { view: "all", search: "9435" })
    )
    expect(result.page.map((row) => row.phone)).toEqual(["+919435261113"])
    expect(result.isDone).toBe(true)
  })

  test("fewer than four digits is a coincidence, not a lookup", async () => {
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff", { phone: "+919876500080" })
    const me = await viewer(t, staffId)
    await seed(t, "student", {
      phone: "+919435261113",
      leadStatus: "new",
      lastEnquiryAt: 1,
    })
    // "943" IS inside the seeded number; the minimum, not absence, empties it.
    const result = await t.run((ctx) =>
      readInboxPage(ctx, me, PAGE, { view: "all", search: "943" })
    )
    expect(result.page).toEqual([])
    expect(result.isDone).toBe(true)
  })

  test("a fragment still answers to the view filter", async () => {
    // Settled leads must not resurface under "action" however they are found.
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff", { phone: "+919876500090" })
    const me = await viewer(t, staffId)
    const now = Date.UTC(2026, 9, 2, 6, 0)
    await seed(t, "student", {
      phone: "+919435260001",
      leadStatus: "enrolled",
      lastEnquiryAt: now - 1,
      nextFollowUpAt: now - 3_600_000,
    })
    await seed(t, "student", {
      phone: "+919435260002",
      leadStatus: "new",
      lastEnquiryAt: now,
    })
    const action = await t.run((ctx) =>
      readInboxPage(ctx, me, PAGE, { view: "action", search: "9435" }, now)
    )
    expect(action.page.map((row) => row.phone)).toEqual(["+919435260002"])
    // Status views work too: the scan has no status index to lean on.
    const enrolled = await t.run((ctx) =>
      readInboxPage(ctx, me, PAGE, { view: "enrolled", search: "9435" }, now)
    )
    expect(enrolled.page.map((row) => row.phone)).toEqual(["+919435260001"])
  })

  test("a fragment page stops at numItems matches", async () => {
    const t = convexTest(schema, modules)
    const staffId = await seed(t, "staff", { phone: "+919876500100" })
    const me = await viewer(t, staffId)
    for (let i = 0; i < 3; i++) {
      await seed(t, "student", {
        phone: `+9194352611${i}0`,
        leadStatus: "new",
        lastEnquiryAt: i,
      })
    }
    const result = await t.run((ctx) =>
      readInboxPage(
        ctx,
        me,
        { numItems: 2, cursor: null },
        { view: "all", search: "943526" }
      )
    )
    // Flat and done, queue order kept: the third match is simply not read.
    expect(result.page.map((row) => row.phone)).toEqual([
      "+919435261120",
      "+919435261110",
    ])
    expect(result.isDone).toBe(true)
  })
})

describe("staff adding an enquiry", () => {
  type Staff = NonNullable<Parameters<typeof readInboxPage>[1]>

  async function setup() {
    const t = convexTest(schema, modules)
    const staff = (await viewer(
      t,
      await seed(t, "staff", { phone: "+919876600001" })
    )) as Staff
    const student = (await viewer(
      t,
      await seed(t, "student", { phone: "+919876600002" })
    )) as Staff
    return { t, staff, student }
  }

  test("staff can create a lead, and the audit trail says how it arrived", async () => {
    const { t, staff } = await setup()
    const result = await t.run((ctx) =>
      applyCreateLead(ctx, staff!, {
        name: "Jimoni Deka",
        phone: "94352 61113",
        track: "APSC",
        source: "walk_in",
        note: "Asked about the morning batch.",
      })
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const person = await t.run((ctx) => ctx.db.get(result.personId))
    expect(person).toMatchObject({
      name: "Jimoni Deka",
      phone: "+919435261113",
      leadStatus: "new",
      interestTrack: "APSC",
      source: "staff_walk_in",
      role: "student",
    })
    const activity = await t.run((ctx) =>
      ctx.db
        .query("activities")
        .withIndex("by_person", (q) => q.eq("personId", result.personId))
        .collect()
    )
    expect(activity.map((a) => [a.kind, a.body])).toEqual([
      ["enquiry", "Added by staff (walk-in)"],
      ["note", "Asked about the morning batch."],
    ])
    expect(activity.every((a) => a.actorId === staff!.id)).toBe(true)
  })

  test("a student cannot file an enquiry for someone else", async () => {
    const { t, student } = await setup()
    expect(
      await t.run((ctx) =>
        applyCreateLead(ctx, student!, {
          name: "Someone",
          phone: "9435261113",
          source: "walk_in",
        })
      )
    ).toEqual({ ok: false, reason: "forbidden" })
  })

  test("an existing number keeps its name and status, and gains an enquiry row", async () => {
    const { t, staff } = await setup()
    const existingId = await seed(t, "student", {
      phone: "+919876600003",
      name: "Manash",
      leadStatus: "contacted",
      lastEnquiryAt: 1,
    })
    const result = await t.run((ctx) =>
      applyCreateLead(ctx, staff!, {
        name: "A different spelling",
        phone: "98766 00003",
        source: "phone_call",
      })
    )
    expect(result).toEqual({ ok: true, personId: existingId })
    const person = await t.run((ctx) => ctx.db.get(existingId))
    expect(person?.name).toBe("Manash")
    expect(person?.leadStatus).toBe("contacted")
    expect(person?.lastEnquiryAt).toBeGreaterThan(1)
    const rows = await t.run((ctx) =>
      ctx.db
        .query("activities")
        .withIndex("by_person", (q) => q.eq("personId", existingId))
        .collect()
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      kind: "enquiry",
      // Another name on a known number: a sibling, or a new spelling.
      body: "Added by staff (phone call) for A different spelling",
    })
  })

  test("a bad number, a long note or an erased account are refused", async () => {
    const { t, staff } = await setup()
    expect(
      await t.run((ctx) =>
        applyCreateLead(ctx, staff!, {
          name: "No Phone",
          phone: "12345",
          source: "other",
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "phone" })
    expect(
      await t.run((ctx) =>
        applyCreateLead(ctx, staff!, {
          name: "Verbose",
          phone: "9435261113",
          source: "other",
          note: "x".repeat(NOTE_MAX + 1),
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "note" })
    const gone = await seed(t, "student", { phone: "+919876600004" })
    await t.run((ctx) => ctx.db.patch(gone, { deletedAt: Date.now() }))
    expect(
      await t.run((ctx) =>
        applyCreateLead(ctx, staff!, {
          name: "Comeback",
          phone: "9876600004",
          source: "walk_in",
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "phone" })
  })

  test("a track outside the enquiry options is refused", async () => {
    const { t, staff } = await setup()
    expect(
      await t.run((ctx) =>
        applyCreateLead(ctx, staff!, {
          name: "Neha",
          phone: "9435261113",
          track: "Made-up exam",
          source: "referral",
        })
      )
    ).toEqual({ ok: false, reason: "invalid-input", field: "track" })
  })
})

describe("past one page of people", () => {
  /* Convex allows one .paginate() per query. A loop that paginates again
     throws on the second page, which small fixtures never reach. */
  async function many(
    t: ReturnType<typeof convexTest>,
    n: number,
    leadStatus: "contacted" | "enrolled" = "contacted",
    from = 0
  ) {
    const now = Date.now()
    await t.run(async (ctx) => {
      for (let i = from; i < from + n; i++)
        await ctx.db.insert("persons", {
          phone: `+9198${String(10000000 + i)}`,
          name: `Lead ${i}`,
          role: "student",
          source: "website",
          leadStatus,
          lastEnquiryAt: now - i * 1000,
          // Older follow-ups first in the index: the closed ones lead.
          nextFollowUpAt: now - 3 * 24 * 60 * 60 * 1000 + i,
        })
    })
  }

  test("due follow-ups behind 250 closed leads are still counted", async () => {
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "staff"))
    // Enrolled people whose old follow-up date was never cleared come first.
    await many(t, 250, "enrolled")
    await many(t, 3, "contacted", 250)
    const counts = await t.run((ctx) => readLeadCounts(ctx, me!, Date.now()))
    expect(counts.due).toBe(3)
  })

  test("a phone fragment past the first 200 people is still found", async () => {
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "staff"))
    await many(t, 250)
    const result = await t.run((ctx) =>
      readInboxPage(ctx, me, PAGE, { search: "10000249" })
    )
    expect(result.page.map((row) => row.name)).toEqual(["Lead 249"])
  })
})

describe("closing a lead", () => {
  test("enrolled or lost clears the call-back date, so it stops counting as due", async () => {
    const t = convexTest(schema, modules)
    const me = await viewer(t, await seed(t, "staff"))
    const lead = await seed(t, "student", {
      phone: "+919800000077",
      leadStatus: "interested",
      nextFollowUpAt: Date.now() - 60_000,
    })
    const result = await t.run((ctx) =>
      applyLeadStatus(ctx, me!, {
        personId: lead,
        status: "enrolled",
        expectedRevision: 0,
      })
    )
    expect(result).toMatchObject({ ok: true })
    const after = await t.run((ctx) => ctx.db.get(lead))
    expect(after?.nextFollowUpAt).toBeUndefined()
  })
})
