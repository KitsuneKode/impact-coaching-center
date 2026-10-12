import {
  type Expression,
  type FilterBuilder,
  paginationOptsValidator,
} from "convex/server"
import { type Infer, v } from "convex/values"

import {
  allow,
  checkRevision,
  COUNT_CAP,
  forbidden,
  invalidInput,
  missingRecord,
  mutationResult,
  paginated,
  REFUSAL,
  requireOwner,
  requireStaff,
  revisionOf,
  type Viewer,
} from "./authz"
import type { DataModel, Doc, Id } from "./_generated/dataModel"
import {
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server"
import { upsertPersonByPhone } from "./persons"
import { LEAD_STATUS } from "./schema"
import { endOfTodayIst } from "../lib/ist"
import { enquiryTracks, toE164 } from "../lib/leads"

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
 * Which slice of the queue a page shows: "action" is untouched new enquiries
 * plus follow-ups that have come due, "due" only the follow-ups, a status
 * that exact status, "all" or absent every lead.
 */
export const INBOX_VIEW = v.union(
  v.literal("all"),
  v.literal("action"),
  v.literal("due"),
  v.literal("new"),
  v.literal("contacted"),
  v.literal("interested"),
  v.literal("enrolled"),
  v.literal("lost")
)

export type InboxView = Infer<typeof INBOX_VIEW>

export type InboxFilters = {
  view?: InboxView
  track?: string
  search?: string
}

function toRow(person: Doc<"persons">) {
  return {
    id: person._id,
    name: person.name,
    phone: person.phone,
    leadStatus: person.leadStatus,
    interestTrack: person.interestTrack,
    lastEnquiryAt: person.lastEnquiryAt,
    verifiedAt: person.verifiedAt,
    nextFollowUpAt: person.nextFollowUpAt,
    revision: revisionOf(person),
  }
}

/** The view predicates, evaluated on a document the indexes cannot reach. */
function inView(
  person: Doc<"persons">,
  filters: InboxFilters,
  endOfToday: number
): boolean {
  if (!person.leadStatus) return false
  if (filters.track && person.interestTrack !== filters.track) return false
  const view = filters.view ?? "all"
  if (view === "all") return true
  const due =
    person.nextFollowUpAt !== undefined &&
    person.nextFollowUpAt < endOfToday &&
    person.leadStatus !== "enrolled" &&
    person.leadStatus !== "lost"
  if (view === "action") return person.leadStatus === "new" || due
  if (view === "due") return due
  return person.leadStatus === view
}

/**
 * `inView` as a filter expression, for paths that read many documents. A
 * status view compares `leadStatus` to the view even where an index already
 * applied it - redundant on `by_leadStatus`, needed on the fragment scan,
 * which has no status index at all.
 */
function viewExpr(
  q: FilterBuilder<DataModel["persons"]>,
  view: InboxView,
  track: string | undefined,
  endOfToday: number
): Expression<boolean> {
  const due = q.and(
    q.neq(q.field("leadStatus"), undefined),
    q.neq(q.field("nextFollowUpAt"), undefined),
    q.lt(q.field("nextFollowUpAt"), endOfToday),
    q.neq(q.field("leadStatus"), "enrolled"),
    q.neq(q.field("leadStatus"), "lost")
  )
  const inViewExpr =
    view === "action"
      ? q.or(q.eq(q.field("leadStatus"), "new"), due)
      : view === "due"
        ? due
        : view === "all"
          ? q.neq(q.field("leadStatus"), undefined)
          : q.eq(q.field("leadStatus"), view)
  return track
    ? q.and(inViewExpr, q.eq(q.field("interestTrack"), track))
    : inViewExpr
}

/** Fewer digits than this match too many phones to be a lookup. */
const PHONE_FRAGMENT_MIN = 4

/**
 * A phone fragment has no index to answer it, so the queue order is walked
 * in bounded chunks: at most this many pages of 200 persons.
 */
const FRAGMENT_SCAN_PAGES = 10
const FRAGMENT_SCAN_PAGE_ROWS = 200

/** One page of the queue. */
export async function readInboxPage(
  ctx: Pick<QueryCtx, "db">,
  staff: Viewer | null,
  paginationOpts: { numItems: number; cursor: string | null },
  filters: InboxFilters,
  now = Date.now()
) {
  if (!staff || (staff.role !== "staff" && staff.role !== "owner"))
    return { page: [], isDone: true, continueCursor: "" }

  const endOfToday = endOfTodayIst(now)
  const view = filters.view ?? "all"
  const track = filters.track
  const status =
    view !== "all" && view !== "action" && view !== "due" ? view : undefined

  const search = filters.search?.trim() ?? ""
  /* A complete number names one Person exactly; `by_phone` answers it without
     a scan. */
  const exactPhone = search ? toE164(search) : null
  if (exactPhone) {
    const person = await ctx.db
      .query("persons")
      .withIndex("by_phone", (q) => q.eq("phone", exactPhone))
      .first()
    return {
      page:
        person && inView(person, filters, endOfToday) ? [toRow(person)] : [],
      isDone: true,
      continueCursor: "",
    }
  }

  /* A search with letters is a name; the search index answers it. */
  if (search && /\p{L}/u.test(search)) {
    const result = await ctx.db
      .query("persons")
      .withSearchIndex("search_name", (q) => {
        let s = q.search("name", search)
        if (status) s = s.eq("leadStatus", status)
        if (track) s = s.eq("interestTrack", track)
        return s
      })
      .filter((q) => {
        const due = q.and(
          q.neq(q.field("leadStatus"), undefined),
          q.neq(q.field("nextFollowUpAt"), undefined),
          q.lt(q.field("nextFollowUpAt"), endOfToday),
          q.neq(q.field("leadStatus"), "enrolled"),
          q.neq(q.field("leadStatus"), "lost")
        )
        if (view === "action")
          return q.or(q.eq(q.field("leadStatus"), "new"), due)
        if (view === "due") return due
        return q.neq(q.field("leadStatus"), undefined)
      })
      .paginate(paginationOpts)
    return { ...result, page: result.page.map(toRow) }
  }

  /* Digits without letters are a phone fragment: `by_phone` needs the whole
     number (toE164 already answered that) and the name index holds none, so
     the queue order is scanned in bounded chunks until enough phones match. */
  const digits = search.replace(/\D/g, "")
  if (digits.length > 0) {
    /* Too few digits matches phones freely rather than naming anyone. */
    if (digits.length < PHONE_FRAGMENT_MIN)
      return { page: [], isDone: true, continueCursor: "" }
    const matches: Doc<"persons">[] = []
    let cursor: string | null = null
    for (let pages = 0; pages < FRAGMENT_SCAN_PAGES; pages++) {
      const chunk = await ctx.db
        .query("persons")
        .withIndex("by_lastEnquiryAt")
        .order("desc")
        .filter((q) => viewExpr(q, view, track, endOfToday))
        .paginate({ numItems: FRAGMENT_SCAN_PAGE_ROWS, cursor })
      for (const person of chunk.page) {
        if (matches.length >= paginationOpts.numItems) break
        if (person.phone.includes(digits)) matches.push(person)
      }
      if (matches.length >= paginationOpts.numItems || chunk.isDone) break
      cursor = chunk.continueCursor
    }
    /* A fragment answer is one flat page: a cursor would have to name where
       the scan stopped rather than a row, so no continueCursor is kept. */
    return { page: matches.map(toRow), isDone: true, continueCursor: "" }
  }

  const base = status
    ? ctx.db
        .query("persons")
        .withIndex("by_leadStatus", (q) => q.eq("leadStatus", status))
        .order("desc")
    : ctx.db.query("persons").withIndex("by_lastEnquiryAt").order("desc")

  const result = await base
    .filter((q) => viewExpr(q, view, track, endOfToday))
    .paginate(paginationOpts)

  return { ...result, page: result.page.map(toRow) }
}

export const inboxPage = query({
  args: {
    paginationOpts: paginationOptsValidator,
    view: v.optional(INBOX_VIEW),
    track: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  returns: paginated(INBOX_ROW),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return { page: [], isDone: true, continueCursor: "" }
    return readInboxPage(ctx, staff.value, args.paginationOpts, {
      view: args.view,
      track: args.track,
      search: args.search,
    })
  },
})

/* -------------------------------------------------------------------------- */
/*  Staff adding an enquiry themselves                                        */
/* -------------------------------------------------------------------------- */

/**
 * How a walk-in or phone enquiry reached the desk. Stored on the Person as
 * `staff_<key>` so it cannot be mistaken for the public form's "website".
 */
const STAFF_SOURCE = v.union(
  v.literal("walk_in"),
  v.literal("phone_call"),
  v.literal("whatsapp"),
  v.literal("referral"),
  v.literal("other")
)

type StaffSource = Infer<typeof STAFF_SOURCE>

const STAFF_SOURCE_LABELS: Record<StaffSource, string> = {
  walk_in: "walk-in",
  phone_call: "phone call",
  whatsapp: "WhatsApp",
  referral: "referral",
  other: "other",
}

/** The create itself, split out so it can be tested without a session. */
export async function applyCreateLead(
  ctx: MutationCtx,
  viewer: Viewer,
  args: {
    name: string
    phone: string
    track?: string
    source: StaffSource
    note?: string
  }
) {
  if (!isStaff(viewer)) return forbidden
  const name = args.name.trim()
  if (name.length < 1 || name.length > 80) return invalidInput("name")
  const phone = toE164(args.phone)
  if (!phone) return invalidInput("phone")
  if (
    args.track !== undefined &&
    !(enquiryTracks as readonly string[]).includes(args.track)
  )
    return invalidInput("track")
  const note = args.note?.trim()
  if (note && note.length > NOTE_MAX) return invalidInput("note")

  /* An erased Person is a tombstone: never revive it from the front desk. */
  const existing = await ctx.db
    .query("persons")
    .withIndex("by_phone", (q) => q.eq("phone", phone))
    .first()
  if (existing?.deletedAt) return invalidInput("phone")

  const personId = await upsertPersonByPhone(ctx, {
    phone,
    name,
    source: `staff_${args.source}`,
  })
  const now = Date.now()
  const revision = revisionOf(existing ?? {}) + 1
  await ctx.db.patch(personId, {
    /* A number that already has a status keeps it - a second call is another
       enquiry, not a restart of the pipeline. */
    leadStatus: existing?.leadStatus ?? "new",
    lastEnquiryAt: now,
    ...(args.track ? { interestTrack: args.track } : {}),
    revision,
    updatedAt: now,
  })
  await ctx.db.insert("activities", {
    personId,
    kind: "enquiry",
    actorId: viewer.id,
    track: args.track,
    body: `Added by staff (${STAFF_SOURCE_LABELS[args.source]})`,
  })
  if (note)
    await ctx.db.insert("activities", {
      personId,
      kind: "note",
      actorId: viewer.id,
      body: note,
    })
  return { ok: true as const, personId }
}

/** A walk-in or a phone call, entered at the desk by whoever took it. */
export const createLead = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    track: v.optional(v.string()),
    source: STAFF_SOURCE,
    note: v.optional(v.string()),
  },
  returns: mutationResult({ personId: v.id("persons") }),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return staff
    return applyCreateLead(ctx, staff.value, args)
  },
})

/** Whether the viewer may see the inbox at all, for the page shell. */
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
  /** The onboarding answers, so the caller knows what to talk about. */
  targetExam: v.optional(v.string()),
  attempt: v.optional(v.union(v.literal("first"), v.literal("repeat"))),
  preferredBatch: v.optional(v.string()),
  deletedAt: v.optional(v.number()),
  revision: v.number(),
})

/** How much history the detail sheet shows. Older rows stay in the table. */
const HISTORY_LIMIT = 50

/** One lead and its recent history, newest first. */
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
      targetExam: person.questionnaire?.targetExam,
      attempt: person.questionnaire?.attempt,
      preferredBatch: person.questionnaire?.preferredBatch,
      deletedAt: person.deletedAt,
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

/** Append a note or a call to a lead's history. */
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
  /* The follow-up index range also matches enrolled/lost leads, and they are
     filtered after the read - a plain `take` can fill its window on closed
     leads and under-count what is actually due. Page through instead and stop
     as soon as the cap is reached. */
  let due = 0
  let capped = fresh.length > COUNT_CAP
  let cursor: string | null = null
  while (true) {
    const chunk = await ctx.db
      .query("persons")
      .withIndex("by_nextFollowUpAt", (q) =>
        q.gte("nextFollowUpAt", 0).lt("nextFollowUpAt", endOfTodayIst(now))
      )
      .paginate({ numItems: 200, cursor })
    due += chunk.page.filter(
      (person) =>
        person.leadStatus !== "enrolled" && person.leadStatus !== "lost"
    ).length
    if (due >= COUNT_CAP) {
      due = COUNT_CAP
      capped = true
      break
    }
    if (chunk.isDone) break
    cursor = chunk.continueCursor
  }
  return {
    fresh: Math.min(fresh.length, COUNT_CAP),
    due,
    capped,
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

/**
 * An export leaves the building with real phone numbers in it, so the audit
 * trail records that one happened before the file downloads. The row hangs
 * on the exporting owner - the "person" this activity is about is them.
 */
export const recordExport = mutation({
  args: { count: v.number() },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    if (!owner.ok) return owner
    if (!Number.isInteger(args.count) || args.count < 1)
      return invalidInput("count")
    await ctx.db.insert("activities", {
      personId: owner.value.id,
      kind: "export",
      body: `Exported ${args.count} enquir${args.count === 1 ? "y" : "ies"} as CSV`,
      actorId: owner.value.id,
    })
    return { ok: true as const }
  },
})
