"use client"

import { useSyncExternalStore } from "react"

import { nextBatch } from "@/lib/brand"

const DAY = 24 * 60 * 60 * 1000

export function daysUntil(isoDate: string, now = Date.now()) {
  const start = new Date(`${isoDate}T00:00:00+05:30`).getTime()
  return Math.ceil((start - now) / DAY)
}

/* The clock is an external source: re-read it hourly, and never on the server. */
function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60 * 60 * 1000)
  return () => window.clearInterval(timer)
}

export function useDaysUntilBatch() {
  return useSyncExternalStore(
    subscribe,
    () => daysUntil(nextBatch.startsOn),
    () => null
  )
}

/**
 * Honest urgency. The page is statically built, so the count is computed in
 * the browser rather than frozen at build time. The server HTML carries the
 * date alone; the relative count appears once mounted, and disappears after
 * the batch starts instead of showing a stale deadline.
 */
export function BatchCountdown() {
  const days = useDaysUntilBatch()

  const label =
    days === null || days < 0
      ? null
      : days > 1
        ? `in ${days} days`
        : days === 1
          ? "tomorrow"
          : "today"

  if (!label) return null

  return (
    <span className="tnum shrink-0 rounded-[0.375rem] bg-highlight/40 px-1.5 py-0.5 text-[0.8125rem] font-medium whitespace-nowrap text-foreground">
      {label}
    </span>
  )
}
