import { v } from "convex/values"

import { hasGrant, requireStaff } from "./authz"
import { indiaDay } from "./contactTaps"
import { query } from "./_generated/server"

const DAY = 24 * 60 * 60 * 1000
/** A week's rows stop here; past it the card says "500+". */
const WEEK_CAP = 500

/**
 * The admin overview's week: money in, where enquiries came from, what sells,
 * what is stuck, what is live. Each part is read only for staff who may see
 * it. Queries never read the clock, so the page passes `now` (to the minute).
 */
export const weekly = query({
  args: { now: v.number() },
  returns: v.union(
    v.null(),
    v.object({
      sales: v.optional(
        v.object({
          paidPaise: v.number(),
          paidOrders: v.number(),
          unpaidStale: v.number(),
          capped: v.boolean(),
        })
      ),
      taps: v.object({
        whatsapp: v.number(),
        call: v.number(),
        topPages: v.array(v.object({ page: v.string(), count: v.number() })),
      }),
      enquiries: v.object({
        total: v.number(),
        capped: v.boolean(),
        bySource: v.array(v.object({ source: v.string(), count: v.number() })),
      }),
      topSets: v.optional(
        v.array(
          v.object({ slug: v.string(), title: v.string(), sold: v.number() })
        )
      ),
      livePromotions: v.optional(v.number()),
      lastSync: v.optional(
        v.object({
          at: v.number(),
          status: v.union(v.literal("ok"), v.literal("failed")),
          seen: v.number(),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return null
    const viewer = staff.value
    const since = args.now - 7 * DAY

    /* Enquiries this week, by where they came from. */
    const enquiries = await ctx.db
      .query("enquiries")
      .withIndex("by_creation_time", (q) => q.gt("_creationTime", since))
      .take(WEEK_CAP + 1)
    const counts = new Map<string, number>()
    for (const enquiry of enquiries.slice(0, WEEK_CAP)) {
      const source =
        enquiry.utm?.source ??
        (enquiry.channel === "website"
          ? enquiry.referrer
            ? hostOf(enquiry.referrer)
            : "website"
          : enquiry.channel.replace("_", " "))
      counts.set(source, (counts.get(source) ?? 0) + 1)
    }
    const bySource = [...counts]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    /* WhatsApp and phone taps, from the daily totals. */
    const days = Array.from({ length: 7 }, (_, i) =>
      indiaDay(args.now - i * DAY)
    )
    const tapRows = (
      await Promise.all(
        days.map((day) =>
          ctx.db
            .query("contactTaps")
            .withIndex("by_day_and_kind_and_page_and_source", (q) =>
              q.eq("day", day)
            )
            .take(200)
        )
      )
    ).flat()
    const pages = new Map<string, number>()
    for (const row of tapRows)
      pages.set(row.page, (pages.get(row.page) ?? 0) + row.count)
    const taps = {
      whatsapp: tapRows
        .filter((row) => row.kind === "whatsapp")
        .reduce((sum, row) => sum + row.count, 0),
      call: tapRows
        .filter((row) => row.kind === "call")
        .reduce((sum, row) => sum + row.count, 0),
      topPages: [...pages]
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
    }

    /* Orders: owners and staff who handle the shop. */
    let sales
    let topSets
    if (hasGrant(viewer, "catalog") || viewer.role === "owner") {
      const week = await ctx.db
        .query("orders")
        .withIndex("by_placedAt", (q) => q.gt("placedAt", since))
        .take(WEEK_CAP + 1)
      const paid = week.filter((order) => order.payment?.paidAt)
      const unpaidStale = week.filter(
        (order) =>
          order.status === "awaiting_payment" && args.now - order.placedAt > DAY
      ).length
      sales = {
        paidPaise: paid.reduce((sum, order) => sum + order.totalPaise, 0),
        paidOrders: paid.length,
        unpaidStale,
        capped: week.length > WEEK_CAP,
      }
      const sets = await ctx.db
        .query("bundles")
        .withIndex("by_published_and_sortOrder", (q) => q.eq("published", true))
        .take(100)
      topSets = sets
        .filter((set) => !set.sample && set.soldCount > 0)
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 3)
        .map((set) => ({
          slug: set.slug,
          title: set.title.en,
          sold: set.soldCount,
        }))
    }

    /* Live promotions, for those who run them. */
    let livePromotions
    if (hasGrant(viewer, "promotions")) {
      const live = await ctx.db
        .query("campaigns")
        .withIndex("by_status_and_priority", (q) => q.eq("status", "live"))
        .take(50)
      livePromotions = live.filter(
        (c) =>
          (c.startsAt === undefined || c.startsAt <= args.now) &&
          (c.endsAt === undefined || c.endsAt > args.now)
      ).length
    }

    /* The last ClassPlus sync, for those who keep the courses. */
    let lastSync
    if (hasGrant(viewer, "catalog")) {
      const sync = await ctx.db.query("courseSyncs").order("desc").first()
      if (sync)
        lastSync = {
          at: sync._creationTime,
          status: sync.status,
          seen: sync.seen,
        }
    }

    return {
      taps,
      sales,
      enquiries: {
        total: Math.min(enquiries.length, WEEK_CAP),
        capped: enquiries.length > WEEK_CAP,
        bySource,
      },
      topSets,
      livePromotions,
      lastSync,
    }
  },
})

/** "www.google.com" from a referrer URL, or the raw text if it is not one. */
function hostOf(referrer: string) {
  try {
    return new URL(referrer).hostname.replace(/^www\./, "")
  } catch {
    return referrer.slice(0, 40)
  }
}

const OPEN_STATUSES = new Set(["new", "contacted", "interested"])
/** People read for the month's lead insights; past it the page says so. */
const MONTH_CAP = 800

/**
 * The lead side of the overview: enquiries per day for two weeks, the
 * funnel for the last 30 days, which sources bring people who enrol, the
 * pages that turn visitors into enquiries, and who is due a call. Read by
 * each person's enquiry time, so the history is right however rows arrived.
 */
export const leadInsights = query({
  args: { now: v.number() },
  returns: v.union(
    v.null(),
    v.object({
      days: v.array(v.object({ day: v.string(), count: v.number() })),
      thisWeek: v.number(),
      lastWeek: v.number(),
      funnel: v.object({
        new: v.number(),
        contacted: v.number(),
        interested: v.number(),
        enrolled: v.number(),
        lost: v.number(),
      }),
      sources: v.array(
        v.object({
          source: v.string(),
          people: v.number(),
          enrolled: v.number(),
        })
      ),
      pages: v.array(v.object({ page: v.string(), people: v.number() })),
      followUps: v.array(
        v.object({
          id: v.id("persons"),
          name: v.string(),
          phone: v.string(),
          track: v.optional(v.string()),
          due: v.number(),
          status: v.string(),
        })
      ),
      capped: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return null
    const since = args.now - 30 * DAY

    const people = await ctx.db
      .query("persons")
      .withIndex("by_lastEnquiryAt", (q) => q.gt("lastEnquiryAt", since))
      .order("desc")
      .take(MONTH_CAP + 1)
    const month = people.slice(0, MONTH_CAP).filter((p) => !p.deletedAt)

    /* Enquiries per IST day, oldest first, for the sparkline. */
    const days = Array.from({ length: 14 }, (_, i) =>
      indiaDay(args.now - (13 - i) * DAY)
    )
    const perDay = new Map(days.map((day) => [day, 0]))
    let thisWeek = 0
    let lastWeek = 0
    for (const person of month) {
      const at = person.lastEnquiryAt ?? 0
      const day = indiaDay(at)
      if (perDay.has(day)) perDay.set(day, perDay.get(day)! + 1)
      if (at > args.now - 7 * DAY) thisWeek += 1
      else if (at > args.now - 14 * DAY) lastWeek += 1
    }

    const funnel = { new: 0, contacted: 0, interested: 0, enrolled: 0, lost: 0 }
    for (const person of month)
      if (person.leadStatus) funnel[person.leadStatus] += 1

    /* Where each person first came from, and the page they enquired on. */
    const sources = new Map<string, { people: number; enrolled: number }>()
    const pages = new Map<string, number>()
    for (const person of month) {
      const first = await ctx.db
        .query("enquiries")
        .withIndex("by_person", (q) => q.eq("personId", person._id))
        .first()
      if (!first) continue
      const source =
        first.utm?.source ??
        (first.channel === "website"
          ? first.referrer
            ? hostOf(first.referrer)
            : "website, direct"
          : first.channel.replace("_", " "))
      const row = sources.get(source) ?? { people: 0, enrolled: 0 }
      row.people += 1
      if (person.leadStatus === "enrolled") row.enrolled += 1
      sources.set(source, row)
      if (first.page) {
        const page = first.page.split("?")[0]!.split("#")[0]!
        pages.set(page, (pages.get(page) ?? 0) + 1)
      }
    }

    /* Due today or overdue, soonest first, still open. */
    const due = await ctx.db
      .query("persons")
      .withIndex("by_nextFollowUpAt", (q) =>
        q.gt("nextFollowUpAt", 0).lte("nextFollowUpAt", args.now + DAY)
      )
      .take(60)
    const followUps = due
      .filter(
        (p) => !p.deletedAt && p.leadStatus && OPEN_STATUSES.has(p.leadStatus)
      )
      .slice(0, 6)
      .map((p) => ({
        id: p._id,
        name: p.name,
        phone: p.phone,
        track: p.interestTrack,
        due: p.nextFollowUpAt!,
        status: p.leadStatus!,
      }))

    return {
      days: days.map((day) => ({ day, count: perDay.get(day) ?? 0 })),
      thisWeek,
      lastWeek,
      funnel,
      sources: [...sources]
        .map(([source, row]) => ({ source, ...row }))
        .sort((a, b) => b.people - a.people)
        .slice(0, 6),
      pages: [...pages]
        .map(([page, people]) => ({ page, people }))
        .sort((a, b) => b.people - a.people)
        .slice(0, 5),
      followUps,
      capped: people.length > MONTH_CAP,
    }
  },
})

/** Paid money per IST day for two weeks, and the two weeks' totals. */
export const salesTrend = query({
  args: { now: v.number() },
  returns: v.union(
    v.null(),
    v.object({
      days: v.array(v.object({ day: v.string(), paise: v.number() })),
      thisWeek: v.number(),
      lastWeek: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return null
    const viewer = staff.value
    if (!(hasGrant(viewer, "catalog") || viewer.role === "owner")) return null
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_placedAt", (q) => q.gt("placedAt", args.now - 14 * DAY))
      .take(WEEK_CAP * 2)
    const days = Array.from({ length: 14 }, (_, i) =>
      indiaDay(args.now - (13 - i) * DAY)
    )
    const perDay = new Map(days.map((day) => [day, 0]))
    let thisWeek = 0
    let lastWeek = 0
    for (const order of orders) {
      // Money counts once paid, whatever has happened to the parcel since.
      const paid =
        order.payment?.paidAt ??
        (order.status !== "awaiting_payment" && order.status !== "cancelled"
          ? order.placedAt
          : undefined)
      if (!paid || order.status === "refunded") continue
      const day = indiaDay(paid)
      if (perDay.has(day)) perDay.set(day, perDay.get(day)! + order.totalPaise)
      if (paid > args.now - 7 * DAY) thisWeek += order.totalPaise
      else lastWeek += order.totalPaise
    }
    return {
      days: days.map((day) => ({ day, paise: perDay.get(day) ?? 0 })),
      thisWeek,
      lastWeek,
    }
  },
})
