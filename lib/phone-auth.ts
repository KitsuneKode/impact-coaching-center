import { APIError, createAuthMiddleware, getIp } from "better-auth/api"
import { phoneNumber } from "better-auth/plugins"

import { toE164 } from "./leads"

/** Shared by the Convex adapter and the integration-test memory adapter. */
export function phoneAuthOptions(delivery: {
  send: (target: { phoneNumber: string; code: string }) => Promise<void>
  record: (person: { phone: string; name: string }) => Promise<void>
  /** False refuses the send. See convex/otp.ts for the ceilings. */
  throttle: (target: { phone: string; ip: string | null }) => Promise<boolean>
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
          if (!(await delivery.throttle({ phone, ip }))) {
            throw new APIError("TOO_MANY_REQUESTS", {
              message:
                "Too many codes were requested for this number. Wait a few minutes and try again.",
            })
          }
        }
        // A resend must leave exactly one live code. send-otp only ever
        // inserts, and findVerificationValue resolves ties on createdAt with
        // `limit: 1`, so two rows created inside the same millisecond make
        // which code is accepted undefined - the stale one can win. Deleting
        // first also means a resend invalidates the code it replaces, which
        // is the behaviour a resend button implies.
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
