"use client"

import { IconArrowRight, IconCheck } from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useEffect, useId, useState } from "react"

/* ------------------------------------------------------------------ */
/*  First-week checklist                                               */
/* ------------------------------------------------------------------ */

/** Tick the steps; when all three are done the call to action appears. */
export function PlanCard({
  steps,
  cta,
  href,
}: {
  steps: { verb: string; body: string }[]
  cta: string
  href: string
}) {
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false))
  const id = useId()
  const reduce = useReducedMotion()
  const count = done.filter(Boolean).length
  const all = count === steps.length

  return (
    <div
      data-nb-ruled
      data-k-card
      className="relative overflow-hidden py-7 pr-6 pl-16 sm:pr-8"
    >
      <span data-nb-hole style={{ top: 26 }} />
      <span data-nb-hole style={{ top: "48%" }} />
      <span data-nb-hole style={{ bottom: 26 }} />
      <p data-nb-hand>Your first week at ICT</p>
      <ul className="mt-3 grid gap-4">
        {steps.map((s, i) => (
          <li key={s.verb}>
            <label
              htmlFor={`${id}-${i}`}
              aria-label={s.verb}
              className="flex cursor-pointer items-start gap-4"
            >
              <input
                id={`${id}-${i}`}
                type="checkbox"
                checked={done[i]}
                onChange={() =>
                  setDone((d) => d.map((v, k) => (k === i ? !v : v)))
                }
                className="peer sr-only"
              />
              <span
                data-nb-check
                aria-hidden
                className="mt-0.5 transition-[background-color] duration-150 peer-checked:bg-[var(--k-accent)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--k-ink)]"
              >
                <m.span
                  initial={false}
                  animate={{
                    opacity: done[i] ? 1 : 0,
                    scale: done[i] ? 1 : 0.6,
                    filter: done[i] ? "blur(0px)" : "blur(3px)",
                  }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", duration: 0.3, bounce: 0 }
                  }
                  className="grid place-items-center"
                >
                  <IconCheck size={18} stroke={3} />
                </m.span>
              </span>
              <span className="min-w-0">
                <span
                  className="block text-lg font-bold transition-[opacity] duration-200"
                  style={{
                    textDecorationLine: done[i] ? "line-through" : "none",
                    textDecorationThickness: "2px",
                    opacity: done[i] ? 0.55 : 1,
                  }}
                >
                  {s.verb}
                </span>
                <span className="block text-sm text-[var(--k-muted)]">
                  {s.body}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-6 min-h-[52px]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {all ? (
            <m.div
              key="go"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.24 } }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              <Link
                href={href}
                data-k-press
                data-k-btn
                className="inline-flex h-12 items-center gap-2 px-6 whitespace-nowrap"
              >
                {cta}
                <IconArrowRight aria-hidden size={18} stroke={2.25} />
              </Link>
            </m.div>
          ) : (
            <m.p
              key="count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              data-nb-hand
              className="pt-3"
            >
              {count} of {steps.length} done. Tick them off as you go.
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Daily planner                                                      */
/* ------------------------------------------------------------------ */

export type PlannerRow = {
  id: number
  name: string
  exam: string
  when: string
  days: string | null
  price: string
  href: string
  start: number
  end: number
}

const FIRST = 6
const LAST = 22
const HOURS = Array.from({ length: LAST - FIRST + 1 }, (_, i) => FIRST + i)
const label = (h: number) =>
  `${h % 12 === 0 ? 12 : h % 12} ${h < 12 || h === 24 ? "AM" : "PM"}`

/** Every batch on one day's time axis, with a marker for where the day is now. */
export function Planner({ rows }: { rows: PlannerRow[] }) {
  const exams = ["All", ...Array.from(new Set(rows.map((r) => r.exam)))]
  const [pick, setPick] = useState("All")
  const [now, setNow] = useState<number | null>(null)
  const shown = pick === "All" ? rows : rows.filter((r) => r.exam === pick)

  useEffect(() => {
    const tick = () => {
      const t = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      )
      setNow(t.getHours() + t.getMinutes() / 60)
    }
    tick()
    const i = setInterval(tick, 60_000)
    return () => clearInterval(i)
  }, [])

  const pct = (h: number) => ((h - FIRST) / (LAST - FIRST)) * 100
  const showNow = now !== null && now >= FIRST && now <= LAST

  return (
    <div>
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Filter by exam</legend>
        {exams.map((x) => (
          <button
            key={x}
            type="button"
            aria-pressed={x === pick}
            onClick={() => setPick(x)}
            data-k-press
            data-k-outline
            data-on={x === pick ? "" : undefined}
            className="min-h-11 px-4 text-sm data-[on]:!bg-[var(--k-accent)]"
          >
            {x}
          </button>
        ))}
      </fieldset>

      <div data-nb-planner data-k-card className="mt-6 p-4 sm:p-6">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[170px_1fr] items-end">
            <span />
            <div className="relative h-8">
              {HOURS.filter((h) => h % 2 === 0).map((h) => (
                <span
                  key={h}
                  className="absolute -translate-x-1/2 text-xs font-semibold text-[var(--k-muted)] tabular-nums"
                  style={{ left: `${pct(h)}%` }}
                >
                  {label(h)}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute inset-y-0 right-0 left-[170px]"
              aria-hidden
            >
              {HOURS.map((h) => (
                <span
                  key={h}
                  className="absolute top-0 bottom-0 border-l"
                  style={{
                    left: `${pct(h)}%`,
                    borderColor:
                      h % 2 === 0 ? "var(--k-line-hi)" : "var(--k-line)",
                  }}
                />
              ))}
              {showNow && (
                <span data-nb-now style={{ left: `${pct(now!)}%` }}>
                  <span>now</span>
                </span>
              )}
            </div>

            <ul className="relative grid gap-3 py-3">
              <AnimatePresence initial={false}>
                {shown.map((r) => (
                  <m.li
                    key={r.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    className="grid grid-cols-[170px_1fr] items-center"
                  >
                    <span className="pr-4">
                      <span className="block font-bold">{r.name}</span>
                      <span className="block text-xs text-[var(--k-muted)]">
                        {r.exam}
                      </span>
                      <span className="block text-sm font-bold tabular-nums">
                        {r.price}
                      </span>
                    </span>
                    <span className="relative block h-12">
                      <Link
                        href={r.href}
                        data-nb-bar
                        aria-label={`${r.name}, ${r.when}, ${r.price}`}
                        className="absolute inset-y-0 flex items-center justify-between gap-3 overflow-hidden rounded-md bg-[var(--k-accent)] px-3 text-sm font-bold"
                        style={{
                          left: `${pct(r.start)}%`,
                          width: `${pct(r.end) - pct(r.start)}%`,
                          boxShadow: "0 0 0 1.5px var(--k-ink)",
                        }}
                      >
                        <span className="truncate tabular-nums">{r.when}</span>
                      </Link>
                    </span>
                  </m.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-[var(--k-muted)]">
        Times are read off ICT&apos;s own posters. Tap a bar for the batch.
      </p>
    </div>
  )
}
