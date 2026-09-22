import { v } from "convex/values"

import { parseClientAddress } from "../lib/client-address"
import { toE164 } from "../lib/leads"
import { internalMutation } from "./_generated/server"
import { consumeRateLimit } from "./persons"

/**
 * Which ceiling refused a send, or null when none did.
 *
 * Spec §10 asks a ceiling to "fail closed with a truthful message". A single
 * boolean cannot carry one: telling someone behind a busy shared connection,
 * or someone who hit the deployment-wide cap, that they asked too often for
 * *their number* is simply untrue, and "wait a few minutes" is wrong advice
 * for a twenty-four hour window.
 */
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

/**
 * Spend one send of allowance for this number, this address and the whole
 * deployment. Returns false as soon as any ceiling is hit.
 *
 * Fail closed: allowance already spent on a bucket that passed is not refunded
 * when a later bucket refuses. That is the conservative direction - it can
 * only ever refuse more, never fewer, and refusing a send costs a person a few
 * minutes while allowing one costs real money.
 *
 * The ceilings exist before the transport does on purpose. Today a send writes
 * a line to the Convex log and costs nothing; the moment WhatsApp lands every
 * send is a billed message, and an unthrottled endpoint is both a cost sink
 * and a way to harass any Indian mobile number with codes it did not ask for.
 *
 * Internal: only the auth hook in convex/auth.ts calls this.
 */
export const consumeSendAllowance = internalMutation({
  args: { phone: v.string(), ip: v.optional(v.string()) },
  returns: v.union(
    v.literal("phone"),
    v.literal("address"),
    v.literal("deployment"),
    v.null()
  ),
  handler: async (ctx, args) => {
    const phone = toE164(args.phone)
    if (!phone) return "phone" as SendRefusal
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
      if (!(await consumeRateLimit(ctx, key, limit, windowMs))) return refusal
    }
    return null
  },
})
