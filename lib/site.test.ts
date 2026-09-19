import { describe, expect, test } from "bun:test"

import { resolveSiteUrl } from "./site"

describe("resolveSiteUrl", () => {
  test("prefers an explicit site URL", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://impactcareertutorials.in",
      })
    ).toBe("https://impactcareertutorials.in")
  })

  test("strips a trailing slash", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://ict.in/" })).toBe(
      "https://ict.in"
    )
  })

  test("falls back to localhost in development", () => {
    expect(resolveSiteUrl({ NODE_ENV: "development" })).toBe(
      "http://localhost:3000"
    )
  })

  test("falls back to localhost for a build that is not indexed", () => {
    expect(resolveSiteUrl({ NODE_ENV: "production" })).toBe(
      "http://localhost:3000"
    )
  })

  test("throws when an indexable build has no site URL", () => {
    expect(() => resolveSiteUrl({ SITE_INDEXABLE: "true" })).toThrow(
      /NEXT_PUBLIC_SITE_URL/
    )
  })

  test("throws for an indexable build even outside production", () => {
    // robots.ts keys off SITE_INDEXABLE alone, so this combination would
    // otherwise publish "index me" alongside localhost canonicals.
    expect(() =>
      resolveSiteUrl({ NODE_ENV: "development", SITE_INDEXABLE: "true" })
    ).toThrow(/NEXT_PUBLIC_SITE_URL/)
  })

  test("does not throw when an indexable build has one", () => {
    expect(
      resolveSiteUrl({
        NODE_ENV: "production",
        SITE_INDEXABLE: "true",
        NEXT_PUBLIC_SITE_URL: "https://impactcareertutorials.in",
      })
    ).toBe("https://impactcareertutorials.in")
  })

  test("strips only one trailing slash, since that is all a URL should carry", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://ict.in//" })).toBe(
      "https://ict.in/"
    )
  })

  test("an empty site URL is treated as unset", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "" })).toBe(
      "http://localhost:3000"
    )
  })

  test('SITE_INDEXABLE is exact: only "true" counts', () => {
    expect(resolveSiteUrl({ SITE_INDEXABLE: "TRUE" })).toBe(
      "http://localhost:3000"
    )
    expect(resolveSiteUrl({ SITE_INDEXABLE: "1" })).toBe(
      "http://localhost:3000"
    )
  })

  test("an entirely empty environment still yields a usable URL", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000")
  })
})
