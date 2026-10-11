"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, type RefObject } from "react"

import { OffersMenu, PromoModal, PromoScope, type Campaign } from "../_promos"
import { clearReplay, popupDelay, replayDelay, seenKey } from "./promo-session"
import { SiteReel, TopBar } from "./site-promos"

export type PromoParts = { bar: boolean; modal: boolean; reel: boolean }

export type PopupTrigger = {
  /** Element that counts as "the end of the page" once 40% visible. */
  endSelector: string
  /** Seconds of *visible* time needed before the pop-up may open. */
  engagedMs: number
  /** Fraction of the scrollable height the visitor must have covered. */
  minDepth: number
}

/**
 * The pop-up that waits for real engagement: opens once the end selector has
 * been 40% visible (plus a beat), or once the visitor has spent `engagedMs` of
 * visible time and scrolled `minDepth`. While a dialog is open, the reel is
 * expanded, focus sits inside a form field or the page is hidden, the guards
 * hold it back and it re-checks every two seconds. Seeing it, or acting on a
 * call/WhatsApp link, ends it for the session; the ProtoNav replay still
 * brings it back on demand.
 */
function politePopup(
  base: string,
  popup: PopupTrigger,
  openRef: RefObject<boolean>,
  openNow: () => void
): () => void {
  const replay = replayDelay()
  if (replay !== null) {
    const id = window.setTimeout(() => {
      clearReplay()
      openNow()
    }, replay)
    return () => window.clearTimeout(id)
  }

  const seen = () => {
    try {
      return sessionStorage.getItem(seenKey(base)) !== null
    } catch {
      return false
    }
  }
  if (seen()) return () => {}

  const cleanups: (() => void)[] = []
  let done = false
  const finish = () => {
    if (done) return
    done = true
    for (const c of cleanups) c()
  }

  const onAct = (e: Event) => {
    const a = (e.target as Element | null)?.closest?.(
      'a[href*="wa.me"], a[href^="tel:"]'
    )
    if (!a) return
    try {
      sessionStorage.setItem(seenKey(base), "1")
    } catch {}
    finish()
  }
  document.addEventListener("click", onAct, true)
  cleanups.push(() => document.removeEventListener("click", onAct, true))

  let engaged = 0
  let deep = false
  let armed = false

  const onScroll = () => {
    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    if (max > 0 && window.scrollY / max >= popup.minDepth) {
      deep = true
      window.removeEventListener("scroll", onScroll)
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true })
  cleanups.push(() => window.removeEventListener("scroll", onScroll))
  onScroll()

  const guardsBusy = () =>
    document.querySelector('[role="dialog"], [data-pm-reel][data-open]') !==
      null ||
    document.activeElement?.closest(
      "input, textarea, select, [contenteditable], form"
    ) != null ||
    document.visibilityState !== "visible"

  const end = document.querySelector(popup.endSelector)
  if (end) {
    let t: number | undefined
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.4) {
          io.disconnect()
          t = window.setTimeout(() => {
            armed = true
          }, 1200)
        }
      },
      { threshold: 0.4 }
    )
    io.observe(end)
    cleanups.push(() => {
      io.disconnect()
      if (t) window.clearTimeout(t)
    })
  }

  const tick = window.setInterval(() => {
    if (document.visibilityState === "visible") engaged += 2000
    if (openRef.current || seen()) {
      finish()
      return
    }
    if (!armed && deep && engaged >= popup.engagedMs) armed = true
    if (armed && !guardsBusy()) {
      openNow()
      finish()
    }
  }, 2000)
  cleanups.push(() => window.clearInterval(tick))

  return finish
}

/**
 * The promotions every kit theme carries on its own home page: the
 * announcement bar, one pop-up per visit, and the video reel. Other pages stay
 * clear so a visitor is never interrupted mid-task.
 */
export function SitePromoLayer({
  base,
  bar,
  campaign,
  parts,
  reelAfter,
  popup,
}: {
  base: string
  bar: Campaign
  campaign: Campaign
  parts: PromoParts
  /** Below md, the reel stays hidden until this selector scrolls out of view. */
  reelAfter?: string
  /** When set, engagement triggers replace the plain timer for the pop-up. */
  popup?: PopupTrigger
}) {
  const home = usePathname() === base
  const [open, setOpen] = useState(false)
  const openRef = useRef(open)
  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    if (!home || !parts.modal) return
    if (popup) return politePopup(base, popup, openRef, () => setOpen(true))
    const delay = popupDelay(base)
    if (delay === null) return
    const id = window.setTimeout(() => setOpen(true), delay)
    return () => window.clearTimeout(id)
  }, [home, parts.modal, base, popup])

  const change = (next: boolean) => {
    setOpen(next)
    if (next) return
    try {
      sessionStorage.setItem(seenKey(base), "1")
    } catch {}
  }

  return (
    <PromoScope>
      {parts.bar && home ? <TopBar c={bar} /> : null}
      {parts.modal ? (
        <PromoModal c={campaign} open={open} onOpenChange={change} />
      ) : null}
      {parts.reel && home ? <SiteReel c={campaign} after={reelAfter} /> : null}
    </PromoScope>
  )
}

/** The header's Offers dropdown. */
export function SiteOffers({
  campaign,
  items,
}: {
  campaign: Campaign
  items: { label: string; note: string; href: string }[]
}) {
  return (
    <PromoScope>
      <OffersMenu c={campaign} items={items} />
    </PromoScope>
  )
}
