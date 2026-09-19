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

  test("falls back to localhost for a production build that is not indexed", () => {
    expect(resolveSiteUrl({ NODE_ENV: "production" })).toBe(
      "http://localhost:3000"
    )
  })

  test("throws when an indexable production build has no site URL", () => {
    expect(() =>
      resolveSiteUrl({ NODE_ENV: "production", SITE_INDEXABLE: "true" })
    ).toThrow(/NEXT_PUBLIC_SITE_URL/)
  })

  test("does not throw when an indexable production build has one", () => {
    expect(
      resolveSiteUrl({
        NODE_ENV: "production",
        SITE_INDEXABLE: "true",
        NEXT_PUBLIC_SITE_URL: "https://impactcareertutorials.in",
      })
    ).toBe("https://impactcareertutorials.in")
  })
})
