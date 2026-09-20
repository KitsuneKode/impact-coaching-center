import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { betterAuth } from "better-auth/minimal"

import { chooseTransport, sendOtp } from "../lib/otp-transport"
import { phoneAuthOptions } from "../lib/phone-auth"
import { components, internal } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import { query } from "./_generated/server"
import authConfig from "./auth.config"
import { findVerifiedPerson } from "./persons"

export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  /**
   * Resolved before the plugin is constructed, because the plugin writes the
   * verification row *before* it calls sendOTP: a transport that failed at
   * send time would leave a stored, still-acceptable code that nobody
   * received. Fail-closed means refusing to build the auth instance at all.
   *
   * This runs per call rather than at module load, unlike an earlier revision,
   * because the check now reads CONVEX_SITE_URL, which Convex supplies to the
   * running function rather than to module scope. The cost is that a
   * misconfigured deployment surfaces per request instead of at construction.
   */
  const transport = chooseTransport(
    process.env.OTP_TRANSPORT,
    process.env.CONVEX_SITE_URL
  )
  const phone = phoneAuthOptions({
    // Awaited deliberately. The plugin only backgrounds this when
    // `advanced.backgroundTasks.handler` is configured, which it is not, so
    // returning the promise is what makes a delivery failure fail the request
    // instead of answering "code sent" to someone who will never receive one.
    send: (target) => sendOtp(transport, target),
    // Spends allowance before a code is generated or stored. Every send is a
    // billed message once the WhatsApp transport lands, so the ceiling is a
    // cost control as much as an abuse control. See convex/otp.ts.
    throttle: async ({ phone, ip }) => {
      if (!("runMutation" in ctx))
        throw new Error(
          "Sending a verification code requires a mutation-capable context."
        )
      return await ctx.runMutation(internal.otp.consumeSendAllowance, {
        phone,
        ip: ip ?? undefined,
      })
    },
    // The one point at which a number is known to belong to the person holding
    // the handset, so it is where the Person is created and stamped verified.
    // See ADR-0001.
    record: async (person) => {
      // GenericCtx spans query, mutation and action contexts; only the latter
      // two can write. Verification always arrives through an HTTP action, so
      // this narrows rather than guards a real case - but it fails loudly
      // instead of silently dropping the Person if that stops being true.
      if (!("runMutation" in ctx))
        throw new Error(
          "Phone verification requires a mutation-capable context."
        )
      await ctx.runMutation(internal.persons.recordVerifiedPerson, person)
    },
  })
  return betterAuth({
    database: authComponent.adapter(ctx),
    ...phone,
    plugins: [...phone.plugins, convex({ authConfig })],
  })
}

/**
 * The signed-in Person, or null when nobody is signed in.
 *
 * Domain identity only: auth-component IDs never serve as Person IDs, and the
 * raw auth document is never returned - it carries the synthetic
 * @person.ict.invalid address, which no client needs and which ADR-0001 says
 * must never be presented as contactable.
 */
export const getCurrentPerson = query({
  args: {},
  handler: async (ctx) => {
    // safeGetAuthUser is deliberate: getAuthUser throws ConvexError
    // "Unauthenticated" for anonymous visitors, so a public page calling it
    // would render a 500 for everyone who is not signed in.
    const identity = await authComponent.safeGetAuthUser(ctx)
    return findVerifiedPerson(ctx, identity)
  },
})
