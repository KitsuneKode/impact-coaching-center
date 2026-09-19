import { describe, expect, test } from "bun:test"

import { parseTrustedOrigins, requireEnv } from "./env"

describe("requireEnv", () => {
  test("returns a set value", () => {
    expect(requireEnv("SITE_URL", "https://ict.in")).toBe("https://ict.in")
  })

  test("names the missing variable when it is undefined", () => {
    // The whole point: the downstream failure never names the variable.
    expect(() => requireEnv("SITE_URL", undefined)).toThrow(/SITE_URL/)
  })

  test("treats an empty string as missing", () => {
    // `FOO=` in a .env file yields "", which would otherwise sail through and
    // become an empty CORS allowlist.
    expect(() => requireEnv("SITE_URL", "")).toThrow(/SITE_URL/)
  })

  test("accepts a value that is only whitespace, and says so by not throwing", () => {
    // Deliberately not trimmed: a space-padded URL is a configuration
    // mistake this helper cannot distinguish from a deliberate value, and
    // silently rejecting it would be its own surprise.
    expect(requireEnv("SITE_URL", " ")).toBe(" ")
  })
})

describe("parseTrustedOrigins", () => {
  test("accepts a single origin", () => {
    expect(parseTrustedOrigins("https://ict.in")).toEqual(["https://ict.in"])
  })

  test("splits a comma-separated list", () => {
    expect(
      parseTrustedOrigins("http://localhost:3000,https://preview.vercel.app")
    ).toEqual(["http://localhost:3000", "https://preview.vercel.app"])
  })

  test("trims whitespace around entries", () => {
    expect(parseTrustedOrigins(" https://a.in , https://b.in ")).toEqual([
      "https://a.in",
      "https://b.in",
    ])
  })

  test("drops empty entries so a trailing comma cannot widen trust", () => {
    expect(parseTrustedOrigins("https://ict.in,")).toEqual(["https://ict.in"])
    expect(parseTrustedOrigins("https://a.in,,https://b.in")).toEqual([
      "https://a.in",
      "https://b.in",
    ])
  })

  test("refuses a value that yields no origin at all", () => {
    expect(() => parseTrustedOrigins(",,")).toThrow(/empty trusted-origin/i)
    expect(() => parseTrustedOrigins("   ")).toThrow(/empty trusted-origin/i)
  })
})
