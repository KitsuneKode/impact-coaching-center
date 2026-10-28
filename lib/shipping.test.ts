import { describe, expect, test } from "bun:test"

import { lowestShipping, shippingFor, zoneOf } from "./shipping"

describe("shipping zones", () => {
  test("a PIN finds its zone", () => {
    expect(zoneOf("787001")).toBe("assam")
    expect(zoneOf("781005")).toBe("assam")
    expect(zoneOf("793001")).toBe("northeast") // Shillong
    expect(zoneOf("737101")).toBe("northeast") // Gangtok
    expect(zoneOf("110001")).toBe("india")
    expect(zoneOf("560001")).toBe("india")
  })

  test("what is not an Indian PIN has no zone", () => {
    for (const pin of ["", "78100", "7810011", "000001", "900001", "abc123"])
      expect(zoneOf(pin)).toBeNull()
  })

  test("a blank zone charges the Assam rate", () => {
    const rates = { assam: 6000, india: 9900 }
    expect(shippingFor("787001", rates)).toBe(6000)
    expect(shippingFor("793001", rates)).toBe(6000)
    expect(shippingFor("110001", rates)).toBe(9900)
    expect(shippingFor("900001", rates)).toBeNull()
    expect(lowestShipping(rates)).toBe(6000)
  })
})
