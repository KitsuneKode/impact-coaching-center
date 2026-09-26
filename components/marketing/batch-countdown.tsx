"use client"

import { type ReactNode, useSyncExternalStore } from "react"

import { nextBatch } from "@/lib/brand"

import { daysUntil } from "@/lib/batch-date"

/* The clock is an external source: re-read it hourly, and never on the server. */
function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60 * 60 * 1000)
  return () => window.clearInterval(timer)
}

export function useDaysUntil(isoDate: string) {
  return useSyncExternalStore(
    subscribe,
    () => daysUntil(isoDate),
    () => null
  )
}

export function useDaysUntilBatch() {
  return useDaysUntil(nextBatch.startsOn)
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
    <span className="tnum shrink-0 rounded-sm bg-highlight/40 px-1.5 py-0.5 text-[0.8125rem] font-medium whitespace-nowrap text-foreground">
      {label}
    </span>
  )
}

/**
 * Renders its children only until `date` (ISO, IST) has started.
 *
 * Pages are prerendered, so a line built before the date would keep
 * advertising "Start date: 14 September" for as long as the build stays up.
 * Server components drop it from builds made after the date (`hasStarted`);
 * this retires it in builds made before.
 */
export function UntilDate({
  date,
  children,
}: {
  date: string
  children: ReactNode
}) {
  const days = useDaysUntil(date)
  if (days !== null && days < 0) return null
  return children
}
