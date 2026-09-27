import { describe, expect, test } from "bun:test"

import sitemap from "../app/sitemap"
import { libraryApproved } from "./library"
import { policies } from "./policies"

/**
 * A policy ICT has not signed off renders `noindex`, so listing it would ask
 * a crawler to fetch a page that tells it to go away. These are the only
 * routes allowed to exist on disk and be absent from the sitemap.
 */
const unapprovedPolicyRoutes = policies
  .filter((policy) => !policy.approved)
  .map((policy) => `/${policy.slug}`)

/**
 * Routes that set their own `noindex` and so must not be listed: a sitemap
 * entry asks a crawler to fetch a page that tells it to go away. Sign-in has
 * nothing worth ranking, and the leads inbox is staff-only.
 */
const noindexRoutes = [
  "/login",
  "/register",
  // A Person's own record. Nothing on it is public, and it says nothing a
  // stranger could act on, so there is nothing to rank.
  "/account",
  "/admin",
  "/admin/leads",
  "/admin/orders",
  "/admin/people",
  // Sample content, labelled as such and noindexed by its layout.
  "/preview",
  "/admin/books",
  "/admin/books/new",
  "/admin/resources",
  "/admin/resources/new",
  "/admin/blog",
  "/admin/blog/new",
  // A buyer's own order flow - nothing public, nothing to rank.
  "/checkout",
  // Noindexed while every title is a sample; list them once ICT's are in.
  "/books",
  "/resources",
  // Design concepts for review, noindexed by their layout.
  "/redesign",
  "/redesign/1",
  "/redesign/2",
  "/redesign/3",
  "/redesign/4",
  "/redesign/5",
  "/redesign/6",
  "/redesign/7",
]

/** Every route allowed to exist on disk and be absent from the sitemap. */
const draftRoutes = [
  ...unapprovedPolicyRoutes,
  ...(libraryApproved ? [] : ["/library"]),
  ...noindexRoutes,
]

/** Routes derived from the filesystem, not hand-listed. */
function staticRoutesOnDisk(): string[] {
  const glob = new Bun.Glob("app/**/page.tsx")
  return (
    [...glob.scanSync(".")]
      .map(
        (file) => "/" + file.replace(/^app\//, "").replace(/\/?page\.tsx$/, "")
      )
      .map((route) => (route === "/" ? "/" : route.replace(/\/$/, "")))
      .filter((route) => !route.includes("["))
      /*
       * Parallel-route slots (@authModal) and intercepting routes ((.)login) are
       * presentations of routes that already exist elsewhere in this list, not
       * separate pages.
       */
      .filter((route) => !route.includes("/@") && !route.includes("/(."))
  )
}

const pathnames = async () =>
  (await sitemap()).map((entry) => new URL(entry.url).pathname)

describe("sitemap", () => {
  test("lists every static page in the App Router tree", async () => {
    const expected = staticRoutesOnDisk()
      .filter((route) => !draftRoutes.includes(route))
      .sort()
    expect([...(await pathnames())].sort()).toEqual(
      expect.arrayContaining(expected)
    )
  })

  test("an unapproved policy is absent, an approved one is listed", async () => {
    // Both directions, so the gate cannot rot into "policies are never
    // listed" once ICT signs the wording off.
    const listed = await pathnames()
    for (const route of draftRoutes) expect(listed).not.toContain(route)
    for (const policy of policies.filter((p) => p.approved))
      expect(listed).toContain(`/${policy.slug}`)
  })

  test("the derivation found the routes we know exist", () => {
    // Guards the guard: a broken glob would make the test above vacuous.
    const routes = staticRoutesOnDisk()
    expect(routes).toContain("/")
    expect(routes).toContain("/courses")
    expect(routes).toContain("/success-stories")
  })

  test("lists the individual course pages", async () => {
    expect((await pathnames()).some((p) => p.startsWith("/courses/"))).toBe(
      true
    )
  })

  test("contains no duplicate entries", async () => {
    const urls = (await sitemap()).map((entry) => entry.url)
    expect(new Set(urls).size).toBe(urls.length)
  })

  test("every entry is an absolute URL", async () => {
    for (const entry of await sitemap()) {
      expect(() => new URL(entry.url)).not.toThrow()
    }
  })

  test("every entry carries a priority between 0 and 1", async () => {
    for (const entry of await sitemap()) {
      expect(entry.priority).toBeGreaterThan(0)
      expect(entry.priority).toBeLessThanOrEqual(1)
    }
  })
})
