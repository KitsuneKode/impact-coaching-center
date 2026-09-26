"use client"

/*
 * Adapted from motion-primitives (ibelick/motion-primitives, AnimatedNumber).
 * Changes: counts up only once it scrolls into view, formats with a custom
 * formatter so "16.2K" style labels work, and drops the per-render
 * motion.create call, which rebuilt the component on every render.
 */
import {
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
  type SpringOptions,
} from "motion/react"
import * as m from "motion/react-m"
import { useEffect, useRef } from "react"

export type AnimatedNumberProps = {
  value: number
  /** 16200 -> "16.2K". Props stay serialisable so server components can pass them. */
  compact?: boolean
  suffix?: string
  className?: string
  springOptions?: SpringOptions
}

function formatValue(n: number, compact: boolean, suffix: string) {
  const text =
    compact && n >= 1000
      ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`
      : Math.round(n).toLocaleString("en-IN")
  return `${text}${suffix}`
}

export function AnimatedNumber({
  value,
  compact = false,
  suffix = "",
  className,
  springOptions = { stiffness: 90, damping: 24, mass: 0.8 },
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()

  const spring = useSpring(reduce ? value : 0, springOptions)
  const display = useTransform(spring, (current) =>
    formatValue(current, compact, suffix)
  )

  useEffect(() => {
    if (inView) spring.set(value)
  }, [inView, spring, value])

  /*
   * The final value is also rendered as plain text for screen readers and
   * crawlers, which would otherwise read the spring's starting zero or every
   * intermediate number.
   */
  return (
    <span className={className}>
      <span className="sr-only">{formatValue(value, compact, suffix)}</span>
      <m.span ref={ref} aria-hidden className="tnum">
        {display}
      </m.span>
    </span>
  )
}
