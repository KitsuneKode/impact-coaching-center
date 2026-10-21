import { v } from "convex/values"

import { parseTrustedOrigins } from "../lib/env"
import { internal } from "./_generated/api"
import { internalAction, type MutationCtx } from "./_generated/server"

/** The cache tags the site's pages read under (lib/catalog-server.ts). */
export const SITE_TAG = v.union(
  v.literal("courses"),
  v.literal("catalog"),
  v.literal("blog"),
  v.literal("calendar"),
  v.literal("campaigns")
)
export type SiteTag = "courses" | "catalog" | "blog" | "calendar" | "campaigns"

/**
 * Tells the site which content changed, so only the pages that read it are
 * rebuilt, once, instead of every page on a timer. Called after the write
 * commits; a failed call only means the pages catch up on their fallback.
 */
export async function revalidateSite(
  ctx: Pick<MutationCtx, "scheduler">,
  tags: SiteTag[],
  at?: number
) {
  if (at === undefined)
    await ctx.scheduler.runAfter(0, internal.site.revalidate, { tags })
  else await ctx.scheduler.runAt(at, internal.site.revalidate, { tags })
}

export const revalidate = internalAction({
  args: { tags: v.array(SITE_TAG) },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const secret = process.env.REVALIDATE_SECRET
    const origins = process.env.SITE_URL
      ? parseTrustedOrigins(process.env.SITE_URL)
      : []
    if (!secret || !origins.length) return null
    await Promise.all(
      origins.map(async (origin) => {
        try {
          const response = await fetch(`${origin}/api/revalidate`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${secret}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({ tags: args.tags }),
          })
          if (!response.ok)
            console.warn(`[site] ${origin} revalidate: ${response.status}`)
        } catch {
          // A local origin is unreachable from a cloud deployment; that is fine.
        }
      })
    )
    return null
  },
})
