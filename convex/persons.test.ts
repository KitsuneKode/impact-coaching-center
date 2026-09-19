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

  test("keeps a stored name even when the incoming one is longer", () => {
    // Longer is not better: the first name we learned is the one the Person
    // gave us deliberately.
    expect(mergePersonName("Ritu", "Rituparna Das Choudhury")).toBe("Ritu")
  })

  test("returns empty when neither side has a name", () => {
    expect(mergePersonName("", "")).toBe("")
    expect(mergePersonName("   ", "   ")).toBe("")
  })

  test("does not trim a stored name it is keeping", () => {
    // Stored names are written trimmed; re-trimming here would hide a bug
    // rather than fix it.
    expect(mergePersonName("Ritu ", "Anything")).toBe("Ritu ")
  })

  test("preserves non-Latin names", () => {
    expect(mergePersonName("", "ৰিতুপৰ্ণা")).toBe("ৰিতুপৰ্ণা")
  })
})
