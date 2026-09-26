import { describe, expect, test } from "bun:test"

import { isDevelopmentDeployment } from "./dev-deployment"

describe("isDevelopmentDeployment", () => {
  test("accepts a local backend without a name", () => {
    expect(isDevelopmentDeployment("http://127.0.0.1:3211")).toBe(true)
    expect(isDevelopmentDeployment("http://localhost:3211")).toBe(true)
    expect(isDevelopmentDeployment("http://[::1]:3211")).toBe(true)
  })

  test("accepts a hosted deployment only under its own name", () => {
    expect(
      isDevelopmentDeployment(
        "https://peaceful-emu-861.convex.site",
        "peaceful-emu-861"
      )
    ).toBe(true)
  })

  test("refuses a hosted deployment the name does not belong to", () => {
    // The production failure mode: the variable copied to another deployment.
    expect(
      isDevelopmentDeployment(
        "https://brave-otter-123.convex.site",
        "peaceful-emu-861"
      )
    ).toBe(false)
  })

  test("refuses a hosted deployment with no name set", () => {
    for (const name of [undefined, "", "  "])
      expect(
        isDevelopmentDeployment("https://peaceful-emu-861.convex.site", name)
      ).toBe(false)
  })

  test("refuses lookalike origins and malformed names", () => {
    const cases: [string | undefined, string][] = [
      ["https://peaceful-emu-861.convex.site.evil.test", "peaceful-emu-861"],
      ["https://evil.test/peaceful-emu-861.convex.site", "peaceful-emu-861"],
      ["http://peaceful-emu-861.convex.site", "peaceful-emu-861"],
      ["https://peaceful-emu-861.convex.site:8443", "peaceful-emu-861"],
      ["https://user@peaceful-emu-861.convex.site", "peaceful-emu-861"],
      ["https://x.convex.site", "x"],
      ["https://a-b-1.convex.site", "a-b-1.convex.site"],
      [undefined, "peaceful-emu-861"],
      ["garbage", "peaceful-emu-861"],
      ["http://localhost.evil.test", ""],
      ["http://localhost@evil.test", ""],
    ]
    for (const [origin, name] of cases)
      expect(isDevelopmentDeployment(origin, name)).toBe(false)
  })
})
