"use client"

import { useEffect, useRef, useState } from "react"

/**
 * A count that rolls up digit by digit, like a mechanical counter, the
 * first time it comes into view. The number itself is in the markup for
 * readers, search and reduced motion; the rolling strips are decoration
 * laid over the same width (tabular figures, so nothing shifts).
 */
export function RollingNumber({
  value,
  className,
}: {
  /** As printed: "10", "1,000+", "16.2K". Only the digits roll. */
  value: string
  className?: string
}) {
  const box = useRef<HTMLSpanElement>(null)
  const [rolled, setRolled] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    // Reduced motion: CSS shows the digits in place; nothing rolls.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setRolled(true)
        seen.disconnect()
      },
      { threshold: 0.6 }
    )
    seen.observe(el)
    return () => seen.disconnect()
  }, [])

  let digit = 0
  return (
    <span
      ref={box}
      data-rolling={rolled ? "done" : "ready"}
      className={className}
    >
      <span className="sr-only">{value}</span>
      <span aria-hidden className="tnum inline-flex">
        {[...value].map((char, i) => {
          if (!/\d/.test(char)) return <span key={i}>{char}</span>
          const order = digit++
          return (
            <span key={i} data-roll-digit>
              {/* The strip runs 0-9 then lands on the digit; the delay rolls
                  the places left to right, like a counter turning over. */}
              <span
                data-roll-strip
                style={{
                  ["--to" as string]: Number(char),
                  ["--roll-delay" as string]: `${order * 70}ms`,
                }}
              >
                {Array.from({ length: 10 }, (_, n) => (
                  <span key={n}>{n}</span>
                ))}
              </span>
            </span>
          )
        })}
      </span>
    </span>
  )
}
