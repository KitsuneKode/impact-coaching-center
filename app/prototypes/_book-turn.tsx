"use client"

import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react"
import {
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react"

/**
 * Drag a `Book3D` sideways to turn it over; it settles on the front or the
 * back with a spring. Arrow keys and the two buttons do the same.
 */
export function TurnBook({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  const box = useRef<HTMLButtonElement>(null)
  const turn = useMotionValue(0)
  const drag = useRef<{ x: number; from: number; moved: boolean } | null>(null)
  const dragged = useRef(false)
  const reduce = useReducedMotion()

  useMotionValueEvent(turn, "change", (v) =>
    box.current?.style.setProperty("--bk-turn", `${v}deg`)
  )

  function settle(to: number, velocity = 0) {
    if (reduce) return turn.set(to)
    animate(turn, to, { type: "spring", duration: 0.8, bounce: 0.18, velocity })
  }
  /** The nearest face in the direction of travel. */
  function face(side: "front" | "back") {
    const v = turn.get()
    const base = Math.round(v / 360) * 360
    settle(side === "front" ? base : base + (v >= base ? 180 : -180))
  }

  function down(e: PointerEvent<HTMLButtonElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, from: turn.get(), moved: false }
    turn.stop()
  }
  function move(e: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    if (Math.abs(dx) > 4) drag.current.moved = true
    turn.set(drag.current.from + dx * 0.6)
  }
  function up() {
    if (!drag.current) return
    const v = turn.getVelocity()
    dragged.current = drag.current.moved
    drag.current = null
    if (!dragged.current) return
    // Flicks carry through to the next face; slow drags snap to the nearest.
    const projected = turn.get() + v * 0.25
    settle(Math.round(projected / 180) * 180, v)
  }
  function key(e: KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
    e.preventDefault()
    settle(
      Math.round(turn.get() / 180) * 180 + (e.key === "ArrowRight" ? 180 : -180)
    )
  }

  /** Whether the back is facing the reader. */
  const showingBack = () => Math.abs(Math.round(turn.get() / 180)) % 2 === 1

  return (
    <div>
      <button
        ref={box}
        type="button"
        aria-label={label}
        data-bk-turning
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={key}
        onClick={() => {
          if (dragged.current) return void (dragged.current = false)
          face(showingBack() ? "front" : "back")
        }}
        className="block w-full cursor-grab touch-pan-y rounded-[20px] select-none active:cursor-grabbing"
      >
        {children}
      </button>
      <p aria-hidden className="mt-3 text-center text-sm opacity-50">
        Drag or tap to turn it over
      </p>
    </div>
  )
}
