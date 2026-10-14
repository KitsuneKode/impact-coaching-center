"use client"

import { IconArrowRight, IconX } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { convexConfigured } from "@/app/providers"
import {
  isAvailable,
  rememberClosed,
  storeKey,
  useLivePromos,
  usePromoTrack,
} from "@/components/site/use-live-promos"

/** The announcement strip: Pulse's ink band above the header. */
export function PromoStrip() {
  if (!convexConfigured) return null
  return <Strip />
}

function Strip() {
  const t = useTranslations("Pulse")
  const { rows, now } = useLivePromos()
  const [closed, setClosed] = useState<string | null>(null)
  const bar = rows?.find((c) => c.kind === "bar")
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

  return (
    <aside
      aria-label={t("promoLabel")}
      data-promo-strip
      data-hidden={hidden || undefined}
      inert={hidden}
    >
      <div className="overflow-clip [min-block-size:0]">
        {bar ? (
          <div className="container-page flex h-11 items-center gap-3 md:h-12">
            <p className="min-w-0 flex-1 truncate text-sm">
              {bar.tag ? (
                <span className="font-semibold text-highlight">{bar.tag}</span>
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
  )
}
