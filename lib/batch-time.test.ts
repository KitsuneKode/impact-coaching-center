import { describe, expect, test } from "bun:test"

import { parseTiming, partOf } from "./batch-time"

describe("parseTiming", () => {
  test.each([
    ["12 to 2 PM", 12, 14],
    ["6 to 8 PM", 18, 20],
    ["8 to 10 AM", 8, 10],
    ["4 to 5:30 PM", 16, 17.5],
    ["11 AM to 1 PM", 11, 13],
    ["11 to 1 PM", 11, 13],
    ["10:00 AM - 12:00 PM", 10, 12],
    ["7–9 pm", 19, 21],
  ])("%s", (text, start, end) => {
    expect(parseTiming(text)).toEqual({ start, end })
  })

  test("leaves what is not a time range", () => {
    expect(parseTiming("Morning")).toBeNull()
    expect(parseTiming("Monday to Saturday")).toBeNull()
    expect(parseTiming(undefined)).toBeNull()
    expect(parseTiming("3 PM to 1 PM")).toBeNull()
  })
})

test("partOf", () => {
  expect(partOf(8)).toBe("morning")
  expect(partOf(12)).toBe("noon")
  expect(partOf(16)).toBe("afternoon")
  expect(partOf(18)).toBe("evening")
})
