/**
 * Books, bundles and resources: the shapes the public pages, the admin editors
 * and the Convex functions share, and the one set of rules they validate with.
 */

export const LANGUAGES = ["en", "as"] as const
export type Language = (typeof LANGUAGES)[number]

export const RESOURCE_KINDS = [
  "Notes",
  "Question paper",
  "Current affairs",
  "Practice set",
] as const
export type ResourceKind = (typeof RESOURCE_KINDS)[number]

/** English always; Assamese when written. */
export type Localised = { en: string; as?: string }

/** An uploaded image with what a page needs to reserve its space. */
export type Picture = {
  url: string
  width?: number
  height?: number
  blurDataUrl?: string
}

/** One language edition of a book, as the public pages show it. */
export type PublicEdition = {
  title: string
  subtitle?: string
  edition: string
  pages: number
  cover: Picture | null
  samplePages: Picture[]
}

export type PublicBook = {
  slug: string
  exam: string
  editions: Partial<Record<Language, PublicEdition>>
}

export type PublicVariant = {
  pricePaise: number
  comparePaise?: number
  available: boolean
}

/** A bundle as the public pages render it. */
export type PublicBundle = {
  slug: string
  exam: string
  title: Localised
  tagline?: Localised
  description: Localised
  cover: Picture | null
  variants: Record<Language, PublicVariant>
  soldCount: number
  books: PublicBook[]
  sample: boolean
}

/** A resource as the public list renders it. Page images stay server-side. */
/** The cheaper of a set's available languages, or null when neither is on. */
export function lowestPrice(bundle: PublicBundle) {
  const prices = LANGUAGES.flatMap((language) =>
    bundle.variants[language].available
      ? [bundle.variants[language].pricePaise]
      : []
  )
  return prices.length ? Math.min(...prices) : null
}

export type Resource = {
  slug: string
  title: string
  exam: string
  kind: ResourceKind
  language?: Language
  pages: number
  description: string
  sample?: boolean
}

export type EditionInput = {
  title: string
  subtitle?: string
  edition: string
  pages: number
}

export type BookInput = {
  slug: string
  exam: string
  description?: Localised
  contents: string[]
  editions: Partial<Record<Language, EditionInput>>
}

export type VariantInput = {
  pricePaise: number
  comparePaise?: number
  available: boolean
}

export type BundleInput = {
  slug: string
  exam: string
  title: Localised
  tagline?: Localised
  description: Localised
  variants: Record<Language, VariantInput>
  sortOrder: number
}

export type ResourceInput = {
  slug: string
  title: string
  exam: string
  kind: ResourceKind
  language?: Language
  description: string
}

/** A phone photo of a page is a few MB; anything bigger is the wrong file. */
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024
export const SAMPLE_PAGES_MAX = 12
export const RESOURCE_PAGES_MAX = 300
export const BUNDLE_BOOKS_MAX = 12
/** Largest quantity of one bundle in one order. */
export const BUNDLE_QUANTITY_MAX = 5
/** Sets in one order, across every line: more than this is a bulk buyer, who calls ICT. */
export const ORDER_SETS_MAX = 5

/** Parcels go within Assam, whose PIN codes all start with 78. */
export function deliversTo(pin: string) {
  return /^78\d{4}$/.test(pin.trim())
}
const PRICE_MAX_PAISE = 10_000_000

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** A valid public-path slug: lowercase words joined by hyphens. */
export function isSlug(value: string) {
  return SLUG.test(value) && value.length <= 80
}

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

/** Tidy both languages; an empty Assamese text becomes absent. */
function tidyLocalised(text: Localised, keepLines = false): Localised {
  const clean = keepLines ? (s: string) => s.trim() : tidy
  const as = text.as === undefined ? undefined : clean(text.as)
  return { en: clean(text.en), ...(as ? { as } : {}) }
}

const fits = (text: Localised, max: number) =>
  text.en.length <= max && (text.as?.length ?? 0) <= max

const isPaise = (value: number) =>
  Number.isInteger(value) && value >= 0 && value <= PRICE_MAX_PAISE

type Result<T> = { ok: true; value: T } | { ok: false; field: string }

/** Tidies a book and names the first field that is not acceptable. */
export function checkBook(input: BookInput): Result<BookInput> {
  const editions: BookInput["editions"] = {}
  for (const language of LANGUAGES) {
    const edition = input.editions[language]
    if (!edition) continue
    const value = {
      title: tidy(edition.title),
      subtitle: edition.subtitle ? tidy(edition.subtitle) : undefined,
      edition: tidy(edition.edition),
      pages: edition.pages,
    }
    if (!value.title || value.title.length > 120)
      return { ok: false, field: `${language}.title` }
    if ((value.subtitle?.length ?? 0) > 160)
      return { ok: false, field: `${language}.subtitle` }
    if (value.edition.length > 60)
      return { ok: false, field: `${language}.edition` }
    if (!Number.isInteger(value.pages) || value.pages < 1 || value.pages > 5000)
      return { ok: false, field: `${language}.pages` }
    editions[language] = value
  }
  const value: BookInput = {
    slug: input.slug.trim(),
    exam: tidy(input.exam),
    description: input.description
      ? tidyLocalised(input.description, true)
      : undefined,
    contents: input.contents.map(tidy).filter(Boolean),
    editions,
  }
  if (!isSlug(value.slug)) return { ok: false, field: "slug" }
  if (!value.exam || value.exam.length > 60) return { ok: false, field: "exam" }
  if (!editions.en && !editions.as) return { ok: false, field: "editions" }
  if (value.description && !fits(value.description, 2000))
    return { ok: false, field: "description" }
  if (value.contents.length > 60) return { ok: false, field: "contents" }
  return { ok: true, value }
}

/** Tidies a bundle and names the first field that is not acceptable. */
export function checkBundle(input: BundleInput): Result<BundleInput> {
  const value: BundleInput = {
    slug: input.slug.trim(),
    exam: tidy(input.exam),
    title: tidyLocalised(input.title),
    tagline: input.tagline ? tidyLocalised(input.tagline) : undefined,
    description: tidyLocalised(input.description, true),
    variants: input.variants,
    sortOrder: input.sortOrder,
  }
  if (!isSlug(value.slug)) return { ok: false, field: "slug" }
  if (!value.exam || value.exam.length > 60) return { ok: false, field: "exam" }
  if (!value.title.en || !fits(value.title, 120))
    return { ok: false, field: "title" }
  if (value.tagline && !fits(value.tagline, 160))
    return { ok: false, field: "tagline" }
  if (!fits(value.description, 3000)) return { ok: false, field: "description" }
  for (const language of LANGUAGES) {
    const variant = value.variants[language]
    // A set on sale costs something: Razorpay cannot take a payment of ₹0.
    if (
      !isPaise(variant.pricePaise) ||
      (variant.available && variant.pricePaise < 100)
    )
      return { ok: false, field: `${language}.price` }
    if (
      variant.comparePaise !== undefined &&
      (!isPaise(variant.comparePaise) ||
        variant.comparePaise <= variant.pricePaise)
    )
      return { ok: false, field: `${language}.comparePrice` }
  }
  if (!Number.isInteger(value.sortOrder)) return { ok: false, field: "order" }
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
  if (!isSlug(value.slug)) return { ok: false, field: "slug" }
  if (!value.title || value.title.length > 120)
    return { ok: false, field: "title" }
  if (!value.exam || value.exam.length > 60) return { ok: false, field: "exam" }
  if (!RESOURCE_KINDS.includes(value.kind)) return { ok: false, field: "kind" }
  if (value.description.length > 600) return { ok: false, field: "description" }
  return { ok: true, value }
}

/** The text for a language, falling back to English. */
export function inLanguage(text: Localised, language: Language): string {
  return (language === "as" && text.as) || text.en
}

/** Keeps a rupee field to digits and one dot, with at most two decimal places. */
export function rupeeDraft(text: string): string {
  const clean = text.replace(/[^\d.]/g, "")
  const dot = clean.indexOf(".")
  if (dot === -1) return clean
  const whole = clean.slice(0, dot)
  const fraction = clean
    .slice(dot + 1)
    .replace(/\./g, "")
    .slice(0, 2)
  return `${whole}.${fraction}`
}

/** Digits only, capped at the longest page count a book is allowed to have. */
export function pageCountDraft(text: string): string {
  return text.replace(/\D/g, "").slice(0, 4)
}

/** Rupees as typed in a form ("349", "349.50") to integer paise, or null. */
export function rupeesToPaise(text: string): number | null {
  const clean = text.replace(/[,₹\s]/g, "")
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null
  return Math.round(Number(clean) * 100)
}
