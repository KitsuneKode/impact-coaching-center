import { getTranslations } from "next-intl/server"
import { Suspense, type ReactNode } from "react"

import { ShopShell } from "@/components/commerce/shop-shell"
import { InlineScript } from "@/components/site/inline-script"
import { LivePromos } from "@/components/site/live-promos"
import { SiteFooter } from "@/components/site/site-footer"
import { PromoStrip } from "@/components/site/promo-strip"
import { liveBars } from "@/lib/catalog-server"
import { RouteProgress } from "@/components/site/route-progress"
import { SiteHeader } from "@/components/site/site-header"

/**
 * The public site's frame: skip link, promo strip, header, the live
 * promotions below the page, and the footer - inside the shop shell, so
 * the cart sheet opens from the header on any page.
 * Rendered by the language layout and by the English-only (plain) group;
 * /admin sits outside both and gets none of it.
 */
export async function SiteChrome({
  children,
  entrance = false,
}: {
  children: ReactNode
  /** The first-load reveal (app/pulse.css "Entrance"); off for cart and checkout. */
  entrance?: boolean
}) {
  const t = await getTranslations("Chrome")
  const bars = await liveBars()
  return (
    <ShopShell>
      {/* WCAG 2.4.1: skip the navigation that precedes every page. */}
      <a
        href="#main"
        className="sr-only rounded-control bg-primary px-4 py-2 text-primary-foreground focus-visible:not-sr-only focus-visible:absolute focus-visible:inset-s-4 focus-visible:inset-bs-4 focus-visible:z-100"
      >
        {t("skip")}
      </a>
      <Suspense>
        <RouteProgress />
      </Suspense>
      <PromoStrip initial={bars} />
      <SiteHeader />
      {entrance ? (
        // Marks the first paint so the reveal runs once, never on later
        // in-app navigations (those use the page transition).
        <InlineScript code="(function(){var d=document.documentElement;d.setAttribute('data-first-paint','');setTimeout(function(){d.removeAttribute('data-first-paint')},2200)})()" />
      ) : null}
      <div
        id="main"
        tabIndex={-1}
        data-entrance={entrance || undefined}
        className="outline-none"
      >
        {children}
        <LivePromos />
      </div>
      <SiteFooter />
    </ShopShell>
  )
}
