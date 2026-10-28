/** The cached reads behind the public pages (lib/catalog-server.ts). */
export const SITE_AREAS = [
  "catalog",
  "blog",
  "courses",
  "calendar",
  "campaigns",
] as const
export type SiteArea = (typeof SITE_AREAS)[number]

export const isSiteArea = (value: unknown): value is SiteArea =>
  (SITE_AREAS as readonly unknown[]).includes(value)

/** The listing pages an area's change shows up on, for IndexNow. */
export const CHANGED_PATHS: Record<SiteArea, string[]> = {
  catalog: ["/books", "/resources", "/"],
  blog: ["/blog"],
  courses: ["/courses", "/"],
  calendar: ["/exams/calendar"],
  campaigns: [],
}
