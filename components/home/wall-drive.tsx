"use client"

import { useEffect } from "react"

/**
 * The hero's photo wall, under a mouse: drag it like a film reel (the first
 * column follows the hand, the others turn with it at their own speed and
 * direction), let go and it carries the flick's speed and coasts to a stop,
 * hover and it slows to a crawl so a photo can be read, scroll the page and
 * it rushes a little with the page. A press that did not drag is a click:
 * the photo opens what it shows.
 *
 * It moves the wall's own CSS animations (their currentTime and rate), so
 * the drift never jumps and nothing new is drawn. Touch and reduced motion
 * leave the CSS drift alone (reduced motion has none to move).
 */
export function WallDrive() {
  useEffect(() => {
    const wall = document.querySelector<HTMLElement>("[data-hero-sidewall]")
    if (!wall) return
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return
    const cols = [...wall.querySelectorAll<HTMLElement>("[data-wall-col]")]
    const drifts = cols.map((col) => col.getAnimations()[0])
    if (drifts.some((d) => !d)) return
    const anims = drifts as Animation[]

    // One chip that names the photo under the pointer and rides beside it.
    const chip = document.createElement("span")
    chip.dataset.wallChip = ""
    chip.setAttribute("aria-hidden", "true")
    document.body.append(chip)
    const label = (event: PointerEvent) => {
      const photo = (event.target as Element | null)?.closest<HTMLElement>(
        "[data-wall-photo]"
      )
      if (!photo || "dragging" in wall.dataset) {
        delete chip.dataset.on
        return
      }
      const text = `${photo.dataset.label ?? ""}  →`
      if (chip.textContent !== text) chip.textContent = text
      // Beside the pointer, flipping to its left near the window's edge.
      const width = chip.offsetWidth
      const x =
        event.clientX + 14 + width > window.innerWidth - 12
          ? event.clientX - 14 - width
          : event.clientX + 14
      chip.style.translate = `${x}px ${event.clientY + 18}px`
      chip.dataset.on = ""
    }

    // Seconds of drift per pixel, so the first column tracks the pointer.
    const secPerPx = () => {
      const timing = anims[0]!.effect?.getTiming()
      const duration = Number(timing?.duration) / 1000 || 60
      return duration / (cols[0]!.offsetHeight / 2 || 1)
    }
    const shift = (seconds: number) => {
      for (const anim of anims) {
        const t = Number(anim.currentTime ?? 0) + seconds * 1000
        anim.currentTime = t
      }
    }

    let velocity = 0 // drift seconds per second, on top of the drift itself
    let over = false
    let rate = 1
    let drag: {
      id: number
      y: number
      moved: number
      samples: { y: number; t: number }[]
    } | null = null
    let frame = 0
    let last = 0

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60
      last = now
      if (!drag && Math.abs(velocity) > 0.01) {
        shift(velocity * dt)
        // Exponential coast, as a scroll view decelerates.
        velocity *= Math.exp(-dt / 0.45)
      } else if (!drag) velocity = 0
      const goal = drag ? 0 : over ? 0.15 : 1
      const next = rate + (goal - rate) * (1 - Math.exp(-dt / 0.35))
      if (Math.abs(next - rate) > 0.003) {
        rate = next
        for (const anim of anims) anim.playbackRate = rate
      }
      const settled = !drag && velocity === 0 && Math.abs(goal - rate) <= 0.003
      frame = settled ? 0 : requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!frame) {
        last = 0
        frame = requestAnimationFrame(tick)
      }
    }

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      drag = {
        id: event.pointerId,
        y: event.clientY,
        moved: 0,
        samples: [{ y: event.clientY, t: event.timeStamp }],
      }
      velocity = 0
      wake()
    }
    const onMove = (event: PointerEvent) => {
      label(event)
      if (!drag || event.pointerId !== drag.id) return
      const dy = event.clientY - drag.y
      drag.y = event.clientY
      drag.moved += Math.abs(dy)
      // Hysteresis: a press that wanders a few pixels is still a click.
      if (drag.moved > 6 && !("dragging" in wall.dataset)) {
        wall.dataset.dragging = ""
        wall.setPointerCapture(event.pointerId)
      }
      if ("dragging" in wall.dataset) shift(-dy * secPerPx())
      drag.samples.push({ y: event.clientY, t: event.timeStamp })
      if (drag.samples.length > 5) drag.samples.shift()
    }
    const onUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return
      const [first, end] = [drag.samples[0]!, drag.samples.at(-1)!]
      const span = (end.t - first.t) / 1000
      // Hand the flick's speed to the coast, in drift seconds per second.
      if (
        "dragging" in wall.dataset &&
        span > 0 &&
        event.timeStamp - end.t < 80
      )
        velocity = Math.max(
          -40,
          Math.min(40, (-(end.y - first.y) / span) * secPerPx())
        )
      drag = null
      wake()
      // The click after a drag is not a click on a photo.
      if ("dragging" in wall.dataset)
        requestAnimationFrame(() => delete wall.dataset.dragging)
    }
    const onClick = (event: MouseEvent) => {
      if ("dragging" in wall.dataset) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    const onEnter = () => {
      over = true
      wake()
    }
    const onLeave = () => {
      over = false
      delete chip.dataset.on
      wake()
    }
    // The page's own scroll gives the wall a push, felt but not fought.
    let lastY = window.scrollY
    const onScroll = () => {
      delete chip.dataset.on
      const y = window.scrollY
      if (y < window.innerHeight) {
        velocity += (y - lastY) * secPerPx() * 0.6
        velocity = Math.max(-25, Math.min(25, velocity))
        wake()
      }
      lastY = y
    }

    wall.addEventListener("pointerdown", onDown)
    wall.addEventListener("pointermove", onMove)
    wall.addEventListener("pointerup", onUp)
    wall.addEventListener("pointercancel", onUp)
    wall.addEventListener("click", onClick, true)
    wall.addEventListener("pointerenter", onEnter)
    wall.addEventListener("pointerleave", onLeave)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      chip.remove()
      wall.removeEventListener("pointerdown", onDown)
      wall.removeEventListener("pointermove", onMove)
      wall.removeEventListener("pointerup", onUp)
      wall.removeEventListener("pointercancel", onUp)
      wall.removeEventListener("click", onClick, true)
      wall.removeEventListener("pointerenter", onEnter)
      wall.removeEventListener("pointerleave", onLeave)
      window.removeEventListener("scroll", onScroll)
      for (const anim of anims) anim.playbackRate = 1
    }
  }, [])
  return null
}
