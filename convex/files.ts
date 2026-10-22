import { R2 } from "@convex-dev/r2"
import { v } from "convex/values"

import { requireGrant } from "./authz"
import { components, internal } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import { internalMutation, query } from "./_generated/server"

/**
 * Documents (PDFs) live in Cloudflare R2 through Convex's R2 component; images
 * stay in Convex storage. R2 has no egress fees, which matters for long PDFs
 * read by many students. Configured by R2_ENDPOINT, R2_BUCKET,
 * R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_TOKEN on the deployment
 * (docs/production.md). Locally any S3-compatible server works.
 */
export const r2 = new R2(components.r2)

/** Anyone who edits something with documents: the shop, promotions, the blog. */
const UPLOAD_GRANTS = ["catalog", "promotions", "content"] as const

export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: async (ctx) => {
    const editor = await requireGrant(ctx, UPLOAD_GRANTS)
    if (!editor.ok) throw new Error("Not allowed to upload documents.")
  },
})

/** Whether R2 is configured here; without it the admin rasterises PDFs into images instead. */
export const r2Ready = query({
  args: {},
  returns: v.boolean(),
  handler: async () =>
    Boolean(
      process.env.R2_ENDPOINT &&
      process.env.R2_BUCKET &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY
    ),
})

/** PDFs are capped at 60 MB: a scanned 300-page book fits, a stray video does not. */
export const PDF_MAX_BYTES = 60 * 1024 * 1024

/** An upload no resource has claimed after this long was abandoned. */
export const UNCLAIMED_AFTER_MS = 2 * 24 * 60 * 60 * 1000

/**
 * The objects safe to delete: no resource points at them and they are older
 * than the grace period. An unreadable date keeps the object.
 */
export function unclaimedKeys(
  objects: readonly { key: string; lastModified: string }[],
  claimed: ReadonlySet<string>,
  now: number
): string[] {
  return objects
    .filter((object) => {
      const modified = Date.parse(object.lastModified)
      return (
        !claimed.has(object.key) &&
        Number.isFinite(modified) &&
        modified < now - UNCLAIMED_AFTER_MS
      )
    })
    .map((object) => object.key)
}
const SWEEP_BATCH = 100

/**
 * Deletes PDFs no resource points at: uploads whose editor was closed
 * without saving. Replacing or removing a PDF on a saved resource already
 * deletes the old one (catalogAdmin). Two days' grace covers an editor left
 * open overnight. A page at a time, continuing until the bucket is read.
 */
export const sweepDocuments = internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())) },
  returns: v.object({ deleted: v.number() }),
  handler: async (ctx, args) => {
    const page = await r2.listMetadata(ctx, SWEEP_BATCH, args.cursor ?? null)
    const claimed = new Set<string>()
    for await (const resource of ctx.db.query("resources"))
      if (resource.pdf) claimed.add(resource.pdf.key)
    const unclaimed = unclaimedKeys(page.page, claimed, Date.now())
    for (const key of unclaimed) await r2.deleteObject(ctx, key)
    if (!page.isDone)
      await ctx.scheduler.runAfter(0, internal.files.sweepDocuments, {
        cursor: page.continueCursor,
      })
    return { deleted: unclaimed.length }
  },
})
