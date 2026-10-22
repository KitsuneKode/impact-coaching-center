"use client"

import { IconArrowRight, IconX } from "@tabler/icons-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"

import { convexConfigured } from "@/app/providers"
import { InlineScript } from "@/components/site/inline-script"
import { usePathname } from "@/i18n/navigation"
import { matchesPath, wordsIn } from "@/lib/campaigns"
import type { LiveBar } from "@/lib/catalog-server"
import {
  isAvailable,
  rememberClosed,
  storeKey,
  useLivePromos,
  usePromoTrack,
} from "@/components/site/use-live-promos"

/**
 * The announcement strip: Pulse's ink band above the header. The server
 * renders it from `initial` so it is there in the first paint (appearing a
 * second later pushed the whole page down); Convex then keeps it live.
 */
export function PromoStrip({ initial = [] }: { initial?: LiveBar[] }) {
  if (!convexConfigured) return null
  return <Strip initial={initial} />
}

function Strip({ initial }: { initial: LiveBar[] }) {
  const t = useTranslations("Pulse")
  const locale = useLocale()
  const path = usePathname()
  const { rows, now } = useLivePromos()
  const [closed, setClosed] = useState<string | null>(null)
  // Until the live query answers, the server's bar for this page.
  const quiet = /^\/(checkout|account|login|register)(\/|$)/.test(path)
  const first = quiet
    ? undefined
    : initial.find((c) => matchesPath(c.routes, path))
  const initialBar = useMemo(
    () => first && { ...wordsIn(first, locale), kind: "bar" as const },
    [first, locale]
  )
  const bar =
    rows === undefined ? initialBar : rows.find((c) => c.kind === "bar")
  const key = bar ? storeKey(bar) : null
  const hidden =
    !bar || closed === key || (now !== null && !isAvailable(bar, now))

  const track = usePromoTrack()
  // The strip is at the top of the page: showing it is seeing it.
  useEffect(() => {
    if (bar && !hidden) track(bar, "view")
  }, [bar, hidden, track])

  const dismiss = () => {
    if (!key || !bar) return
    track(bar, "close")
    rememberClosed(key)
    setClosed(key)
  }

  // Runs as the HTML is parsed: someone who closed this bar never sees it
  // flash in before the page's script catches up.
  const restCheck = key
    ? `(function(){try{var a=document.currentScript.previousElementSibling,c=Number(localStorage.getItem(${JSON.stringify(key)}));if(c&&Date.now()-c<${(bar?.restDays ?? 0) * 86_400_000})a.setAttribute("data-hidden","")}catch(e){}})()`
    : ""

  return (
    <>
      <aside
        aria-label={t("promoLabel")}
        data-promo-strip
        data-hidden={hidden || undefined}
        // The rest check below may hide it before hydration.
        suppressHydrationWarning
        inert={hidden}
      >
        <div className="overflow-clip [min-block-size:0]">
          {bar ? (
            <div className="container-page flex h-11 items-center gap-3 md:h-12">
              <p className="min-w-0 flex-1 truncate text-sm">
                {bar.tag ? (
                  <span className="font-semibold text-highlight">
                    {bar.tag}
                  </span>
                ) : null}
                <span className="ms-2 font-semibold">{bar.headline}</span>
                {bar.body ? (
                  <span data-promo-strip-body className="ms-2 hidden md:inline">
                    {bar.body}
                  </span>
                ) : null}
              </p>
              {bar.cta ? (
                <a
                  href={bar.href}
                  onClick={() => track(bar, "click")}
                  aria-label={bar.cta}
                  className="flex h-11 min-w-11 flex-none items-center justify-center gap-1.5 text-sm font-semibold whitespace-nowrap text-highlight"
                >
                  <span className="hidden sm:inline">{bar.cta}</span>
                  <IconArrowRight aria-hidden size={16} stroke={2} />
                </a>
              ) : null}
              <button
                type="button"
                onClick={dismiss}
                aria-label={t("dismissPromo")}
                data-promo-strip-close
                className="grid size-11 flex-none place-items-center rounded-full"
              >
                <IconX aria-hidden size={18} />
              </button>
            </div>
          ) : null}
        </div>
      </aside>
      {restCheck ? <InlineScript code={restCheck} /> : null}
    </>
  )
}
