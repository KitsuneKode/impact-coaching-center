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
    /* Carried so a Person can edit their own record. */
    revision: person.revision ?? 0,
  }
}

/** A Person's name is whatever we learned first. */
export function mergePersonName(stored: string, incoming: string): string {
  if (stored.trim().length > 0) return stored
  return incoming.trim()
}

/** Find the Person with this mobile number, or create them. */
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

/** Attach a verified phone number to a Person. */
export const recordVerifiedPerson = internalMutation({
  args: {
    phone: v.string(),
    name: v.optional(v.string()),
  },
  returns: v.id("persons"),
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
  const stale = await ctx.db
    .query("rateLimits")
    .withIndex("by_window", (q) => q.lt("windowStart", now - STALE_AFTER))
    .take(PRUNE_PER_CALL)
  await Promise.all(stale.map((row) => ctx.db.delete(row._id)))

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
/** A single number has no legitimate reason to enquire this often. */
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
  returns: v.literal("recorded"),
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
    // Idempotency, not rate limiting: a double-click or a retried request repeats
    // the identical enquiry, so acknowledge it without a second activity.
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
