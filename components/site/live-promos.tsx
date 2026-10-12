"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { useEffect, useRef, useState } from "react"

import { convexConfigured } from "@/app/providers"
import {
  PromoBanner,
  PromoCard,
  PromoReel,
  type Promo,
} from "@/components/site/promos"
import {
  isAvailable,
  rememberClosed,
  storeKey,
  useLivePromos,
  type LivePromo,
} from "@/components/site/use-live-promos"

/** One pop-up per visit, whatever the page. */
const SHOWN_THIS_VISIT = "ict-promo-shown"
/** Set when a visitor taps WhatsApp or call: they are already talking to ICT. */
const CONTACTED_THIS_VISIT = "ict-contacted"
/** How long the end of the page stays in view before the pop-up comes. */
const END_DWELL_MS = 1500
/** Or, reading this long on a visible tab after this much of the page. */
const READ_MS = 45_000
const READ_DEPTH = 0.35

const session = {
  get: (key: string) => {
    try {
      return sessionStorage.getItem(key) !== null
    } catch {
      return false
    }
  },
  set: (key: string) => {
    try {
      sessionStorage.setItem(key, "1")
    } catch {
      /* blocked storage: at worst it may show again next page */
    }
  },
}

const toPromo = (row: LivePromo): Promo => ({
  kind: row.kind,
  tag: row.tag,
  headline: row.headline,
  body: row.body,
  cta: row.cta,
  href: row.href,
  coupon: row.coupon,
  reelIds: row.reelIds,
  image: row.image,
})

/**
 * The owner's live promotions below the page: one banner and one reel, before
 * the footer, and one pop-up, timed to real interest. The bar lives in
 * PromoStrip above the header.
 */
export function LivePromos() {
  if (!convexConfigured) return null
  return <Live />
}

function Live() {
  const { rows, now } = useLivePromos()
  const [closed, setClosed] = useState<readonly string[]>([])
  if (!rows || now === null) return null

  const open = (kind: LivePromo["kind"]) =>
    rows.find(
      (row) =>
        row.kind === kind &&
        !closed.includes(storeKey(row)) &&
        isAvailable(row, now)
    )
  const banner = open("banner")
  const reel = rows.find((row) => row.kind === "reel")
  const modal = open("modal")

  const close = (row: LivePromo) => {
    rememberClosed(storeKey(row))
    setClosed((list) => [...list, storeKey(row)])
  }

  return (
    <>
      {banner ? (
        <PromoBanner
          promo={toPromo(banner)}
          onClose={() => close(banner)}
          onAction={() => close(banner)}
        />
      ) : null}
      {reel ? <PromoReel promo={toPromo(reel)} /> : null}
      {modal ? (
        <TimedPopup
          key={storeKey(modal)}
          row={modal}
          onDone={() => close(modal)}
        />
      ) : null}
    </>
  )
}

/** Whether the visitor is busy: a field in focus, or a dialog (a video) open. */
function busy() {
  const active = document.activeElement
  if (active?.matches("input, textarea, select, [contenteditable='true']"))
    return true
  return document.querySelector("[role='dialog'], dialog[open]") !== null
}

/**
 * Comes up once the visitor has shown interest: the end of the page in view
 * for a moment, or a long read past a third of it. Never sooner than the
 * campaign's own delay, never on a hidden tab or over a video or a form,
 * never after they have tapped WhatsApp or call, and once per visit.
 */
function TimedPopup({ row, onDone }: { row: LivePromo; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const shown = useRef(false)
  const popup = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session.get(SHOWN_THIS_VISIT) || session.get(CONTACTED_THIS_VISIT))
      return
    const started = performance.now()
    let readFor = 0
    let lastTick = performance.now()
    let endSince: number | null = null
    let deepEnough = false

    const contacted = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest("a")
      if (link && /^(tel:|https:\/\/wa\.me\/)/.test(link.href))
        session.set(CONTACTED_THIS_VISIT)
    }
    document.addEventListener("click", contacted, { capture: true })

    const end =
      document.querySelector("[data-page-end]") ??
      document.querySelector("footer")
    // "Mostly in view" against the smaller of the element and the screen: on
    // a phone the footer is taller than the screen and never 60% visible.
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        const fits = Math.min(
          entry.boundingClientRect.height,
          entry.rootBounds?.height ?? window.innerHeight
        )
        const seen = fits > 0 && entry.intersectionRect.height / fits >= 0.6
        if (!seen) endSince = null
        else endSince ??= performance.now()
      },
      { threshold: Array.from({ length: 11 }, (_, i) => i / 10) }
    )
    if (end) watcher.observe(end)

    const timer = window.setInterval(() => {
      const tick = performance.now()
      if (!document.hidden) readFor += tick - lastTick
      lastTick = tick
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      if (scrollable > 0 && window.scrollY / scrollable >= READ_DEPTH)
        deepEnough = true

      if (shown.current || document.hidden || busy()) return
      if (session.get(SHOWN_THIS_VISIT) || session.get(CONTACTED_THIS_VISIT))
        return
      if (tick - started < row.delaySeconds * 1000) return
      const atEnd = endSince !== null && tick - endSince >= END_DWELL_MS
      const longRead = deepEnough && readFor >= READ_MS
      if (!atEnd && !longRead) return
      shown.current = true
      session.set(SHOWN_THIS_VISIT)
      setOpen(true)
    }, 500)

    return () => {
      window.clearInterval(timer)
      watcher.disconnect()
      document.removeEventListener("click", contacted, { capture: true })
    }
  }, [row.delaySeconds])

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onDone()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop data-promo-backdrop />
        {/* Focus the dialog, not the first button, so its heading is read first. */}
        <DialogPrimitive.Popup
          ref={popup}
          initialFocus={popup}
          data-promo-popup
        >
          <PromoCard
            promo={toPromo(row)}
            onAction={() => setOpen(false)}
            title={(text) => (
              <DialogPrimitive.Title className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance">
                {text}
              </DialogPrimitive.Title>
            )}
            close={(label) => (
              <DialogPrimitive.Close
                data-press
                data-cta="ghost-paper"
                className="inline-flex h-12 items-center rounded-full px-5 font-semibold"
              >
                {label}
              </DialogPrimitive.Close>
            )}
          />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
