import { describe, expect, test } from "bun:test"

import { isDevelopmentDeployment } from "./dev-deployment"

describe("isDevelopmentDeployment", () => {
  test("accepts a local backend", () => {
    expect(isDevelopmentDeployment("http://127.0.0.1:3211")).toBe(true)
    expect(isDevelopmentDeployment("http://localhost:3211")).toBe(true)
    expect(isDevelopmentDeployment("http://[::1]:3211")).toBe(true)
  })

  test("accepts the one named hosted development deployment", () => {
    expect(
      isDevelopmentDeployment("https://peaceful-emu-861.convex.site")
    ).toBe(true)
  })

  test("refuses every other hosted deployment, including the production one", () => {
    // The failure mode this guards: on production, CONVEX_SITE_URL is
    // production's own origin, so an env paste cannot open dev affordances.
    for (const origin of [
      "https://brave-otter-123.convex.site",
      "https://peaceful-emu-862.convex.site",
      "https://ict.in",
    ])
      expect(isDevelopmentDeployment(origin)).toBe(false)
  })

  test("refuses lookalike origins", () => {
    const cases: Array<string | undefined> = [
      "https://peaceful-emu-861.convex.site.evil.test",
      "https://evil.test/peaceful-emu-861.convex.site",
      "http://peaceful-emu-861.convex.site",
      "https://peaceful-emu-861.convex.site:8443",
      "https://user@peaceful-emu-861.convex.site",
      undefined,
      "garbage",
      "http://localhost.evil.test",
      "http://localhost@evil.test",
    ]
    for (const origin of cases)
      expect(isDevelopmentDeployment(origin)).toBe(false)
  })
})
