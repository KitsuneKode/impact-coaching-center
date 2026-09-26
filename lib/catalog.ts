/**
 * Book and resource shapes shared by the public pages, the admin editor and
 * the Convex functions, plus the one set of rules both sides validate with.
 */
export const BOOK_TONES = ["primary", "highlight", "muted"] as const
export type BookTone = (typeof BOOK_TONES)[number]

export const RESOURCE_KINDS = [
  "Notes",
  "Question paper",
  "Current affairs",
  "Practice set",
] as const
export type ResourceKind = (typeof RESOURCE_KINDS)[number]

/** A book as the public pages render it. */
export type Book = {
  slug: string
  title: string
  subtitle: string
  exam: string
  edition: string
  pages: number
  pricePaise: number
  tone: BookTone
  description: string
  contents: readonly string[]
  /** How many sample pages exist; the reader shows placeholders beyond URLs. */
  samplePages: number
  samplePageUrls?: readonly string[]
  coverUrl?: string | null
  sample?: boolean
}

/** A resource as the public list renders it. Page images stay server-side. */
export type Resource = {
  slug: string
  title: string
  exam: string
  kind: ResourceKind
  pages: number
  description: string
  sample?: boolean
}

export type BookInput = {
  slug: string
  title: string
  subtitle: string
  exam: string
  edition: string
  pages: number
  pricePaise: number
  tone: BookTone
  description: string
  contents: string[]
}

export type ResourceInput = {
  slug: string
  title: string
  exam: string
  kind: ResourceKind
  description: string
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** "Assam GK Capsule" → "assam-gk-capsule". */
export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

const tidy = (text: string) => text.replace(/\s+/g, " ").trim()

type Result<T> = { ok: true; value: T } | { ok: false; field: string }

/** Tidies a book and names the first field that is not acceptable. */
export function checkBook(input: BookInput): Result<BookInput> {
  const value: BookInput = {
    ...input,
    slug: input.slug.trim(),
    title: tidy(input.title),
    subtitle: tidy(input.subtitle),
    exam: tidy(input.exam),
    edition: tidy(input.edition),
    description: input.description.trim(),
    contents: input.contents.map(tidy).filter(Boolean),
  }
  if (!SLUG.test(value.slug) || value.slug.length > 80)
    return { ok: false, field: "slug" }
  if (!value.title || value.title.length > 120)
    return { ok: false, field: "title" }
  if (value.subtitle.length > 160) return { ok: false, field: "subtitle" }
  if (!value.exam || value.exam.length > 60) return { ok: false, field: "exam" }
  if (value.edition.length > 60) return { ok: false, field: "edition" }
  if (!Number.isInteger(value.pages) || value.pages < 1 || value.pages > 5000)
    return { ok: false, field: "pages" }
  if (
    !Number.isInteger(value.pricePaise) ||
    value.pricePaise < 0 ||
    value.pricePaise > 10_000_000
  )
    return { ok: false, field: "price" }
  if (!BOOK_TONES.includes(value.tone)) return { ok: false, field: "tone" }
  if (value.description.length > 2000)
    return { ok: false, field: "description" }
  if (value.contents.length > 60) return { ok: false, field: "contents" }
  return { ok: true, value }
}

/** Tidies a resource and names the first field that is not acceptable. */
export function checkResource(input: ResourceInput): Result<ResourceInput> {
  const value: ResourceInput = {
    ...input,
    slug: input.slug.trim(),
    title: tidy(input.title),
    exam: tidy(input.exam),
    description: input.description.trim(),
  }
  if (!SLUG.test(value.slug) || value.slug.length > 80)
    return { ok: false, field: "slug" }
  if (!value.title || value.title.length > 120)
    return { ok: false, field: "title" }
  if (!value.exam || value.exam.length > 60) return { ok: false, field: "exam" }
  if (!RESOURCE_KINDS.includes(value.kind)) return { ok: false, field: "kind" }
  if (value.description.length > 600) return { ok: false, field: "description" }
  return { ok: true, value }
}

/** Rupees as typed in a form ("349", "349.50") to integer paise, or null. */
export function rupeesToPaise(text: string): number | null {
  const clean = text.replace(/[,₹\s]/g, "")
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null
  return Math.round(Number(clean) * 100)
}
