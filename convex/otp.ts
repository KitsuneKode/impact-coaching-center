import { v } from "convex/values"

import { parseClientAddress } from "../lib/client-address"
import { toE164 } from "../lib/leads"
import type { Doc } from "./_generated/dataModel"
import type { MutationCtx } from "./_generated/server"
import { internalMutation } from "./_generated/server"
import { consumeRateLimit, rateLimitAllows } from "./persons"

/** Which ceiling refused a send, or null when none did. */
export type SendRefusal =
  | "phone"
  | "address"
  | "deployment"
  | "not_whatsapp"
  | "too_soon"

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** A resend button pressed a few times. More than this is not a person. */
export const SENDS_PER_PHONE_10_MIN = 3
/** Spec §10: roughly one code per new Person; ten a day is generous. */
export const SENDS_PER_PHONE_DAY = 10
/** One shared connection (a college or a cafe) may hold several Persons. */
export const SENDS_PER_IP_HOUR = 15
/** A day on one network; mobile carriers put many people behind one address. */
export const SENDS_PER_IP_DAY = 40
/** Different numbers one address may ask codes for in an hour: a family or a
    classroom is a few, someone cycling random numbers is many. */
export const NEW_NUMBERS_PER_IP_HOUR = 6
/** A burst cannot spend the day's budget in minutes. */
export const SENDS_PER_HOUR_GLOBAL = 150
/** How long a number WhatsApp could not reach stays refused. */
export const UNDELIVERABLE_FOR_MS = 30 * 24 * 60 * 60_000
/** Global daily ceiling. Every send is a billed message once WhatsApp lands. */
export const SENDS_PER_DAY_GLOBAL = 500

/**
 * The least time between two delivered codes to one number, matching the
 * sign-in screen's "Send again in 30s". Without it a script can land three
 * WhatsApp messages on somebody else's phone within seconds.
 */
export const RESEND_GAP_MS = 30_000

/** How long a send may stay in flight before another request may take over. */
export const SEND_LEASE_MS = 20_000

/** Matches the phone plugin's allowedAttempts. A sixth guess finds nothing. */
export const OTP_ATTEMPTS = 5

const CODE_HASH = /^[0-9a-f]{64}$/

const sendRefusal = v.union(
  v.literal("inflight"),
  v.literal("phone"),
  v.literal("address"),
  v.literal("deployment"),
  v.literal("not_whatsapp"),
  v.literal("too_soon")
)

/**
 * The lease for this phone. A lost insert race can leave extras; `.unique()`
 * would then throw on every later send and lock the number out.
 */
async function leaseByPhone(ctx: MutationCtx, phone: string) {
  const rows = await ctx.db
    .query("otpSendLeases")
    .withIndex("by_phone", (q) => q.eq("phone", phone))
    .take(32)
  if (rows.length === 0) return null
  if (rows.length === 1) return rows[0] ?? null
  const now = Date.now()
  const ranked = [...rows].sort((a, b) => b.generation - a.generation)
  const keep =
    ranked.find(
      (row) => row.codeHash !== undefined && (row.codeExpiresAt ?? 0) > now
    ) ??
    ranked[0] ??
    null
  if (!keep) return null
  const maxGeneration = ranked[0]?.generation ?? keep.generation
  const discardsANewerOrEqualGeneration = rows.some(
    (row) => row._id !== keep._id && row.generation >= keep.generation
  )
  await Promise.all(
    rows
      .filter((extra) => extra._id !== keep._id)
      .map((extra) => ctx.db.delete(extra._id))
  )
  if (!discardsANewerOrEqualGeneration) return keep
  const generation = maxGeneration + 1
  await ctx.db.patch(keep._id, { generation })
  return { ...keep, generation }
}

function hashesMatch(left: string, right: string) {
  if (left.length !== right.length) return false
  let diff = 0
  for (let index = 0; index < left.length; index++)
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index)
  return diff === 0
}

/** Drop the acceptable code. The generation and any in-flight hold stay. */
async function clearCode(
  ctx: MutationCtx,
  row: Doc<"otpSendLeases">,
  inflightUntil: number
) {
  await ctx.db.replace(row._id, {
    phone: row.phone,
    generation: row.generation,
    inflightUntil,
    attempts: 0,
  })
}

/** Whether this rate-limit key was used within the last hour. */
async function askedRecently(ctx: MutationCtx, key: string, now: number) {
  const row = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first()
  return row !== null && now - row.windowStart < HOUR
}

/**
 * Meta reported these numbers could not get a WhatsApp message (they are not
 * on WhatsApp). Later sends to them are refused for UNDELIVERABLE_FOR_MS.
 */
export const markUndeliverable = internalMutation({
  args: {
    /** One entry per failed status in a webhook, delivered together. */
    failures: v.array(
      v.object({ phones: v.array(v.string()), code: v.number() })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now()
    // The same number can fail twice in one webhook; the last code wins.
    const codes = new Map<string, number>()
    for (const { phones, code } of args.failures.slice(0, 50))
      for (const raw of phones.slice(0, 50)) {
        const phone = toE164(raw)
        if (phone) codes.set(phone, code)
      }
    await Promise.all(
      [...codes].map(async ([phone, code]) => {
        const row = await ctx.db
          .query("otpUndeliverable")
          .withIndex("by_phone", (q) => q.eq("phone", phone))
          .first()
        if (row) await ctx.db.patch(row._id, { at: now, code })
        else await ctx.db.insert("otpUndeliverable", { phone, code, at: now })
      })
    )
    return null
  },
})

/** Spend allowance and take the per-phone send lease in one mutation. */
export const claimOtpSend = internalMutation({
  args: { phone: v.string(), ip: v.optional(v.string()) },
  returns: v.union(
    v.object({ ok: v.literal(true), generation: v.number() }),
    v.object({ ok: v.literal(false), reason: sendRefusal })
  ),
  handler: async (ctx, args) => {
    const phone = toE164(args.phone)
    if (!phone) return { ok: false as const, reason: "phone" as const }
    const now = Date.now()
    const existing = await leaseByPhone(ctx, phone)
    if (existing && existing.inflightUntil > now)
      return { ok: false as const, reason: "inflight" as const }
    if (existing?.resendAfter && existing.resendAfter > now)
      return { ok: false as const, reason: "too_soon" as const }
    // WhatsApp already told us it cannot reach this number: refuse before
    // spending anything, and say why.
    const undeliverable = await ctx.db
      .query("otpUndeliverable")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .first()
    if (undeliverable && now - undeliverable.at < UNDELIVERABLE_FOR_MS)
      return { ok: false as const, reason: "not_whatsapp" as const }
    // Validated exactly as the enquiry path does. The address arrives from a
    // header the caller controls, so an unchecked value would both evade this
    // ceiling and mint a counter row per made-up spelling. ADR-0004.
    const ip = parseClientAddress(args.ip)
    const checks: Array<{
      key: string
      limit: number
      windowMs: number
      refusal: SendRefusal
    }> = [
      {
        key: `otp:phone:10m:${phone}`,
        limit: SENDS_PER_PHONE_10_MIN,
        windowMs: 10 * MINUTE,
        refusal: "phone",
      },
      {
        key: `otp:phone:day:${phone}`,
        limit: SENDS_PER_PHONE_DAY,
        windowMs: DAY,
        refusal: "phone",
      },
      ...(ip
        ? [
            {
              key: `otp:ip:${ip}`,
              limit: SENDS_PER_IP_HOUR,
              windowMs: HOUR,
              refusal: "address" as SendRefusal,
            },
            {
              key: `otp:ip:day:${ip}`,
              limit: SENDS_PER_IP_DAY,
              windowMs: DAY,
              refusal: "address" as SendRefusal,
            },
            // A number this address has not asked for in the last hour
            // counts against its new-number allowance.
            ...((await askedRecently(ctx, `otp:ipnum:${ip}:${phone}`, now))
              ? []
              : [
                  {
                    key: `otp:ip:newnum:${ip}`,
                    limit: NEW_NUMBERS_PER_IP_HOUR,
                    windowMs: HOUR,
                    refusal: "address" as SendRefusal,
                  },
                ]),
            {
              key: `otp:ipnum:${ip}:${phone}`,
              limit: Number.MAX_SAFE_INTEGER,
              windowMs: HOUR,
              refusal: "address" as SendRefusal,
            },
          ]
        : []),
      {
        key: "otp:global:hour",
        limit: SENDS_PER_HOUR_GLOBAL,
        windowMs: HOUR,
        refusal: "deployment",
      },
      {
        key: "otp:global:day",
        limit: SENDS_PER_DAY_GLOBAL,
        windowMs: DAY,
        refusal: "deployment",
      },
    ]
    /* Every ceiling is checked before any is spent: a refusal by the
       deployment's daily cap must not also use up this number's own
       allowance, or a person retrying during an outage locks themselves
       out for ten minutes once it is over. One transaction, so nothing can
       slip in between the check and the spend. */
    const verdicts = await Promise.all(
      checks.map((check) =>
        rateLimitAllows(ctx, check.key, check.limit, check.windowMs)
      )
    )
    const refused = checks.find((_, i) => !verdicts[i])
    if (refused) return { ok: false as const, reason: refused.refusal }
    // In turn, not in parallel: each spend also prunes a few stale rows,
    // and two at once could pick the same row to delete.
    for (const { key, limit, windowMs } of checks)
      await consumeRateLimit(ctx, key, limit, windowMs)
    const generation = (existing?.generation ?? 0) + 1
    const inflightUntil = now + SEND_LEASE_MS
    if (existing)
      await ctx.db.patch(existing._id, { generation, inflightUntil })
    else
      await ctx.db.insert("otpSendLeases", {
        phone,
        generation,
        inflightUntil,
        attempts: 0,
      })
    return { ok: true as const, generation }
  },
})

/** Record the code this generation may accept. */
export const commitOtpCode = internalMutation({
  args: {
    phone: v.string(),
    generation: v.number(),
    codeHash: v.string(),
    codeExpiresAt: v.number(),
  },
  returns: v.union(v.literal("ok"), v.literal("lost"), v.literal("expired")),
  handler: async (ctx, args) => {
    const phone = toE164(args.phone)
    if (!phone || !CODE_HASH.test(args.codeHash)) return "lost"
    const now = Date.now()
    const ttl = args.codeExpiresAt - now
    if (ttl <= 0 || ttl > 10 * MINUTE) return "lost"
    const row = await leaseByPhone(ctx, phone)
    if (!row || row.generation !== args.generation) return "lost"
    if (row.inflightUntil <= now) return "expired"
    await ctx.db.patch(row._id, {
      codeHash: args.codeHash,
      codeExpiresAt: args.codeExpiresAt,
      attempts: 0,
      inflightUntil: now + SEND_LEASE_MS,
    })
    return "ok"
  },
})

/** The code was delivered. Release the hold and leave the hash verifiable. */
export const releaseOtpSend = internalMutation({
  args: { phone: v.string(), generation: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const phone = toE164(args.phone)
    if (!phone) return null
    const row = await leaseByPhone(ctx, phone)
    if (!row || row.generation !== args.generation) return null
    await ctx.db.patch(row._id, {
      inflightUntil: 0,
      resendAfter: Date.now() + RESEND_GAP_MS,
    })
    return null
  },
})

/**
 * Delivery failed after commit. Drop the code nobody received and release
 * the hold. A previous code is already gone: commit replaced it.
 */
export const abortOtpCode = internalMutation({
  args: { phone: v.string(), generation: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const phone = toE164(args.phone)
    if (!phone) return null
    const row = await leaseByPhone(ctx, phone)
    if (!row || row.generation !== args.generation) return null
    await clearCode(ctx, row, 0)
    return null
  },
})

export const verifyOtpCode = internalMutation({
  args: { phone: v.string(), codeHash: v.string() },
  returns: v.union(
    v.literal("ok"),
    v.literal("missing"),
    v.literal("expired"),
    v.literal("exhausted"),
    v.literal("invalid")
  ),
  handler: async (ctx, args) => {
    const phone = toE164(args.phone)
    if (!phone) return "missing"
    const row = await leaseByPhone(ctx, phone)
    if (!row?.codeHash || row.codeExpiresAt === undefined) return "missing"
    if (row.codeExpiresAt <= Date.now()) {
      await clearCode(ctx, row, row.inflightUntil)
      return "expired"
    }
    if (row.attempts >= OTP_ATTEMPTS) {
      await clearCode(ctx, row, row.inflightUntil)
      return "exhausted"
    }
    if (
      !CODE_HASH.test(args.codeHash) ||
      !hashesMatch(row.codeHash, args.codeHash)
    ) {
      const attempts = row.attempts + 1
      if (attempts >= OTP_ATTEMPTS) {
        await clearCode(ctx, row, row.inflightUntil)
        return "exhausted"
      }
      await ctx.db.patch(row._id, { attempts })
      return "invalid"
    }
    await clearCode(ctx, row, row.inflightUntil)
    return "ok"
  },
})
