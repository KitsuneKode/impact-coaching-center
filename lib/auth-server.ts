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

/**
 * Convex sees this server, not the visitor, so the visitor's address travels
 * in a header signed with AUTH_PROXY_SECRET (set on both sides). The host's
 * edge sets x-real-ip / x-forwarded-for and overwrites whatever a client sent
 * (Vercel does); anything a client sends as our own headers is dropped first.
 * Without the secret, Convex falls back to the forwarded chain.
 */
async function withClientAddress(request: Request): Promise<Request> {
  const headers = new Headers(request.headers)
  headers.delete("x-ict-client-ip")
  headers.delete("x-ict-proxy-key")
  const secret = process.env.AUTH_PROXY_SECRET
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  // The address alone keys Better Auth's coarse per-address limiter; only
  // the secret makes the OTP ceilings (lib/phone-auth.ts) trust it. The key
  // goes on every request, address or not: with the secret set, Convex sends
  // no code for a request that lacks it.
  if (ip) headers.set("x-ict-client-ip", ip)
  if (secret) headers.set("x-ict-proxy-key", secret)
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer()
  return new Request(request.url, { method: request.method, headers, body })
}

export const handler = {
  GET: async (request: Request) =>
    authServer().handler.GET(await withClientAddress(request)),
  POST: async (request: Request) =>
    authServer().handler.POST(await withClientAddress(request)),
}

/** Whether this request's signed-in person may refresh the public pages. */
export async function viewerCanRefreshSite(): Promise<boolean> {
  return authServer().fetchAuthQuery(api.catalogAdmin.canRefreshSite)
}
