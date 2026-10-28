import { R2 } from "@convex-dev/r2"
import { type Infer, v } from "convex/values"

import { requireGrant } from "./authz"
import { deleteStoredImage, filesInUse } from "./catalogAdmin"
import { components, internal } from "./_generated/api"
import type { DataModel, Id } from "./_generated/dataModel"
import { internalMutation, type MutationCtx, query } from "./_generated/server"
import { PDF_DOCUMENT } from "./schema"

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

/** How long a file a save dropped can still be put back. */
export const RESTORE_FOR_MS = 30 * 24 * 60 * 60 * 1000

type Owner = { table: string; id: string }
type PdfDocument = Infer<typeof PDF_DOCUMENT>

/**
 * Hand images a save stopped using to the sweep instead of deleting them:
 * another record may share one, and an editor may want it back.
 */
export async function releaseImages(
  ctx: MutationCtx,
  ids: readonly Id<"_storage">[],
  owner: Owner
) {
  const now = Date.now()
  await Promise.all(
    ids.map((image) =>
      ctx.db.insert("releasedFiles", { owner, image, releasedAt: now })
    )
  )
}

/** The same for a replaced or removed PDF, with its page-one preview. */
export async function releasePdf(
  ctx: MutationCtx,
  pdf: PdfDocument,
  owner: Owner,
  cover?: Id<"_storage">
) {
  await ctx.db.insert("releasedFiles", {
    owner,
    pdf,
    cover,
    releasedAt: Date.now(),
  })
}

/** A save points at these again (a restore): they are not to be swept. */
export async function reclaim(
  ctx: MutationCtx,
  files: { images?: readonly Id<"_storage">[]; pdfKey?: string }
) {
  const rows = await Promise.all([
    ...(files.images ?? []).map((image) =>
      ctx.db
        .query("releasedFiles")
        .withIndex("by_image", (q) => q.eq("image", image))
        .take(10)
    ),
    ...(files.pdfKey
      ? [
          ctx.db
            .query("releasedFiles")
            .withIndex("by_pdfKey", (q) => q.eq("pdf.key", files.pdfKey!))
            .take(10),
        ]
      : []),
  ])
  await Promise.all(rows.flat().map((row) => ctx.db.delete(row._id)))
}

/** The PDF a resource had before, while it can still be put back. */
export const previousPdf = query({
  args: { resourceId: v.id("resources"), now: v.number() },
  returns: v.union(
    v.null(),
    v.object({
      pdf: PDF_DOCUMENT,
      cover: v.optional(v.id("_storage")),
      releasedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const editor = await requireGrant(ctx, ["catalog"])
    if (!editor.ok) return null
    const rows = await ctx.db
      .query("releasedFiles")
      .withIndex("by_owner_and_releasedAt", (q) =>
        q
          .eq("owner.table", "resources")
          .eq("owner.id", args.resourceId)
          .gt("releasedAt", args.now - RESTORE_FOR_MS)
      )
      .order("desc")
      .take(5)
    const latest = rows.find((row) => row.pdf)
    return latest?.pdf
      ? { pdf: latest.pdf, cover: latest.cover, releasedAt: latest.releasedAt }
      : null
  },
})

/**
 * Weekly: delete released files past their restore window that nothing
 * points at, then read the bucket for uploads no save ever claimed (an
 * editor closed without saving). Released rows are read by index, so the
 * catalogue is scanned once per pass, not once per file.
 */
export const sweep = internalMutation({
  args: {},
  returns: v.object({ deleted: v.number() }),
  handler: async (ctx) => {
    const expired = await ctx.db
      .query("releasedFiles")
      .withIndex("by_releasedAt", (q) =>
        q.lt("releasedAt", Date.now() - RESTORE_FOR_MS)
      )
      .take(SWEEP_BATCH)
    let deleted = 0
    if (expired.length > 0) {
      const inUse = await filesInUse(ctx)
      // One file can be released twice (released, restored, released).
      const gone = new Set<string>()
      for (const row of expired) {
        for (const image of [row.image, row.cover])
          if (image && !gone.has(image) && !inUse(image)) {
            gone.add(image)
            if (await ctx.db.system.get("_storage", image)) {
              await deleteStoredImage(ctx, image)
              deleted += 1
            }
          }
        const key = row.pdf?.key
        if (key && !gone.has(key)) {
          gone.add(key)
          const used = await ctx.db
            .query("resources")
            .withIndex("by_pdfKey", (q) => q.eq("pdf.key", key))
            .first()
          if (!used) {
            await r2.deleteObject(ctx, key)
            deleted += 1
          }
        }
        await ctx.db.delete(row._id)
      }
    }
    if (expired.length === SWEEP_BATCH)
      await ctx.scheduler.runAfter(0, internal.files.sweep, {})
    else
      await ctx.scheduler.runAfter(0, internal.files.sweepUnclaimed, {
        cursor: null,
      })
    return { deleted }
  },
})

/**
 * Deletes PDFs nothing points at or holds for restoring: uploads whose
 * editor was closed without saving. Two days' grace covers an editor left
 * open overnight. A page at a time, until the bucket is read.
 */
export const sweepUnclaimed = internalMutation({
  args: { cursor: v.union(v.string(), v.null()) },
  returns: v.object({ deleted: v.number() }),
  handler: async (ctx, args) => {
    const page = await r2.listMetadata(ctx, SWEEP_BATCH, args.cursor)
    const claimed = new Set<string>()
    await Promise.all(
      page.page.map(async (object) => {
        const [resource, released] = await Promise.all([
          ctx.db
            .query("resources")
            .withIndex("by_pdfKey", (q) => q.eq("pdf.key", object.key))
            .first(),
          ctx.db
            .query("releasedFiles")
            .withIndex("by_pdfKey", (q) => q.eq("pdf.key", object.key))
            .first(),
        ])
        if (resource || released) claimed.add(object.key)
      })
    )
    const unclaimed = unclaimedKeys(page.page, claimed, Date.now())
    for (const key of unclaimed) await r2.deleteObject(ctx, key)
    if (!page.isDone)
      await ctx.scheduler.runAfter(0, internal.files.sweepUnclaimed, {
        cursor: page.continueCursor,
      })
    return { deleted: unclaimed.length }
  },
})
