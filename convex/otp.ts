import { v } from "convex/values"

import { parseClientAddress } from "../lib/client-address"
import { toE164 } from "../lib/leads"
import type { Doc } from "./_generated/dataModel"
import type { MutationCtx } from "./_generated/server"
import { internalMutation } from "./_generated/server"
import { consumeRateLimit } from "./persons"

/** Which ceiling refused a send, or null when none did. */
export type SendRefusal = "phone" | "address" | "deployment"

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** A resend button pressed a few times. More than this is not a person. */
export const SENDS_PER_PHONE_10_MIN = 3
/** Spec §10: roughly one code per new Person; ten a day is generous. */
export const SENDS_PER_PHONE_DAY = 10
/** One shared connection (a college or a cafe) may hold several Persons. */
export const SENDS_PER_IP_HOUR = 15
/** Global daily ceiling. Every send is a billed message once WhatsApp lands. */
export const SENDS_PER_DAY_GLOBAL = 500

/** How long a send may stay in flight before another request may take over. */
export const SEND_LEASE_MS = 20_000

/** Matches the phone plugin's allowedAttempts. A sixth guess finds nothing. */
export const OTP_ATTEMPTS = 5

const CODE_HASH = /^[0-9a-f]{64}$/

const sendRefusal = v.union(
  v.literal("inflight"),
  v.literal("phone"),
  v.literal("address"),
  v.literal("deployment")
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
  for (const extra of rows) {
    if (extra._id !== keep._id) await ctx.db.delete(extra._id)
  }
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
          ]
        : []),
      {
        key: "otp:global:day",
        limit: SENDS_PER_DAY_GLOBAL,
        windowMs: DAY,
        refusal: "deployment",
      },
    ]
    for (const { key, limit, windowMs, refusal } of checks) {
      if (!(await consumeRateLimit(ctx, key, limit, windowMs)))
        return { ok: false as const, reason: refusal }
    }
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
    await ctx.db.patch(row._id, { inflightUntil: 0 })
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
