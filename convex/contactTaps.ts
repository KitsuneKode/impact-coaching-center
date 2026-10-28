import { v } from "convex/values"

import { mutation } from "./_generated/server"
import { consumeRateLimit } from "./persons"

/** India's date for a moment, as YYYY-MM-DD. */
export function indiaDay(at: number) {
  return new Date(at + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

const tidy = (text: string, max: number) =>
  text
    .replace(/[^\p{L}\p{N}\-_/.: ]/gu, "")
    .trim()
    .slice(0, max) || "unknown"

/** Distinct page and source pairs one day keeps; ICT's site has far fewer. */
const ROWS_PER_DAY = 300

/** Taps counted per kind per minute, far above real visitors. */
const TAPS_PER_MINUTE = 120

/**
 * Count one tap on a WhatsApp or phone link. Anonymous on purpose: it adds
 * one to the day's total for that page and source, nothing else. A flood can
 * only inflate a count, never touch a person.
 */
export const record = mutation({
  args: {
    kind: v.union(v.literal("whatsapp"), v.literal("call")),
    page: v.string(),
    source: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // A ceiling per kind, so a script cannot inflate the counts at will.
    if (
      !(await consumeRateLimit(
        ctx,
        `taps:${args.kind}`,
        TAPS_PER_MINUTE,
        60_000
      ))
    )
      return null
    const day = indiaDay(Date.now())
    let page = tidy(args.page.split("?")[0] ?? "/", 120)
    let source = tidy(args.source, 60)
    // Anyone can call this, so made-up pages must not grow the table without
    // end: past a day's worth of real rows, new spellings share one row.
    const today = await ctx.db
      .query("contactTaps")
      .withIndex("by_day_and_kind_and_page_and_source", (q) => q.eq("day", day))
      .take(ROWS_PER_DAY)
    if (
      today.length >= ROWS_PER_DAY &&
      !today.some(
        (row) =>
          row.kind === args.kind && row.page === page && row.source === source
      )
    ) {
      page = "other"
      source = "other"
    }
    const row = await ctx.db
      .query("contactTaps")
      .withIndex("by_day_and_kind_and_page_and_source", (q) =>
        q
          .eq("day", day)
          .eq("kind", args.kind)
          .eq("page", page)
          .eq("source", source)
      )
      .unique()
    if (row) await ctx.db.patch(row._id, { count: row.count + 1 })
    else
      await ctx.db.insert("contactTaps", {
        day,
        kind: args.kind,
        page,
        source,
        count: 1,
      })
    return null
  },
})
