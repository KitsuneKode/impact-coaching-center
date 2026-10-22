import { v } from "convex/values"

import type { PublicBook, PublicBundle } from "../lib/catalog"
import {
  anonymous,
  missingRecord,
  mutationResult,
  viewerPerson,
  type Viewer,
} from "./authz"
import { r2 } from "./files"
import type { Doc, Id } from "./_generated/dataModel"
import {
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server"
import { PICTURE, pictureOf, picturesOf } from "./images"
import { LOCALE, LOCALISED, RESOURCE_KIND } from "./schema"

/** Published catalogue for the public pages. Nothing unpublished leaves here. */

const PUBLIC_EDITION = v.object({
  title: v.string(),
  subtitle: v.optional(v.string()),
  edition: v.string(),
  pages: v.number(),
  cover: v.union(PICTURE, v.null()),
  samplePages: v.array(PICTURE),
})

const PUBLIC_BOOK = v.object({
  slug: v.string(),
  exam: v.string(),
  editions: v.object({
    en: v.optional(PUBLIC_EDITION),
    as: v.optional(PUBLIC_EDITION),
  }),
})

const PUBLIC_VARIANT = v.object({
  pricePaise: v.number(),
  comparePaise: v.optional(v.number()),
  available: v.boolean(),
})

const PUBLIC_BUNDLE = v.object({
  slug: v.string(),
  exam: v.string(),
  title: LOCALISED,
  tagline: v.optional(LOCALISED),
  description: LOCALISED,
  cover: v.union(PICTURE, v.null()),
  variants: v.object({ en: PUBLIC_VARIANT, as: PUBLIC_VARIANT }),
  soldCount: v.number(),
  books: v.array(PUBLIC_BOOK),
  sample: v.boolean(),
})

const RESOURCE = v.object({
  slug: v.string(),
  title: v.string(),
  exam: v.string(),
  kind: RESOURCE_KIND,
  language: v.optional(LOCALE),
  pages: v.number(),
  description: v.string(),
  sample: v.boolean(),
  /** When it went up, for newest-first and the "New" tag. */
  addedAt: v.number(),
})

/** The free shelf's ceiling; the page lists 24 at a time inside a folder. */
const PUBLIC_RESOURCES_MAX = 1000

/** The shelf shows covers only; sample pages load on the bundle page. */
async function toBook(
  ctx: QueryCtx,
  book: Doc<"books">,
  withSamples: boolean
): Promise<PublicBook> {
  const editions: PublicBook["editions"] = {}
  for (const language of ["en", "as"] as const) {
    const edition = book.editions[language]
    if (!edition) continue
    editions[language] = {
      title: edition.title,
      subtitle: edition.subtitle,
      edition: edition.edition,
      pages: edition.pages,
      cover: await pictureOf(ctx, edition.cover),
      samplePages: withSamples
        ? await picturesOf(ctx, edition.samplePages)
        : [],
    }
  }
  return { slug: book.slug, exam: book.exam, editions }
}

async function toBundle(
  ctx: QueryCtx,
  bundle: Doc<"bundles">,
  withSamples: boolean
): Promise<PublicBundle> {
  const books = await Promise.all(bundle.bookIds.map((id) => ctx.db.get(id)))
  return {
    slug: bundle.slug,
    exam: bundle.exam,
    title: bundle.title,
    tagline: bundle.tagline,
    description: bundle.description,
    cover: await pictureOf(ctx, bundle.cover),
    variants: bundle.variants,
    soldCount: bundle.soldCount + (bundle.soldOffline ?? 0),
    books: await Promise.all(
      books.flatMap((book) => (book ? [toBook(ctx, book, withSamples)] : []))
    ),
    sample: bundle.sample ?? false,
  }
}

/** A shop never has more bundles than this; the cap keeps the read bounded. */
const SHELF_MAX = 50

export const bundles = query({
  args: {},
  returns: v.array(PUBLIC_BUNDLE),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("bundles")
      .withIndex("by_published_and_sortOrder", (q) => q.eq("published", true))
      .take(SHELF_MAX)
    const shelf = await Promise.all(
      rows.map((row) => toBundle(ctx, row, false))
    )
    // A set whose books are all gone has nothing to show or sell.
    return shelf.filter((bundle) => bundle.books.length > 0)
  },
})

export const bundle = query({
  args: { slug: v.string() },
  returns: v.union(PUBLIC_BUNDLE, v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("bundles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first()
    if (!row?.published) return null
    const bundle = await toBundle(ctx, row, true)
    return bundle.books.length ? bundle : null
  },
})

export const resources = query({
  args: {},
  returns: v.array(RESOURCE),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("resources")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .take(PUBLIC_RESOURCES_MAX)
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      exam: r.exam,
      kind: r.kind,
      language: r.language,
      // A PDF counts its own pages; page images otherwise.
      pages: r.pdf?.pages || r.pageImages.length || (r.sample ? 6 : 0),
      description: r.description,
      sample: r.sample ?? false,
      addedAt: r._creationTime,
    }))
  },
})

/**
 * Open a resource: the gate. Only a verified Person gets the page images, and
 * the first open is recorded once on their activity trail. Storage URLs are
 * signed but not short-lived; the gate is the verification, not the URL.
 */
export const openResource = mutation({
  args: { slug: v.string() },
  returns: mutationResult({
    title: v.string(),
    pages: v.array(PICTURE),
    pageCount: v.number(),
    /** A short-lived signed link to the PDF in R2, when it has one. */
    pdfUrl: v.optional(v.string()),
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
    .first()
  if (!resource?.published) return missingRecord

  await recordFirstOpen(ctx, viewer.id, resource)

  // The PDF wins when there is one; the link lasts long enough to read, not to share.
  if (resource.pdf)
    return {
      ok: true as const,
      title: resource.title,
      pages: [],
      pageCount: resource.pdf.pages,
      pdfUrl: await r2.getUrl(resource.pdf.key, { expiresIn: 60 * 60 }),
    }
  const pages = await picturesOf(ctx, resource.pageImages)
  return {
    ok: true as const,
    title: resource.title,
    pages,
    pageCount: pages.length || (resource.sample ? 6 : 0),
  }
}

async function recordFirstOpen(
  ctx: MutationCtx,
  personId: Id<"persons">,
  resource: Doc<"resources">
) {
  const seen = await ctx.db
    .query("resourceOpens")
    .withIndex("by_personId_and_resourceId", (q) =>
      q.eq("personId", personId).eq("resourceId", resource._id)
    )
    .first()
  if (seen) return
  await ctx.db.insert("resourceOpens", {
    personId,
    resourceId: resource._id,
    at: Date.now(),
  })
  await ctx.db.insert("activities", {
    personId,
    kind: "resource_open",
    body: resource.title,
  })
}
