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
import { GRANT, LOCALE, PERSON_ROLE } from "./schema"

export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  /**
   * Resolved before the plugin is constructed. Fail-closed means refusing to
   * build the auth instance at all when the transport is not explicitly local
   * or is not implemented yet.
   */
  const siteUrl = process.env.CONVEX_SITE_URL
  const transport = chooseTransport(process.env.OTP_TRANSPORT, siteUrl)
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
    // Awaited deliberately.
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
    /*
     * The auth endpoints live on the Convex site URL (the /api/auth routes on
     * the *.convex.site host), which Convex sets for us - without it Better
     * Auth warns "Base URL is not set" and derives redirect targets from
     * request headers instead of a fixed origin.
     */
    baseURL: siteUrl ? `${siteUrl}/api/auth` : undefined,
    /** The same allowlist convex/http.ts gives the route layer. */
    trustedOrigins: process.env.SITE_URL
      ? parseTrustedOrigins(process.env.SITE_URL)
      : [],
    /** Ninety days, sliding, refreshed at most once a day. */
    session: {
      expiresIn: 60 * 60 * 24 * 90,
      updateAge: 60 * 60 * 24,
    },
    // Memory storage resets on every function call here; the component has a
    // rateLimit table, so counts persist. The per-phone lease in otp.ts stays
    // the main guard; this caps a single client hammering the endpoints.
    rateLimit: {
      enabled: true,
      storage: "database",
      customRules: {
        "/phone-number/send-otp": { window: 60, max: 5 },
        "/phone-number/verify": { window: 60, max: 10 },
      },
    },
    ...phone,
    plugins: [...phone.plugins, convex({ authConfig })],
  })
}

/** The signed-in Person, or null when nobody is signed in. */
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
      grants: v.array(GRANT),
      locale: v.optional(LOCALE),
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
