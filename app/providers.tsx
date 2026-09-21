"use client"

import {
  type AuthClient,
  ConvexBetterAuthProvider,
} from "@convex-dev/better-auth/react"
import { ConvexReactClient } from "convex/react"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"

/**
 * Built once at module scope, not per render: a new ConvexReactClient means a
 * new websocket, and React would open one on every re-render of the tree.
 *
 * The URL is read without `requireEnv` on purpose. This is a client module, so
 * a throw here is a blank page for every visitor - including the overwhelming
 * majority who never sign in. A missing URL leaves the provider unconfigured
 * and the public pages rendering, which is the right failure for a marketing
 * site whose authenticated surface is one route.
 */
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

/**
 * Whether this build can reach Convex from the browser at all.
 *
 * `NEXT_PUBLIC_CONVEX_URL` is inlined when the bundle is built, so this is
 * settled at build time and cannot change per request. The one route that
 * reads Convex from the browser checks it before calling a hook: `useQuery`
 * throws without a provider, and because /admin/leads is prerendered that
 * throw fails the entire production build rather than just that page.
 */
export const convexConfigured = convex !== null

/**
 * One cast, at the one boundary that needs it.
 *
 * The provider declares `authClient: AuthClient`, which the package defines as
 * `createAuthClient<BetterAuthClientPlugin & { plugins: Plugins }>` - a
 * constraint no client built by `createAuthClient({ plugins: [...] })` infers
 * to, because the real client type is not itself a plugin. The runtime shape
 * is exactly what the provider uses; only the declared generic disagrees.
 * Kept here, named, rather than widening the client's own type.
 */
const providerAuthClient = authClient as unknown as AuthClient

export function Providers({ children }: { children: ReactNode }) {
  if (!convex) return children
  return (
    <ConvexBetterAuthProvider client={convex} authClient={providerAuthClient}>
      {children}
    </ConvexBetterAuthProvider>
  )
}
