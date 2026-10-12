import { describe, expect, test } from "bun:test"

import { parseClientAddress } from "./client-address"

describe("parseClientAddress", () => {
  test("takes the rightmost entry of a forwarded chain", () => {
    // Each hop appends the peer it saw; the rightmost is the edge's view.
    expect(parseClientAddress("203.0.113.4, 70.41.3.18")).toBe("70.41.3.18")
  })
  test("a spoofed leading entry cannot move the bucket", () => {
    // Whatever the client claims to be, the appended hop is what counts.
    expect(parseClientAddress("1.1.1.1, 2.2.2.2, 203.0.113.4")).toBe(
      "203.0.113.4"
    )
  })
  test("skips a malformed tail to find the last real address", () => {
    expect(parseClientAddress("203.0.113.4, junk")).toBe("203.0.113.4")
    expect(parseClientAddress("junk, junk2")).toBeNull()
  })
  test("accepts a bare address and trims it", () => {
    expect(parseClientAddress("  203.0.113.4  ")).toBe("203.0.113.4")
  })
  test("accepts IPv6", () => {
    expect(parseClientAddress("2001:db8::1")).toBe("2001:db8::1")
  })

  test("one IPv6 address written several ways is one bucket", () => {
    // Validating without canonicalising gave each spelling its own
    // rate-limit key, so a caller could mint as many as they could spell.
    const spellings = [
      "2001:db8::1",
      "2001:0db8::1",
      "2001:DB8:0:0:0:0:0:1",
      "2001:0db8:0000:0000:0000:0000:0000:0001",
    ]
    const keys = new Set(spellings.map(parseClientAddress))
    expect(keys.size).toBe(1)
    expect([...keys][0]).toBe("2001:db8::1")
  })

  test("loopback spellings also collapse to one", () => {
    expect(parseClientAddress("::1")).toBe(
      parseClientAddress("0:0:0:0:0:0:0:1")
    )
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
