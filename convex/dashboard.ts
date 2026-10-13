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
