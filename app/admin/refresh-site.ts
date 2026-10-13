"use server"

import { updateTag } from "next/cache"

import { viewerCanRefreshSite } from "@/lib/auth-server"

/** The cached reads behind the public pages (lib/catalog-server.ts). */
export type SiteArea = "catalog" | "blog" | "courses" | "calendar"

/**
 * Show an admin's change on the public pages at once instead of within five
 * minutes. Only for people who may edit what the pages show; anyone else is
 * ignored, so the action cannot be used to empty the cache.
 */
export async function refreshSite(area: SiteArea) {
  const allowed = await viewerCanRefreshSite().catch(() => false)
  if (allowed) updateTag(area)
}
