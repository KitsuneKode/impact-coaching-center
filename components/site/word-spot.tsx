"use client"

import { useRef, type PointerEvent, type ReactNode } from "react"

/** Hands its children the mouse position as `--wx`/`--wy`, for a light that follows it. */
export function WordSpot({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !ref.current) return
    const box = ref.current.getBoundingClientRect()
    ref.current.style.setProperty("--wx", `${event.clientX - box.left}px`)
    ref.current.style.setProperty("--wy", `${event.clientY - box.top}px`)
  }
  return (
    <div ref={ref} onPointerMove={move} data-footer-word aria-hidden>
      {children}
    </div>
  )
}
