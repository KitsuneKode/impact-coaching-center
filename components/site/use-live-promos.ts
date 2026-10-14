"use client"

import { useQuery } from "convex/react"
import { useLocale } from "next-intl"
import { useEffect, useMemo, useState } from "react"

import { api } from "@/convex/_generated/api"
import { usePathname } from "@/i18n/navigation"
import { isRested, wordsIn } from "@/lib/campaigns"

/** The time, to the minute: queries never read the clock themselves. */
export function useMinute() {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => setNow(Math.floor(Date.now() / 60_000) * 60_000)
    tick()
    const timer = setInterval(tick, 60_000)
    return () => clearInterval(timer)
  }, [])
  return now
}

/**
 * The promotions live on this page now. Every caller with the same page and
 * minute shares one Convex subscription.
 */
export function useLivePromos() {
  const path = usePathname()
  const now = useMinute()
  const locale = useLocale()
  // No promotions where someone is paying, signing in or in their account.
  const quiet = /^\/(checkout|account|login|register)(\/|$)/.test(path)
  const live = useQuery(
    api.campaigns.liveCampaigns,
    now === null || quiet ? "skip" : { path, now }
  )
  // Assamese pages read the Assamese wording where the editor wrote one.
  const rows = useMemo(
    () => live?.map((promo) => wordsIn(promo, locale)),
    [live, locale]
  )
  return { rows, now }
}

export type LivePromo = NonNullable<
  ReturnType<typeof useLivePromos>["rows"]
>[number]

/** One key per campaign revision, so an edited promotion shows again. */
export const storeKey = (promo: Pick<LivePromo, "id" | "revision">) =>
  `ict-promo:${promo.id}:${promo.revision}`

/** When this visitor last closed it; storage can be blocked, so never assumed. */
export function closedAt(key: string): number | null {
  try {
    const value = localStorage.getItem(key)
    return value ? Number(value) : null
  } catch {
    return null
  }
}

export function rememberClosed(key: string) {
  try {
    localStorage.setItem(key, String(Date.now()))
  } catch {
    /* blocked storage only means it may show again */
  }
}

/** Whether a closed promotion has rested long enough to show again. */
export const isAvailable = (promo: LivePromo, now: number) =>
  isRested(closedAt(storeKey(promo)), promo.restDays, now)
