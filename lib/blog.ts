import { isSlug } from "./catalog"

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
}

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

/** Posts in the reader's language first, each group keeping its order. */
export function ownLanguageFirst<T extends { language?: PostLanguage }>(
  posts: T[],
  locale: string
) {
  const own = (post: T) => (post.language ?? "en") === locale
  return [...posts.filter(own), ...posts.filter((post) => !own(post))]
}
