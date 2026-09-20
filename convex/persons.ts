import { v } from "convex/values"

import { type E164, parseLead, toE164 } from "../lib/leads"
import type { Id } from "./_generated/dataModel"
import {
  internalMutation,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server"

/** Fail closed for anonymous, unverified, or incompletely linked identities. */
export async function findVerifiedPerson(
  ctx: Pick<QueryCtx, "db">,
  identity:
    | { phoneNumber?: string | null; phoneNumberVerified?: boolean | null }
    | null
    | undefined
) {
  if (!identity?.phoneNumberVerified || !identity.phoneNumber) return null
  const phone = toE164(identity.phoneNumber)
  if (!phone) return null
  const person = await ctx.db
    .query("persons")
    .withIndex("by_phone", (q) => q.eq("phone", phone))
    .unique()
  if (!person?.verifiedAt) return null
  return {
    id: person._id,
    name: person.name,
    phone: person.phone,
    role: person.role,
    verifiedAt: person.verifiedAt,
  }
}

/**
 * A Person's name is whatever we learned first.
 *
 * A later enquiry often carries a worse name - an initial, a nickname typed
 * in a hurry - and must not overwrite a good one. An empty stored name should
 * still be filled, which is the case this exists to get right.
 */
export function mergePersonName(stored: string, incoming: string): string {
  if (stored.trim().length > 0) return stored
  return incoming.trim()
}

/**
 * Find the Person with this mobile number, or create them.
 *
 * Phone is the natural key, so every entry point - an enquiry, a verification,
 * a book order - lands on the same record. Convex mutations are serializable,
 * so two concurrent callers cannot both insert: the second conflicts and
 * retries, then finds the row the first wrote. That holds because the read
 * and the write are in the same mutation; splitting the lookup into a query
 * and the insert into a separate mutation would silently break it.
 *
 * `.unique()` throws if duplicates already exist, and Convex has no unique
 * index to prevent them. A duplicate introduced by hand in the dashboard
 * would therefore make every later upsert for that number throw until it is
 * reconciled - loudly, which is the right failure for a natural key.
 */
export async function upsertPersonByPhone(
  ctx: MutationCtx,
  args: { phone: E164; name: string; source: string }
): Promise<Id<"persons">> {
  const existing = await ctx.db
    .query("persons")
    .withIndex("by_phone", (q) => q.eq("phone", args.phone))
    .unique()

  if (existing) {
    // Repair only the exact generated phone placeholder, never a real name.
    const storedName = toE164(existing.name) === args.phone ? "" : existing.name
    const incomingName = toE164(args.name) === args.phone ? "" : args.name
    const name = mergePersonName(storedName, incomingName)
    if (name !== existing.name)
      await ctx.db.patch(existing._id, { name, updatedAt: Date.now() })
    return existing._id
  }

  return await ctx.db.insert("persons", {
    phone: args.phone,
    name: toE164(args.name) === args.phone ? "" : args.name.trim(),
    role: "student",
    source: args.source,
    updatedAt: Date.now(),
  })
}

/**
 * Attach a verified phone number to a Person.
 *
 * Called from the Phone Number plugin's verification callback, which is the
 * only place a number is known to belong to the person holding the handset.
 * Internal: nothing public may mark a Person verified.
 */
export const recordVerifiedPerson = internalMutation({
  args: {
    phone: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const phone = toE164(args.phone)
    if (!phone) {
      // Unreachable while phoneNumberValidator guards the endpoint, which is
      // exactly why this throws rather than storing an unnormalised key.
      throw new Error("Refusing to record a Person under an invalid number.")
    }

    const personId = await upsertPersonByPhone(ctx, {
      phone,
      name: args.name ?? "",
      source: "verification",
    })
    await ctx.db.patch(personId, {
      verifiedAt: Date.now(),
      updatedAt: Date.now(),
    })
    return personId
  },
})

/**
 * Fixed-window rate limit. Returns false once `limit` is reached inside
 * `windowMs`, and starts a fresh window after it elapses.
 *
 * Fixed rather than sliding: a burst straddling a window boundary can briefly
 * reach twice the limit, which is an acceptable trade here for one document
 * read and one write per call. The public enquiry path is not hot enough to
 * justify the extra rows a sliding log would need.
 */
/** Small enough to stay cheap on a hot path, large enough to keep up. */
const PRUNE_PER_CALL = 10

/**
 * A counter is disposable only once no window can still be reading it. The
 * longest window any caller uses is 24 hours (convex/otp.ts), so two days is
 * comfortably past every live bucket. Raise this before adding a longer one.
 */
const STALE_AFTER = 2 * 24 * 60 * 60 * 1000

export async function consumeRateLimit(
  ctx: MutationCtx,
  key: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now()
  // Opportunistic cleanup, a few rows per call: a public path that can mint
  // buckets would otherwise leave a row behind for every one it ever saw.
  //
  // The cutoff is absolute, NOT this caller's `windowMs`. Using the caller's
  // window deleted every bucket with a longer one: a send checks its
  // ten-minute bucket first, which wiped the per-day and global-per-day rows
  // regardless of the counts sitting in them, so those two ceilings never
  // fired at all. The cutoff must outlast the longest window any caller uses.
  const stale = await ctx.db
    .query("rateLimits")
    .withIndex("by_window", (q) => q.lt("windowStart", now - STALE_AFTER))
    .take(PRUNE_PER_CALL)
  for (const row of stale) await ctx.db.delete(row._id)

  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique()
  if (!existing) {
    await ctx.db.insert("rateLimits", { key, count: 1, windowStart: now })
    return true
  }
  if (now - existing.windowStart >= windowMs) {
    await ctx.db.patch(existing._id, { count: 1, windowStart: now })
    return true
  }
  if (existing.count >= limit) return false
  await ctx.db.patch(existing._id, { count: existing.count + 1 })
  return true
}

/** Raised when a caller exceeds a public submission ceiling. */
export const ENQUIRY_RATE_LIMITED = "Enquiry rate limit reached."

const HOUR = 60 * 60 * 1000
/** One shared connection (a college or a cafe) may hold several enquirers. */
const ENQUIRIES_PER_IP_HOUR = 20
/**
 * A single number has no legitimate reason to enquire this often. Set above
 * the handful of retries an impatient visitor might produce, because the
 * ceiling is checked before the idempotency shortcut below - an identical
 * resubmission still spends allowance, so that a flood cannot be laundered
 * through repeats.
 */
const ENQUIRIES_PER_PHONE_HOUR = 10

/** Called only by the authenticated server-to-server ingestion route. */
export const recordEnquiry = internalMutation({
  args: {
    name: v.string(),
    phone: v.string(),
    track: v.string(),
    timing: v.string(),
    /**
     * The visitor's address, forwarded by our own server action. Convex sees
     * that server as the caller, so it cannot observe the visitor itself. Only
     * a holder of the ingestion secret can set this.
     */
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const parsed = parseLead(args)
    if (!parsed.ok) throw new Error("Invalid enquiry.")
    const lead = parsed.lead
    // Checked before any write, and before the idempotency shortcut below, so
    // a flood cannot be laundered through repeated identical submissions.
    if (args.ip !== undefined) {
      const allowed = await consumeRateLimit(
        ctx,
        `enquiry:ip:${args.ip}`,
        ENQUIRIES_PER_IP_HOUR,
        HOUR
      )
      if (!allowed) throw new Error(ENQUIRY_RATE_LIMITED)
    }
    if (
      !(await consumeRateLimit(
        ctx,
        `enquiry:phone:${lead.phone}`,
        ENQUIRIES_PER_PHONE_HOUR,
        HOUR
      ))
    )
      throw new Error(ENQUIRY_RATE_LIMITED)
    const existing = await ctx.db
      .query("persons")
      .withIndex("by_phone", (q) => q.eq("phone", lead.phone))
      .unique()
    const now = Date.now()
    // Course and timing are validated against fixed option lists, so this key
    // holds no visitor-entered text. The name is deliberately left out: the
    // schema keeps free text on activities so an export of persons cannot leak
    // it, and a corrected spelling is the same enquiry anyway.
    const key = `${lead.track}\u0000${lead.timing}`
    // Idempotency, not rate limiting: a double-click or a retried request
    // repeats the identical enquiry, so acknowledge it without a second
    // activity. A different course or timing inside the window is genuine new
    // interest from the same Person and must be recorded - rejecting it told a
    // real enquirer their message had failed. Abusive volume is bounded above
    // by the per-address and per-number ceilings, not here.
    if (
      existing?.lastEnquiryAt !== undefined &&
      now - existing.lastEnquiryAt < 60_000 &&
      existing.lastEnquiryKey === key
    )
      return "recorded" as const
    const personId = await upsertPersonByPhone(ctx, {
      phone: lead.phone,
      name: lead.name,
      source: "website",
    })
    await ctx.db.patch(personId, {
      leadStatus: existing?.leadStatus ?? "new",
      interestTrack: lead.track,
      updatedAt: now,
      lastEnquiryAt: now,
      lastEnquiryKey: key,
    })
    await ctx.db.insert("activities", {
      personId,
      kind: "enquiry",
      track: lead.track,
      timing: lead.timing,
    })
    return "recorded" as const
  },
})
