import { paginationOptsValidator } from "convex/server"
import { type Infer, v } from "convex/values"

import {
  allow,
  checkRevision,
  forbidden,
  invalidInput,
  missingRecord,
  mutationResult,
  paginated,
  REFUSAL,
  requireStaff,
  revisionOf,
  type Viewer,
} from "./authz"
import type { Id } from "./_generated/dataModel"
import {
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server"
import { LEAD_STATUS } from "./schema"
import { endOfTodayIst } from "../lib/ist"

/** The inbox projection. Never the whole Person document. */
const INBOX_ROW = v.object({
  id: v.id("persons"),
  name: v.string(),
  phone: v.string(),
  leadStatus: v.optional(LEAD_STATUS),
  interestTrack: v.optional(v.string()),
  lastEnquiryAt: v.optional(v.number()),
  verifiedAt: v.optional(v.number()),
  nextFollowUpAt: v.optional(v.number()),
  revision: v.number(),
})

/**
 * The follow-up queue, paginated, as the shared contract requires.
 *
 * Access goes through `requireStaff`, not a local check: role is read from
 * the Person record and the session is re-verified against its age on every
 * call, so a demoted staff member or a stale staff session stops answering
 * on the very next request. A refusal returns an empty page rather than an
 * `authorized` flag, because `usePaginatedQuery` requires a plain
 * PaginationResult; `canSeeInbox` answers the access question on its own,
 * which is why the page can say "staff only" without fetching rows.
 *
 * Projected, never whole documents: a Person carries the synthetic
 * @person.ict.invalid address that ADR-0001 says must never be presented as
 * contactable, and staff notes live on `activities` precisely so an export
 * of this screen cannot leak them.
 *
 * `by_lastEnquiryAt` gives most-recently-active-first across every status -
 * `by_leadStatus` would group the queue by the status string, which sorts
 * "lost" ahead of "interested". Filtering inside the query lets Convex keep
 * filling each page instead of taking a page and then dropping rows.
 *
 * There is deliberately no total count. Counting would mean reading every
 * matching row on every page load, and a number derived from one page is
 * worse than no number: it looks authoritative and is wrong.
 */

/**
 * One page of the queue.
 *
 * Re-checks the role on whatever it is given rather than trusting that the
 * caller already did, so the function is safe under a future caller that
 * skipped `requireStaff`. The session-age cutoff is NOT repeated here - it
 * lives in `requireStaff`, which the public query above is the only caller
 * of.
 */
export async function readInboxPage(
  ctx: Pick<QueryCtx, "db">,
  staff: Viewer | null,
  paginationOpts: { numItems: number; cursor: string | null }
) {
  if (!staff || (staff.role !== "staff" && staff.role !== "owner"))
    return { page: [], isDone: true, continueCursor: "" }

  const result = await ctx.db
    .query("persons")
    .withIndex("by_lastEnquiryAt")
    .order("desc")
    .filter((q) => q.neq(q.field("leadStatus"), undefined))
    .paginate(paginationOpts)

  return {
    ...result,
    page: result.page.map((person) => ({
      id: person._id,
      name: person.name,
      phone: person.phone,
      leadStatus: person.leadStatus,
      interestTrack: person.interestTrack,
      lastEnquiryAt: person.lastEnquiryAt,
      verifiedAt: person.verifiedAt,
      nextFollowUpAt: person.nextFollowUpAt,
      revision: revisionOf(person),
    })),
  }
}

export const inboxPage = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginated(INBOX_ROW),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return { page: [], isDone: true, continueCursor: "" }
    return readInboxPage(ctx, staff.value, args.paginationOpts)
  },
})

/**
 * Whether the viewer may see the inbox at all, for the page shell.
 *
 * Separate from `inboxPage` so the screen can render a truthful "you do not
 * have access" without also asking for the rows and discarding them.
 */
export const canSeeInbox = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => (await requireStaff(ctx)).ok,
})

/* -------------------------------------------------------------------------- */
/*  Working a lead                                                            */
/* -------------------------------------------------------------------------- */

/*
 * Staff, not only the owner, may do everything below. Following up is the
 * daily work of whoever answers the phone at the centre; a queue only the
 * owner may update is a queue that is only worked when one person is free.
 * Export, roles and refunds stay owner-only elsewhere.
 *
 * Each write re-checks the role on the viewer it is given, so the helpers are
 * safe under a future caller that skipped `requireStaff`. The public wrappers
 * add only the session check, which is why the helpers are what the tests
 * exercise.
 */

const isStaff = (viewer: Viewer) =>
  viewer.role === "staff" || viewer.role === "owner"

/** A note is for the next person who calls, not a document. */
export const NOTE_MAX = 1000

/** Follow-ups further out than this are a typo, not a plan. */
const FOLLOW_UP_MAX_MS = 366 * 24 * 60 * 60 * 1000

const ACTIVITY_ROW = v.object({
  id: v.id("activities"),
  kind: v.string(),
  at: v.number(),
  body: v.optional(v.string()),
  actorName: v.optional(v.string()),
  fromStatus: v.optional(v.string()),
  toStatus: v.optional(v.string()),
  track: v.optional(v.string()),
  timing: v.optional(v.string()),
})

const LEAD_DETAIL = v.object({
  id: v.id("persons"),
  name: v.string(),
  phone: v.string(),
  leadStatus: v.optional(LEAD_STATUS),
  interestTrack: v.optional(v.string()),
  source: v.string(),
  lastEnquiryAt: v.optional(v.number()),
  verifiedAt: v.optional(v.number()),
  nextFollowUpAt: v.optional(v.number()),
  revision: v.number(),
})

/** How much history the detail sheet shows. Older rows stay in the table. */
const HISTORY_LIMIT = 50

/**
 * One lead and its recent history, newest first.
 *
 * Actor names are resolved here so the sheet can say who did what without a
 * second round trip; the actor's phone never leaves the server.
 */
export async function readLeadDetail(
  ctx: Pick<QueryCtx, "db">,
  viewer: Viewer,
  personId: Id<"persons">
) {
  if (!isStaff(viewer)) return forbidden
  const person = await ctx.db.get(personId)
  if (!person) return missingRecord

  const rows = await ctx.db
    .query("activities")
    .withIndex("by_person", (q) => q.eq("personId", personId))
    .order("desc")
    .take(HISTORY_LIMIT)

  const actorIds = [
    ...new Set(rows.flatMap((row) => (row.actorId ? [row.actorId] : []))),
  ]
  const actors = new Map(
    (await Promise.all(actorIds.map((id) => ctx.db.get(id)))).flatMap(
      (actor) =>
        actor ? [[actor._id, actor.name.trim() || "Staff"] as const] : []
    )
  )

  return allow({
    lead: {
      id: person._id,
      name: person.name,
      phone: person.phone,
      leadStatus: person.leadStatus,
      interestTrack: person.interestTrack,
      source: person.source,
      lastEnquiryAt: person.lastEnquiryAt,
      verifiedAt: person.verifiedAt,
      nextFollowUpAt: person.nextFollowUpAt,
      revision: revisionOf(person),
    },
    activities: rows.map((row) => ({
      id: row._id,
      kind: row.kind,
      at: row._creationTime,
      body: row.body,
      actorName: row.actorId ? actors.get(row.actorId) : undefined,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      track: row.track,
      timing: row.timing,
    })),
  })
}

export const leadDetail = query({
  args: { personId: v.id("persons") },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      value: v.object({ lead: LEAD_DETAIL, activities: v.array(ACTIVITY_ROW) }),
    }),
    REFUSAL
  ),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return staff
    return readLeadDetail(ctx, staff.value, args.personId)
  },
})

/** Move a lead through the pipeline, with an audit row saying who and when. */
export async function applyLeadStatus(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    personId: Id<"persons">
    status: Infer<typeof LEAD_STATUS>
    expectedRevision: number
  }
) {
  if (!isStaff(viewer)) return forbidden
  const person = await ctx.db.get(args.personId)
  if (!person) return missingRecord
  const conflict = checkRevision(person, args.expectedRevision)
  if (conflict) return conflict
  if (person.leadStatus === args.status)
    return { ok: true as const, revision: revisionOf(person) }

  const revision = revisionOf(person) + 1
  await ctx.db.patch(args.personId, {
    leadStatus: args.status,
    revision,
    updatedAt: Date.now(),
  })
  await ctx.db.insert("activities", {
    personId: args.personId,
    kind: "status_change",
    actorId: viewer.id,
    fromStatus: person.leadStatus,
    toStatus: args.status,
  })
  return { ok: true as const, revision }
}

export const setLeadStatus = mutation({
  args: {
    personId: v.id("persons"),
    status: LEAD_STATUS,
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return staff
    return applyLeadStatus(ctx, staff.value, args)
  },
})

/**
 * Append a note or a call to a lead's history.
 *
 * Append-only, so no revision: two people writing notes at once should both
 * be kept, not have one refused. Free text lives on `activities` and never
 * on the Person, so an export of the queue cannot leak it.
 */
export async function appendLeadActivity(
  ctx: MutationCtx,
  viewer: Viewer,
  args: { personId: Id<"persons">; kind: "note" | "call"; body?: string }
) {
  if (!isStaff(viewer)) return forbidden
  const person = await ctx.db.get(args.personId)
  if (!person) return missingRecord
  const body = args.body?.trim()
  if (args.kind === "note" && !body) return invalidInput("body")
  if (body && body.length > NOTE_MAX) return invalidInput("body")

  await ctx.db.insert("activities", {
    personId: args.personId,
    kind: args.kind,
    actorId: viewer.id,
    ...(body ? { body } : {}),
  })
  return { ok: true as const }
}

export const addLeadNote = mutation({
  args: { personId: v.id("persons"), body: v.string() },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return staff
    return appendLeadActivity(ctx, staff.value, { ...args, kind: "note" })
  },
})

export const logLeadCall = mutation({
  args: { personId: v.id("persons"), body: v.optional(v.string()) },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return staff
    return appendLeadActivity(ctx, staff.value, { ...args, kind: "call" })
  },
})

/** Set or clear when somebody should next get back to this person. */
export async function applyFollowUp(
  ctx: MutationCtx,
  viewer: Viewer,
  args: { personId: Id<"persons">; at?: number; expectedRevision: number },
  now = Date.now()
) {
  if (!isStaff(viewer)) return forbidden
  const person = await ctx.db.get(args.personId)
  if (!person) return missingRecord
  const conflict = checkRevision(person, args.expectedRevision)
  if (conflict) return conflict
  if (
    args.at !== undefined &&
    (!Number.isFinite(args.at) || args.at > now + FOLLOW_UP_MAX_MS)
  )
    return invalidInput("at")

  const revision = revisionOf(person) + 1
  await ctx.db.patch(args.personId, {
    nextFollowUpAt: args.at,
    revision,
    updatedAt: now,
  })
  return { ok: true as const, revision }
}

export const setLeadFollowUp = mutation({
  args: {
    personId: v.id("persons"),
    at: v.optional(v.number()),
    expectedRevision: v.number(),
  },
  returns: mutationResult({ revision: v.number() }),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return staff
    return applyFollowUp(ctx, staff.value, args)
  },
})

/** Counts stop here: past this, "99+" is the honest answer on a home screen. */
const COUNT_CAP = 99

/**
 * What needs someone today: new enquiries nobody has touched, and follow-ups
 * that have come due. Bounded reads, capped counts - a home screen needs to
 * know "some" versus "none", not an exact total over the whole table.
 */
export async function readLeadCounts(
  ctx: Pick<QueryCtx, "db">,
  viewer: Viewer,
  now: number
) {
  if (!isStaff(viewer)) return { fresh: 0, due: 0, capped: false }
  const fresh = await ctx.db
    .query("persons")
    .withIndex("by_leadStatus", (q) => q.eq("leadStatus", "new"))
    .take(COUNT_CAP + 1)
  const dueRows = await ctx.db
    .query("persons")
    .withIndex("by_nextFollowUpAt", (q) =>
      q.gte("nextFollowUpAt", 0).lt("nextFollowUpAt", endOfTodayIst(now))
    )
    .take(COUNT_CAP * 2)
  const due = dueRows.filter(
    (person) => person.leadStatus !== "enrolled" && person.leadStatus !== "lost"
  )
  return {
    fresh: Math.min(fresh.length, COUNT_CAP),
    due: Math.min(due.length, COUNT_CAP),
    capped: fresh.length > COUNT_CAP || due.length > COUNT_CAP,
  }
}

export const leadCounts = query({
  args: {},
  returns: v.object({
    fresh: v.number(),
    due: v.number(),
    capped: v.boolean(),
  }),
  handler: async (ctx) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return { fresh: 0, due: 0, capped: false }
    return readLeadCounts(ctx, staff.value, Date.now())
  },
})
