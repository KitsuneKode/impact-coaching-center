"use client"

import { useEffect } from "react"

/**
 * Pauses the hero's drifting photo columns/ribbons and the exam marquee while
 * they are off-screen — the loops only cost battery when someone can see them.
 */
export function LoopWatch() {
  useEffect(() => {
    const els = [
      ...document.querySelectorAll<HTMLElement>(
        "[data-pf-hero], [data-pf-track]"
      ),
    ]
    if (!els.length) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries)
        e.target.toggleAttribute("data-offscreen", !e.isIntersecting)
    })
    for (const el of els) io.observe(el)
    return () => io.disconnect()
  }, [])
  return null
}
