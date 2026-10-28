import { v } from "convex/values"

import { internal } from "./_generated/api"
import { internalMutation } from "./_generated/server"
import { UNDELIVERABLE_FOR_MS } from "./otp"
import { RATE_LIMIT_STALE_AFTER } from "./persons"

const DAY = 24 * 60 * 60 * 1000
/** Razorpay retries an event for 24 hours; ninety days is plenty to dedupe. */
const PAYMENT_EVENTS_KEPT = 90 * DAY
/** An unpaid checkout attempt this old will not be paid. */
const CHECKOUTS_KEPT = 30 * DAY
/** A sent message's row only guards against sending it twice. */
const MESSAGES_KEPT = 90 * DAY
const BATCH = 200

/**
 * Rows that only matter for a while: numbers WhatsApp could not reach (and
 * so personal data), spent rate-limit windows, old webhook event ids,
 * checkout attempts nobody paid, and old sent messages. Deleted a batch at
 * a time; a full batch schedules another pass.
 */
export const weekly = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now()
    const stale = (status: "open" | "replaced") =>
      ctx.db
        .query("checkouts")
        .withIndex("by_status_and_updatedAt", (q) =>
          q.eq("status", status).lt("updatedAt", now - CHECKOUTS_KEPT)
        )
        .take(BATCH)
    const batches = await Promise.all([
      ctx.db
        .query("otpUndeliverable")
        .withIndex("by_at", (q) => q.lt("at", now - UNDELIVERABLE_FOR_MS))
        .take(BATCH),
      ctx.db
        .query("rateLimits")
        .withIndex("by_windowStart", (q) =>
          q.lt("windowStart", now - RATE_LIMIT_STALE_AFTER)
        )
        .take(BATCH),
      ctx.db
        .query("paymentEvents")
        .withIndex("by_creation_time", (q) =>
          q.lt("_creationTime", now - PAYMENT_EVENTS_KEPT)
        )
        .take(BATCH),
      stale("open"),
      stale("replaced"),
      ctx.db
        .query("messages")
        .withIndex("by_creation_time", (q) =>
          q.lt("_creationTime", now - MESSAGES_KEPT)
        )
        .take(BATCH),
    ])
    await Promise.all(batches.flat().map((row) => ctx.db.delete(row._id)))
    if (batches.some((rows) => rows.length === BATCH))
      await ctx.scheduler.runAfter(0, internal.cleanup.weekly, {})
    return null
  },
})
