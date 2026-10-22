import { describe, expect, test } from "bun:test"

import { UNCLAIMED_AFTER_MS, unclaimedKeys } from "./files"

const now = Date.parse("2026-10-22T12:00:00Z")
const old = new Date(now - UNCLAIMED_AFTER_MS - 60_000).toISOString()
const fresh = new Date(now - 60_000).toISOString()

describe("unclaimedKeys", () => {
  test("deletes only old uploads no resource points at", () => {
    const objects = [
      { key: "claimed-old", lastModified: old },
      { key: "abandoned", lastModified: old },
      { key: "still-being-edited", lastModified: fresh },
      { key: "no-date", lastModified: "not a date" },
    ]
    expect(unclaimedKeys(objects, new Set(["claimed-old"]), now)).toEqual([
      "abandoned",
    ])
  })
})
