import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { betterAuth } from "better-auth/minimal"

import { v } from "convex/values"

import { parseTrustedOrigins } from "../lib/env"
import { chooseTransport, sendOtp } from "../lib/otp-transport"
import { phoneAuthOptions } from "../lib/phone-auth"

import { components, internal } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import { query } from "./_generated/server"
import authConfig from "./auth.config"
import { findVerifiedPerson } from "./persons"
import { PERSON_ROLE } from "./schema"

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
    process.env.CONVEX_SITE_URL,
    process.env.DEV_DEPLOYMENT_NAME
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
    /**
     * The same allowlist convex/http.ts gives the route layer.
     *
     * That one only drives CORS. Better Auth runs its own origin check on any
     * request carrying cookies, and without this list it trusts nothing but the
     * Convex origin itself, so every real browser sign-in failed with "Invalid
     * origin" while cookie-less requests (curl, tests) passed. Empty when unset,
     * which fails closed; http.ts already refuses to register without it.
     */
    trustedOrigins: process.env.SITE_URL
      ? parseTrustedOrigins(process.env.SITE_URL)
      : [],
    /**
     * Ninety days, sliding, refreshed at most once a day.
     *
     * Set deliberately rather than left at Better Auth's seven-day default,
     * which is what made verification feel like it happened "every time":
     * a student who studies weekly was being asked for a code roughly
     * monthly, and every one of those is a billed WhatsApp authentication
     * template once KIT-46 lands. Spec §10 asks for ninety.
     *
     * `updateAge` is what makes it sliding. At one day, an active Person is
     * effectively never asked again; a dormant one is asked ninety days
     * after they last opened the site, not ninety days after they first
     * verified.
     *
     * Spec §10 also asks for **seven days for staff**, which is NOT
     * implemented here, and deliberately not faked. Better Auth's expiry is
     * a single global value: the documented refresh sets expiry to
     * `now + expiresIn`, so a shorter per-session value written by a
     * `databaseHooks.session.create.before` hook is silently restored to
     * ninety days the first time that staff member uses the site. It would
     * read as implemented and behave as absent, which is worse than the gap.
     *
     * Role is also usually wrong at create time: staff are promoted by an
     * owner *after* they verify, so the session that needs the shorter life
     * was created while they were still a student.
     *
     * The staff ceiling belongs where the boundary already is - the
     * re-check in convex/authz.ts that every protected operation runs -
     * because that cannot be undone by a refresh. Recorded on KIT-55.
     */
    session: {
      expiresIn: 60 * 60 * 24 * 90,
      updateAge: 60 * 60 * 24,
    },
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
  // The caller's own Person projection, or null when signed out. Never the
  // auth-component document, which carries the synthetic @person.ict.invalid
  // address ADR-0001 says must never surface.
  returns: v.union(
    v.object({
      id: v.id("persons"),
      name: v.string(),
      phone: v.string(),
      role: PERSON_ROLE,
      verifiedAt: v.number(),
      revision: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    // safeGetAuthUser is deliberate: getAuthUser throws ConvexError
    // "Unauthenticated" for anonymous visitors, so a public page calling it
    // would render a 500 for everyone who is not signed in.
    const identity = await authComponent.safeGetAuthUser(ctx)
    return findVerifiedPerson(ctx, identity)
  },
})
