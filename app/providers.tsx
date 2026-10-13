"use client"

import {
  type AuthClient,
  ConvexBetterAuthProvider,
} from "@convex-dev/better-auth/react"
import { ConvexReactClient } from "convex/react"
import { LazyMotion } from "motion/react"
import { ThemeProvider } from "next-themes"
import { useEffect, type ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import { api } from "@/convex/_generated/api"
import { visitAttribution } from "@/lib/attribution"
import { authClient } from "@/lib/auth-client"
import { publicEnv } from "@/lib/public-env"
import { defaultTheme, themes } from "@/lib/theme"

/**
 * Built once at module scope, not per render: a new ConvexReactClient means a
 * new websocket, and React would open one on every re-render of the tree.
 */
const convexUrl = publicEnv.convexUrl

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

/** Whether this build can reach Convex from the browser at all. */
export const convexConfigured = convex !== null

/** One cast, at the one boundary that needs it. */
const providerAuthClient = authClient as unknown as AuthClient

/**
 * next-themes drives the palette attribute. Its own blocking script is patched
 * out: React 19 will not execute a script rendered from this client component.
 * The same script runs from the root layout instead (`themeInitScript`).
 */
function Themed({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme={defaultTheme}
      themes={[...themes]}
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

/** Notes where this visit came from, once, on the page it landed on. */
function VisitSource() {
  useEffect(() => {
    visitAttribution()
    if (!convex) return
    const client = convex
    /*
     * Count taps on WhatsApp and phone links: most of ICT's enquiries start
     * there, and nothing else records them. Anonymous daily totals per page
     * and source (convex/contactTaps.ts); a failed count is simply dropped.
     */
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest("a")
      const href = link?.getAttribute("href") ?? ""
      const kind = href.startsWith("tel:")
        ? "call"
        : href.startsWith("https://wa.me/")
          ? "whatsapp"
          : null
      // Staff calling leads from the admin are not visitors reaching ICT.
      const page = window.location.pathname
      if (!kind || /^\/(admin|account|checkout)(\/|$)/.test(page)) return
      void client
        .mutation(api.contactTaps.record, {
          kind,
          page,
          source: visitAttribution().utmSource ?? "direct",
        })
        .catch(() => {})
    }
    document.addEventListener("click", onClick, { capture: true })
    return () =>
      document.removeEventListener("click", onClick, { capture: true })
  }, [])
  return null
}

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
        {/* Bottom-right on desktop; lifted on phones above the call bar. */}
        <Toaster position="bottom-right" mobileOffset={{ bottom: 88 }} />
        <VisitSource />
      </Themed>
    </LazyMotion>
  )
}
