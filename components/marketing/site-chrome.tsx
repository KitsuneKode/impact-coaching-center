import { getTranslations } from "next-intl/server"
import type { ReactNode } from "react"

import { MobileActionBar } from "@/components/marketing/mobile-action-bar"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"

/**
 * The public site's frame: skip link, header, footer and the mobile call bar.
 * Rendered by the language layout and by the English-only (plain) group;
 * /admin and /redesign sit outside both and get none of it.
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const t = await getTranslations("Chrome")
  return (
    <>
      {/* WCAG 2.4.1: skip the navigation that precedes every page. */}
      <a
        href="#main"
        className="sr-only rounded-control bg-primary px-4 py-2 text-primary-foreground focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-100"
      >
        {t("skip")}
      </a>
      <SiteHeader />
      {/* A plain fade under the floating nav so scrolling text does not collide with it. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-30 h-20 bg-gradient-to-b from-background via-background/70 to-transparent"
      />
      <div id="main" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <SiteFooter />
      <MobileActionBar />
    </>
  )
}
