import { isSlug, type Picture } from "./catalog"

/**
 * Post shapes shared by the public pages, the admin editor and the Convex
 * functions, plus the one set of rules both sides validate with - same
 * reason checkBook lives in lib/catalog.ts.
 */
export const POST_TITLE_MAX = 120
export const POST_EXCERPT_MAX = 300
export const POST_BODY_MAX = 50_000

/** The language a post is written in. Each list shows its own first. */
export const POST_LANGUAGES = ["en", "as"] as const
export type PostLanguage = (typeof POST_LANGUAGES)[number]

export type PostInput = {
  slug: string
  title: string
  excerpt: string
  /** Markdown. */
  body: string
  language: PostLanguage
}

/** A post in the public list; the body stays on its own page. */
export type PostCard = {
  slug: string
  title: string
  excerpt: string
  language: PostLanguage
  publishedAt?: number
  updatedAt: number
  cover?: Picture | null
  /** Reading time, whole minutes. */
  minutes?: number
  /** Counted reads (convex/blog.ts countRead); shown from READS_FROM. */
  reads?: number
}

/** Below this a read count says "nobody reads this" more than anything. */
export const READS_FROM = 100

export type Post = PostCard & { body: string }

type Result<T> = { ok: true; value: T } | { ok: false; field: string }

const tidy = (text: string) => text.replace(/\s+/g, " ").trim()

/** Tidies a post and names the first field that is not acceptable. */
export function checkPost(input: PostInput): Result<PostInput> {
  const value: PostInput = {
    slug: input.slug.trim(),
    title: tidy(input.title),
    excerpt: tidy(input.excerpt),
    body: input.body.trim(),
    language: input.language,
  }
  if (!isSlug(value.slug)) return { ok: false, field: "slug" }
  if (!POST_LANGUAGES.includes(value.language))
    return { ok: false, field: "language" }
  if (!value.title || value.title.length > POST_TITLE_MAX)
    return { ok: false, field: "title" }
  if (value.excerpt.length > POST_EXCERPT_MAX)
    return { ok: false, field: "excerpt" }
  if (value.body.length > POST_BODY_MAX) return { ok: false, field: "body" }
  return { ok: true, value }
}

/** About what a search result shows of a description before it cuts. */
const AUTO_EXCERPT_MAX = 180

/**
 * The excerpt a post has when nobody wrote one: its first paragraph of
 * prose, Markdown removed, cut on a word near what search results show.
 * Worked out on reading, not stored, so it follows later edits to the body
 * until the owner writes an excerpt of their own.
 */
export function excerptFrom(body: string): string {
  const paragraph = body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find(
      (block) =>
        block !== "" &&
        !/^(#|!\[|<|\||```|---|\* \* \*|https?:\/\/\S+$)/.test(block)
    )
  if (!paragraph) return ""
  const text = tidy(
    paragraph
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/^\s*(?:[-*+]|\d+\.|>)\s+/gm, "")
      .replace(/[*_`~]+/g, "")
  )
  if (text.length <= AUTO_EXCERPT_MAX) return text
  const cut = text.slice(0, AUTO_EXCERPT_MAX)
  const space = cut.lastIndexOf(" ")
  return `${(space > AUTO_EXCERPT_MAX / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:.\u0964-]+$/, "")}…`
}

/** Posts in the reader's language first, each group keeping its order. */
export function ownLanguageFirst<T extends { language?: PostLanguage }>(
  posts: T[],
  locale: string
) {
  const own = (post: T) => (post.language ?? "en") === locale
  return [...posts.filter(own), ...posts.filter((post) => !own(post))]
}
