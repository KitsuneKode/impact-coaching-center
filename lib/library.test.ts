import { describe, expect, test } from "bun:test"

import { libraryTerms, termPrice } from "./library"

/* The poster's own totals, so a typo in a rate shows up here. */
describe("library terms", () => {
  test("totals match ICT's poster", () => {
    const totals = libraryTerms.map((term) => [
      term.months,
      termPrice(term, "half").total,
      termPrice(term, "full").total,
    ])
    expect(totals).toEqual([
      [1, 1000, 1500],
      [3, 2400, 3600],
      [6, 3600, 6000],
    ])
  })

  test("savings are against paying monthly, and nothing for a month", () => {
    const six = libraryTerms.find((term) => term.months === 6)!
    expect(termPrice(six, "half").saves).toBe(2400)
    expect(termPrice(six, "full").saves).toBe(3000)
    expect(termPrice(libraryTerms[0]!, "full").saves).toBe(0)
  })

  test("only the six-month term is marked best value", () => {
    expect(
      libraryTerms.filter((term) => term.bestValue).map((t) => t.months)
    ).toEqual([6])
  })
})
