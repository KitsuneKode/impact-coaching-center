import { isSlug } from "./catalog"

/**
 * Post shapes shared by the public pages, the admin editor and the Convex
 * functions, plus the one set of rules both sides validate with - same
 * reason checkBook lives in lib/catalog.ts.
 */
export const POST_TITLE_MAX = 120
export const POST_EXCERPT_MAX = 300
export const POST_BODY_MAX = 50_000

export type PostInput = {
  slug: string
  title: string
  excerpt: string
  /** Markdown. */
  body: string
}

/** A post in the public list; the body stays on its own page. */
export type PostCard = {
  slug: string
  title: string
  excerpt: string
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
  }
  if (!isSlug(value.slug)) return { ok: false, field: "slug" }
  if (!value.title || value.title.length > POST_TITLE_MAX)
    return { ok: false, field: "title" }
  if (value.excerpt.length > POST_EXCERPT_MAX)
    return { ok: false, field: "excerpt" }
  if (value.body.length > POST_BODY_MAX) return { ok: false, field: "body" }
  return { ok: true, value }
}
