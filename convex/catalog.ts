import { v } from "convex/values"

import {
  anonymous,
  missingRecord,
  mutationResult,
  viewerPerson,
  type Viewer,
} from "./authz"
import type { Doc } from "./_generated/dataModel"
import {
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server"
import { BOOK_TONE, RESOURCE_KIND } from "./schema"

/** Published catalogue, for the public pages. Nothing unpublished leaves here. */

const BOOK = v.object({
  slug: v.string(),
  title: v.string(),
  subtitle: v.string(),
  exam: v.string(),
  edition: v.string(),
  pages: v.number(),
  pricePaise: v.number(),
  tone: BOOK_TONE,
  description: v.string(),
  contents: v.array(v.string()),
  samplePages: v.number(),
  samplePageUrls: v.array(v.string()),
  coverUrl: v.union(v.string(), v.null()),
  sample: v.boolean(),
})

const RESOURCE = v.object({
  slug: v.string(),
  title: v.string(),
  exam: v.string(),
  kind: RESOURCE_KIND,
  pages: v.number(),
  description: v.string(),
  sample: v.boolean(),
})

async function urls(ctx: QueryCtx, ids: Doc<"books">["samplePages"]) {
  const found = await Promise.all(ids.map((id) => ctx.storage.getUrl(id)))
  return found.filter((url): url is string => url !== null)
}

async function toBook(ctx: QueryCtx, book: Doc<"books">) {
  const samplePageUrls = await urls(ctx, book.samplePages)
  return {
    slug: book.slug,
    title: book.title,
    subtitle: book.subtitle,
    exam: book.exam,
    edition: book.edition,
    pages: book.pages,
    pricePaise: book.pricePaise,
    tone: book.tone,
    description: book.description,
    contents: book.contents,
    // Placeholder books still show a few blank sample sheets in the reader.
    samplePages: samplePageUrls.length || (book.sample ? 5 : 0),
    samplePageUrls,
    coverUrl: book.cover ? await ctx.storage.getUrl(book.cover) : null,
    sample: book.sample ?? false,
  }
}

export const books = query({
  args: {},
  returns: v.array(BOOK),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("books")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(200)
    return Promise.all(rows.map((row) => toBook(ctx, row)))
  },
})

export const book = query({
  args: { slug: v.string() },
  returns: v.union(BOOK, v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("books")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()
    return row?.published ? toBook(ctx, row) : null
  },
})

export const resources = query({
  args: {},
  returns: v.array(RESOURCE),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("resources")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(200)
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      exam: r.exam,
      kind: r.kind,
      pages: r.pageImages.length || (r.sample ? 6 : 0),
      description: r.description,
      sample: r.sample ?? false,
    }))
  },
})

/**
 * Open a resource: the gate. Only a verified Person gets the page images, and
 * the first open is recorded once on their activity trail. It does not make
 * them a lead (see `leadStatus` in the schema). Storage URLs are signed but not
 * short-lived; the gate is the verification, not the URL.
 */
export const openResource = mutation({
  args: { slug: v.string() },
  returns: mutationResult({
    title: v.string(),
    pageUrls: v.array(v.string()),
    pages: v.number(),
  }),
  handler: async (ctx, args) => {
    const viewer = await viewerPerson(ctx)
    return openResourceAs(ctx, viewer.ok ? viewer.value : null, args.slug)
  },
})

/** The gate itself, split out so it can be tested without a session. */
export async function openResourceAs(
  ctx: MutationCtx,
  viewer: Viewer | null,
  slug: string
) {
  if (!viewer) return anonymous

  const resource = await ctx.db
    .query("resources")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique()
  if (!resource?.published) return missingRecord

  const seen = await ctx.db
    .query("resourceOpens")
    .withIndex("by_person_resource", (q) =>
      q.eq("personId", viewer.id).eq("resourceId", resource._id)
    )
    .unique()
  if (!seen) {
    await ctx.db.insert("resourceOpens", {
      personId: viewer.id,
      resourceId: resource._id,
      at: Date.now(),
    })
    await ctx.db.insert("activities", {
      personId: viewer.id,
      kind: "resource_open",
      body: resource.title,
    })
  }

  const pageUrls = (
    await Promise.all(resource.pageImages.map((id) => ctx.storage.getUrl(id)))
  ).filter((url): url is string => url !== null)

  return {
    ok: true as const,
    title: resource.title,
    pageUrls,
    pages: pageUrls.length || (resource.sample ? 6 : 0),
  }
}
