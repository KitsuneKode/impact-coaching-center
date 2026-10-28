"use server"

import { updateTag } from "next/cache"
import { after } from "next/server"

import { pingIndexNow } from "@/lib/indexnow"
import { CHANGED_PATHS, type SiteArea } from "@/lib/site-areas"

import { viewerCanRefreshSite } from "@/lib/auth-server"

/**
 * Show an admin's change on the public pages at once instead of within five
 * minutes. Only for people who may edit what the pages show; anyone else is
 * ignored, so the action cannot be used to empty the cache.
 */
export async function refreshSite(area: SiteArea) {
  const allowed = await viewerCanRefreshSite().catch(() => false)
  if (!allowed) return
  updateTag(area)
  // Tell search engines too, after the response, so the admin never waits.
  after(() => pingIndexNow(CHANGED_PATHS[area]))
}
