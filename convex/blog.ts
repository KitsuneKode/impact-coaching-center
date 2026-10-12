import { v } from "convex/values"

import { query, type QueryCtx } from "./_generated/server"

/*
 * The public face of the blog: published posts only, in fields a visitor
 * page needs. Drafts never leave this file - the admin reads through
 * blogAdmin.ts instead.
 */

/** A post in the list: everything but the body, which only its page needs. */
const POST_CARD = v.object({
  slug: v.string(),
  title: v.string(),
  excerpt: v.string(),
  publishedAt: v.optional(v.number()),
  updatedAt: v.number(),
})

const POST = POST_CARD.extend({ body: v.string() })

/** A homepage-worth of posts; the list page is not paginated. */
const PUBLIC_MAX = 50

/** The published list, newest first. Split out so tests need no session. */
export async function readPublishedPosts(ctx: Pick<QueryCtx, "db">) {
  const rows = await ctx.db
    .query("posts")
    .withIndex("by_published", (q) => q.eq("published", true))
    .order("desc")
    .take(PUBLIC_MAX)
  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
  }))
}

/** One published post by slug, or null - drafts read as absent. */
export async function readPublishedPost(
  ctx: Pick<QueryCtx, "db">,
  slug: string
) {
  const row = await ctx.db
    .query("posts")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first()
  if (!row?.published) return null
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
  }
}

export const posts = query({
  args: {},
  returns: v.array(POST_CARD),
  handler: (ctx) => readPublishedPosts(ctx),
})

export const post = query({
  args: { slug: v.string() },
  returns: v.union(POST, v.null()),
  handler: (ctx, args) => readPublishedPost(ctx, args.slug),
})
