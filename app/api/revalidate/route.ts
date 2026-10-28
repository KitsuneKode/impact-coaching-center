import { revalidateTag } from "next/cache"
import { after } from "next/server"

import { secretsMatch } from "@/lib/env"
import { pingIndexNow } from "@/lib/indexnow"
import { CHANGED_PATHS, isSiteArea } from "@/lib/site-areas"

/**
 * Convex calls this when content changed without an admin on the site: the
 * six-hourly ClassPlus sync, or a promotion reaching its start or end time.
 * Only the pages that read the named areas are rebuilt, on their next visit.
 * Admin edits refresh through their own server action (app/admin/refresh-site.ts).
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET
  const given = request.headers.get("authorization") ?? ""
  if (!secret || !secretsMatch(given, `Bearer ${secret}`))
    return new Response(null, { status: 401 })
  let tags: unknown
  try {
    tags = ((await request.json()) as { tags?: unknown })?.tags
  } catch {
    return new Response(null, { status: 400 })
  }
  if (!Array.isArray(tags) || !tags.length || !tags.every(isSiteArea))
    return new Response(null, { status: 400 })
  const areas = [...new Set(tags)]
  for (const area of areas) revalidateTag(area, { expire: 0 })
  after(() => pingIndexNow(areas.flatMap((area) => CHANGED_PATHS[area])))
  return new Response(null, { status: 204 })
}
