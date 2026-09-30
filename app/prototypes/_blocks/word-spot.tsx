"use client"

import { useRef, type PointerEvent, type ReactNode } from "react"

/** Hands its child the pointer position as `--wx`/`--wy`, for a light that follows the mouse. */
export function WordSpot({
  children,
  ...rest
}: {
  children: ReactNode
  [attr: `data-${string}`]: string | boolean | undefined
}) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty("--wx", `${e.clientX - r.left}px`)
    ref.current.style.setProperty("--wy", `${e.clientY - r.top}px`)
  }
  return (
    <div ref={ref} onPointerMove={move} {...rest}>
      {children}
    </div>
  )
}
