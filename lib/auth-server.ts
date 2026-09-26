import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs"

import { requireEnv } from "./env"

/** The Better Auth route handler, constructed on first request. */
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
