import { describe, expect, test } from "bun:test"

import { searchScore } from "./search-match"

describe("searchScore", () => {
  test("no letter-scatter matches", () => {
    expect(
      searchScore("VICTOR 8.0", "apsc", [
        "The ADRE/Assam Police SI & Govt. Exams",
      ])
    ).toBe(0)
  })

  test("a title that starts with the query ranks above one that only contains it", () => {
    const starts = searchScore("APSC Prelims GS paper", "apsc")
    const contains = searchScore("Lakhya 2027", "apsc", ["APSC"])
    expect(starts).toBeGreaterThan(contains)
    expect(contains).toBeGreaterThan(0)
  })

  test("every word must appear, in any order", () => {
    expect(
      searchScore("Assam Police Sub-Inspector", "inspector police")
    ).toBeGreaterThan(0)
    expect(searchScore("Assam Police Sub-Inspector", "police bank")).toBe(0)
  })

  test("Assamese text matches Assamese queries", () => {
    expect(searchScore("পৰীক্ষাৰ কেলেণ্ডাৰ", "কেলেণ্ডাৰ")).toBeGreaterThan(0)
    expect(searchScore("অসম আৰক্ষী", "আৰক্ষী")).toBeGreaterThan(0)
  })

  test("an English keyword finds an Assamese title", () => {
    expect(
      searchScore("কিতাপৰ সংকলন", "foundation", ["APSC Foundation Set"])
    ).toBeGreaterThan(0)
  })
})
