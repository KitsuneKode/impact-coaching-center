import { describe, expect, test } from "bun:test"

import { mergePersonName } from "./persons"

describe("mergePersonName", () => {
  test("keeps the stored name when one already exists", () => {
    expect(mergePersonName("Rituparna Das", "R")).toBe("Rituparna Das")
  })

  test("adopts the incoming name when the stored one is empty", () => {
    expect(mergePersonName("", "Rituparna Das")).toBe("Rituparna Das")
  })

  test("adopts the incoming name when the stored one is only spaces", () => {
    expect(mergePersonName("   ", "Rituparna Das")).toBe("Rituparna Das")
  })

  test("trims the incoming name", () => {
    expect(mergePersonName("", "  Rituparna  ")).toBe("Rituparna")
  })
})
