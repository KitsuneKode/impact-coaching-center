"use client"

import {
  IconArrowRight,
  IconBrandGooglePlay,
  IconSearch,
} from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { useId, useState, type ReactNode } from "react"

import { ease } from "../_fx"

/** A segmented control with a thumb that slides between options. */
function Segmented({
  options,
  value,
  onChange,
  label,
  id,
}: {
  options: string[]
  value: number
  onChange: (i: number) => void
  label: string
  id: string
}) {
  return (
    <fieldset className="grid auto-cols-fr grid-flow-col rounded-full bg-[var(--tl-sunk)] p-1">
      <legend className="sr-only">{label}</legend>
      {options.map((o, i) => (
        <button
          key={o}
          type="button"
          aria-pressed={i === value}
          onClick={() => onChange(i)}
          className="relative h-9 rounded-full px-3 text-sm font-medium whitespace-nowrap text-[var(--tl-muted)] transition-colors duration-200 aria-pressed:text-[var(--tl-ink)]"
        >
          {i === value && (
            <m.span
              layoutId={`${id}-thumb`}
              transition={{ type: "spring", duration: 0.4, bounce: 0.12 }}
              className="absolute inset-0 rounded-full bg-[var(--tl-surface)] shadow-[0_1px_2px_rgba(10,16,32,0.08),0_2px_8px_-2px_rgba(10,16,32,0.12)]"
            />
          )}
          <span className="relative">{o}</span>
        </button>
      ))}
    </fieldset>
  )
}

/** Blur cross-fade between keyed children. */
function Swap({ k, children }: { k: string; children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <m.div
        key={k}
        initial={
          reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(6px)" }
        }
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={
          reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(6px)" }
        }
        transition={{ duration: 0.3, ease }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}

export type Slot = {
  label: string
  /** hours on a 24h clock, for the day bar */
  start: number
  end: number
  when: string
  name: string
  exam: string
  days: string | null
  note: string | null
  price: string
  href: string
}

/** "Which hour can you keep?" Picks the batch printed at that hour. */
export function HourPicker({ slots }: { slots: Slot[] }) {
  const [i, setI] = useState(0)
  const id = useId()
  const slot = slots[i]!
  return (
    <div className="flex h-full flex-col">
      <Segmented
        id={id}
        label="Time of day"
        options={slots.map((s) => s.label)}
        value={i}
        onChange={setI}
      />
      <div aria-hidden className="mt-7">
        <div className="relative h-10 rounded-xl bg-[var(--tl-sunk)]">
          {slots.map((s, j) => (
            <button
              key={s.name}
              type="button"
              tabIndex={-1}
              aria-label={s.label}
              onClick={() => setI(j)}
              style={{
                left: `${((s.start - 6) / 15) * 100}%`,
                width: `${((s.end - s.start) / 15) * 100}%`,
              }}
              className={`absolute inset-y-1 rounded-lg transition-colors duration-300 ${
                j === i
                  ? "bg-[var(--tl-blue)]"
                  : "bg-[#CBD0D9] hover:bg-[#B6BDC9]"
              }`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-[var(--tl-muted)] tabular-nums">
          <span>6 AM</span>
          <span>9 AM</span>
          <span>12 PM</span>
          <span>3 PM</span>
          <span>6 PM</span>
          <span>9 PM</span>
        </div>
      </div>
      <div className="relative mt-8 flex-1">
        <Swap k={slot.name}>
          <p className="text-[clamp(2.5rem,5vw,3.75rem)] leading-none font-semibold tracking-[-0.04em] tabular-nums">
            {slot.when}
          </p>
          <p className="mt-4 text-xl font-semibold">{slot.name}</p>
          <p className="text-[var(--tl-muted)]">
            {slot.exam}
            {slot.days ? `, ${slot.days}` : ""}
          </p>
          {slot.note && (
            <p className="mt-4 inline-flex rounded-full bg-[var(--tl-blue-soft)] px-3 py-1 text-sm font-medium text-[var(--tl-blue)]">
              {slot.note}
            </p>
          )}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--tl-line)] pt-5">
            <span className="text-lg font-semibold tabular-nums">
              {slot.price}
            </span>
            <Link
              href={slot.href}
              className="group inline-flex items-center gap-1.5 font-medium text-[var(--tl-blue)]"
            >
              See the batch
              <IconArrowRight
                aria-hidden
                size={17}
                stroke={2}
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Swap>
      </div>
    </div>
  )
}

/** Centre or app: the same class, two ways to attend it. */
export function ModeToggle({
  photo,
  installs,
  playHref,
}: {
  photo: { src: string; alt: string }
  installs: string
  playHref: string
}) {
  const [i, setI] = useState(0)
  const id = useId()
  return (
    <div className="flex h-full flex-col gap-6 md:flex-row md:items-stretch">
      <div className="flex flex-col md:w-[46%]">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]">
          Same class, two ways in.
        </h3>
        <p className="mt-2 text-[var(--tl-muted)]">
          Sit in the room on DC Bungalow Road, or join live and catch the
          recording on the ICT app.
        </p>
        <div className="mt-auto pt-6">
          <Segmented
            id={id}
            label="How you attend"
            options={["At the centre", "On the app"]}
            value={i}
            onChange={setI}
          />
        </div>
      </div>
      <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-[20px] bg-[var(--tl-sunk)]">
        <Swap k={String(i)}>
          {i === 0 ? (
            <div className="relative h-[260px] md:h-[240px]">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 360px, 100vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-[260px] flex-col items-center justify-center gap-4 bg-[var(--tl-blue)] text-white md:h-[240px]">
              <Image
                src="/brand/ict-app-icon.png"
                alt=""
                width={72}
                height={72}
                className="size-18 rounded-[20px] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.4)]"
              />
              <p className="text-center">
                <span className="block font-semibold">ICT on Android</span>
                <span className="text-sm text-[#D6E4FA] tabular-nums">
                  {installs} installs
                </span>
              </p>
              <a
                href={playHref}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-[var(--tl-ink)] transition-transform duration-150 active:scale-[0.97]"
              >
                <IconBrandGooglePlay aria-hidden size={16} stroke={1.75} />
                Google Play
              </a>
            </div>
          )}
        </Swap>
      </div>
    </div>
  )
}

/** Teachers as a list; the portrait follows whoever you point at. */
export function FacultyPicker({
  people,
}: {
  people: {
    slug: string
    name: string
    teaches: string
    note: string
    portrait: string
    href: string
  }[]
}) {
  const [i, setI] = useState(0)
  const p = people[i]!
  return (
    <div className="grid gap-10 md:grid-cols-[1fr_minmax(0,380px)] md:gap-16">
      <ul className="-mx-2">
        {people.map((f, j) => (
          <li key={f.slug}>
            <button
              type="button"
              onMouseEnter={() => setI(j)}
              onFocus={() => setI(j)}
              onClick={() => setI(j)}
              aria-pressed={j === i}
              className="group flex w-full items-baseline justify-between gap-6 rounded-2xl px-2 py-4 text-left transition-colors duration-200 md:py-5"
            >
              <span
                className={`text-[clamp(1.6rem,3.2vw,2.75rem)] leading-none font-semibold tracking-[-0.04em] transition-colors duration-200 ${
                  j === i ? "text-[var(--tl-ink)]" : "text-[#B4BAC6]"
                }`}
              >
                {f.name}
              </span>
              <span
                className={`hidden text-right text-sm transition-colors duration-200 sm:block ${
                  j === i ? "text-[var(--tl-ink)]" : "text-[var(--tl-muted)]"
                }`}
              >
                {f.teaches}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="md:sticky md:top-28 md:self-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#0E2A57]">
          <Swap k={p.slug}>
            <div className="relative aspect-[4/5]">
              <Image
                src={p.portrait}
                alt={`${p.name}, ${p.teaches}`}
                fill
                sizes="380px"
                className="object-cover object-top"
              />
            </div>
          </Swap>
        </div>
        <p className="mt-5 text-[var(--tl-muted)]">{p.note}</p>
        <a
          href={p.href}
          target="_blank"
          rel="noreferrer noopener"
          className="group mt-3 inline-flex items-center gap-1.5 font-medium text-[var(--tl-blue)]"
        >
          Watch {p.name.split(" ")[0]} teach
          <IconArrowRight
            aria-hidden
            size={17}
            stroke={2}
            className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </div>
  )
}

/** Questions with a live filter. */
export function FaqSearch({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [q, setQ] = useState("")
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const shown = faqs.filter((f) =>
    words.every((w) => `${f.q} ${f.a}`.toLowerCase().includes(w))
  )
  return (
    <div>
      <label htmlFor="tl-faq" className="text-sm font-medium">
        Search the questions
      </label>
      <div className="relative mt-2">
        <IconSearch
          aria-hidden
          size={18}
          stroke={1.75}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[var(--tl-muted)]"
        />
        <input
          id="tl-faq"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Fees, hostel, online, timings"
          className="h-13 w-full rounded-2xl bg-[var(--tl-surface)] pr-4 pl-11 text-base shadow-[inset_0_0_0_1px_var(--tl-line-hi)] outline-none placeholder:text-[#7A8292] focus:shadow-[inset_0_0_0_2px_var(--tl-blue)]"
        />
      </div>
      <ul className="mt-6 grid gap-3" aria-live="polite">
        {shown.map((f) => (
          <li
            key={f.q}
            className="rounded-[20px] bg-[var(--tl-surface)] p-6 shadow-[0_0_0_1px_var(--tl-line)]"
          >
            <p className="font-semibold">{f.q}</p>
            <p className="mt-2 max-w-[64ch] text-[var(--tl-muted)]">{f.a}</p>
          </li>
        ))}
        {!shown.length && (
          <li className="rounded-[20px] bg-[var(--tl-surface)] p-6 text-[var(--tl-muted)] shadow-[0_0_0_1px_var(--tl-line)]">
            Nothing matches &ldquo;{q}&rdquo;. Ask us directly and we will
            answer the same day.
          </li>
        )}
      </ul>
    </div>
  )
}
