"use client"

import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconCheck,
  IconSearch,
} from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Link from "next/link"
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react"

/* ------------------------------------------------------------------ */
/*  One small store, so the search in the hero drives the list below   */
/* ------------------------------------------------------------------ */

type Query = { exam: string | null; when: string | null; asked: number }
let query: Query = { exam: null, when: null, asked: 0 }
const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
const set = (next: Partial<Query>) => {
  query = { ...query, ...next }
  listeners.forEach((cb) => cb())
}
const useQuery = () =>
  useSyncExternalStore(
    subscribe,
    () => query,
    () => query
  )

const bucket = (start: number) =>
  start < 12 ? "Morning" : start < 16 ? "Day" : start < 20 ? "Evening" : "Night"

/* ------------------------------------------------------------------ */
/*  Search                                                             */
/* ------------------------------------------------------------------ */

function Segment({
  label,
  empty,
  value,
  options,
  onPick,
  open,
  onOpen,
}: {
  label: string
  empty: string
  value: string | null
  options: string[]
  onPick: (v: string | null) => void
  open: boolean
  onOpen: (o: boolean) => void
}) {
  const id = useId()
  return (
    <div className="relative min-w-0">
      <button
        type="button"
        data-ud-seg
        aria-expanded={open}
        aria-controls={id}
        onClick={() => onOpen(!open)}
      >
        <small>{label}</small>
        <span>{value ?? empty}</span>
      </button>
      <div
        id={id}
        data-ud-pop
        data-closed={open ? undefined : ""}
        className="left-0"
      >
        <ul className="grid gap-0.5">
          {[empty, ...options].map((o, i) => {
            const v = i === 0 ? null : o
            const on = value === v
            return (
              <li key={o}>
                <button
                  type="button"
                  data-ud-opt
                  aria-pressed={on}
                  tabIndex={open ? 0 : -1}
                  onClick={() => {
                    onPick(v)
                    onOpen(false)
                  }}
                >
                  {o}
                  {on && <IconCheck aria-hidden size={16} stroke={2.25} />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/** Two questions and a button, like booking a trip. Results land in the list below. */
export function BatchSearch({
  exams,
  times,
}: {
  exams: string[]
  times: string[]
}) {
  const q = useQuery()
  const [open, setOpen] = useState<"exam" | "when" | null>(null)
  const ref = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!open) return
    const out = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(null)
    }
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null)
    document.addEventListener("pointerdown", out)
    document.addEventListener("keydown", esc)
    return () => {
      document.removeEventListener("pointerdown", out)
      document.removeEventListener("keydown", esc)
    }
  }, [open])

  return (
    <form
      ref={ref}
      aria-label="Find a batch"
      data-ud-search
      onSubmit={(e) => {
        e.preventDefault()
        setOpen(null)
        set({ asked: query.asked + 1 })
        document
          .getElementById("batches")
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }}
    >
      <Segment
        label="Exam"
        empty="Any exam"
        value={q.exam}
        options={exams}
        onPick={(v) => set({ exam: v })}
        open={open === "exam"}
        onOpen={(o) => setOpen(o ? "exam" : null)}
      />
      <span data-ud-sep aria-hidden />
      <Segment
        label="When you can study"
        empty="Any time"
        value={q.when}
        options={times}
        onPick={(v) => set({ when: v })}
        open={open === "when"}
        onOpen={(o) => setOpen(o ? "when" : null)}
      />
      <button type="submit" data-ud-go>
        <IconSearch aria-hidden size={18} stroke={2.25} />
        Find batches
      </button>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  Results                                                            */
/* ------------------------------------------------------------------ */

export type UdBatch = {
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
export type UdUntimed = {
  exam: string
  name: string
  price: string
  href: string
}

const DAY_FROM = 6
const DAY_SPAN = 16

/** Every printed batch on a strip of the day; the search narrows it, never hides it. */
export function Batches({
  batches,
  untimed,
  askHref,
}: {
  batches: UdBatch[]
  untimed: UdUntimed[]
  askHref: string
}) {
  const q = useQuery()
  const reduce = useReducedMotion()
  const fits = (b: { exam: string; start?: number }) =>
    (!q.exam || q.exam === "Not sure yet" || b.exam === q.exam) &&
    (!q.when ||
      q.when === "Online only" ||
      b.start === undefined ||
      bucket(b.start) === q.when)
  const shown = batches.filter(fits)
  const rest = batches.filter((b) => !fits(b))
  const extra = untimed.filter((u) => fits(u))
  const filtered = Boolean(q.exam || q.when)

  return (
    <div>
      <div
        className="flex min-h-12 flex-wrap items-center gap-3"
        aria-live="polite"
      >
        <p className="text-[var(--k-muted)]">
          {filtered
            ? shown.length
              ? `${shown.length} ${shown.length === 1 ? "batch fits" : "batches fit"} ${[q.exam, q.when?.toLowerCase()].filter(Boolean).join(", ")}.`
              : "No printed batch at that hour yet. Ask us; timings change with each intake."
            : "Every batch with a printed timing, earliest first."}
        </p>
        {filtered && (
          <button
            type="button"
            data-k-press
            data-k-outline
            className="inline-flex h-10 items-center px-4 text-sm font-semibold"
            onClick={() => set({ exam: null, when: null })}
          >
            Show all
          </button>
        )}
      </div>

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        <AnimatePresence initial={false} mode="popLayout">
          {[...shown, ...(filtered ? rest : [])].map((b) => {
            const dim = filtered && !shown.includes(b)
            return (
              <m.li
                key={b.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", duration: 0.45, bounce: 0 }}
              >
                <Link
                  href={b.href}
                  data-ud-batch
                  data-dim={dim || undefined}
                  data-k-card
                  className="group flex h-full flex-col gap-6 p-6 sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p data-ud-label className="text-[var(--k-accent-deep)]">
                        {b.exam}
                      </p>
                      <p data-k-display className="mt-2 text-3xl">
                        {b.name}
                      </p>
                    </div>
                    <p className="text-right text-xl font-semibold tabular-nums">
                      {b.price}
                    </p>
                  </div>
                  <div>
                    <div data-ud-day aria-hidden>
                      <span
                        data-ud-span
                        style={
                          {
                            left: `${((b.start - DAY_FROM) / DAY_SPAN) * 100}%`,
                            width: `${((b.end - b.start) / DAY_SPAN) * 100}%`,
                          } as CSSProperties
                        }
                      />
                    </div>
                    <div
                      aria-hidden
                      className="mt-2 flex justify-between text-[0.7rem] text-[var(--k-muted)] tabular-nums"
                    >
                      <span>6 AM</span>
                      <span>Noon</span>
                      <span>6 PM</span>
                      <span>10 PM</span>
                    </div>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-4">
                    <p className="text-sm text-[var(--k-muted)]">
                      <span className="block text-base font-semibold text-[var(--k-ink)] tabular-nums">
                        {b.when}
                      </span>
                      {[b.days, b.note].filter(Boolean).join(". ")}
                    </p>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--k-ink)] text-white transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                      <IconArrowRight aria-hidden size={18} stroke={2} />
                    </span>
                  </div>
                </Link>
              </m.li>
            )
          })}
        </AnimatePresence>
      </ul>

      {extra.length > 0 && (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {extra.map((u) => (
            <li key={u.name}>
              <div
                data-k-tile
                className="flex h-full flex-wrap items-center justify-between gap-4 p-5"
              >
                <div>
                  <p data-ud-label className="text-[var(--k-muted)]">
                    {u.exam}
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {u.name}, <span className="tabular-nums">{u.price}</span>
                  </p>
                </div>
                <a
                  href={askHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-k-press
                  data-k-outline
                  className="inline-flex h-11 items-center gap-2 px-4 text-sm font-semibold"
                >
                  <IconBrandWhatsapp aria-hidden size={17} stroke={1.75} />
                  Ask for the timing
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
