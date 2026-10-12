"use client"

/*
 * Adapted from motion-primitives (ibelick/motion-primitives, AnimatedNumber).
 * Changes:
 */
import {
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
  const reduce = useReducedMotion()

  /* Start on the real number. Counting up from zero made the proof bar read
     as 0 subscribers until the spring arrived. Later changes still move. */
  const spring = useSpring(value, springOptions)
  const display = useTransform(spring, (current) =>
    formatValue(current, compact, suffix)
  )

  useEffect(() => {
    if (reduce) spring.jump(value)
    else spring.set(value)
  }, [reduce, spring, value])

  /*
   * The final value is also rendered as plain text for screen readers and
   * crawlers, which would otherwise hear every intermediate number.
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
