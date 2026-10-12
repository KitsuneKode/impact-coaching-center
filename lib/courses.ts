import { tracks } from "./brand"
import type { CatalogueCourse } from "./catalogue"

/**
 * A course as the public pages use it: the old catalogue shape (rupees),
 * plus what the ClassPlus mirror and ICT's admin add.
 */
export type Course = CatalogueCourse & {
  /** Exam name from `tracks`, e.g. "APSC". */
  track?: string
  createdAt?: number
  batchStarts?: string
  timing?: string
  offlineFee?: number
  tags: string[]
}

/** ClassPlus categories ICT uses, read as our exam tracks. */
const CATEGORY_TRACK: Record<string, string> = {
  "State PSC Exams": "APSC",
  "State govt exams- SSC": "ADRE and Assam Police",
  "Bank Exams": "Bank, SSC, Railway",
}

/** An exam named in the course's own title beats ClassPlus's category. */
function trackFromName(name: string): string | undefined {
  if (/\bAPSC\b/i.test(name)) return "APSC"
  if (/\b(ADRE|Assam Police)\b/i.test(name)) return "ADRE and Assam Police"
  if (/\b(Bank|Banking|SSC|Railway|NTPC)\b/i.test(name))
    return "Bank, SSC, Railway"
  return undefined
}

/** The shape `api.courses.list` returns, kept loose to stay importable anywhere. */
export type MirrorCourse = {
  classplusId: number
  slug: string
  name: string
  short: string
  subtitle: string
  features: string[]
  pricePaise: number
  finalPricePaise: number
  free: boolean
  enrolled: number
  category?: string
  tags: string[]
  cover: { url: string } | null
  createdAt?: number
  track?: string
  batchStarts?: string
  timing?: string
  offlineFeePaise?: number
}

export function fromMirror(row: MirrorCourse): Course {
  return {
    id: row.classplusId,
    slug: row.slug,
    name: row.name,
    short: row.short,
    subtitle: row.subtitle,
    mrp: Math.round(row.pricePaise / 100),
    price: Math.round(row.finalPricePaise / 100),
    free: row.free,
    learners: row.enrolled,
    features: row.features,
    cover: row.cover?.url ?? null,
    track:
      row.track ?? (row.category ? CATEGORY_TRACK[row.category] : undefined),
    createdAt: row.createdAt,
    batchStarts: row.batchStarts,
    timing: row.timing,
    offlineFee:
      row.offlineFeePaise === undefined
        ? undefined
        : Math.round(row.offlineFeePaise / 100),
    tags: row.tags,
  }
}

/** A snapshot course, tracked by the ids `tracks` used to name. */
export function fromSnapshot(course: CatalogueCourse): Course {
  const track = tracks.find((t) =>
    [t.flagshipId, ...t.alsoIds, t.freeId].includes(course.id)
  )
  return { ...course, track: track?.exam, tags: [] }
}

const TEST_SERIES = /\bmock|test series\b/i

/**
 * One exam's courses: the lead course, the other paid ones and the free one.
 * The list arrives in ICT's order (admin position, then dearest), so the lead
 * is the first paid course in it.
 */
export function lineup(courses: readonly Course[], exam: string) {
  const mine = courses.filter((course) => course.track === exam)
  const paid = mine.filter((course) => !course.free)
  // A mock-test series sells beside a batch; it is never the exam's lead.
  const flagship =
    paid.find((course) => !TEST_SERIES.test(course.name)) ?? paid[0]
  return {
    flagship,
    also: paid.filter((course) => course !== flagship),
    free: mine.find((course) => course.free),
  }
}

/** The most recently created paid course: the batch to put in front. */
export function newestBatch(courses: readonly Course[]) {
  return courses
    .filter(
      (course) => !course.free && course.track && !TEST_SERIES.test(course.name)
    )
    .toSorted((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))[0]
}

/** Replace {apsc} and {apscFee} style marks with each exam's lead course. */
export function fillFees(text: string, courses: readonly Course[]) {
  let out = text
  for (const track of tracks) {
    const lead = lineup(courses, track.exam).flagship
    out = out
      .replaceAll(`{${track.slug}}`, lead?.short ?? track.exam)
      .replaceAll(`{${track.slug}Fee}`, lead ? inr(lead.price) : "")
  }
  return out
}

/** "25009" -> "₹25,009" */
export function inr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`
}
