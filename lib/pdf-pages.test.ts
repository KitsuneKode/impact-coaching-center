import { describe, expect, test } from "bun:test"

import { PAGE_WIDTH, renderScale } from "./pdf-pages"

describe("renderScale", () => {
  test("an A4 page renders at the full width", () => {
    // A4 at 72 dpi: 595 x 842 points.
    expect(595 * renderScale(595, 842, PAGE_WIDTH)).toBeCloseTo(PAGE_WIDTH)
  })

  test("a very tall page is drawn smaller, within the iOS canvas cap", () => {
    const scale = renderScale(595, 20_000, PAGE_WIDTH)
    expect(595 * scale).toBeLessThan(PAGE_WIDTH)
    // The canvas is whole pixels; iOS refuses anything over 16,777,216.
    const pixels = Math.ceil(595 * scale) * Math.ceil(20_000 * scale)
    expect(pixels).toBeLessThanOrEqual(16_777_216)
  })

  test("a page with no size falls back to its own scale", () => {
    expect(renderScale(0, 842, PAGE_WIDTH)).toBe(1)
  })
})
