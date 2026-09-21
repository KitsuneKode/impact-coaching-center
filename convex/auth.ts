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
   * Resolved before the plugin is constructed. Fail-closed means refusing to
   * build the auth instance at all when the transport is not explicitly local
   * or is not implemented yet.
   *
   * This runs per call rather than at module load, unlike an earlier revision,
   * because the check now reads CONVEX_SITE_URL, which Convex supplies to the
   * running function rather than to module scope. The cost is that a
   * misconfigured deployment surfaces per request instead of at construction.
   *
   * The plugin still inserts its own verification row before sendOTP. That row
   * is not acceptable. Acceptance is the lease hash, and a delivery failure
   * aborts it. See lib/phone-auth.ts.
   */
  const transport = chooseTransport(
    process.env.OTP_TRANSPORT,
    process.env.CONVEX_SITE_URL
  )
  const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET
  if (!secret)
    throw new Error(
      "BETTER_AUTH_SECRET or AUTH_SECRET is required to hash verification codes."
    )
  const requireMutation = () => {
    if (!("runMutation" in ctx))
      throw new Error("Phone verification requires a mutation-capable context.")
    return ctx
  }
  const phone = phoneAuthOptions({
    secret,
    // Awaited deliberately. The plugin only backgrounds this when
    // `advanced.backgroundTasks.handler` is configured, which it is not, so
    // returning the promise is what makes a delivery failure fail the request
    // instead of answering "code sent" to someone who will never receive one.
    // A throw after the code is committed aborts that hash. See lib/phone-auth.ts.
    send: (target) => sendOtp(transport, target),
    // Ceilings and the per-phone lease are one mutation. The hash is computed
    // here, in the action, so the raw code is never a mutation argument.
    claim: async ({ phone, ip }) => {
      return await requireMutation().runMutation(internal.otp.claimOtpSend, {
        phone,
        ip: ip ?? undefined,
      })
    },
    commit: async (attempt) => {
      return await requireMutation().runMutation(
        internal.otp.commitOtpCode,
        attempt
      )
    },
    release: async (attempt) => {
      await requireMutation().runMutation(internal.otp.releaseOtpSend, attempt)
    },
    abort: async (attempt) => {
      await requireMutation().runMutation(internal.otp.abortOtpCode, attempt)
    },
    verify: async (attempt) => {
      return await requireMutation().runMutation(
        internal.otp.verifyOtpCode,
        attempt
      )
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
