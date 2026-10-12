"use client"

import { useReducedMotion, useSpring } from "motion/react"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

/** Tilts toward a mouse pointer on a spring. Touch never moves it. */
export function Tilt({
  children,
  className,
  max = 6,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const reduce = useReducedMotion()
  const rx = useSpring(0, { stiffness: 180, damping: 18 })
  const ry = useSpring(0, { stiffness: 180, damping: 18 })
  return (
    <m.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== "mouse") return
        const box = event.currentTarget.getBoundingClientRect()
        ry.set(((event.clientX - box.left) / box.width - 0.5) * max * 2)
        rx.set(-((event.clientY - box.top) / box.height - 0.5) * max * 2)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
    >
      {children}
    </m.div>
  )
}
