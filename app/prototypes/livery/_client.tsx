"use client"

import { IconArrowRight } from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useRef, useState, type KeyboardEvent } from "react"

export type TowerRow = {
  id: number
  name: string
  exam: string
  when: string
  days: string | null
  note: string | null
  price: string
  href: string
}

/** The timing tower: every batch ordered by start time, filterable by exam. */
export function Tower({ rows }: { rows: TowerRow[] }) {
  const exams = ["All", ...Array.from(new Set(rows.map((r) => r.exam)))]
  const [pick, setPick] = useState("All")
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const reduce = useReducedMotion()
  const shown = pick === "All" ? rows : rows.filter((r) => r.exam === pick)

  const onKey = (e: KeyboardEvent, at: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (at + step + exams.length) % exams.length
    setPick(exams[next]!)
    refs.current[next]?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter batches by exam"
        className="flex flex-wrap gap-2"
      >
        {exams.map((x, at) => {
          const on = x === pick
          return (
            <button
              key={x}
              ref={(el) => {
                refs.current[at] = el
              }}
              type="button"
              role="tab"
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setPick(x)}
              onKeyDown={(e) => onKey(e, at)}
              data-on={on ? "" : undefined}
              data-lv-press
              data-lv-chip
              className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold"
            >
              {x}
            </button>
          )
        })}
      </div>

      <m.ol
        layout={!reduce}
        aria-live="polite"
        data-lv-tower
        className="mt-5 overflow-hidden rounded-[14px]"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((r, i) => (
            <m.li
              key={r.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.24, ease: [0.23, 1, 0.32, 1] },
              }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              data-lv-row
            >
              <Link
                href={r.href}
                className="group grid items-center gap-x-5 gap-y-1 px-4 py-4 sm:px-6 md:grid-cols-[2.5rem_1.4fr_1fr_1fr_auto_2.5rem]"
              >
                <span
                  data-lv-display
                  className="hidden text-3xl leading-none text-[var(--lv-orange)] tabular-nums md:block"
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span
                    data-lv-display
                    className="block text-2xl leading-none text-white sm:text-[1.7rem]"
                  >
                    {r.name}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--lv-on-navy)]">
                    {r.exam}
                  </span>
                </span>
                <span
                  data-lv-display
                  className="text-xl text-white tabular-nums md:text-2xl"
                >
                  {r.when}
                </span>
                <span className="text-sm text-[var(--lv-on-navy)]">
                  {r.days ?? r.note ?? "Ask for the days"}
                </span>
                <span
                  data-lv-display
                  className="text-xl text-[var(--lv-orange)] tabular-nums md:text-right md:text-2xl"
                >
                  {r.price}
                </span>
                <span className="hidden justify-self-end md:block">
                  <IconArrowRight
                    aria-hidden
                    size={22}
                    stroke={2}
                    className="text-white transition-transform duration-200 ease-out group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </m.li>
          ))}
        </AnimatePresence>
      </m.ol>
    </div>
  )
}
