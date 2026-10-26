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
   * Fail-closed for sending only: with no usable transport, a code request is
   * refused before any code is stored, while sessions, sign-out and the
   * Convex token keep working. Refusing to build the instance at all made
   * every page's session check a 500.
   */
  const siteUrl = process.env.CONVEX_SITE_URL
  let transport: ReturnType<typeof chooseTransport> | null = null
  try {
    transport = chooseTransport(process.env.OTP_TRANSPORT, siteUrl)
  } catch (error) {
    console.error(`[auth] sign-in codes are off: ${(error as Error).message}`)
  }
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
    send: (target) => {
      if (!transport) throw new Error("No OTP transport on this deployment.")
      return sendOtp(transport, target)
    },
    // Ceilings and the per-phone lease are one mutation. The hash is computed
    // here, in the action, so the raw code is never a mutation argument.
    claim: async ({ phone, ip }) => {
      if (!transport)
        return { ok: false as const, reason: "deployment" as const }
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
    // Memory storage resets on every function call here, and the component's
    // own table prunes with an unindexed scan, so counts live in our indexed
    // rateLimits table, checked and counted in one mutation. The per-phone
    // lease in otp.ts stays the main guard; this caps a single address
    // hammering the endpoints. Per address, and Indian mobile carriers put
    // many people behind one (carrier-grade NAT), so the ceiling is loose
    // enough for a crowded classroom on the same network signing in at once.
    rateLimit: {
      enabled: true,
      customRules: {
        "/phone-number/send-otp": { window: 60, max: 10 },
        "/phone-number/verify": { window: 60, max: 20 },
        // Convex's own backend fetching the token keys, server to server:
        // no visitor behind it, and it must never be throttled.
        "/convex/jwks": false,
      },
      customStorage: {
        // Unused while consume exists; Better Auth still asks for them.
        get: async () => null,
        set: async () => {},
        consume: async (key, rule) => {
          // Rate limiting only runs inside the HTTP actions.
          if (!("runMutation" in ctx))
            return { allowed: true, retryAfter: null }
          // Better Auth's own warning also fires for the server-to-server
          // jwks fetch, so it is muted below and said here, where it means
          // a visitor's request arrived without an address.
          if (key.startsWith("no-trusted-ip|"))
            console.warn(`[auth] no client address for ${key.slice(14)}`)
          return await ctx.runMutation(internal.persons.consumeAuthRateLimit, {
            key,
            max: rule.max,
            windowMs: rule.window * 1000,
          })
        },
      },
    },
    logger: {
      log: (level, message, ...args) => {
        if (message.startsWith("Rate limiting could not determine")) return
        console[level === "debug" ? "log" : level](
          `[Better Auth] ${message}`,
          ...args
        )
      },
    },
    // The visitor's address as our Next.js server forwards it
    // (lib/auth-server.ts), then the forwarded chain. Without one, every
    // visitor shares a single bucket per path, and one noisy client would
    // lock everyone out of codes.
    advanced: {
      ipAddress: { ipAddressHeaders: ["x-ict-client-ip", "x-forwarded-for"] },
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
