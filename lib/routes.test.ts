import { describe, expect, test } from "bun:test"

import sitemap from "../app/sitemap"

describe("sitemap", () => {
  test("lists every indexable top-level route", () => {
    const urls = sitemap().map((entry) => new URL(entry.url).pathname)
    // /success-stories sets its own canonical but was absent from the sitemap,
    // so nothing pointed crawlers at it.
    expect(urls).toContain("/success-stories")
    expect(urls).toContain("/courses")
    expect(urls).toContain("/")
  })

  test("lists the individual course pages", () => {
    const urls = sitemap().map((entry) => new URL(entry.url).pathname)
    expect(urls.some((p) => p.startsWith("/courses/"))).toBe(true)
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
})
