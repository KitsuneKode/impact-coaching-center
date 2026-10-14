"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

/** A navigation faster than this shows nothing at all. */
const PATIENCE_MS = 250

/**
 * A thin bar at the top of the window, only while a navigation is slow:
 * it waits 250 ms after a click on an internal link, creeps toward 85% while
 * the next page loads, and finishes the moment the address changes. Most
 * pages here are static and never trigger it.
 */
export function RouteProgress() {
  const key = `${usePathname()}?${useSearchParams()}`
  // The address a slow navigation started from; once the address differs,
  // the next page has arrived and the bar finishes.
  const [from, setFrom] = useState<string | null>(null)
  const latest = useRef(key)
  useEffect(() => {
    latest.current = key
  }, [key])
  const timer = useRef(0)

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return
      const link = (event.target as Element | null)?.closest("a")
      if (!link || link.target === "_blank" || link.hasAttribute("download"))
        return
      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin) return
      // Same page (an anchor, or the page itself): nothing loads.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return
      const start = latest.current
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        // Already there: a fast navigation shows nothing.
        if (latest.current === start) setFrom(start)
      }, PATIENCE_MS)
    }
    document.addEventListener("click", onClick, { capture: true })
    return () => {
      document.removeEventListener("click", onClick, { capture: true })
      window.clearTimeout(timer.current)
    }
  }, [])

  const state = from === null ? "idle" : from === key ? "loading" : "done"

  useEffect(() => {
    if (state !== "done") return
    const reset = window.setTimeout(() => setFrom(null), 400)
    return () => window.clearTimeout(reset)
  }, [state])

  return <div aria-hidden data-route-progress={state} />
}
