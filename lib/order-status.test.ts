import { describe, expect, test } from "bun:test"

import { nextStatuses } from "./order-status"

describe("the moves the order menu offers", () => {
  test("a paid order that was cancelled offers the owner its refund", () => {
    expect(nextStatuses("cancelled", true, "delivery", true)).toEqual([
      "refunded",
    ])
    expect(nextStatuses("cancelled", false, "delivery", true)).toEqual([])
  })

  test("a cancellation with no money held goes nowhere", () => {
    expect(nextStatuses("cancelled", true, "delivery")).toEqual([])
  })

  test("parcels ship and collections are handed over", () => {
    expect(nextStatuses("paid", false, "delivery")).toEqual(["shipped"])
    expect(nextStatuses("paid", false, "collection")).toEqual([
      "ready_for_collection",
    ])
  })

  test("only the owner can cancel a paid order", () => {
    expect(nextStatuses("paid", false, "delivery")).not.toContain("cancelled")
    expect(nextStatuses("paid", true, "delivery")).toContain("cancelled")
  })

  test("a parcel on its way can only arrive", () => {
    expect(nextStatuses("shipped", true, "delivery")).toEqual(["delivered"])
  })
})
