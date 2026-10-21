import { v } from "convex/values"

import { internal } from "./_generated/api"
import { internalMutation } from "./_generated/server"
import { UNDELIVERABLE_FOR_MS } from "./otp"
import { RATE_LIMIT_STALE_AFTER } from "./persons"

const DAY = 24 * 60 * 60 * 1000
/** Razorpay retries an event for 24 hours; ninety days is plenty to dedupe. */
const PAYMENT_EVENTS_KEPT = 90 * DAY
const BATCH = 200

/**
 * Rows that only matter for a while: numbers WhatsApp could not reach (and
 * so personal data), spent rate-limit windows, and old webhook event ids.
 * Deleted a batch at a time; a full batch schedules another pass.
 */
export const daily = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now()
    const undeliverable = await ctx.db
      .query("otpUndeliverable")
      .withIndex("by_at", (q) => q.lt("at", now - UNDELIVERABLE_FOR_MS))
      .take(BATCH)
    const limits = await ctx.db
      .query("rateLimits")
      .withIndex("by_windowStart", (q) =>
        q.lt("windowStart", now - RATE_LIMIT_STALE_AFTER)
      )
      .take(BATCH)
    const events = await ctx.db
      .query("paymentEvents")
      .withIndex("by_creation_time", (q) =>
        q.lt("_creationTime", now - PAYMENT_EVENTS_KEPT)
      )
      .take(BATCH)
    for (const row of [...undeliverable, ...limits, ...events])
      await ctx.db.delete(row._id)
    if ([undeliverable, limits, events].some((rows) => rows.length === BATCH))
      await ctx.scheduler.runAfter(0, internal.cleanup.daily, {})
    return null
  },
})
