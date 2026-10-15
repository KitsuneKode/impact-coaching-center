"use client"

import { useEffect, useState } from "react"

export type Headroom = "top" | "pinned" | "hidden"

/**
 * Where the site's top chrome is: at the top of the page ("top"), scrolled
 * with everything showing ("pinned"), or reading down ("hidden"), when the
 * CSS folds away what can go (the promo strip; the header stays).
 * It hides after `hideAfter` px of page when scrolling down, and comes back
 * on any deliberate scroll up (`tolerance` px), when focus moves into
 * `keep`, or while the page is scroll-locked (a menu or dialog is open).
 * The state is also written to <html data-chrome>, for the CSS.
 */
export function useHeadroom({
  keep,
  hideAfter = 240,
  tolerance = 8,
}: {
  /** Selector for the chrome itself; focus inside it keeps it showing. */
  keep: string
  hideAfter?: number
  tolerance?: number
}): Headroom {
  const [state, setState] = useState<Headroom>("top")

  useEffect(() => {
    const root = document.documentElement
    let last = Math.max(0, window.scrollY)
    let travel = 0 // px scrolled in the current direction
    let current: Headroom = "top"
    let frame = 0

    const set = (next: Headroom) => {
      if (next === current) return
      current = next
      root.dataset.chrome = next
      setState(next)
    }
    // Keyboard focus only: a clicked link keeps focus, and that must not
    // pin the header for the rest of the page.
    const focusInside = () => {
      const el = document.activeElement
      return el?.closest(keep) != null && el.matches(":focus-visible")
    }
    const locked = () =>
      document.body.hasAttribute("data-scroll-locked") ||
      getComputedStyle(document.body).overflow === "hidden"

    const update = () => {
      frame = 0
      const y = Math.max(0, window.scrollY)
      const delta = y - last
      last = y
      // Hysteresis: draws in after a real scroll, back only near the top,
      // so a nudge never sets the header off.
      if (y < 8 || (current === "top" && y < 40)) return set("top")
      if (locked() || focusInside()) return set("pinned")
      // Reset the run whenever the direction changes.
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta
      if (travel > tolerance && y > hideAfter) set("hidden")
      else if (travel < -tolerance || current === "top") set("pinned")
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onFocus = (event: FocusEvent) => {
      const el = event.target as Element | null
      if (el?.closest?.(keep) && el.matches(":focus-visible"))
        set(window.scrollY < 8 ? "top" : "pinned")
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("focusin", onFocus)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("focusin", onFocus)
      delete root.dataset.chrome
    }
  }, [hideAfter, keep, tolerance])

  return state
}
