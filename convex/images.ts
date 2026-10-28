import { v } from "convex/values"

import type { Picture } from "../lib/catalog"
import { IMAGE_MAX_BYTES } from "../lib/catalog"
import { invalidInput, mutationResult, requireStaff } from "./authz"
import type { Id } from "./_generated/dataModel"
import { mutation, type QueryCtx } from "./_generated/server"

/** Validator for `Picture`, for returns. */
export const PICTURE = v.object({
  url: v.string(),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  blurDataUrl: v.optional(v.string()),
})

/** A stored image with its size, or null when the file is gone. */
export async function pictureOf(
  ctx: Pick<QueryCtx, "db" | "storage">,
  storageId: Id<"_storage"> | undefined
): Promise<Picture | null> {
  if (!storageId) return null
  const url = await ctx.storage.getUrl(storageId)
  if (!url) return null
  const meta = await ctx.db
    .query("images")
    .withIndex("by_storageId", (q) => q.eq("storageId", storageId))
    .first()
  return meta
    ? {
        url,
        width: meta.width,
        height: meta.height,
        blurDataUrl: meta.blurDataUrl,
      }
    : { url }
}

/** Every picture that still exists, in order. */
export async function picturesOf(
  ctx: Pick<QueryCtx, "db" | "storage">,
  ids: readonly Id<"_storage">[]
): Promise<Picture[]> {
  const found = await Promise.all(ids.map((id) => pictureOf(ctx, id)))
  return found.filter((picture): picture is Picture => picture !== null)
}

/** Placeholders are inlined in pages, so they must stay tiny. */
const BLUR_MAX_CHARS = 2000

/**
 * Size and placeholder for an image staff just uploaded. The browser measures
 * it before upload; the file itself is checked here.
 */
export const recordImage = mutation({
  args: {
    storageId: v.id("_storage"),
    width: v.number(),
    height: v.number(),
    blurDataUrl: v.optional(v.string()),
  },
  returns: mutationResult({}),
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx)
    if (!staff.ok) return staff
    const file = await ctx.db.system.get("_storage", args.storageId)
    if (!file?.contentType?.startsWith("image/") || file.size > IMAGE_MAX_BYTES)
      return invalidInput("image")
    const sane = (n: number) => Number.isInteger(n) && n > 0 && n <= 20_000
    if (!sane(args.width) || !sane(args.height)) return invalidInput("size")
    if (
      args.blurDataUrl &&
      (!args.blurDataUrl.startsWith("data:image/") ||
        args.blurDataUrl.length > BLUR_MAX_CHARS)
    )
      return invalidInput("placeholder")

    const existing = await ctx.db
      .query("images")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .first()
    const meta = {
      width: args.width,
      height: args.height,
      blurDataUrl: args.blurDataUrl,
    }
    if (existing) await ctx.db.patch(existing._id, meta)
    else await ctx.db.insert("images", { storageId: args.storageId, ...meta })
    return { ok: true as const }
  },
})
