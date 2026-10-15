"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

/** A navigation faster than this shows nothing at all. */
const PATIENCE_MS = 250
/** A page that has not arrived by now is not coming: the bar lets go. */
const GIVE_UP_MS = 10_000

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
      if (link.closest("[data-progress=off]")) return
      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin) return
      // Same page (an anchor, or the page itself): nothing loads.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return
      const start = latest.current
      let opened = false
      window.clearTimeout(timer.current)
      // Seen after every handler ran: a link a handler took over (the cart
      // opening in place, a pop-up) and Next's own links both prevent the
      // default, but only a takeover leaves a dialog open or the URL alone.
      window.addEventListener(
        "click",
        () => {
          opened = Boolean(document.querySelector("[role=dialog]"))
        },
        { once: true }
      )
      timer.current = window.setTimeout(() => {
        // Already there, or nothing is loading: show nothing.
        if (latest.current !== start || opened) return
        if (document.querySelector("[role=dialog]")) return
        setFrom(start)
      }, PATIENCE_MS)
    }
    // Back and forward, or any move the bar did not start: it stands down.
    const reset = () => {
      window.clearTimeout(timer.current)
      setFrom(null)
    }
    document.addEventListener("click", onClick, { capture: true })
    window.addEventListener("popstate", reset)
    return () => {
      document.removeEventListener("click", onClick, { capture: true })
      window.removeEventListener("popstate", reset)
      window.clearTimeout(timer.current)
    }
  }, [])

  const state = from === null ? "idle" : from === key ? "loading" : "done"

  useEffect(() => {
    if (state !== "loading") return
    const giveUp = window.setTimeout(() => setFrom(null), GIVE_UP_MS)
    return () => window.clearTimeout(giveUp)
  }, [state])

  useEffect(() => {
    if (state !== "done") return
    const reset = window.setTimeout(() => setFrom(null), 400)
    return () => window.clearTimeout(reset)
  }, [state])

  return <div aria-hidden data-route-progress={state} />
}
