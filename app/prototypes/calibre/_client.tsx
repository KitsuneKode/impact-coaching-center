"use client"

import { IconArrowRight } from "@tabler/icons-react"
import { animate, m, useInView, useReducedMotion } from "motion/react"
import Link from "next/link"
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"

/* ------------------------------------------------------------------ */
/*  Light                                                              */
/* ------------------------------------------------------------------ */

/** Moves the specular spot on every `[data-cb-plate]` toward the pointer. */
export function LightSource({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root || !matchMedia("(hover: hover) and (pointer: fine)").matches)
      return
    let frame = 0
    let x = 0
    let y = 0
    const paint = () => {
      frame = 0
      for (const el of root.querySelectorAll<HTMLElement>("[data-cb-plate]")) {
        const r = el.getBoundingClientRect()
        if (r.bottom < -200 || r.top > innerHeight + 200) continue
        el.style.setProperty("--lx", `${x - r.left}px`)
        el.style.setProperty("--ly", `${y - r.top}px`)
      }
    }
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!frame) frame = requestAnimationFrame(paint)
    }
    addEventListener("pointermove", move, { passive: true })
    return () => {
      removeEventListener("pointermove", move)
      cancelAnimationFrame(frame)
    }
  }, [])
  return (
    <div ref={ref} style={{ display: "contents" }}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  The dial                                                           */
/* ------------------------------------------------------------------ */

export type DialBatch = {
  id: number
  name: string
  exam: string
  when: string
  days: string | null
  note: string | null
  price: string
  href: string
  start: number
  end: number
}

const C = 200
const R = 170

/** 12-hour dial angle, clockwise from twelve. */
const angle = (h: number) => ((h % 12) / 12) * 360
function arc(from: number, to: number, r = R) {
  const p = (a: number) => {
    const t = ((a - 90) * Math.PI) / 180
    return `${(C + r * Math.cos(t)).toFixed(2)} ${(C + r * Math.sin(t)).toFixed(2)}`
  }
  const a0 = angle(from) + 1.2
  let a1 = angle(to) - 1.2
  if (a1 <= a0) a1 += 360
  return `M ${p(a0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)}`
}

/** Hours and minutes in North Lakhimpur, whatever the visitor's clock says. */
function istNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date())
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  return { h: get("hour"), m: get("minute"), s: get("second") }
}

/** The batch running now, else the next one today, else the first tomorrow. */
function pick(batches: DialBatch[], hour: number) {
  return (
    batches.find((b) => hour >= b.start && hour < b.end) ??
    batches.find((b) => b.start > hour) ??
    batches[0]!
  )
}

/**
 * A watch dial that is also the timetable: each printed batch is a gold arc
 * over the hours it runs. The hands keep Indian time; the sunray finish turns
 * its light toward the pointer, or with the scroll on a phone.
 */
export function DialHero({
  batches,
  intro,
}: {
  batches: DialBatch[]
  intro: ReactNode
}) {
  const dial = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(
    null
  )
  const [picked, setPicked] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setTime(istNow())
    const first = setTimeout(tick, 60)
    const id = setInterval(tick, 20_000)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    const el = dial.current
    if (!el || !matchMedia("(hover: hover) and (pointer: fine)").matches) return
    let frame = 0
    let a = 210
    const paint = () => {
      frame = 0
      el.style.setProperty("--ang", `${a}deg`)
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      a = (Math.atan2(dy, dx) * 180) / Math.PI + 90 - 19
      if (!frame) frame = requestAnimationFrame(paint)
    }
    addEventListener("pointermove", move, { passive: true })
    return () => {
      removeEventListener("pointermove", move)
      cancelAnimationFrame(frame)
    }
  }, [])

  const active =
    batches.find((b) => b.id === picked) ??
    pick(batches, time ? time.h + time.m / 60 : 10)

  // 10:08:37 until the real time arrives: the pose every watch is photographed in.
  const h = time ? time.h : 10
  const mi = time ? time.m : 8
  const s = time ? time.s : 37
  const hourRot = angle(h + mi / 60)
  const minRot = (mi / 60) * 360

  return (
    <>
      <div className="grid items-center gap-14 pt-10 pb-14 md:pt-14 lg:grid-cols-12">
        <div className="lg:col-span-6">{intro}</div>
        <div
          data-rise
          style={{ animationDelay: "0.2s" }}
          className="mx-auto w-full max-w-[500px] lg:col-span-6"
        >
          <div ref={dial} data-cb-dial aria-hidden>
            <div data-cb-face />
            <svg data-cb-track viewBox="0 0 400 400">
              <defs>
                <linearGradient id="cb-arc" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" data-cb-stop="hi" />
                  <stop offset="0.45" data-cb-stop="mid" />
                  <stop offset="1" data-cb-stop="lo" />
                </linearGradient>
              </defs>
              {Array.from({ length: 60 }, (_, i) => {
                const t = ((i * 6 - 90) * Math.PI) / 180
                const long = i % 5 === 0
                const r0 = long ? 150 : 154
                const at = (r: number, f: (n: number) => number) =>
                  Math.round((C + r * f(t)) * 100) / 100
                return (
                  <line
                    key={i}
                    x1={at(r0, Math.cos)}
                    y1={at(r0, Math.sin)}
                    x2={at(158, Math.cos)}
                    y2={at(158, Math.sin)}
                    data-cb-tick={long ? "long" : "short"}
                    strokeWidth={long ? 1.6 : 0.8}
                  />
                )
              })}
              <circle cx={C} cy={C} r={R} data-cb-ring strokeWidth={12} />
              {batches.map((b) => (
                <path
                  key={b.id}
                  d={arc(b.start, b.end)}
                  data-cb-arc
                  data-on={b.id === active.id || undefined}
                  stroke="url(#cb-arc)"
                  strokeWidth={11}
                  onPointerEnter={() => setPicked(b.id)}
                  onClick={() => setPicked(b.id)}
                />
              ))}
            </svg>
            {Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                data-cb-index
                data-twelve={i === 0 || undefined}
                style={{ "--i": i } as CSSProperties}
              />
            ))}
            <p data-cb-print="brand">IMPACT</p>
            <p data-cb-print="town">North Lakhimpur</p>
            <div data-cb-window>
              <b>{active.name}</b>
              <span>{active.when}</span>
            </div>
            <span
              data-cb-hand="h"
              style={{ "--rot": `${hourRot}deg` } as CSSProperties}
            />
            <span
              data-cb-hand="m"
              style={{ "--rot": `${minRot}deg` } as CSSProperties}
            />
            <span
              data-cb-sec
              style={
                {
                  "--sec-delay": `-${s}s`,
                  transform: reduce ? `rotate(${s * 6}deg)` : undefined,
                } as CSSProperties
              }
            />
            <span data-cb-pin />
          </div>
        </div>
      </div>

      <div data-cb-strip className="grid gap-8 py-8 lg:grid-cols-12">
        <p data-cb-label className="pt-3 lg:col-span-2">
          The day&apos;s batches
        </p>
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:col-span-10">
          {batches.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                data-cb-batch
                aria-pressed={b.id === active.id}
                onClick={() => setPicked(b.id)}
                onPointerEnter={() => setPicked(b.id)}
              >
                <time>{b.when}</time>
                <span data-k-display className="text-xl text-[var(--k-ink)]">
                  {b.name}
                </span>
                <span className="text-xs">{b.exam}</span>
              </button>
            </li>
          ))}
        </ul>
        <div
          className="flex flex-wrap items-baseline gap-x-6 gap-y-2 lg:col-span-10 lg:col-start-3"
          aria-live="polite"
        >
          <p className="text-sm text-[var(--k-muted)]">
            {active.days ? `${active.days}. ` : ""}
            {active.note ? `${active.note}.` : ""}
          </p>
          <p data-k-display className="text-2xl tabular-nums">
            {active.price}
          </p>
          <Link
            href={active.href}
            data-k-link
            className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[var(--k-accent)]"
          >
            See {active.name}
            <IconArrowRight
              aria-hidden
              size={16}
              stroke={1.75}
              className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-dials                                                          */
/* ------------------------------------------------------------------ */

/** A small azurage dial whose hand sweeps up to its mark once, when it is seen. */
export function SubDial({
  display,
  label,
  reach,
}: {
  display: string
  label: string
  /** 0 to 1 around the 270 degree scale */
  reach: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const numRef = useRef<HTMLSpanElement>(null)
  const target = -135 + reach * 270

  useEffect(() => {
    const el = numRef.current
    const match = /^([\d.,]+)(.*)$/.exec(display)
    if (!el || !match || !seen || reduce) return
    const [, raw, suffix] = match
    const n = Number(raw!.replaceAll(",", ""))
    const decimals = raw!.split(".")[1]?.length ?? 0
    const fmt = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: raw!.includes(","),
    })
    const c = animate(0, n, {
      duration: 1.6,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => {
        el.textContent = `${fmt.format(v)}${suffix}`
      },
    })
    return () => c.stop()
  }, [seen, reduce, display])

  return (
    <figure ref={ref} className="text-center">
      <div data-cb-sub>
        <m.span
          data-cb-subhand
          initial={false}
          animate={{ rotate: seen || reduce ? target : -135 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 60, damping: 11, delay: 0.15 }
          }
        />
        <span
          data-k-display
          className="absolute inset-x-0 bottom-[18%] text-[clamp(1.6rem,3vw,2.2rem)] leading-none tabular-nums"
        >
          <span ref={numRef}>{display}</span>
        </span>
      </div>
      <figcaption className="mx-auto mt-5 max-w-[22ch] text-sm text-[var(--k-muted)]">
        {label}
      </figcaption>
    </figure>
  )
}
