import { v } from "convex/values"

import { toE164 } from "../lib/leads"
import { internalMutation } from "./_generated/server"
import { consumeRateLimit } from "./persons"

/** Raised when a caller exceeds a verification-code send ceiling. */
export const OTP_SEND_LIMITED = "Verification code send limit reached."

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
  handler: async (ctx, args) => {
    const phone = toE164(args.phone)
    if (!phone) return false
    const checks: Array<[string, number, number]> = [
      [`otp:phone:10m:${phone}`, SENDS_PER_PHONE_10_MIN, 10 * MINUTE],
      [`otp:phone:day:${phone}`, SENDS_PER_PHONE_DAY, DAY],
      ...(args.ip
        ? ([[`otp:ip:${args.ip}`, SENDS_PER_IP_HOUR, HOUR]] as Array<
            [string, number, number]
          >)
        : []),
      ["otp:global:day", SENDS_PER_DAY_GLOBAL, DAY],
    ]
    for (const [key, limit, windowMs] of checks) {
      if (!(await consumeRateLimit(ctx, key, limit, windowMs))) return false
    }
    return true
  },
})
