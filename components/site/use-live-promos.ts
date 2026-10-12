"use client"

import { useQuery } from "convex/react"
import { useEffect, useState } from "react"

import { api } from "@/convex/_generated/api"
import { usePathname } from "@/i18n/navigation"
import { isRested } from "@/lib/campaigns"

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
  const rows = useQuery(
    api.campaigns.liveCampaigns,
    now === null ? "skip" : { path, now }
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
