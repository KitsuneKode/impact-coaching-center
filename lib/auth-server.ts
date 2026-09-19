import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs"

/**
 * Server-side helpers for authenticated rendering and route handlers.
 *
 * fetchAuthQuery and friends carry the session cookie through to Convex, so
 * a Server Component can ask "who is this?" without a client round trip.
 */
export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
})
