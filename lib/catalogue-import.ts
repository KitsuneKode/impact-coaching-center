import type { CatalogueCourse } from "./catalogue"

/**
 * Turning a Classplus course into a catalogue row.
 *
 * This is the pure half of `scripts/sync-courses.ts`. It lived in the script,
 * which `tsconfig.json` excludes, so the rules that decide every price, slug
 * and feature bullet on the site were invisible to the type checker and could
 * not be tested. The script keeps the IO - fetching, downloading covers,
 * writing the file - and calls this for the transform.
 */

/** The fields this module reads from Classplus. The API sends more. */
export type RawCourse = {
  id: number
  name: string
  description?: string | null
  price?: number | null
  discount?: number | null
  totalSubscriberCount?: number | null
}

/**
 * A URL segment for a course.
 *
 * `fallbackId` is not optional decoration: a name written entirely in
 * Assamese script strips to an empty string, and an empty slug produces the
 * route `/courses/` - the catalogue page itself - rather than a course.
 */
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
 *
 * The separator is a dash followed by a space, with or without a space
 * before it, because ICT also writes "Kouxal- Free APSC Workshop". Requiring
 * the trailing space is what keeps "Pre-Foundation" in one piece.
 */
export function splitCourseName(name: string): {
  short: string
  subtitle: string
} {
  const [short = "", ...rest] = name.trim().split(/\s*[-–]\s+/)
  return { short: short.trim(), subtitle: rest.join(" - ").trim() }
}

/**
 * The bulleted lines of a description, as card features.
 *
 * Classplus descriptions are a prose intro followed by bullets. A marker is
 * required: without it the intro paragraph took the first slot on the card.
 */
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

/**
 * A catalogue row, minus the cover.
 *
 * The cover is the one field that needs IO - downloading the image - so the
 * script supplies it after calling this.
 */
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
