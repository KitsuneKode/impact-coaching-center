"use client"

import { useEffect, useState } from "react"

import { startOfTodayIst } from "@/lib/ist"

/** Fifteen minutes: IST midnight (18:30 UTC) falls on one of its marks. */
export const QUARTER_HOUR = 15 * 60_000

const floorTo = (stepMs: number) => Math.floor(Date.now() / stepMs) * stepMs

/**
 * The time, rounded down to `stepMs`, for Convex queries that cannot read
 * the clock (a query that did would be cached on the time it first ran).
 * Every change of the value re-runs the queries it is passed to, so give
 * them the coarsest step their windows allow: "due today" needs the day to
 * turn over on time, not a fresh answer every minute.
 */
export function useClock(stepMs: number) {
  const [now, setNow] = useState(() => floorTo(stepMs))
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    // Wake just past each mark, so the value turns at midnight, not up to
    // a whole step after it.
    const schedule = () => {
      timer = setTimeout(
        () => {
          setNow(floorTo(stepMs))
          schedule()
        },
        stepMs - (Date.now() % stepMs) + 50
      )
    }
    schedule()
    return () => clearTimeout(timer)
  }, [stepMs])
  return now
}

/** The time to the minute, for "waited 3 hours" labels. */
export function useMinute() {
  return useClock(60_000)
}

/**
 * The start of today in IST, changing only at midnight. For queries whose
 * only use of the clock is "due today", and for paginated ones especially:
 * new arguments throw away every page already loaded.
 */
export function useIstDay() {
  return startOfTodayIst(useClock(QUARTER_HOUR))
}
