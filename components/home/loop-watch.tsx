"use client"

import { useEffect } from "react"

/** Pauses the hero's photo walls and the marquee while they are off screen. */
export function LoopWatch() {
  useEffect(() => {
    const loops = document.querySelectorAll<HTMLElement>(
      '[data-hero="blue"], [data-marquee-track]'
    )
    if (!loops.length) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries)
        entry.target.toggleAttribute("data-offscreen", !entry.isIntersecting)
    })
    for (const loop of loops) observer.observe(loop)
    return () => observer.disconnect()
  }, [])
  return null
}
