"use client"

import { IconArrowRight, IconX } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { convexConfigured } from "@/app/providers"
import { api } from "@/convex/_generated/api"
import { usePathname } from "@/i18n/navigation"
import { isRested } from "@/lib/campaigns"

/** The time, to the minute: queries never read the clock themselves. */
function useMinute() {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => setNow(Math.floor(Date.now() / 60_000) * 60_000)
    tick()
    const timer = setInterval(tick, 60_000)
    return () => clearInterval(timer)
  }, [])
  return now
}

const storeKey = (id: string, revision: number) => `ict-promo:${id}:${revision}`

function closedAt(key: string): number | null {
  try {
    const value = localStorage.getItem(key)
    return value ? Number(value) : null
  } catch {
    return null
  }
}

/** The announcement strip: Pulse's ink band above the header. */
export function PromoStrip() {
  if (!convexConfigured) return null
  return <Strip />
}

function Strip() {
  const t = useTranslations("Pulse")
  const path = usePathname()
  const now = useMinute()
  const live = useQuery(
    api.campaigns.liveCampaigns,
    now === null ? "skip" : { path, now }
  )
  const [closed, setClosed] = useState<string | null>(null)
  const bar = live?.find((c) => c.kind === "bar")
  const key = bar ? storeKey(bar.id, bar.revision) : null
  const hidden =
    !bar ||
    closed === key ||
    (key !== null &&
      now !== null &&
      !isRested(closedAt(key), bar.restDays, now))

  const dismiss = () => {
    if (!key) return
    try {
      localStorage.setItem(key, String(Date.now()))
    } catch {
      /* blocked storage only means it may show again */
    }
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
                aria-label={bar.cta}
                className="flex h-11 flex-none items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-highlight"
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
