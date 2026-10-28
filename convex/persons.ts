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
  /* `.first()`, not `.unique()`: the phone key should never duplicate, but if
     corruption ever did, `unique()` would throw and break sign-in entirely -
     `first()` degrades to one row instead. */
  const person = await ctx.db
    .query("persons")
    .withIndex("by_phone", (q) => q.eq("phone", phone))
    .first()
  if (!person?.verifiedAt) return null
  return {
    id: person._id,
    name: person.name,
    phone: person.phone,
    role: person.role,
    grants: person.grants ?? [],
    locale: person.locale,
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
    .first()

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
export const RATE_LIMIT_STALE_AFTER = 2 * 24 * 60 * 60 * 1000

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
    .withIndex("by_windowStart", (q) =>
      q.lt("windowStart", now - RATE_LIMIT_STALE_AFTER)
    )
    .take(PRUNE_PER_CALL)
  await Promise.all(stale.map((row) => ctx.db.delete(row._id)))

  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first()
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

/**
 * Whether one more call fits under `limit`, without spending it. Callers
 * with several ceilings check them all first and spend only when every one
 * allows, so a refusal by the last never uses up the first.
 */
export async function rateLimitAllows(
  ctx: MutationCtx,
  key: string,
  limit: number,
  windowMs: number
) {
  const row = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first()
  return !row || Date.now() - row.windowStart >= windowMs || row.count < limit
}

/** Raised when a caller exceeds a public submission ceiling. */
/**
 * Better Auth's per-address limiter (convex/auth.ts), on the same indexed
 * counters. The key is Better Auth's "address|path".
 */
export const consumeAuthRateLimit = internalMutation({
  args: { key: v.string(), max: v.number(), windowMs: v.number() },
  returns: v.object({
    allowed: v.boolean(),
    retryAfter: v.union(v.number(), v.null()),
  }),
  handler: async (ctx, { key, max, windowMs }) => {
    const bucket = `auth:${key.slice(0, 200)}`
    if (await consumeRateLimit(ctx, bucket, max, windowMs))
      return { allowed: true, retryAfter: null }
    const row = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", bucket))
      .first()
    const left = row ? row.windowStart + windowMs - Date.now() : windowMs
    return { allowed: false, retryAfter: Math.max(1, Math.ceil(left / 1000)) }
  },
})

export const ENQUIRY_RATE_LIMITED = "Enquiry rate limit reached."

const HOUR = 60 * 60 * 1000
/** One shared connection (a college or a cafe) may hold several enquirers. */
const ENQUIRIES_PER_IP_HOUR = 20
/** A single number has no legitimate reason to enquire this often. */
const ENQUIRIES_PER_PHONE_HOUR = 10

/** Where an enquiry came from, as the site saw it. */
export const ATTRIBUTION = {
  page: v.optional(v.string()),
  utmSource: v.optional(v.string()),
  utmMedium: v.optional(v.string()),
  utmCampaign: v.optional(v.string()),
  referrer: v.optional(v.string()),
}

/** Trimmed and capped; empty becomes absent. */
const clip = (value: string | undefined, max = 200) =>
  value?.trim().slice(0, max) || undefined

/** The same enquiry twice inside this window is one enquiry. */
const DUPLICATE_WINDOW_MS = 60_000

/** Called only by the authenticated server-to-server ingestion route. */
export const recordEnquiry = internalMutation({
  args: {
    name: v.string(),
    phone: v.string(),
    track: v.string(),
    timing: v.string(),
    /** The visitor's address, forwarded by our own server action. */
    ip: v.optional(v.string()),
    ...ATTRIBUTION,
  },
  returns: v.literal("recorded"),
  handler: async (ctx, args) => {
    const parsed = parseLead(args)
    if (!parsed.ok) throw new Error("Invalid enquiry.")
    const lead = parsed.lead
    // Before any write and before the duplicate check, so a flood cannot be
    // laundered through repeated identical submissions.
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

    const now = Date.now()
    const personId = await upsertPersonByPhone(ctx, {
      phone: lead.phone,
      name: lead.name,
      source: "website",
    })
    const last = await ctx.db
      .query("enquiries")
      .withIndex("by_person", (q) => q.eq("personId", personId))
      .order("desc")
      .first()
    // A double-click or a retried request is the same enquiry. A second
    // child on the same phone is not: the name tells them apart.
    if (
      last &&
      now - last._creationTime < DUPLICATE_WINDOW_MS &&
      last.track === lead.track &&
      last.timing === lead.timing &&
      (last.name === undefined || last.name === lead.name)
    )
      return "recorded" as const

    const person = await ctx.db.get(personId)
    // Families share one phone; the lead sheet says who this one was for.
    const forSomeoneElse =
      person && person.name && person.name !== lead.name ? lead.name : undefined
    await ctx.db.patch(personId, {
      leadStatus: person?.leadStatus ?? "new",
      interestTrack: lead.track,
      lastEnquiryAt: now,
      updatedAt: now,
    })
    const utm = {
      source: clip(args.utmSource, 80),
      medium: clip(args.utmMedium, 80),
      campaign: clip(args.utmCampaign, 120),
    }
    await ctx.db.insert("enquiries", {
      personId,
      channel: "website",
      name: lead.name,
      track: lead.track,
      timing: lead.timing,
      page: clip(args.page),
      utm: utm.source || utm.medium || utm.campaign ? utm : undefined,
      referrer: clip(args.referrer),
    })
    await ctx.db.insert("activities", {
      personId,
      kind: "enquiry",
      track: lead.track,
      timing: lead.timing,
      body: forSomeoneElse ? `For ${forSomeoneElse}` : undefined,
    })
    return "recorded" as const
  },
})
