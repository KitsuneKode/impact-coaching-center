import { v } from "convex/values"

import { query, type QueryCtx } from "./_generated/server"
import schema from "./schema"

/*
 * The public exam calendar: published dates only. Drafts are read through
 * calendarAdmin.ts. No clock here - the page passes the day it wants to read
 * from, so the query caches and stays pure.
 */

const DATE = schema.tables.examDates.validator.pick(
  "exam",
  "kind",
  "title",
  "titleAs",
  "starts",
  "ends",
  "tentative",
  "source"
)

/** Several cycles' worth; the page shows a few months either side. */
const PUBLIC_MAX = 200

/** Published dates starting on or after `since`, earliest first. */
export async function readCalendar(ctx: Pick<QueryCtx, "db">, since: string) {
  const rows = await ctx.db
    .query("examDates")
    .withIndex("by_published_and_starts", (q) =>
      q.eq("published", true).gte("starts", since)
    )
    .take(PUBLIC_MAX)
  return rows.map((row) => ({
    exam: row.exam,
    kind: row.kind,
    title: row.title,
    titleAs: row.titleAs,
    starts: row.starts,
    ends: row.ends,
    tentative: row.tentative,
    source: row.source,
  }))
}

export const dates = query({
  args: { since: v.string() },
  returns: v.array(DATE),
  handler: (ctx, args) => readCalendar(ctx, args.since),
})
