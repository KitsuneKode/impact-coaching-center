"use client"

import { useEffect, useState } from "react"

/**
 * The time to the minute, for Convex queries that cannot read the clock
 * (a query that did would be cached on the time it first ran).
 */
export function useMinute() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 60_000) * 60_000)
  useEffect(() => {
    const timer = setInterval(
      () => setNow(Math.floor(Date.now() / 60_000) * 60_000),
      60_000
    )
    return () => clearInterval(timer)
  }, [])
  return now
}
