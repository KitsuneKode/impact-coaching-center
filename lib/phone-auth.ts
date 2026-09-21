import { APIError, createAuthMiddleware, getIp } from "better-auth/api"
import { phoneNumber } from "better-auth/plugins"

import { toE164 } from "./leads"

/**
 * What a refused send tells the person, per ceiling.
 *
 * Each has to be true of the ceiling that actually fired. A shared college
 * connection hitting the address limit is not the visitor asking too often,
 * and the deployment cap is not something they can wait out in a few minutes.
 */
const REFUSAL_MESSAGES = {
  phone:
    "Too many codes were requested for this number. Wait a few minutes and try again.",
  address:
    "Too many codes were requested from this internet connection. Wait a while, or call ICT instead.",
  deployment:
    "We cannot send verification codes at the moment. Please call or message ICT and they will help you directly.",
} as const

/** Shared by the Convex adapter and the integration-test memory adapter. */
export function phoneAuthOptions(delivery: {
  send: (target: { phoneNumber: string; code: string }) => Promise<void>
  record: (person: { phone: string; name: string }) => Promise<void>
  /**
   * Null allows the send; a scope refuses it and says which ceiling was hit,
   * so the message the caller sees is true. See convex/otp.ts.
   */
  throttle: (target: {
    phone: string
    ip: string | null
  }) => Promise<"phone" | "address" | "deployment" | null>
}) {
  return {
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (!ctx.path.startsWith("/phone-number/")) return
        // Reject before the plugin consumes the OTP or edits its account.
        if (ctx.body?.updatePhoneNumber) {
          throw new APIError("FORBIDDEN", {
            message: "Phone changes require staff assistance.",
          })
        }
        const raw = ctx.body?.phoneNumber
        const phone = typeof raw === "string" ? toE164(raw) : null
        if (!phone)
          throw new APIError("BAD_REQUEST", {
            message: "Enter a valid Indian mobile number.",
          })
        if (ctx.path === "/phone-number/send-otp") {
          // Checked before the delete below: a refused resend must leave the
          // live code intact, or a flood of refused sends could be used to
          // lock a real Person out of the code they already received.
          const ip = getIp(
            ctx.request ?? ctx.headers ?? new Headers(),
            ctx.context.options
          )
          const refusal = await delivery.throttle({ phone, ip })
          if (refusal) {
            throw new APIError("TOO_MANY_REQUESTS", {
              message: REFUSAL_MESSAGES[refusal],
            })
          }
        }
        // Retire the previous code on sequential resends. The plugin inserts
        // separately, so delete + insert is NOT atomic across concurrent
        // requests. Hosted OTP requires a concurrency safeguard before launch;
        // see docs/research/2026-09-20-implementation-and-merge-status.md.
        if (ctx.path === "/phone-number/send-otp") {
          await ctx.context.internalAdapter.deleteVerificationByIdentifier(
            phone
          )
        }
        return {
          context: { ...ctx, body: { ...ctx.body, phoneNumber: phone } },
        }
      }),
    },
    plugins: [
      phoneNumber({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 5,
        phoneNumberValidator: (input) => toE164(input) === input,
        sendOTP: delivery.send,
        callbackOnVerification: async ({ phoneNumber: phone, user }) => {
          await delivery.record({ phone, name: user.name })
        },
        signUpOnVerification: {
          getTempEmail: (phone) => `${phone}@person.ict.invalid`,
          getTempName: () => "",
        },
      }),
    ],
  }
}
