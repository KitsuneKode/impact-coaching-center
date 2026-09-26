import type { CatalogueCourse } from "./catalogue"

/** Turning a Classplus course into a catalogue row. */

/** The fields this module reads from Classplus. The API sends more. */
export type RawCourse = {
  id: number
  name: string
  description?: string | null
  price?: number | null
  discount?: number | null
  totalSubscriberCount?: number | null
  /**
   * Cover art. Read by scripts/sync-courses.ts, not by toCatalogueRow - the
   * script downloads it and sets `cover` from where the file landed.
   */
  imageUrl?: string | null
}

/** A URL segment for a course. */
export function slugify(name: string, fallbackId?: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
    // The slice can land mid-separator, which would leave a trailing hyphen
    // in the canonical URL.
    .replace(/-$/, "")

  if (slug.length > 0) return slug
  return fallbackId === undefined ? "" : `course-${fallbackId}`
}

/**
 * Split "Lakhya 2027 - The Complete APSC Course" into a short name and a
 * subtitle.
 */
export function splitCourseName(name: string): {
  short: string
  subtitle: string
} {
  const [short = "", ...rest] = name.trim().split(/\s*[-–]\s+/)
  return { short: short.trim(), subtitle: rest.join(" - ").trim() }
}

/** The bulleted lines of a description, as card features. */
export function parseFeatures(description?: string | null): string[] {
  if (!description) return []

  const seen = new Set<string>()
  return description
    .split(/\r?\n/)
    .filter((line) => /^\s*(?:[✅✓•*\-–—]|\d+[.)])\s*\S/.test(line))
    .map((line) =>
      line
        .replace(/^\s*(?:[✅✓•*\-–—]|\d+[.)])\s*/, "")
        // An en or em dash used as a separator becomes a plain hyphen; a
        // hyphen inside a word ("expert-led") is left alone.
        .replace(/\s+[–—]\s+/g, " - ")
        .trim()
    )
    .filter((line) => {
      if (line.length < 3 || line.length > 90) return false
      const key = line.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 8)
}

/** A catalogue row, minus the cover. */
export function toCatalogueRow(
  course: RawCourse
): Omit<CatalogueCourse, "cover"> {
  const mrp = course.price ?? 0
  const payable = mrp - (course.discount ?? 0)
  const { short, subtitle } = splitCourseName(course.name)

  return {
    id: course.id,
    slug: slugify(short, course.id),
    name: course.name.trim(),
    short,
    subtitle,
    mrp,
    price: payable,
    // Over-discounted courses exist in the data; they are free, not negative.
    free: payable <= 0,
    learners: course.totalSubscriberCount ?? 0,
    features: parseFeatures(course.description),
  }
}

/**
 * Two Courses whose short names slugify identically would share one route:
 * the second has no page and its card links to the first. Refuse at sync
 * time, where a human is reading the output, rather than shipping it.
 */
export function assertUniqueSlugs(
  rows: ReadonlyArray<{ slug: string; id: number }>
) {
  const seen = new Map<string, number>()
  for (const row of rows) {
    const other = seen.get(row.slug)
    if (other !== undefined)
      throw new Error(
        `Slug "${row.slug}" is produced by courses ${other} and ${row.id}; refusing to write lib/catalogue.ts`
      )
    seen.set(row.slug, row.id)
  }
}
