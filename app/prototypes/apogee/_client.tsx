"use client"

import { useReducedMotion } from "motion/react"
import { useEffect, useRef, type ReactNode } from "react"

type Star = {
  x: number
  y: number
  r: number
  a: number
  s: number
  deep: boolean
}

/** A small seeded generator, so server and client always lay the same sky. */
function seeded(seed: number) {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * The opening sky. Stars are drawn on a 2D canvas that twinkles slowly and
 * drifts a few pixels against the pointer; the planet and its glow shift
 * through one CSS variable. Nothing here touches React state per frame, the
 * loop sleeps when the sky is off screen, and under reduced motion the sky is
 * drawn once and left still.
 */
export function Sky({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = root.current
    const cv = canvas.current
    const ctx = cv?.getContext("2d")
    if (!el || !cv || !ctx) return

    let w = 0
    let h = 0
    let dpr = 1
    let stars: Star[] = []
    let frame = 0
    let last = 0
    let visible = true
    let px = 0
    let py = 0
    let tx = 0
    let ty = 0

    const build = () => {
      const box = el.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = box.width
      h = box.height
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      const rand = seeded(11)
      const count = Math.round(Math.min(280, (w * h) / 5200))
      stars = Array.from({ length: count }, () => ({
        x: rand(),
        y: rand() * 0.82,
        r: 0.35 + rand() ** 3 * 1.35,
        a: 0.25 + rand() * 0.6,
        s: 0.4 + rand() * 1.6,
        deep: rand() < 0.28,
      }))
    }

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = "#F6EFE2"
      for (const s of stars) {
        const twinkle = reduce
          ? 1
          : 0.62 + 0.38 * Math.sin((t / 1000) * s.s + s.x * 40)
        const depth = s.deep ? 9 : 4
        ctx.globalAlpha = s.a * twinkle
        ctx.beginPath()
        ctx.arc(s.x * w + px * depth, s.y * h + py * depth, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = (t: number) => {
      frame = 0
      if (!visible) return
      if (t - last > 32) {
        last = t
        px += (tx - px) * 0.08
        py += (ty - py) * 0.08
        el.style.setProperty("--ap-x", px.toFixed(3))
        draw(t)
      }
      frame = requestAnimationFrame(loop)
    }
    const start = () => {
      if (!frame && !reduce) frame = requestAnimationFrame(loop)
    }

    const move = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
    }

    build()
    draw(0)

    const resize = new ResizeObserver(() => {
      build()
      draw(performance.now())
    })
    resize.observe(el)
    const watch = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      if (visible) start()
    })
    watch.observe(el)
    if (!reduce) window.addEventListener("pointermove", move, { passive: true })
    start()

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      watch.disconnect()
      window.removeEventListener("pointermove", move)
    }
  }, [reduce])

  return (
    <section ref={root} data-ap-hero aria-label="Impact Career Tutorials">
      <canvas ref={canvas} data-ap-stars aria-hidden />
      <div aria-hidden data-ap-beam />
      <div aria-hidden data-ap-glow />
      <div aria-hidden data-ap-planet />
      <p aria-hidden data-ap-ghost>
        Impact
      </p>
      {children}
    </section>
  )
}
