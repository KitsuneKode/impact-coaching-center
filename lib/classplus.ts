import { parseFeatures, slugify, splitCourseName } from "./catalogue-import"

/** ICT's organisation on ClassPlus. */
export const CLASSPLUS_ORG_ID = 445114

/**
 * The public storefront feed ICT's own ClassPlus site reads. Not a documented
 * API (docs/research/2026-09-20-classplus-integration.md): a failed or odd
 * response keeps the last good data rather than emptying the site.
 */
export function classplusFeedUrl(orgId = CLASSPLUS_ORG_ID) {
  const hash = btoa(JSON.stringify({ tutorId: null, orgId, categoryId: null }))
  return (
    `https://api.classplusapp.com/v2/course/preview/diy/similar/${hash}` +
    `?subCatList=[]&mainCategoryList=[]&limit=60&offset=0`
  )
}

export const CLASSPLUS_HEADERS = {
  accept: "application/json",
  origin: "https://www.impactcareertutorials.in",
  referer: "https://www.impactcareertutorials.in/",
}

/** One course as we keep it from ClassPlus. Prices in paise. */
export type ClassplusCourse = {
  classplusId: number
  slug: string
  name: string
  description: string
  pricePaise: number
  finalPricePaise: number
  free: boolean
  enrolled: number
  category?: string
  tags: string[]
  imageUrl?: string
  createdAt?: number
}

const num = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined
const str = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined

/** Read one raw course, or null when it lacks what a page needs. */
function toCourse(raw: Record<string, unknown>): ClassplusCourse | null {
  const id = num(raw.id)
  const name = str(raw.name)
  if (id === undefined || !name) return null
  const price = Math.max(0, num(raw.price) ?? 0)
  const final = Math.max(
    0,
    num(raw.finalPrice) ?? price - (num(raw.discount) ?? 0)
  )
  const tags = Array.isArray(raw.courseTags)
    ? raw.courseTags.flatMap((tag) => {
        const text = str((tag as { text?: unknown })?.text)
        return text ? [text] : []
      })
    : []
  const created = str(raw.createdAt)
  return {
    classplusId: id,
    slug: slugify(splitCourseName(name).short, id),
    name,
    description: str(raw.description) ?? "",
    pricePaise: Math.round(price * 100),
    finalPricePaise: Math.round(final * 100),
    free: final <= 0,
    enrolled: Math.max(0, num(raw.totalSubscriberCount) ?? 0),
    category: str(raw.categories),
    tags,
    imageUrl: str(raw.imageUrl),
    createdAt: created ? Date.parse(created) || undefined : undefined,
  }
}

/**
 * Every course in a feed response, once each. Throws on a shape we do not
 * recognise, so a changed feed is a failed sync, not an empty catalogue.
 */
export function parseClassplusFeed(payload: unknown): ClassplusCourse[] {
  const body = payload as { status?: unknown; data?: unknown }
  if (body?.status !== "success" || !body.data || typeof body.data !== "object")
    throw new Error("ClassPlus returned an unexpected response.")
  const byId = new Map<number, ClassplusCourse>()
  for (const section of Object.values(body.data as Record<string, unknown>)) {
    const courses = (section as { coursesData?: unknown })?.coursesData
    if (!Array.isArray(courses)) continue
    for (const raw of courses) {
      if (!raw || typeof raw !== "object") continue
      const course = toCourse(raw as Record<string, unknown>)
      if (course) byId.set(course.classplusId, course)
    }
  }
  if (byId.size === 0) throw new Error("ClassPlus returned no courses.")
  return [...byId.values()]
}

/** The ticked lines of a ClassPlus description, for course cards. */
export const courseFeatures = parseFeatures

/** "Lakhya 2027 - The Complete APSC Course" → short name and subtitle. */
export const courseName = splitCourseName
