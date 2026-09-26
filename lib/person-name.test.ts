import { describe, expect, test } from "bun:test"

import { cleanName, NAME_MAX } from "./person-name"

describe("cleanName", () => {
  test("keeps real names in any script, tidied", () => {
    expect(cleanName("  Anjali   Gogoi ")).toBe("Anjali Gogoi")
    expect(cleanName("Rituraj")).toBe("Rituraj")
    expect(cleanName("অনুপম বৰা")).toBe("অনুপম বৰা")
    expect(cleanName("M. K. Das")).toBe("M. K. Das")
  })

  test("drops invisible characters", () => {
    expect(cleanName("Ria​n\u0007a")).toBe("Riana")
  })

  test("refuses what is not a name", () => {
    expect(cleanName("")).toBeNull()
    expect(cleanName("   ")).toBeNull()
    expect(cleanName("98765 43210")).toBeNull()
    expect(cleanName("a".repeat(NAME_MAX + 1))).toBeNull()
  })
})
