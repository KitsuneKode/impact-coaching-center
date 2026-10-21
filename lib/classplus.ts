import { parseFeatures, slugify, splitCourseName } from "./catalogue-import"

/** ICT's organisation on ClassPlus. */
export const CLASSPLUS_ORG_ID = 445114

const orgHash = (orgId: number) =>
  btoa(JSON.stringify({ tutorId: null, orgId, categoryId: null }))

/**
 * The calls ICT's own ClassPlus storefront makes (www.impactcareertutorials.in
 * /courses, recorded 22 Oct 2026). Not a documented API
 * (docs/research/2026-09-20-classplus-integration.md): a failed or odd
 * response keeps the last good data rather than emptying the site.
 *
 * Every course ICT has published, 20 a page; `totalCount` says how many.
 */
export function classplusListUrl(offset = 0, orgId = CLASSPLUS_ORG_ID) {
  return (
    `https://api.classplusapp.com/v2/course/preview/similar/${orgHash(orgId)}` +
    `?subCatList=&mainCategory=0&limit=${LIST_PAGE}&offset=${offset}`
  )
}
export const LIST_PAGE = 20

/** The storefront's front page: its popular, recent, featured and newest rows. */
export function classplusFeedUrl(orgId = CLASSPLUS_ORG_ID) {
  return (
    `https://api.classplusapp.com/v2/course/preview/diy/similar/${orgHash(orgId)}` +
    `?subCatList=[]&mainCategory=0`
  )
}

/** The headers the storefront sends with both calls. */
export const CLASSPLUS_HEADERS = {
  accept: "application/json, text/plain, */*",
  "accept-language": "EN",
  "api-version": "22",
  region: "IN",
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
  /** On the storefront's front page, so ICT is selling it now. */
  listed?: boolean
  /** In the storefront's "Featured" row. */
  classplusFeatured?: boolean
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

function body(payload: unknown) {
  const response = payload as { status?: unknown; data?: unknown }
  if (
    response?.status !== "success" ||
    !response.data ||
    typeof response.data !== "object"
  )
    throw new Error("ClassPlus returned an unexpected response.")
  return response.data as Record<string, unknown>
}

function coursesIn(raw: unknown) {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const course = toCourse(item as Record<string, unknown>)
    return course ? [course] : []
  })
}

/** One page of the full list, and how many courses there are in all. */
export function parseClassplusList(payload: unknown) {
  const data = body(payload)
  const total = Number(data.totalCount)
  if (!Number.isFinite(total) || !Array.isArray(data.coursesData))
    throw new Error("ClassPlus returned an unexpected list.")
  return { courses: coursesIn(data.coursesData), total }
}

/**
 * The storefront front page: the ids it shows anywhere, and its "Featured"
 * row. Throws on a shape we do not recognise, so a changed feed is a failed
 * sync, not a catalogue with nothing listed.
 */
export function parseClassplusFrontPage(payload: unknown) {
  const data = body(payload)
  const listed = new Set<number>()
  const featured = new Set<number>()
  for (const [key, section] of Object.entries(data)) {
    const courses = coursesIn(
      (section as { coursesData?: unknown } | null)?.coursesData
    )
    for (const course of courses) {
      listed.add(course.classplusId)
      if (key === "featured") featured.add(course.classplusId)
    }
  }
  if (listed.size === 0) throw new Error("ClassPlus returned no courses.")
  return { listed, featured }
}

/**
 * Every course in a front-page response, once each. Throws on a shape we do
 * not recognise, so a changed feed is a failed sync, not an empty catalogue.
 */
export function parseClassplusFeed(payload: unknown): ClassplusCourse[] {
  const data = body(payload)
  const byId = new Map<number, ClassplusCourse>()
  for (const section of Object.values(data))
    for (const course of coursesIn(
      (section as { coursesData?: unknown } | null)?.coursesData
    ))
      byId.set(course.classplusId, course)
  if (byId.size === 0) throw new Error("ClassPlus returned no courses.")
  return [...byId.values()]
}

/** The ticked lines of a ClassPlus description, for course cards. */
export const courseFeatures = parseFeatures

/** "Lakhya 2027 - The Complete APSC Course" → short name and subtitle. */
export const courseName = splitCourseName
