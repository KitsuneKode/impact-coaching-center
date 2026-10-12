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

/**
 * One exam's courses: the lead course, the other paid ones and the free one.
 * The list arrives in ICT's order (admin position, then dearest), so the lead
 * is the first paid course in it.
 */
export function lineup(courses: readonly Course[], exam: string) {
  const mine = courses.filter((course) => course.track === exam)
  const paid = mine.filter((course) => !course.free)
  return {
    flagship: paid[0],
    also: paid.slice(1),
    free: mine.find((course) => course.free),
  }
}

/** The most recently created paid course: the batch to put in front. */
export function newestBatch(courses: readonly Course[]) {
  return courses
    .filter((course) => !course.free && course.track)
    .toSorted((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))[0]
}

/** "25009" -> "₹25,009" */
export function inr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`
}
