import { getTranslations } from "next-intl/server"
import type { ReactNode } from "react"

import { MobileActionBar } from "@/components/marketing/mobile-action-bar"
import { SiteFooter } from "@/components/marketing/site-footer"
import { PromoStrip } from "@/components/site/promo-strip"
import { SiteHeader } from "@/components/site/site-header"

/**
 * The public site's frame: skip link, header, footer and the mobile call bar.
 * Rendered by the language layout and by the English-only (plain) group;
 * /admin sits outside both and gets none of it.
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
      <PromoStrip />
      <SiteHeader />
      <div id="main" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <SiteFooter />
      <MobileActionBar />
    </>
  )
}
