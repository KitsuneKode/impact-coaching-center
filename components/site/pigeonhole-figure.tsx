"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { type CSSProperties, useEffect, useRef } from "react"

import {
  BEAM_FOOT,
  EMPTY_HOLE,
  HOLE_X,
  HOLES,
  LAMP_REST,
  LAMP_UNIT,
  LENS_RIM,
  PIGEONHOLES_SVG,
  PULL,
} from "@/components/site/pigeonholes-art"

const TOUR_STEP = 1.6 // seconds the lamp rests over each pigeonhole

/**
 * The 404 figure (scripts/figures/pigeonholes.mjs): a pigeonhole cabinet
 * whose empty pigeonhole is the address that was asked for. The lamp runs
 * along its rail to the pigeonhole under the pointer (or the arrow keys),
 * its beam falls on that pigeonhole, whose papers slide out a little and
 * whose label lights; the readout names what is filed there, and a click or
 * Enter goes to it.
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
    const beam = svg?.querySelector<SVGPathElement>("[data-beam]")
    // Everything that lights with a pigeonhole: its ring, its contents, its label.
    const lit = HOLES.map((_, i) => [
      ...(svg?.querySelectorAll(
        `[data-ring="${i}"],[data-hole="${i}"],[data-holder="${i}"]`
      ) ?? []),
    ])
    if (!svg || !lamp || !beam) return
    if (mode === "error") svg.dataset.lampOut = ""

    const still = matchMedia("(prefers-reduced-motion: reduce)")
    let x = LAMP_REST
    let target = LAMP_REST
    // the beam's foot eases from one pigeonhole to the next with the lamp
    let foot: number[] = BEAM_FOOT[EMPTY_HOLE]!.flat()
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
      lit.forEach((els, n) =>
        els.forEach((el) => el.toggleAttribute("data-active", n === i))
      )
      const text = textFor(i)
      if (readout.current && readout.current.textContent !== text)
        readout.current.textContent = text
    }

    // The lamp is drawn over x = 0; one world unit is LAMP_UNIT on screen.
    const place = () => {
      const dx = LAMP_UNIT[0] * x
      const dy = LAMP_UNIT[1] * x
      lamp.setAttribute(
        "transform",
        `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`
      )
      const [[ax, ay], [bx, by]] = LENS_RIM
      const [fx, fy, gx, gy] = foot.map((n) => n.toFixed(1))
      beam.setAttribute(
        "d",
        `M${(ax + dx).toFixed(1)} ${(ay + dy).toFixed(1)}L${(bx + dx).toFixed(1)} ${(by + dy).toFixed(1)}L${gx} ${gy}L${fx} ${fy}Z`
      )
    }

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
      const ease = still.matches ? 1 : 1 - Math.exp(-dt / 0.3)
      x += (target - x) * ease
      if (Math.abs(target - x) < 0.02) x = target
      const goal: number[] = BEAM_FOOT[active]!.flat()
      foot = foot.map((n, k) => {
        const next = n + (goal[k]! - n) * ease
        return Math.abs(goal[k]! - next) < 0.05 ? goal[k]! : next
      })
      place()
      const settled =
        !touring && x === target && foot.every((n, k) => n === goal[k])
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
    // A press pulls the papers out a little further, like taking hold of them.
    const onDown = (event: PointerEvent) => {
      const i = holeOf(event)
      if (i === null) return
      steer(i)
      root.dataset.pressed = ""
    }
    const onUp = () => delete root.dataset.pressed
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
    root.addEventListener("pointerdown", onDown)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
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
      root.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
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
        style={
          {
            "--pull-x": `${PULL[0]}px`,
            "--pull-y": `${PULL[1]}px`,
          } as CSSProperties
        }
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
