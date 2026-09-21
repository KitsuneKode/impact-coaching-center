import { describe, expect, test } from "bun:test"

import { safeReturnPath } from "./return-path"

describe("safeReturnPath", () => {
  test("keeps a path on this site", () => {
    expect(safeReturnPath("/admin/leads")).toBe("/admin/leads")
    expect(safeReturnPath("/courses?exam=jee#fees")).toBe(
      "/courses?exam=jee#fees"
    )
  })

  test("refuses a protocol-relative destination", () => {
    expect(safeReturnPath("//evil.example")).toBe("/")
  })

  test("refuses a backslash that a URL parser folds into a slash", () => {
    // The check this replaces accepted every one of these: each starts with a
    // single "/", and each resolves to another origin entirely.
    expect(safeReturnPath("/\\evil.example")).toBe("/")
    expect(safeReturnPath("/\\/evil.example")).toBe("/")
    expect(safeReturnPath("/\\\\evil.example")).toBe("/")
  })

  test("refuses an absolute URL", () => {
    expect(safeReturnPath("https://evil.example/x")).toBe("/")
    expect(safeReturnPath("javascript:alert(1)")).toBe("/")
  })

  test("refuses a repeated parameter rather than choosing one", () => {
    expect(safeReturnPath(["/admin/leads", "//evil.example"])).toBe("/")
    expect(safeReturnPath(["/admin/leads"])).toBe("/")
  })

  test("falls back when nothing was asked for", () => {
    expect(safeReturnPath(undefined)).toBe("/")
    expect(safeReturnPath("")).toBe("/")
  })

  test("honours a caller's own fallback", () => {
    expect(safeReturnPath("//evil.example", "/login")).toBe("/login")
  })
})
