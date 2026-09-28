import { daysBefore, todayIst, type ExamDate } from "@/lib/calendar"
import { examBySlug } from "@/lib/exams"

/**
 * SAMPLE dates, placed relative to today so the prototype never goes stale.
 * They exist only to show the design: the live page reads the calendar ICT
 * keeps in the admin, where every date carries its official notice. The page
 * labels them as samples wherever they appear.
 */
const SAMPLES: {
  exam: ExamDate["exam"]
  kind: ExamDate["kind"]
  title: string
  from: number
  to?: number
  tentative?: boolean
}[] = [
  {
    exam: "adre",
    kind: "applications",
    title: "Grade III applications",
    from: -8,
    to: 12,
  },
  {
    exam: "apsc",
    kind: "notification",
    title: "CCE notification",
    from: 5,
    tentative: true,
  },
  {
    exam: "assam-police-si",
    kind: "admit-card",
    title: "SI admit cards",
    from: 20,
  },
  { exam: "assam-police-si", kind: "exam", title: "SI written test", from: 34 },
  { exam: "adre", kind: "exam", title: "Grade III written paper", from: 41 },
  {
    exam: "apsc",
    kind: "applications",
    title: "CCE applications",
    from: 12,
    to: 40,
  },
  {
    exam: "apsc",
    kind: "exam",
    title: "CCE Prelims",
    from: 88,
    tentative: true,
  },
  { exam: "banking", kind: "exam", title: "IBPS PO Prelims", from: 26 },
  { exam: "banking", kind: "exam", title: "IBPS PO Mains", from: 62 },
  { exam: "banking", kind: "result", title: "IBPS PO result", from: 120 },
  { exam: "adre", kind: "result", title: "Grade III result", from: 130 },
  {
    exam: "assam-police-si",
    kind: "result",
    title: "SI written result",
    from: 96,
  },
  { exam: "apsc", kind: "result", title: "Prelims result", from: 150 },
  {
    exam: "apsc",
    kind: "exam",
    title: "CCE Mains",
    from: 232,
    tentative: true,
  },
  {
    exam: "assam-police-si",
    kind: "exam",
    title: "Physical test (PET/PST)",
    from: 140,
  },
  {
    exam: "apsc",
    kind: "interview",
    title: "Interview",
    from: 320,
    tentative: true,
  },
]

const shift = (today: string, days: number) => daysBefore(today, -days)

export function sampleDates(today: string): ExamDate[] {
  return SAMPLES.map((s) => ({
    exam: s.exam,
    kind: s.kind,
    title: s.title,
    starts: shift(today, s.from),
    ends: s.to === undefined ? undefined : shift(today, s.to),
    tentative: s.tentative ?? false,
    source: examBySlug(s.exam)!.sources[0]!.href,
  }))
}

/** Today's IST day and the samples placed around it. */
export function season() {
  const today = todayIst(Date.now())
  return { today, dates: sampleDates(today) }
}
