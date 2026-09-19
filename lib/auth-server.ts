import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs"

import { requireEnv } from "./env"

/**
 * The Better Auth route handler, constructed on first request.
 *
 * Lazy on purpose. Building it at module scope meant `next build` evaluated
 * it while collecting route configuration, so a missing Convex URL failed the
 * whole build rather than a request - which broke every build without a local
 * .env.local, including CI and a fresh clone. Deferring keeps the variable
 * required, but moves the failure to the first request that needs auth, where
 * it names the variable and affects only that request.
 *
 * Only `handler` is exported. convexBetterAuthNextJs also returns
 * preloadAuthQuery, isAuthenticated, getToken, fetchAuthQuery,
 * fetchAuthMutation and fetchAuthAction; re-exporting them before anything
 * calls them meant six dead exports whose generic signatures could not be
 * forwarded through a lazy wrapper. Add each back here when a caller exists.
 */
type AuthServer = ReturnType<typeof convexBetterAuthNextJs>

let cached: AuthServer | undefined

function authServer(): AuthServer {
  cached ??= convexBetterAuthNextJs({
    convexUrl: requireEnv(
      "NEXT_PUBLIC_CONVEX_URL",
      process.env.NEXT_PUBLIC_CONVEX_URL
    ),
    convexSiteUrl: requireEnv(
      "NEXT_PUBLIC_CONVEX_SITE_URL",
      process.env.NEXT_PUBLIC_CONVEX_SITE_URL
    ),
  })
  return cached
}

export const handler = {
  GET: (...args: Parameters<AuthServer["handler"]["GET"]>) =>
    authServer().handler.GET(...args),
  POST: (...args: Parameters<AuthServer["handler"]["POST"]>) =>
    authServer().handler.POST(...args),
}
