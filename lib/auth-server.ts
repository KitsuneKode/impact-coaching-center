import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs"

import { api } from "@/convex/_generated/api"

import { requireEnv } from "./env"
import { clientEnv } from "./env.client"

/** The Better Auth route handler, constructed on first request. */
type AuthServer = ReturnType<typeof convexBetterAuthNextJs>

let cached: AuthServer | undefined

function authServer(): AuthServer {
  cached ??= convexBetterAuthNextJs({
    convexUrl: requireEnv(
      "NEXT_PUBLIC_CONVEX_URL",
      clientEnv.NEXT_PUBLIC_CONVEX_URL
    ),
    convexSiteUrl: requireEnv(
      "NEXT_PUBLIC_CONVEX_SITE_URL",
      clientEnv.NEXT_PUBLIC_CONVEX_SITE_URL
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

/** Whether this request's signed-in person may refresh the public pages. */
export async function viewerCanRefreshSite(): Promise<boolean> {
  return authServer().fetchAuthQuery(api.catalogAdmin.canRefreshSite)
}
