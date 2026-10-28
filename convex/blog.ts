import { v } from "convex/values"

import { readingMinutes } from "../lib/article"
import { excerptFrom } from "../lib/blog"
import type { Id } from "./_generated/dataModel"
import { mutation, query, type QueryCtx } from "./_generated/server"
import { PICTURE, pictureOf } from "./images"
import { consumeRateLimit } from "./persons"

/*
 * The public face of the blog: published posts only, in fields a visitor
 * page needs. Drafts never leave this file - the admin reads through
 * blogAdmin.ts instead.
 */

/** A post in the list: everything but the body, which only its page needs. */
export const POST_LANGUAGE = v.union(v.literal("en"), v.literal("as"))

const POST_CARD = v.object({
  slug: v.string(),
  title: v.string(),
  excerpt: v.string(),
  language: POST_LANGUAGE,
  /** The exam it is about, as `tracks` names it. */
  exam: v.optional(v.string()),
  publishedAt: v.optional(v.number()),
  updatedAt: v.number(),
  cover: v.union(PICTURE, v.null()),
  minutes: v.number(),
  reads: v.number(),
})

const POST = POST_CARD.extend({ body: v.string() })

async function readsOf(ctx: Pick<QueryCtx, "db">, postId: Id<"posts">) {
  const stats = await ctx.db
    .query("postStats")
    .withIndex("by_postId", (q) => q.eq("postId", postId))
    .first()
  return stats?.reads ?? 0
}

/** A homepage-worth of posts; the list page is not paginated. */
const PUBLIC_MAX = 50

/** The published list, newest first. Split out so tests need no session. */
export async function readPublishedPosts(
  ctx: Pick<QueryCtx, "db" | "storage">
) {
  const rows = await ctx.db
    .query("posts")
    .withIndex("by_published_and_publishedAt", (q) => q.eq("published", true))
    .order("desc")
    .take(PUBLIC_MAX)
  return Promise.all(
    rows.map(async (row) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt || excerptFrom(row.body),
      language: row.language ?? "en",
      exam: row.exam,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
      cover: await pictureOf(ctx, row.cover),
      minutes: readingMinutes(row.body),
      reads: await readsOf(ctx, row._id),
    }))
  )
}

/** One published post by slug, or null - drafts read as absent. */
export async function readPublishedPost(
  ctx: Pick<QueryCtx, "db" | "storage">,
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
    excerpt: row.excerpt || excerptFrom(row.body),
    language: row.language ?? "en",
    exam: row.exam,
    body: row.body,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    cover: await pictureOf(ctx, row.cover),
    minutes: readingMinutes(row.body),
    reads: await readsOf(ctx, row._id),
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

/** A ceiling on counted reads per post per minute: a guard against a script,
    far above what a coaching centre's blog sees. */
const READS_PER_MINUTE = 120

/**
 * One read of a published post. The page calls it once per visit, after the
 * visitor has stayed a while; nothing about the reader is stored.
 */
export const countRead = mutation({
  args: { slug: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.slug.length > 120) return null
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first()
    if (!post?.published) return null
    if (
      !(await consumeRateLimit(
        ctx,
        `reads:${post._id}`,
        READS_PER_MINUTE,
        60_000
      ))
    )
      return null
    const stats = await ctx.db
      .query("postStats")
      .withIndex("by_postId", (q) => q.eq("postId", post._id))
      .first()
    if (stats) await ctx.db.patch(stats._id, { reads: stats.reads + 1 })
    else await ctx.db.insert("postStats", { postId: post._id, reads: 1 })
    return null
  },
})
