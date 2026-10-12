"use client"

import { useReducedMotion, useSpring } from "motion/react"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

/** Pulls its child a few pixels toward a mouse pointer. Touch never moves it. */
export function Magnetic({
  children,
  className,
  strength = 0.2,
}: {
  children: ReactNode
  className?: string
  strength?: number
}) {
  const reduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 220, damping: 16 })
  const y = useSpring(0, { stiffness: 220, damping: 16 })
  return (
    <m.span
      className={className}
      style={{ x, y, display: "inline-flex" }}
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== "mouse") return
        const box = event.currentTarget.getBoundingClientRect()
        x.set((event.clientX - box.left - box.width / 2) * strength)
        y.set((event.clientY - box.top - box.height / 2) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </m.span>
  )
}
