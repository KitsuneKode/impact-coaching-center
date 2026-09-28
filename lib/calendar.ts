import { toIstDateInput } from "./ist"

/**
 * Exam dates the owner enters from official notices, shared by the public
 * calendar, the admin editor and the Convex functions. Every date carries the
 * link it was read from; a date without a source is not published.
 */
export const CALENDAR_EXAMS = [
  "apsc",
  "adre",
  "assam-police-si",
  "banking",
] as const
export type CalendarExam = (typeof CALENDAR_EXAMS)[number]

/** What the date is for, in the order an exam cycle runs. */
export const DATE_KINDS = [
  "notification",
  "applications",
  "admit-card",
  "exam",
  "answer-key",
  "result",
  "interview",
] as const
export type DateKind = (typeof DATE_KINDS)[number]

export const DATE_TITLE_MAX = 120

export type ExamDateInput = {
  exam: CalendarExam
  kind: DateKind
  /** English, e.g. "CCE Prelims 2026". */
  title: string
  /** Assamese; empty shows the English title on /as. */
  titleAs: string
  /** `yyyy-mm-dd`, the day it happens or a window opens. */
  starts: string
  /** `yyyy-mm-dd` when a window closes; empty for a single day. */
  ends: string
  /** The notice says "tentative" or "likely". */
  tentative: boolean
  /** The official page or PDF the date was read from. */
  source: string
}

/** A published date as the public pages read it. */
export type ExamDate = Omit<ExamDateInput, "titleAs" | "ends"> & {
  titleAs?: string
  ends?: string
}

type Result<T> = { ok: true; value: T } | { ok: false; field: string }

const tidy = (text: string) => text.replace(/\s+/g, " ").trim()

/** A real calendar day in `yyyy-mm-dd`, not just the right shape. */
export function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

/* http too: some state boards still serve their notices without TLS. */
function isWebUrl(value: string) {
  try {
    return ["https:", "http:"].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

/** Tidies a date and names the first field that is not acceptable. */
export function checkExamDate(input: ExamDateInput): Result<ExamDateInput> {
  const value: ExamDateInput = {
    exam: input.exam,
    kind: input.kind,
    title: tidy(input.title),
    titleAs: tidy(input.titleAs),
    starts: input.starts.trim(),
    ends: input.ends.trim(),
    tentative: input.tentative,
    source: input.source.trim(),
  }
  if (!CALENDAR_EXAMS.includes(value.exam)) return { ok: false, field: "exam" }
  if (!DATE_KINDS.includes(value.kind)) return { ok: false, field: "kind" }
  if (!value.title || value.title.length > DATE_TITLE_MAX)
    return { ok: false, field: "title" }
  if (value.titleAs.length > DATE_TITLE_MAX)
    return { ok: false, field: "titleAs" }
  if (!isIsoDate(value.starts)) return { ok: false, field: "starts" }
  if (value.ends && (!isIsoDate(value.ends) || value.ends < value.starts))
    return { ok: false, field: "ends" }
  if (!isWebUrl(value.source)) return { ok: false, field: "source" }
  return { ok: true, value }
}

/** Today in IST as `yyyy-mm-dd`, the unit the calendar compares in. */
export const todayIst = (now: number) => toIstDateInput(now)

/** `days` before an IST day, for the "recently" cut-off. */
export function daysBefore(day: string, days: number) {
  const [year, month, date] = day.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, date - days))
    .toISOString()
    .slice(0, 10)
}

/**
 * Upcoming (still open or ahead, soonest first) and recent (over, latest
 * first). A window counts as upcoming until the day it closes.
 */
export function splitCalendar<T extends ExamDate>(dates: T[], today: string) {
  const last = (date: T) => date.ends || date.starts
  const upcoming = dates
    .filter((date) => last(date) >= today)
    .sort((a, b) => a.starts.localeCompare(b.starts))
  const recent = dates
    .filter((date) => last(date) < today)
    .sort((a, b) => last(b).localeCompare(last(a)))
  return { upcoming, recent }
}

/** Upcoming dates grouped by the month they start in, `yyyy-mm` keys. */
export function byMonth<T extends ExamDate>(dates: T[]) {
  const months = new Map<string, T[]>()
  for (const date of dates) {
    const key = date.starts.slice(0, 7)
    months.set(key, [...(months.get(key) ?? []), date])
  }
  return [...months]
}
