"use client"

import { animate, useInView, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"

/**
 * A rank that climbs to its true value as it scrolls into view: it starts
 * further down the list and counts up the table to where the student landed.
 * Under reduced motion it simply shows the rank.
 */
export function RankClimb({
  value,
  from = 120,
}: {
  value: number
  from?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: "-10% 0px" })
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(value)

  useEffect(() => {
    if (!seen || reduce) return
    const controls = animate(from, value, {
      duration: 1.4,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    })
    return () => controls.stop()
  }, [seen, reduce, from, value])

  return (
    <span ref={ref} aria-label={`Rank ${value}`} className="tabular-nums">
      <span aria-hidden>{shown}</span>
    </span>
  )
}
