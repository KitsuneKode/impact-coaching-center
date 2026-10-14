"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

import {
  EMPTY_HOLE,
  HOLE_X,
  HOLES,
  LAMP_REST,
  LAMP_UNIT,
  PIGEONHOLES_SVG,
} from "@/components/site/pigeonholes-art"

const TOUR_STEP = 1.6 // seconds the lamp rests over each pigeonhole

/**
 * The 404 figure (scripts/figures/pigeonholes.mjs): a pigeonhole cabinet
 * whose empty pigeonhole is the address that was asked for. The lamp runs
 * along its rail to the pigeonhole under the pointer (or the arrow keys),
 * the readout names what is filed there, and a click or Enter goes to it.
 * When nobody touches it the lamp tours the cabinet and comes back to the
 * empty one. In `error` mode the lamp is out and stays over the empty slot.
 */
export function PigeonholeFigure({
  names,
  prefix = "",
  mode = "missing",
  labels,
}: {
  /** The pigeonholes' names in the reader's language, in HOLES order. */
  names: readonly string[]
  /** "/as" on Assamese pages, so links stay in the language. */
  prefix?: string
  mode?: "missing" | "error"
  labels: {
    title: string
    hint: string
    empty: string
    open: string
    out: string
  }
}) {
  const stage = useRef<HTMLDivElement>(null)
  const readout = useRef<HTMLSpanElement>(null)
  const router = useRouter()

  useEffect(() => {
    const root = stage.current
    if (!root) return
    const svg = root.querySelector("svg")
    const lamp = svg?.querySelector<SVGGElement>('[data-part="lamp"]')
    const openings = [
      ...(svg?.querySelectorAll<SVGPathElement>("[data-opening]") ?? []),
    ]
    if (!svg || !lamp) return
    if (mode === "error") svg.dataset.lampOut = ""

    const still = matchMedia("(prefers-reduced-motion: reduce)")
    let x = LAMP_REST
    let target = LAMP_REST
    let active = EMPTY_HOLE
    let touring = mode === "missing" && !still.matches
    let clock = 0
    let frame = 0
    let last = 0
    let visible = false
    let idle = 0

    const textFor = (i: number) =>
      mode === "error"
        ? labels.out
        : i === EMPTY_HOLE
          ? labels.empty
          : `${names[i]} · ${labels.open}`

    const show = (i: number) => {
      active = i
      target = HOLE_X[i]!
      openings.forEach((path, n) => {
        if (n === i) path.dataset.active = ""
        else delete path.dataset.active
      })
      const text = textFor(i)
      if (readout.current && readout.current.textContent !== text)
        readout.current.textContent = text
    }

    // The lamp is drawn over x = 0; one world unit is LAMP_UNIT on screen.
    const place = () =>
      lamp.setAttribute(
        "transform",
        `translate(${(LAMP_UNIT[0] * x).toFixed(2)} ${(LAMP_UNIT[1] * x).toFixed(2)})`
      )

    // Tour: every filled pigeonhole in turn, then back to the empty one.
    const order = [...HOLES.keys()].filter((i) => i !== EMPTY_HOLE)
    const tourAt = (t: number) => {
      const step = Math.floor(t / TOUR_STEP) % (order.length + 2)
      return step >= order.length ? EMPTY_HOLE : order[step]!
    }

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60
      last = now
      if (touring) {
        clock += dt
        const next = tourAt(clock)
        if (next !== active) show(next)
      }
      x = still.matches ? target : x + (target - x) * (1 - Math.exp(-dt / 0.3))
      if (Math.abs(target - x) < 0.02) x = target
      place()
      const settled = !touring && x === target
      frame = visible && !settled ? requestAnimationFrame(tick) : 0
    }
    const run = () => {
      if (!frame && visible) {
        last = 0
        frame = requestAnimationFrame(tick)
      }
    }
    const steer = (i: number) => {
      if (mode === "error") return
      touring = false
      window.clearTimeout(idle)
      idle = window.setTimeout(() => {
        touring = !still.matches
        clock = 0
        run()
      }, 4000)
      show(i)
      run()
    }

    const holeOf = (event: Event) => {
      const el = (event.target as Element | null)?.closest("[data-opening]")
      return el ? Number(el.getAttribute("data-opening")) : null
    }
    const go = (i: number) => {
      const href = HOLES[i]?.href
      if (href) router.push(`${prefix}${href === "/" ? "" : href}` || "/")
    }
    const onMove = (event: PointerEvent) => {
      const i = holeOf(event)
      // Any hover takes over from the tour, even on the pigeonhole it is at.
      if (i !== null && (i !== active || touring)) steer(i)
    }
    const onClick = (event: MouseEvent) => {
      const i = holeOf(event)
      if (i !== null) go(i)
    }
    // The links under the drawing steer the lamp too, for keyboards.
    const chips = root.parentElement?.querySelector("[data-pigeon-links]")
    const onChip = (event: Event) => {
      const el = (event.target as Element | null)?.closest("[data-hole]")
      if (el) steer(Number(el.getAttribute("data-hole")))
    }

    const seen = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1]!.isIntersecting
        if (visible) run()
      },
      { rootMargin: "120px 0px" }
    )
    seen.observe(root)
    root.addEventListener("pointermove", onMove)
    root.addEventListener("click", onClick)
    chips?.addEventListener("focusin", onChip)
    chips?.addEventListener("pointerover", onChip)
    show(EMPTY_HOLE)
    place()

    return () => {
      seen.disconnect()
      cancelAnimationFrame(frame)
      window.clearTimeout(idle)
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("click", onClick)
      chips?.removeEventListener("focusin", onChip)
      chips?.removeEventListener("pointerover", onChip)
    }
  }, [labels, mode, names, prefix, router])

  return (
    <figure data-pigeon-card className="relative">
      <div className="flex items-start justify-between gap-4 text-xs text-muted-foreground">
        <span className="tnum font-medium">Fig. 404</span>
        <span className="text-right">{labels.title}</span>
      </div>
      {/* The drawing is generated at build time from trusted source. */}
      <div
        ref={stage}
        data-pigeon-stage
        className="mbs-2"
        dangerouslySetInnerHTML={{ __html: PIGEONHOLES_SVG }}
      />
      <div className="mbs-2 flex items-end justify-between gap-4 text-xs text-muted-foreground">
        <span className="hidden sm:inline">{labels.hint}</span>
        <span
          ref={readout}
          aria-live="polite"
          className="tnum ms-auto text-right font-medium text-foreground"
        >
          {mode === "error" ? labels.out : labels.empty}
        </span>
      </div>
      <ul data-pigeon-links className="mbs-4 flex flex-wrap gap-1.5">
        {HOLES.map((hole, i) =>
          hole.href ? (
            <li key={hole.href}>
              <Link
                href={`${prefix}${hole.href === "/" ? "" : hole.href}` || "/"}
                data-hole={i}
                data-press
                className="inline-flex min-h-9 items-center rounded-full bg-secondary px-3 text-sm font-medium"
              >
                {names[i]}
              </Link>
            </li>
          ) : null
        )}
      </ul>
    </figure>
  )
}
