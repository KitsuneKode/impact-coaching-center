/**
 * Snapshots ICT's live course catalogue into lib/catalogue.ts.
 *
 *   bun run sync:courses
 *
 * ICT already maintains courses, prices and descriptions in Classplus, which
 * is their LMS and their payment rail. That makes Classplus the single source
 * of truth, and re-typing prices into this repo by hand guarantees the site
 * will one day contradict the checkout.
 *
 * This reads the same public endpoint their own storefront calls, then writes
 * a plain TypeScript file and downloads the cover images. The snapshot is
 * committed, so the site never depends on an undocumented third-party API at
 * request time: if Classplus changes or goes down, the page still renders and
 * the only cost is stale data until someone re-runs this.
 *
 * Re-run it whenever ICT adds a course or changes a price, and review the diff
 * before committing, the same as any other content change.
 */

const ORG_ID = 445114
// base64 of {"tutorId":null,"orgId":445114,"categoryId":null}, as the storefront builds it
const HASH = Buffer.from(
  JSON.stringify({ tutorId: null, orgId: ORG_ID, categoryId: null })
).toString("base64")

const ENDPOINT =
  `https://api.classplusapp.com/v2/course/preview/diy/similar/${HASH}` +
  `?subCatList=[]&mainCategoryList=[]&limit=60&offset=0`

type RawCourse = {
  id: number
  name: string
  description?: string | null
  imageUrl?: string | null
  price?: number | null
  discount?: number | null
  totalSubscriberCount?: number | null
  createdAt?: string
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
}

/**
 * Their descriptions are bulleted plain text with a prose intro above the
 * bullets. Only the bulleted lines are features, so require a marker: keeping
 * the intro put a whole paragraph in the first slot of the card.
 */
function parseFeatures(description?: string | null) {
  if (!description) return []
  const seen = new Set<string>()
  return description
    .split("\n")
    .filter((line) => /^\s*(?:[✅✓•*\-–—]|\d+[.)])\s*\S/.test(line))
    .map((line) =>
      line
        .replace(/^\s*(?:[✅✓•*\-–—]|\d+[.)])\s*/, "")
        // an en or em dash used as a separator becomes a plain hyphen; a
        // hyphen inside a word ("expert-led") is left alone
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

async function main() {
  const response = await fetch(ENDPOINT, {
    headers: {
      accept: "application/json",
      origin: "https://www.impactcareertutorials.in",
      referer: "https://www.impactcareertutorials.in/",
    },
  })
  if (!response.ok) throw new Error(`Classplus returned ${response.status}`)

  const payload = (await response.json()) as {
    status: string
    data: Record<string, { coursesData?: RawCourse[] } | null>
  }
  if (payload.status !== "success")
    throw new Error("Classplus returned a non-success payload")

  const byId = new Map<number, RawCourse>()
  for (const section of Object.values(payload.data ?? {})) {
    for (const course of section?.coursesData ?? []) byId.set(course.id, course)
  }
  if (byId.size === 0)
    throw new Error(
      "No courses in the payload; refusing to write an empty catalogue"
    )

  // generated directory: clear it so renamed or removed courses leave no stale art
  await Bun.$`rm -rf public/courses && mkdir -p public/courses`.quiet()

  const rows = []
  for (const course of [...byId.values()].sort(
    (a, b) => (b.price ?? 0) - (a.price ?? 0)
  )) {
    const mrp = course.price ?? 0
    const payable = mrp - (course.discount ?? 0)
    // "Lakhya 2027 - The Complete APSC Course" -> short "Lakhya 2027", subtitle
    // "The Complete APSC Course". ICT also writes "Kouxal- Free ...", so the
    // separator is a dash followed by a space, with or without one before it.
    const [short, ...rest] = course.name.trim().split(/\s*[-–]\s+/)
    const subtitle = rest.join(" - ").trim()
    const slug = slugify(short)

    let cover: string | null = null
    if (course.imageUrl) {
      const extension = course.imageUrl.split(".").pop()?.split("?")[0] ?? "png"
      const file = `public/courses/${slug}.${extension}`
      try {
        const image = await fetch(course.imageUrl)
        if (image.ok) {
          await Bun.write(file, await image.arrayBuffer())
          cover = `/courses/${slug}.${extension}`
        }
      } catch {
        // a missing cover is not worth failing the sync over
      }
    }

    rows.push({
      id: course.id,
      slug,
      name: course.name.trim(),
      short: short.trim(),
      subtitle,
      mrp,
      price: payable,
      free: payable <= 0,
      learners: course.totalSubscriberCount ?? 0,
      features: parseFeatures(course.description),
      cover,
    })
  }

  const file = `/**
 * ICT's live course catalogue, snapshotted from Classplus.
 *
 * GENERATED by scripts/sync-courses.ts. Do not edit by hand.
 * Re-run: bun run sync:courses
 *
 * Synced ${new Date().toISOString().slice(0, 10)} from org ${ORG_ID}, the same
 * data that powers impactcareertutorials.in/courses and the ICT app checkout.
 */

export type CatalogueCourse = {
  id: number
  /** url segment, from the short name: /courses/lakhya-2027 */
  slug: string
  name: string
  /** "Lakhya 2027" */
  short: string
  /** "The Complete APSC Course", empty when ICT gave the course one name */
  subtitle: string
  /** list price before the standing discount */
  mrp: number
  /** what a student actually pays today */
  price: number
  free: boolean
  /** enrolled on Classplus at sync time */
  learners: number
  features: string[]
  cover: string | null
}

export const catalogue: CatalogueCourse[] = ${JSON.stringify(rows, null, 2)}

export function courseById(id: number) {
  return catalogue.find((course) => course.id === id)
}

export function courseBySlug(slug: string) {
  return catalogue.find((course) => course.slug === slug)
}

/** "25009" -> "₹25,009" */
export function inr(amount: number) {
  return \`₹\${amount.toLocaleString("en-IN")}\`
}
`

  await Bun.write("lib/catalogue.ts", file)
  console.log(`Wrote lib/catalogue.ts with ${rows.length} courses`)
  for (const row of rows) {
    console.log(
      `  ${row.free ? "FREE  " : String(row.price).padStart(6)}  ${row.name}`
    )
  }
}

await main()

export {}
