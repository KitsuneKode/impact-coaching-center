import { v } from "convex/values"

import { indiaDay } from "./contactTaps"
import { mutation } from "./_generated/server"
import { consumeRateLimit } from "./persons"

/** The channels lib/attribution.ts knows; anything else arrives as "other". */
export const VISIT_SOURCE = v.union(
  v.literal("instagram"),
  v.literal("facebook"),
  v.literal("youtube"),
  v.literal("chatgpt"),
  v.literal("google"),
  v.literal("whatsapp"),
  v.literal("direct"),
  v.literal("other")
)

/** Visits counted per minute, far above what ICT's site sees. */
const VISITS_PER_MINUTE = 300

/**
 * Count one visit for its source. Anonymous: one more on the day's total,
 * nothing else. The source is a closed list, so a script can only inflate
 * a count, never grow the table.
 */
export const record = mutation({
  args: { source: VISIT_SOURCE },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await consumeRateLimit(ctx, "visits", VISITS_PER_MINUTE, 60_000)))
      return null
    const day = indiaDay(Date.now())
    const row = await ctx.db
      .query("visits")
      .withIndex("by_day_and_source", (q) =>
        q.eq("day", day).eq("source", args.source)
      )
      .unique()
    if (row) await ctx.db.patch(row._id, { count: row.count + 1 })
    else
      await ctx.db.insert("visits", {
        day,
        source: args.source,
        count: 1,
      })
    return null
  },
})
