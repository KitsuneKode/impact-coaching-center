"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { MobileActionBar } from "@/components/marketing/mobile-action-bar"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"

/**
 * The public site's header and footer, and the routes that should not have
 * them.
 */
const BARE_PREFIXES = ["/admin"] as const

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const bare = BARE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (bare) return children

  return (
    <>
      <SiteHeader />
      {/*
        A plain fade under the floating nav so text scrolling beneath it does not
        collide with the pills. Gradient only:
      */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-30 h-20 bg-gradient-to-b from-background via-background/70 to-transparent"
      />
      {children}
      <SiteFooter />
      {/*
        The call-and-book bar is a conversion device for visitors. Staff
        working the enquiry queue do not need a floating button offering to
        ring the centre they are sitting in.
      */}
      <MobileActionBar />
    </>
  )
}
