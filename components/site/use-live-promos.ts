"use client"

import { useMutation, useQuery } from "convex/react"
import { useLocale } from "next-intl"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { usePageExam } from "@/components/site/page-exam"
import { api } from "@/convex/_generated/api"
import { usePathname } from "@/i18n/navigation"
import { isRested, kindsOf, wordsIn } from "@/lib/campaigns"

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
  const exam = usePageExam()
  // No promotions where someone is paying, signing in or in their account.
  const quiet = /^\/(checkout|account|login|register)(\/|$)/.test(path)
  const live = useQuery(
    api.campaigns.liveCampaigns,
    now === null || quiet ? "skip" : { path, now, ...(exam ? { exam } : {}) }
  )
  // One row per place a campaign shows, so a campaign on the bar and in a
  // pop-up is found by each, and closing one leaves the other. Assamese
  // pages read the Assamese wording where the editor wrote one.
  const rows = useMemo(
    () =>
      live?.flatMap((promo) =>
        // kindsOf: a backend not yet redeployed still sends a single kind.
        kindsOf(promo).map((kind) => ({ ...wordsIn(promo, locale), kind }))
      ),
    [live, locale]
  )
  return { rows, now }
}

export type LivePromo = NonNullable<
  ReturnType<typeof useLivePromos>["rows"]
>[number]

/** One key per place and revision, so an edited promotion shows again. */
export const storeKey = (promo: Pick<LivePromo, "id" | "revision" | "kind">) =>
  `ict-promo:${promo.id}:${promo.kind}:${promo.revision}`

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

type PromoEvent = "view" | "click" | "close"

/**
 * Counts views, clicks and closes for the admin. A view counts once per
 * visit; failures are dropped, the visitor never waits on them.
 */
export function usePromoTrack() {
  const track = useMutation(api.campaigns.track)
  return useCallback(
    (promo: Pick<LivePromo, "id">, event: PromoEvent) => {
      if (event === "view") {
        const key = `ict-promo-seen:${promo.id}`
        try {
          if (sessionStorage.getItem(key)) return
          sessionStorage.setItem(key, "1")
        } catch {
          /* blocked storage: count it anyway */
        }
      }
      void track({ id: promo.id, event }).catch(() => {})
    },
    [track]
  )
}

/** Calls `onSeen` once, when half of the element has been on screen. */
export function useSeen<T extends Element>(onSeen: () => void) {
  const ref = useRef<T>(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el || done.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || done.current) return
        done.current = true
        observer.disconnect()
        onSeen()
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onSeen])
  return ref
}
