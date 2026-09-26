"use client"

import {
  type AuthClient,
  ConvexBetterAuthProvider,
} from "@convex-dev/better-auth/react"
import { ConvexReactClient } from "convex/react"
import { LazyMotion } from "motion/react"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"

/**
 * Built once at module scope, not per render: a new ConvexReactClient means a
 * new websocket, and React would open one on every re-render of the tree.
 */
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

/** Whether this build can reach Convex from the browser at all. */
export const convexConfigured = convex !== null

/** One cast, at the one boundary that needs it. */
const providerAuthClient = authClient as unknown as AuthClient

/** next-themes drives the palette attribute, not a hand-rolled switcher. */
function Themed({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="current"
      themes={[
        "current",
        "elegance",
        "elegance-dark",
        "twilight",
        "twilight-dark",
      ]}
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}

/*
 * `m.*` components render without the DOM feature bundle until this loads it,
 * so the animation code is an async chunk instead of part of every page's
 * first load - the site still paints and reads fine before it arrives.
 */
const loadFeatures = () =>
  import("@/components/motion/features").then((res) => res.default)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <Themed>
        {convex ? (
          <ConvexBetterAuthProvider
            client={convex}
            authClient={providerAuthClient}
          >
            {children}
          </ConvexBetterAuthProvider>
        ) : (
          children
        )}
      </Themed>
    </LazyMotion>
  )
}
