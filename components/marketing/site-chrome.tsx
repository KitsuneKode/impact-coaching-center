import { getTranslations } from "next-intl/server"
import { Suspense, type ReactNode } from "react"

import { LivePromos } from "@/components/site/live-promos"
import { SiteFooter } from "@/components/site/site-footer"
import { PromoStrip } from "@/components/site/promo-strip"
import { RouteProgress } from "@/components/site/route-progress"
import { SiteHeader } from "@/components/site/site-header"

/**
 * The public site's frame: skip link, promo strip, header, the live
 * promotions below the page, and the footer.
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
      <Suspense>
        <RouteProgress />
      </Suspense>
      <PromoStrip />
      <SiteHeader />
      <div id="main" tabIndex={-1} className="outline-none">
        {children}
        <LivePromos />
      </div>
      <SiteFooter />
    </>
  )
}
