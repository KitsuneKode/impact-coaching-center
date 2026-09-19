import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { betterAuth } from "better-auth/minimal"
import { phoneNumber } from "better-auth/plugins"

import { toE164 } from "../lib/leads"
import { chooseTransport, sendOtp } from "../lib/otp-transport"
import { components, internal } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import { query } from "./_generated/server"
import authConfig from "./auth.config"

export const authComponent = createClient<DataModel>(components.betterAuth)

/**
 * Resolved once, at module load, so a deployment with no OTP_TRANSPORT fails
 * while this module is being constructed rather than mid-request.
 *
 * The ordering matters: the plugin writes the verification row *before* it
 * calls sendOTP, so a transport that threw at send time would leave a stored,
 * still-acceptable code that nobody received - the very thing the fail-closed
 * rule exists to prevent.
 */
const otpTransport = chooseTransport(process.env.OTP_TRANSPORT)

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    database: authComponent.adapter(ctx),
    plugins: [
      phoneNumber({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 5,
        /**
         * Rejects anything that is not an Indian mobile before a code is
         * generated or stored. Without this the endpoint would happily accept
         * a foreign number and create a verification row for it.
         */
        phoneNumberValidator: (input) => toE164(input) !== null,
        /**
         * Awaited deliberately. The plugin only backgrounds this when
         * `advanced.backgroundTasks.handler` is configured, which it is not,
         * so returning a promise here is what makes a delivery failure fail
         * the request instead of returning "code sent" to someone who will
         * never receive one.
         */
        sendOTP: async (data) => {
          await sendOtp(otpTransport, {
            phoneNumber: data.phoneNumber,
            code: data.code,
          })
        },
        /**
         * The one point at which a number is known to belong to the person
         * holding the handset, so it is where the Person record is created
         * and stamped verified. See ADR-0001.
         */
        callbackOnVerification: async (data) => {
          // GenericCtx spans query, mutation and action contexts; only the
          // latter two can write. Verification always arrives through an HTTP
          // action, so this narrows rather than guards a real case - but it
          // fails loudly instead of silently dropping the Person if that ever
          // stops being true.
          if (!("runMutation" in ctx)) {
            throw new Error(
              "Phone verification ran in a context that cannot write; the Person was not recorded."
            )
          }
          await ctx.runMutation(internal.persons.recordVerifiedPerson, {
            phone: data.phoneNumber,
            name: data.user.name,
          })
        },
        signUpOnVerification: {
          /**
           * Better Auth's core requires a unique email, so a verified Person
           * carries a placeholder. It must never receive mail and must never
           * appear in an export presented as a contactable address. Account
           * recovery is therefore phone-only - see docs/adr/0001.
           */
          getTempEmail: (phone) => `${phone}@person.ict.invalid`,
        },
      }),
      convex({ authConfig }),
    ],
  })

/**
 * The signed-in Person, or undefined when nobody is signed in.
 *
 * safeGetAuthUser is deliberate: getAuthUser throws ConvexError
 * "Unauthenticated" for anonymous visitors, so a public page calling it would
 * render a 500 for everyone who is not signed in.
 *
 * Projected rather than returned whole: the raw document carries the
 * synthetic @person.ict.invalid address, which no client needs and ADR-0001
 * says must never be presented as contactable.
 */
export const getCurrentPerson = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) return null
    return {
      id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      phoneNumberVerified: user.phoneNumberVerified,
    }
  },
})
