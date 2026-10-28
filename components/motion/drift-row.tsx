"use client"

import { type ComponentProps, type ReactNode, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/** Pixels a second the row drifts by on its own. */
const DRIFT = 28
/** A touch or a drag leaves the row still for this long before it drifts. */
const REST_MS = 2500

/**
 * A row that drifts sideways on its own, slowly, and loops: the items are
 * drawn twice and the scroll jumps back by one set when it passes it, so
 * the end never shows. A mouse drags it and a flick coasts; a finger swipes
 * it natively; hover or focus holds it still. It is a real scroller, so
 * Tab brings a focused item into view and a screen reader reads one set.
 * Reduced motion: a plain row to scroll, no drift.
 */
export function DriftRow({
  items,
  className,
  itemClassName,
  label,
  ...rest
}: {
  items: ReactNode[]
  className?: string
  itemClassName?: string
  label: string
} & Omit<ComponentProps<"ul">, "children" | "ref">) {
  const row = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const el = row.current
    if (!el) return
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches

    // Where the drift has the row, as a float: scrollLeft rounds to whole
    // pixels, and a slow drift moves less than one a frame.
    let pos = el.scrollLeft
    let velocity = 0
    let held = false
    let visible = false
    let restUntil = 0
    let frame = 0
    let last = 0
    let drag: {
      id: number
      x: number
      moved: number
      samples: { x: number; t: number }[]
    } | null = null

    const half = () => {
      const second = el.children[items.length] as HTMLElement | undefined
      return second
        ? second.offsetLeft - (el.firstElementChild as HTMLElement).offsetLeft
        : 0
    }
    const wrap = () => {
      const span = half()
      if (!span) return
      if (pos >= span) pos -= span
      else if (pos < 0) pos += span
    }
    const write = () => {
      wrap()
      el.scrollLeft = pos
    }

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60
      last = now
      if (!drag) {
        if (Math.abs(velocity) > 5) {
          pos += velocity * dt
          velocity *= Math.exp(-dt / 0.35)
          write()
        } else if (!held && now > restUntil) {
          velocity = 0
          pos += DRIFT * dt
          write()
        }
      }
      frame = requestAnimationFrame(tick)
    }
    const run = () => {
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
      if (visible && !document.hidden) frame = requestAnimationFrame(tick)
    }

    // Native scrolling (a swipe, a wheel, focus) moves the row: follow it,
    // and give it a moment before drifting again.
    const onScroll = () => {
      if (Math.abs(el.scrollLeft - pos) > 1.5) {
        pos = el.scrollLeft
        velocity = 0
        restUntil = performance.now() + REST_MS
        if (!drag) {
          wrap()
          if (Math.abs(el.scrollLeft - pos) > 1) el.scrollLeft = pos
        }
      }
    }

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return
      drag = {
        id: event.pointerId,
        x: event.clientX,
        moved: 0,
        samples: [{ x: event.clientX, t: event.timeStamp }],
      }
      velocity = 0
    }
    const onMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return
      const dx = event.clientX - drag.x
      drag.x = event.clientX
      drag.moved += Math.abs(dx)
      // A press that wanders a few pixels is still a click.
      if (drag.moved > 6 && !("dragging" in el.dataset)) {
        el.dataset.dragging = ""
        el.setPointerCapture(event.pointerId)
      }
      if (!("dragging" in el.dataset)) return
      pos -= dx
      write()
      drag.samples.push({ x: event.clientX, t: event.timeStamp })
      if (drag.samples.length > 5) drag.samples.shift()
    }
    const onUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return
      const [first, end] = [drag.samples[0]!, drag.samples.at(-1)!]
      const span = (end.t - first.t) / 1000
      if ("dragging" in el.dataset && span > 0 && event.timeStamp - end.t < 80)
        velocity = Math.max(-2400, Math.min(2400, -(end.x - first.x) / span))
      drag = null
      restUntil = performance.now() + REST_MS
      // The click that ends a drag is not a click on an item.
      if ("dragging" in el.dataset)
        requestAnimationFrame(() => delete el.dataset.dragging)
    }
    const onClick = (event: MouseEvent) => {
      if (!("dragging" in el.dataset)) return
      event.preventDefault()
      event.stopPropagation()
    }
    const hold = () => {
      held = true
    }
    const release = () => {
      held = el.matches(":focus-within") || (fine && el.matches(":hover"))
    }

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      run()
    })
    seen.observe(el)
    document.addEventListener("visibilitychange", run)
    el.addEventListener("scroll", onScroll, { passive: true })
    el.addEventListener("pointerdown", onDown)
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerup", onUp)
    el.addEventListener("pointercancel", onUp)
    el.addEventListener("click", onClick, true)
    el.addEventListener("focusin", hold)
    el.addEventListener("focusout", release)
    if (fine) {
      el.addEventListener("pointerenter", hold)
      el.addEventListener("pointerleave", release)
    }
    return () => {
      cancelAnimationFrame(frame)
      seen.disconnect()
      document.removeEventListener("visibilitychange", run)
      el.removeEventListener("scroll", onScroll)
      el.removeEventListener("pointerdown", onDown)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerup", onUp)
      el.removeEventListener("pointercancel", onUp)
      el.removeEventListener("click", onClick, true)
      el.removeEventListener("focusin", hold)
      el.removeEventListener("focusout", release)
      el.removeEventListener("pointerenter", hold)
      el.removeEventListener("pointerleave", release)
    }
  }, [items.length])

  return (
    <ul
      {...rest}
      ref={row}
      aria-label={label}
      data-drift-row
      className={cn("scrollbar-none flex overflow-x-auto", className)}
    >
      {items.map((item, i) => (
        <li key={i} className={itemClassName}>
          {item}
        </li>
      ))}
      {/* The loop's second set: for the eye only. */}
      {items.map((item, i) => (
        <li key={`again-${i}`} aria-hidden inert className={itemClassName}>
          {item}
        </li>
      ))}
    </ul>
  )
}
