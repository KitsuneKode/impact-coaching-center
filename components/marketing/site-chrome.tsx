"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { MobileActionBar } from "@/components/marketing/mobile-action-bar"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"

/**
 * The public site's header and footer, and the routes that should not have
 * them.
 *
 * The root layout wrapped every route in marketing chrome, including /admin.
 * The result was visible the first time anyone reached the admin as an owner:
 * the floating marketing header sat on top of the admin shell, overlapping
 * the sidebar trigger, while the site footer - course links, social links,
 * the APSC result disclaimer - ran underneath the enquiry table. Two
 * navigations for two different products, stacked.
 *
 * Excluded by prefix rather than by a route group. Route groups are the
 * idiomatic answer and would remove this component entirely, but they mean
 * moving every public page into `app/(site)/`, and `lib/sitemap.test.ts`
 * derives the expected routes from the filesystem - so that refactor has to
 * be made deliberately, with the guard updated in the same change, rather
 * than as a side effect of fixing a visual bug. Recorded so the next person
 * knows this is a deliberate stopgap and what the end state is.
 *
 * `usePathname` is available during the server render, so the correct chrome
 * is in the first HTML - nothing flashes and nothing shifts.
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
       * A plain fade under the floating nav so text scrolling beneath it does
       * not collide with the pills. Gradient only: the earlier stacked
       * backdrop blur cost frames on budget phones and blurred the bottom of
       * every screen as well.
       */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-30 h-20 bg-gradient-to-b from-background via-background/70 to-transparent"
      />
      {children}
      <SiteFooter />
      {/*
       * The call-and-book bar is a conversion device for visitors. Staff
       * working the enquiry queue do not need a floating button offering to
       * ring the centre they are sitting in.
       */}
      <MobileActionBar />
    </>
  )
}
