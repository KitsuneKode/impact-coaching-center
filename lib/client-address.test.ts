import { describe, expect, test } from "bun:test"

import { parseClientAddress } from "./client-address"

describe("parseClientAddress", () => {
  test("takes the leftmost entry of a forwarded chain", () => {
    expect(parseClientAddress("203.0.113.4, 70.41.3.18")).toBe("203.0.113.4")
  })
  test("accepts a bare address and trims it", () => {
    expect(parseClientAddress("  203.0.113.4  ")).toBe("203.0.113.4")
  })
  test("accepts IPv6", () => {
    expect(parseClientAddress("2001:db8::1")).toBe("2001:db8::1")
  })
  test("treats a missing header as no address", () => {
    expect(parseClientAddress(null)).toBeNull()
    expect(parseClientAddress(undefined)).toBeNull()
    expect(parseClientAddress("")).toBeNull()
  })
  test("refuses anything that is not an address", () => {
    // Each of these would otherwise become its own rate-limit bucket.
    for (const junk of [
      "not-an-ip",
      "localhost",
      "1.2.3",
      "1.2.3.4.5",
      "256.1.1.1",
      "999.999.999.999",
      "<script>",
      "203.0.113.4; DROP",
    ])
      expect(parseClientAddress(junk)).toBeNull()
  })
  test("refuses an address long enough to bloat a key", () => {
    expect(parseClientAddress("2001:db8::1".padEnd(200, "0"))).toBeNull()
  })
  test("does not split one address into several buckets", () => {
    // Leading zeros would alias to a different key for the same host.
    expect(parseClientAddress("01.2.3.4")).toBeNull()
  })
})
