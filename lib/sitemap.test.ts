import { describe, expect, test } from "bun:test"

import sitemap from "../app/sitemap"

/**
 * Routes derived from the filesystem, not hand-listed.
 *
 * /success-stories declared its own canonical and was simply absent from the
 * sitemap. A test that hardcodes the routes it expects would not have caught
 * that, and would not catch the next page added the same way - so the
 * expectation is computed from the App Router tree instead.
 */
function staticRoutesOnDisk(): string[] {
  const glob = new Bun.Glob("app/**/page.tsx")
  return [...glob.scanSync(".")]
    .map(
      (file) => "/" + file.replace(/^app\//, "").replace(/\/?page\.tsx$/, "")
    )
    .map((route) => (route === "/" ? "/" : route.replace(/\/$/, "")))
    .filter((route) => !route.includes("["))
}

const pathnames = () => sitemap().map((entry) => new URL(entry.url).pathname)

describe("sitemap", () => {
  test("lists every static page in the App Router tree", () => {
    expect([...pathnames()].sort()).toEqual(
      expect.arrayContaining(staticRoutesOnDisk().sort())
    )
  })

  test("the derivation found the routes we know exist", () => {
    // Guards the guard: a broken glob would make the test above vacuous.
    const routes = staticRoutesOnDisk()
    expect(routes).toContain("/")
    expect(routes).toContain("/courses")
    expect(routes).toContain("/success-stories")
  })

  test("lists the individual course pages", () => {
    expect(pathnames().some((p) => p.startsWith("/courses/"))).toBe(true)
  })

  test("contains no duplicate entries", () => {
    const urls = sitemap().map((entry) => entry.url)
    expect(new Set(urls).size).toBe(urls.length)
  })

  test("every entry is an absolute URL", () => {
    for (const entry of sitemap()) {
      expect(() => new URL(entry.url)).not.toThrow()
    }
  })

  test("every entry carries a priority between 0 and 1", () => {
    for (const entry of sitemap()) {
      expect(entry.priority).toBeGreaterThan(0)
      expect(entry.priority).toBeLessThanOrEqual(1)
    }
  })
})
