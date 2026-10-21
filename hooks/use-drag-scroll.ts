"use client"

import { type RefObject, useEffect } from "react"

/**
 * Lets a mouse drag a horizontal scroll row, the way a finger already can.
 * Snapping is paused while dragging and comes back on release, so the row
 * settles on the nearest card; a drag never counts as a click on a card.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let pointer = -1
    let startX = 0
    let startLeft = 0
    let dragged = false

    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return
      pointer = event.pointerId
      startX = event.clientX
      startLeft = el.scrollLeft
      dragged = false
    }
    const move = (event: PointerEvent) => {
      if (event.pointerId !== pointer) return
      const dx = event.clientX - startX
      if (!dragged) {
        if (Math.abs(dx) < 6) return
        dragged = true
        el.setPointerCapture(pointer)
        el.dataset.dragging = ""
      }
      el.scrollLeft = startLeft - dx
    }
    const up = (event: PointerEvent) => {
      if (event.pointerId !== pointer) return
      pointer = -1
      delete el.dataset.dragging
    }
    const click = (event: MouseEvent) => {
      if (!dragged) return
      dragged = false
      event.preventDefault()
      event.stopPropagation()
    }

    el.addEventListener("pointerdown", down)
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerup", up)
    el.addEventListener("pointercancel", up)
    el.addEventListener("click", click, true)
    return () => {
      el.removeEventListener("pointerdown", down)
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerup", up)
      el.removeEventListener("pointercancel", up)
      el.removeEventListener("click", click, true)
    }
  }, [ref])
}
