"use server"

import { updateTag } from "next/cache"
import { after } from "next/server"

import { pingIndexNow } from "@/lib/indexnow"

import { viewerCanRefreshSite } from "@/lib/auth-server"

/** The cached reads behind the public pages (lib/catalog-server.ts). */
export type SiteArea = "catalog" | "blog" | "courses" | "calendar" | "campaigns"

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
  after(() => pingIndexNow(CHANGED[area]))
}

/** The listing pages an area's change shows up on. */
const CHANGED: Record<SiteArea, string[]> = {
  catalog: ["/books", "/resources", "/"],
  blog: ["/blog"],
  courses: ["/courses", "/"],
  calendar: ["/exams/calendar"],
  campaigns: [],
}
