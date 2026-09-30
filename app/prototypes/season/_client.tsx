"use client"

import { IconArrowUpRight } from "@tabler/icons-react"
import { m } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import {
  createContext,
  useContext,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"

import type { CalendarExam, ExamDate } from "@/lib/calendar"

import { Book3D, type BookTones } from "../_book"
import type { Shelf } from "../_data"
import { Folder, type FolderTones } from "../_folder"

/* ------------------------------------------------------------------ */
/*  Which exam the page is set to                                      */
/* ------------------------------------------------------------------ */

const Selected = createContext<{
  exam: CalendarExam
  choose: (exam: CalendarExam) => void
}>({ exam: "apsc", choose: () => {} })

/** Holds the chosen exam for the almanac, the chart and the kit at once. */
export function SeasonRoot({
  initial,
  children,
}: {
  initial: CalendarExam
  children: ReactNode
}) {
  const [exam, choose] = useState(initial)
  return (
    <Selected.Provider value={{ exam, choose }}>{children}</Selected.Provider>
  )
}

export type ExamTab = { slug: CalendarExam; short: string }

/* ------------------------------------------------------------------ */
/*  Days                                                               */
/* ------------------------------------------------------------------ */

const DAY = 86_400_000
const utc = (day: string) => Date.parse(`${day}T00:00:00Z`)
const between = (from: string, to: string) =>
  Math.round((utc(to) - utc(from)) / DAY)
const words = (day: string, options: Intl.DateTimeFormatOptions) =>
  new Date(utc(day)).toLocaleDateString("en-IN", {
    ...options,
    timeZone: "UTC",
  })

const KIND: Record<ExamDate["kind"], string> = {
  notification: "Notification",
  applications: "Applications",
  "admit-card": "Admit cards",
  exam: "Exam day",
  "answer-key": "Answer key",
  result: "Result",
  interview: "Interview",
}

const lastDay = (d: ExamDate) => d.ends ?? d.starts

/** What is next for one exam: an open window first, then the soonest date. */
function upcomingFor(dates: ExamDate[], exam: CalendarExam, today: string) {
  return dates
    .filter((d) => d.exam === exam && lastDay(d) >= today)
    .sort((a, b) => a.starts.localeCompare(b.starts))
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

export function ExamTabs({
  tabs,
  id,
  compact = false,
  className = "",
}: {
  tabs: ExamTab[]
  /** Unique per instance so the sliding pill does not jump between them. */
  id: string
  compact?: boolean
  className?: string
}) {
  const { exam, choose } = useContext(Selected)
  return (
    <div
      role="tablist"
      aria-label="Exam"
      className={`flex [scrollbar-width:none] gap-1 overflow-x-auto rounded-full bg-[var(--ss-well)] p-1 ${className}`}
    >
      {tabs.map((tab) => {
        const on = tab.slug === exam
        return (
          <button
            key={tab.slug}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => choose(tab.slug)}
            data-press
            className={`relative shrink-0 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 ${compact ? "h-9 px-3 text-[13px]" : "h-10 px-4 text-sm"} ${
              on
                ? "text-white"
                : "text-[var(--ss-muted)] hover:text-[var(--ss-ink)]"
            }`}
          >
            {on ? (
              <m.span
                layoutId={`ss-pill-${id}`}
                transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                className="absolute inset-0 rounded-full bg-[var(--ss-ink)]"
              />
            ) : null}
            <span className="relative">{tab.short}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  The almanac card                                                   */
/* ------------------------------------------------------------------ */

export function Almanac({
  tabs,
  dates,
  today,
}: {
  tabs: ExamTab[]
  dates: ExamDate[]
  today: string
}) {
  const { exam } = useContext(Selected)
  const [next, ...after] = upcomingFor(dates, exam, today)
  const open = next && next.ends && next.starts <= today
  const days = next ? between(today, open ? next.ends! : next.starts) : 0

  return (
    <div data-ss-card className="relative rounded-[28px] bg-[var(--ss-paper)]">
      <div data-ss-perf aria-hidden />
      <div className="p-5 pt-8 md:p-7 md:pt-9">
        <ExamTabs tabs={tabs} id="almanac" compact />

        <div key={exam} data-ss-swap className="mt-8">
          {next ? (
            <>
              <p className="text-sm text-[var(--ss-muted)]">
                {open ? (
                  <span className="inline-flex items-center gap-2 font-semibold text-[var(--ss-teal)]">
                    <span data-ss-live aria-hidden />
                    Open now, closes in
                  </span>
                ) : (
                  "Next date in"
                )}
              </p>
              <p className="mt-1 flex items-baseline gap-3">
                <span className="font-[family-name:var(--ss-mono)] text-[clamp(4.5rem,11vw,7.5rem)] leading-[0.9] font-semibold tracking-[-0.06em] tabular-nums">
                  {days}
                </span>
                <span className="text-2xl font-semibold tracking-[-0.02em]">
                  {days === 1 ? "day" : "days"}
                </span>
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--ss-line)] pt-5">
                <span className="text-lg font-semibold tracking-[-0.01em]">
                  {next.title}
                </span>
                <span className="text-[var(--ss-muted)] tabular-nums">
                  {KIND[next.kind]} ·{" "}
                  {words(open ? next.ends! : next.starts, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                {next.tentative ? <Tag>Tentative</Tag> : null}
              </div>
              <a
                href={next.source}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--ss-teal)] underline decoration-[var(--ss-teal)]/30 underline-offset-4 hover:decoration-[var(--ss-teal)]"
              >
                Exam authority website (sample date)
                <IconArrowUpRight aria-hidden size={15} stroke={1.75} />
              </a>

              {after.length > 0 ? (
                <ol className="mt-6 grid gap-2">
                  {after.slice(0, 2).map((d) => (
                    <li
                      key={d.title + d.starts}
                      className="flex items-baseline justify-between gap-4 rounded-2xl bg-[var(--ss-well)] px-4 py-3 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        <span className="font-semibold">{d.title}</span>
                        <span className="text-[var(--ss-muted)]">
                          {" "}
                          · {KIND[d.kind]}
                        </span>
                      </span>
                      <span className="shrink-0 text-[var(--ss-muted)] tabular-nums">
                        in {between(today, d.starts)} days
                      </span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </>
          ) : (
            <p className="text-[var(--ss-muted)]">
              No dates notified for this exam yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-[var(--ss-line)] px-2 py-0.5 text-xs font-semibold text-[var(--ss-muted)]">
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  The season chart: twelve months, one row per exam                  */
/* ------------------------------------------------------------------ */

export function SeasonChart({
  tabs,
  dates,
  today,
}: {
  tabs: ExamTab[]
  dates: ExamDate[]
  today: string
}) {
  const { exam, choose } = useContext(Selected)
  const start = `${today.slice(0, 7)}-01`
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(utc(start))
    d.setUTCMonth(d.getUTCMonth() + i)
    return d.toISOString().slice(0, 10)
  })
  const endDate = new Date(utc(start))
  endDate.setUTCMonth(endDate.getUTCMonth() + 12)
  const end = endDate.toISOString().slice(0, 10)
  const span = between(start, end)
  const at = (day: string) =>
    `${Math.min(100, Math.max(0, (between(start, day) / span) * 100))}%`

  return (
    <div className="[scrollbar-width:none] overflow-x-auto">
      <div className="relative min-w-[780px] pb-10">
        {/* Month rule */}
        <div className="grid grid-cols-[9rem_1fr] items-end pb-3">
          <span />
          <div className="relative grid grid-cols-12 text-xs text-[var(--ss-muted)]">
            {months.map((mo, i) => (
              <span
                key={mo}
                className={`border-l border-[var(--ss-line)] pl-2 ${i === 0 ? "font-semibold text-[var(--ss-ink)]" : ""}`}
              >
                {words(mo, { month: "short" })}
                {mo.slice(5, 7) === "01" || i === 0 ? (
                  <span className="text-[var(--ss-muted)]">
                    {" "}
                    {mo.slice(2, 4)}
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          {tabs.map((tab) => {
            const on = tab.slug === exam
            const rows = dates.filter((d) => d.exam === tab.slug)
            return (
              <div
                key={tab.slug}
                data-ss-row={on ? "on" : undefined}
                className="grid grid-cols-[9rem_1fr] items-center border-t border-[var(--ss-line)]"
              >
                <button
                  type="button"
                  onClick={() => choose(tab.slug)}
                  aria-pressed={on}
                  data-press
                  className={`h-16 pr-4 text-left text-sm font-semibold transition-colors duration-200 ${on ? "text-[var(--ss-ink)]" : "text-[var(--ss-muted)] hover:text-[var(--ss-ink)]"}`}
                >
                  {tab.short}
                </button>
                <div className="relative h-16">
                  {rows.map((d) =>
                    d.ends ? (
                      <button
                        type="button"
                        key={d.title + d.starts}
                        data-ss-mark
                        aria-label={`${d.title}, ${words(d.starts, { day: "numeric", month: "short" })} to ${words(d.ends, { day: "numeric", month: "short" })}`}
                        style={
                          {
                            left: at(d.starts),
                            width: `calc(${at(d.ends)} - ${at(d.starts)})`,
                          } as CSSProperties
                        }
                        className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full"
                      >
                        <Tip d={d} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        key={d.title + d.starts}
                        data-ss-mark
                        data-kind={d.kind}
                        aria-label={`${d.title}, ${words(d.starts, { day: "numeric", month: "short" })}`}
                        style={{ left: at(d.starts) }}
                        className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      >
                        <Tip d={d} />
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}

          {/* Today */}
          <div className="pointer-events-none absolute inset-y-0 right-0 left-[9rem]">
            <span
              style={{ left: at(today) }}
              className="absolute top-0 -bottom-3 w-px bg-[var(--ss-teal)]"
            >
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[var(--ss-teal)] px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-white">
                Today
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Tip({ d }: { d: ExamDate }) {
  return (
    <span
      data-ss-tip
      role="tooltip"
      className="absolute bottom-[calc(100%+10px)] left-1/2 z-10 w-max max-w-56 -translate-x-1/2 rounded-xl bg-[var(--ss-ink)] px-3 py-2 text-left text-xs text-white"
    >
      <span className="block font-semibold">{d.title}</span>
      <span className="block text-white/70 tabular-nums">
        {KIND[d.kind]} · {words(d.starts, { day: "numeric", month: "short" })}
        {d.ends
          ? ` to ${words(d.ends, { day: "numeric", month: "short" })}`
          : ""}
        {d.tentative ? " · tentative" : ""}
      </span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  The kit for the chosen exam                                        */
/* ------------------------------------------------------------------ */

export type Kit = {
  slug: CalendarExam
  short: string
  name: string
  body: string
  summary: string
  stages: { name: string; facts?: string }[]
  source: { label: string; href: string }
  folders: Shelf["folders"]
  books: Shelf["books"]
  course: {
    name: string
    cover: string | null
    when: string | null
    days: string | null
    price: string | null
    mrp: string | null
    href: string
  } | null
}

export function ExamKit({
  kits,
  tabs,
  bookTones,
  folderTones,
  samples,
}: {
  kits: Kit[]
  tabs: ExamTab[]
  bookTones: BookTones
  folderTones: FolderTones
  samples: boolean
}) {
  const { exam } = useContext(Selected)
  const kit = kits.find((k) => k.slug === exam)!

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="max-w-[20ch] text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
          Everything for {kit.short}, in one place.
        </h2>
        <ExamTabs tabs={tabs} id="kit" />
      </div>

      <div key={exam} data-ss-swap className="mt-10 grid gap-4 lg:grid-cols-12">
        {/* How it works */}
        <section
          aria-label={`How ${kit.short} works`}
          className="rounded-[24px] bg-[var(--ss-paper)] p-6 shadow-[var(--ss-shadow)] md:p-7 lg:col-span-5"
        >
          <p className="text-sm text-[var(--ss-muted)]">{kit.body}</p>
          <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em]">
            How the exam works
          </h3>
          <ol className="mt-6 grid gap-5">
            {kit.stages.map((stage, i) => (
              <li key={stage.name} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="font-[family-name:var(--ss-mono)] text-sm font-semibold text-[var(--ss-teal)] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-semibold">{stage.name}</span>
                  {stage.facts ? (
                    <span className="mt-0.5 block text-sm text-[var(--ss-muted)] tabular-nums">
                      {stage.facts}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
          <a
            href={kit.source.href}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-7 inline-flex items-center gap-1 text-sm text-[var(--ss-muted)] underline decoration-[var(--ss-line)] underline-offset-4 hover:text-[var(--ss-ink)]"
          >
            From: {kit.source.label}
            <IconArrowUpRight aria-hidden size={14} stroke={1.75} />
          </a>
        </section>

        {/* Free material */}
        <section
          aria-label="Free material"
          className="rounded-[24px] bg-[var(--ss-teal-deep)] p-6 text-white md:p-7 lg:col-span-4"
        >
          <h3 className="text-xl font-semibold tracking-[-0.02em]">
            Free, before you pay anything
          </h3>
          <p className="mt-1 text-sm text-white/70">
            Mock tests and notes for {kit.short}. Log in with your phone number
            to open them.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6">
            {kit.folders.map((f) => (
              <li key={f.id}>
                <Link
                  data-fd-hover
                  href="/resources"
                  aria-label={`${f.name}, ${f.items.length} files`}
                  className="block rounded-[14px]"
                >
                  <Folder folder={f} tones={folderTones} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* The batch */}
        <section
          aria-label="The batch"
          className="flex flex-col rounded-[24px] bg-[var(--ss-paper)] p-6 shadow-[var(--ss-shadow)] md:p-7 lg:col-span-3"
        >
          {kit.course ? (
            <>
              {kit.course.cover ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl outline outline-1 -outline-offset-1 outline-black/10">
                  <Image
                    src={kit.course.cover}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 300px, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">
                {kit.course.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--ss-muted)] tabular-nums">
                {[kit.course.when, kit.course.days].filter(Boolean).join(", ")}
              </p>
              {kit.course.price ? (
                <p className="mt-4 flex items-baseline gap-2 tabular-nums">
                  <span className="text-2xl font-semibold tracking-[-0.02em]">
                    {kit.course.price}
                  </span>
                  {kit.course.mrp ? (
                    <s className="text-sm text-[var(--ss-muted)]">
                      {kit.course.mrp}
                    </s>
                  ) : null}
                </p>
              ) : null}
              <Link
                data-press
                href={kit.course.href}
                className="mt-auto inline-flex h-11 items-center justify-center rounded-full bg-[var(--ss-ink)] px-5 pt-0 text-sm font-semibold text-white hover:bg-[var(--ss-ink-hi)] max-lg:mt-6"
              >
                See the batch
              </Link>
            </>
          ) : null}
        </section>

        {/* Books */}
        <section
          aria-label={`Books for ${kit.short}`}
          className="grid gap-8 rounded-[24px] bg-[var(--ss-paper)] p-6 shadow-[var(--ss-shadow)] md:p-7 lg:col-span-12 lg:grid-cols-[18rem_1fr] lg:gap-12"
        >
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold tracking-[-0.02em]">
              ICT&apos;s books for {kit.short}
            </h3>
            <p className="mt-2 text-sm text-[var(--ss-muted)]">
              Read the sample pages before you buy. Delivered home, or collect
              from the centre on DC Bungalow Road.
            </p>
            <Link
              href="/books"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--ss-teal)] underline decoration-[var(--ss-teal)]/30 underline-offset-4 hover:decoration-[var(--ss-teal)]"
            >
              Every book
            </Link>
            {samples ? (
              <p className="mt-auto pt-6 text-xs text-[var(--ss-muted)]">
                Sample titles, until ICT&apos;s own are in the shop.
              </p>
            ) : null}
          </div>
          {kit.books.length > 0 ? (
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {kit.books.map((b) => (
                <li key={b.slug}>
                  <Link data-bk-hover href={b.href} className="group block">
                    <Book3D book={b} tones={bookTones} font="var(--ss-sans)" />
                    <span className="mt-3 block px-[18px] text-sm font-semibold">
                      {b.title}
                    </span>
                    <span className="block px-[18px] text-sm text-[var(--ss-muted)] tabular-nums">
                      {b.price}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="self-center text-[var(--ss-muted)]">
              No book for this exam yet. The free folders above cover it.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
