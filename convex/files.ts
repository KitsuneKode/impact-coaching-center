import { R2 } from "@convex-dev/r2"
import { v } from "convex/values"

import { requireGrant } from "./authz"
import { components } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import { query } from "./_generated/server"

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
