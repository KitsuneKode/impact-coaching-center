import { describe, expect, test } from "bun:test"

import { nextStatuses } from "./order-status"

describe("the moves the order menu offers", () => {
  test("a paid order that was cancelled offers the owner its refund", () => {
    expect(nextStatuses("cancelled", true, "delivery", true)).toEqual([
      "refunded",
    ])
    expect(nextStatuses("cancelled", false, "delivery", true)).toEqual([])
  })

  test("an unpaid cancellation is the end of the road", () => {
    expect(nextStatuses("cancelled", true, "delivery")).toEqual([])
  })

  test("a collection order is never offered packing", () => {
    expect(nextStatuses("paid", false, "collection")).not.toContain("packed")
    expect(nextStatuses("paid", false, "delivery")).toContain("packed")
  })
})
