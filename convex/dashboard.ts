import { v } from "convex/values"

import { endOfTodayIst } from "../lib/ist"
import { COUNT_CAP, hasGrant, requireStaff, type Viewer } from "./authz"
import { indiaDay } from "./contactTaps"
import type { Doc, Id } from "./_generated/dataModel"
import { query, type QueryCtx } from "./_generated/server"
import { readLeadCounts } from "./leads"

/*
 * The admin overview. `today` is the work queue: what is waiting for
 * somebody, and who to call first. `week` is how it is going: enquiries,
 * first calls, enrolments and sales against last week, and where enquiries
 * come from. Queries never read the clock, so the page passes `now` (to the
 * minute). Every read is bounded; counts stop at COUNT_CAP ("99+").
 */

const DAY = 24 * 60 * 60 * 1000
const OPEN = new Set(["new", "contacted", "interested"])
/** A pickup parcel waiting longer than this needs a reminder call. */
const COLLECTION_WAIT_MS = 3 * DAY
const TO_CALL_MAX = 8

const canSeeSales = (viewer: Viewer) => hasGrant(viewer, "catalog")

/** Where an enquiry came from, in one spelling for every report. */
export function sourceOf(enquiry: Doc<"enquiries">) {
  if (enquiry.utm?.source) return enquiry.utm.source.toLowerCase()
  if (enquiry.channel !== "website") return enquiry.channel.replace("_", " ")
  if (!enquiry.referrer) return "website, direct"
  try {
    return new URL(enquiry.referrer).hostname.replace(/^www\./, "")
  } catch {
    return "website, direct"
  }
}

/** How many rows of an order status, capped, and the oldest one. */
async function ordersIn(ctx: QueryCtx, status: Doc<"orders">["status"]) {
  const rows = await ctx.db
    .query("orders")
    .withIndex("by_status_and_placedAt", (q) => q.eq("status", status))
    .take(COUNT_CAP + 1)
  return {
    count: Math.min(rows.length, COUNT_CAP),
    capped: rows.length > COUNT_CAP,
    oldestAt: rows[0]?.placedAt,
    rows,
  }
}

const TO_CALL = v.object({
  id: v.id("persons"),
  name: v.string(),
  phone: v.string(),
  track: v.optional(v.string()),
  reason: v.union(v.literal("overdue"), v.literal("due"), v.literal("new")),
  at: v.number(),
})

export const today = query({
  args: { now: v.number() },
  returns: v.union(
    v.null(),
    v.object({
      uncalled: v.object({
        count: v.number(),
        capped: v.boolean(),
        oldestAt: v.optional(v.number()),
      }),
      followUps: v.object({
        due: v.number(),
        overdue: v.number(),
        capped: v.boolean(),
      }),
      toPack: v.object({
        count: v.number(),
        capped: v.boolean(),
        oldestAt: v.optional(v.number()),
      }),
      toShip: v.number(),
      collection: v.object({ count: v.number(), waitingLong: v.number() }),
      unpaid: v.number(),
      refundsDue: v.optional(v.number()),
      syncFailedAt: v.optional(v.number()),
      toCall: v.array(TO_CALL),
    })
  ),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    return staff.ok ? readToday(ctx, staff.value, args.now) : null
  },
})

/** The queue itself, split out so it can be tested without a session. */
export async function readToday(ctx: QueryCtx, viewer: Viewer, now: number) {
  const endOfToday = endOfTodayIst(now)
  const startOfToday = endOfToday - DAY

  // The same counts the sidebar badge shows, so the two never disagree.
  const counts = await readLeadCounts(ctx, viewer, now)

  const uncalled = await ctx.db
    .query("persons")
    .withIndex("by_leadStatus_and_lastEnquiryAt", (q) =>
      q.eq("leadStatus", "new")
    )
    .take(TO_CALL_MAX)
  const due = (
    await ctx.db
      .query("persons")
      .withIndex("by_nextFollowUpAt", (q) =>
        q.gte("nextFollowUpAt", 0).lt("nextFollowUpAt", endOfToday)
      )
      .take(200)
  ).filter((p) => !p.deletedAt && p.leadStatus && OPEN.has(p.leadStatus))
  const overdue = due.filter((p) => p.nextFollowUpAt! < startOfToday)

  // Overdue first, then due today, then the longest-waiting new enquiries.
  const toCall = [
    ...due.map((p) => ({
      person: p,
      reason:
        p.nextFollowUpAt! < startOfToday
          ? ("overdue" as const)
          : ("due" as const),
      at: p.nextFollowUpAt!,
    })),
    ...uncalled
      .filter((p) => !p.deletedAt && !due.some((d) => d._id === p._id))
      .map((p) => ({
        person: p,
        reason: "new" as const,
        at: p.lastEnquiryAt ?? p._creationTime,
      })),
  ]
    .slice(0, TO_CALL_MAX)
    .map(({ person, reason, at }) => ({
      id: person._id,
      name: person.name,
      phone: person.phone,
      track: person.interestTrack,
      reason,
      at,
    }))

  const paid = await ordersIn(ctx, "paid")
  const packed = await ordersIn(ctx, "packed")
  const ready = await ordersIn(ctx, "ready_for_collection")
  const unpaid = await ordersIn(ctx, "awaiting_payment")

  let refundsDue: number | undefined
  if (viewer.role === "owner") {
    const owed = await ctx.db
      .query("orders")
      .withIndex("by_refundDueAt", (q) => q.gt("refundDueAt", 0))
      .take(COUNT_CAP)
    refundsDue = owed.length
  }

  let syncFailedAt: number | undefined
  if (hasGrant(viewer, "catalog")) {
    const last = await ctx.db.query("courseSyncs").order("desc").first()
    if (last?.status === "failed") syncFailedAt = last._creationTime
  }

  return {
    uncalled: {
      count: counts.fresh,
      capped: counts.fresh >= COUNT_CAP,
      oldestAt: uncalled[0]?.lastEnquiryAt,
    },
    followUps: {
      due: counts.due,
      overdue: overdue.length,
      capped: counts.capped,
    },
    toPack: {
      count: paid.count,
      capped: paid.capped,
      oldestAt: paid.oldestAt,
    },
    toShip: packed.count,
    collection: {
      count: ready.count,
      waitingLong: ready.rows.filter(
        (o) => now - (o.updatedAt ?? o.placedAt) > COLLECTION_WAIT_MS
      ).length,
    },
    unpaid: unpaid.count,
    refundsDue,
    syncFailedAt,
    toCall,
  }
}

/** Rows read per window; past it the page says the count is a floor. */
const WINDOW_CAP = 600
/** Enquiries checked for how fast they got their first call. */
const FIRST_CALL_SAMPLE = 150
/** What counts as somebody at ICT getting back to an enquirer. */
const CONTACT_KINDS = new Set(["call", "status_change", "note"])

const STAGES = ["new", "contacted", "interested", "enrolled", "lost"] as const

export const week = query({
  args: { now: v.number() },
  returns: v.union(
    v.null(),
    v.object({
      enquiries: v.object({
        thisWeek: v.number(),
        lastWeek: v.number(),
        capped: v.boolean(),
      }),
      firstCall: v.object({
        /** Median hours from enquiry to first call, this week. */
        medianHours: v.union(v.number(), v.null()),
        /** This week's enquirers nobody has contacted yet. */
        waiting: v.number(),
      }),
      enrolled: v.object({ thisWeek: v.number(), lastWeek: v.number() }),
      sales: v.optional(
        v.object({
          thisWeekPaise: v.number(),
          lastWeekPaise: v.number(),
          orders: v.number(),
        })
      ),
      taps: v.object({ whatsapp: v.number(), call: v.number() }),
      /** Last 30 days: where enquiries came from and who enrolled. */
      sources: v.array(
        v.object({
          source: v.string(),
          people: v.number(),
          enrolled: v.number(),
        })
      ),
      pages: v.array(v.object({ page: v.string(), people: v.number() })),
      /** Where last 30 days' enquirers are now. */
      stages: v.object({
        new: v.number(),
        contacted: v.number(),
        interested: v.number(),
        enrolled: v.number(),
        lost: v.number(),
      }),
      capped: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    return staff.ok ? readWeek(ctx, staff.value, args.now) : null
  },
})

/** The week itself, split out so it can be tested without a session. */
export async function readWeek(ctx: QueryCtx, viewer: Viewer, now: number) {
  const weekAgo = now - 7 * DAY
  const twoWeeksAgo = now - 14 * DAY

  const fortnight = await ctx.db
    .query("enquiries")
    .withIndex("by_creation_time", (q) => q.gt("_creationTime", twoWeeksAgo))
    .take(WINDOW_CAP + 1)
  const thisWeek = fortnight.filter((e) => e._creationTime > weekAgo)

  /* First call: for each person who enquired this week, the first time
     somebody at ICT called, noted or moved them after that enquiry. */
  const firstOf = new Map<Id<"persons">, number>()
  for (const enquiry of thisWeek)
    if (!firstOf.has(enquiry.personId))
      firstOf.set(enquiry.personId, enquiry._creationTime)
  const waits: number[] = []
  let waiting = 0
  for (const [personId, at] of [...firstOf].slice(0, FIRST_CALL_SAMPLE)) {
    const contact = await ctx.db
      .query("activities")
      .withIndex("by_person", (q) => q.eq("personId", personId))
      .filter((q) =>
        q.and(
          q.gt(q.field("_creationTime"), at),
          q.neq(q.field("actorId"), undefined)
        )
      )
      .take(20)
    const first = contact.find((row) => CONTACT_KINDS.has(row.kind))
    if (first) waits.push(first._creationTime - at)
    else waiting += 1
  }
  waits.sort((a, b) => a - b)
  const median = waits.length ? waits[Math.floor(waits.length / 2)]! : null

  /* Enrolments: when staff moved somebody to enrolled. */
  const moves = await ctx.db
    .query("activities")
    .withIndex("by_creation_time", (q) => q.gt("_creationTime", twoWeeksAgo))
    .take(WINDOW_CAP * 3)
  const enrolments = moves.filter(
    (a) => a.kind === "status_change" && a.to === "enrolled"
  )

  let sales
  if (canSeeSales(viewer)) {
    // Placed up to three weeks ago covers anything paid in the fortnight.
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_placedAt", (q) => q.gt("placedAt", now - 21 * DAY))
      .take(WINDOW_CAP)
    let thisWeekPaise = 0
    let lastWeekPaise = 0
    let count = 0
    for (const order of orders) {
      const paidAt = order.payment?.paidAt
      if (!paidAt || order.status === "refunded" || order.refundDueAt) continue
      if (paidAt > weekAgo) {
        thisWeekPaise += order.totalPaise
        count += 1
      } else if (paidAt > twoWeeksAgo) lastWeekPaise += order.totalPaise
    }
    sales = { thisWeekPaise, lastWeekPaise, orders: count }
  }

  const tapRows = (
    await Promise.all(
      Array.from({ length: 7 }, (_, i) => indiaDay(now - i * DAY)).map((day) =>
        ctx.db
          .query("contactTaps")
          .withIndex("by_day_and_kind_and_page_and_source", (q) =>
            q.eq("day", day)
          )
          .take(300)
      )
    )
  ).flat()
  const taps = { whatsapp: 0, call: 0 }
  for (const row of tapRows) taps[row.kind] += row.count

  /* The month: sources, pages and stages, one row per person. */
  const month = await ctx.db
    .query("enquiries")
    .withIndex("by_creation_time", (q) => q.gt("_creationTime", now - 30 * DAY))
    .take(WINDOW_CAP + 1)
  const firstEnquiry = new Map<Id<"persons">, Doc<"enquiries">>()
  for (const enquiry of month)
    if (!firstEnquiry.has(enquiry.personId))
      firstEnquiry.set(enquiry.personId, enquiry)
  const sources = new Map<string, { people: number; enrolled: number }>()
  const pages = new Map<string, number>()
  const stages = { new: 0, contacted: 0, interested: 0, enrolled: 0, lost: 0 }
  for (const [personId, enquiry] of firstEnquiry) {
    const person = await ctx.db.get(personId)
    if (!person || person.deletedAt) continue
    const status = person.leadStatus
    if (status && (STAGES as readonly string[]).includes(status))
      stages[status] += 1
    const row = sources.get(sourceOf(enquiry)) ?? { people: 0, enrolled: 0 }
    row.people += 1
    if (status === "enrolled") row.enrolled += 1
    sources.set(sourceOf(enquiry), row)
    if (enquiry.page) {
      const page = enquiry.page.split(/[?#]/)[0]!
      pages.set(page, (pages.get(page) ?? 0) + 1)
    }
  }

  return {
    enquiries: {
      thisWeek: thisWeek.length,
      lastWeek: fortnight.length - thisWeek.length,
      capped: fortnight.length > WINDOW_CAP,
    },
    firstCall: {
      medianHours: median === null ? null : median / (60 * 60 * 1000),
      waiting,
    },
    enrolled: {
      thisWeek: enrolments.filter((a) => a._creationTime > weekAgo).length,
      lastWeek: enrolments.filter((a) => a._creationTime <= weekAgo).length,
    },
    sales,
    taps,
    sources: [...sources]
      .map(([source, row]) => ({ source, ...row }))
      .sort((a, b) => b.people - a.people)
      .slice(0, 6),
    pages: [...pages]
      .map(([page, people]) => ({ page, people }))
      .sort((a, b) => b.people - a.people)
      .slice(0, 5),
    stages,
    capped: month.length > WINDOW_CAP,
  }
}
