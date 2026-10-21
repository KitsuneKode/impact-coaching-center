"use client"

import { type RefObject, useLayoutEffect } from "react"

/**
 * A critically damped spring (response 0.24 s, no overshoot), sampled for
 * CSS and WAAPI. The header's bar and the items inside it share it, so they
 * arrive together. Mirrored in globals.css as --ease-spring.
 */
export const SPRING =
  "linear(0, 0.0596, 0.186, 0.3294, 0.4656, 0.584, 0.6819, 0.7601, 0.821, 0.8677, 0.9029, 0.9292, 0.9487, 0.963, 0.9734, 0.9809, 0.9864, 0.9903, 0.9931, 0.9951, 0.9966, 0.9976, 1)"
export const SPRING_MS = 330

/** Gap between the items and the bar's edge. */
const PAD = 12

/**
 * Draws the header in and out. Toggling `data-stuck` changes the row's
 * layout in one frame; this measures every item before and after and slides
 * each from where it was shown to where it now sits (FLIP, transforms only),
 * so nothing jumps. A reversal mid-way measures where things are on screen
 * and starts from there. The bar behind them follows the items' new extent
 * through --bar-start/--bar-end, on the same spring (globals.css).
 */
export function useDrawIn({
  header,
  row,
  stuck,
}: {
  header: RefObject<HTMLElement | null>
  row: RefObject<HTMLElement | null>
  stuck: boolean
}) {
  useLayoutEffect(() => {
    const head = header.current
    const line = row.current
    if (!head || !line) return
    const items = [...line.querySelectorAll<HTMLElement>("[data-flip]")]
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const before = new Map(items.map((el) => [el, el.getBoundingClientRect()]))
    for (const el of items) el.getAnimations().forEach((a) => a.cancel())
    head.toggleAttribute("data-stuck", stuck)

    // Layout offsets, not on-screen boxes: they ignore the slides in
    // flight, so the bar heads for where the items will rest.
    const extent = () => {
      const shown = items.filter((el) => el.offsetParent === line)
      if (!shown.length) return
      const start = Math.min(...shown.map((el) => el.offsetLeft)) - PAD
      const end =
        line.clientWidth -
        Math.max(...shown.map((el) => el.offsetLeft + el.offsetWidth)) -
        PAD
      line.style.setProperty("--bar-start", `${Math.max(0, start)}px`)
      line.style.setProperty("--bar-end", `${Math.max(0, end)}px`)
    }
    extent()

    if (!reduce)
      for (const el of items) {
        const was = before.get(el)
        const now = el.getBoundingClientRect()
        if (!was || el.offsetParent === null) continue
        const dx = was.left - now.left
        const dy = was.top - now.top
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue
        el.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0 0" }], {
          duration: SPRING_MS,
          easing: SPRING,
        })
      }

    // Keep the bar wrapped round the items as they change size (a name
    // arriving in the account slot, a resized window).
    const observer = new ResizeObserver(extent)
    observer.observe(line)
    for (const el of items) observer.observe(el)
    return () => observer.disconnect()
  }, [header, row, stuck])
}
