import { describe, expect, test } from "bun:test"

import type { Centre } from "./brand"
import { byDistance, directionsUrl, distanceKm } from "./centres"

const lakhimpur = { lat: 27.2381231, lng: 94.1028255 }
const dhemaji = { lat: 27.4833, lng: 94.5833 }
const centres: Centre[] = [
  {
    id: "a",
    town: "North Lakhimpur",
    main: true,
    at: { street: "", pin: "", maps: "", ...lakhimpur },
  },
  {
    id: "b",
    town: "Dhemaji",
    main: false,
    at: { street: "", pin: "", maps: "", ...dhemaji },
  },
  { id: "c", town: "Somewhere", main: false, at: null },
]

describe("centres", () => {
  test("distance is zero at the same point and about right between towns", () => {
    expect(distanceKm(lakhimpur, lakhimpur)).toBe(0)
    const km = distanceKm(lakhimpur, dhemaji)
    expect(km).toBeGreaterThan(45)
    expect(km).toBeLessThan(65)
  })

  test("orders located centres nearest first, unlocated ones last", () => {
    const nearDhemaji = { lat: 27.47, lng: 94.56 }
    const order = byDistance(centres, nearDhemaji).map((row) => row.centre.id)
    expect(order).toEqual(["b", "a", "c"])
    expect(byDistance(centres, nearDhemaji).at(-1)!.km).toBeNull()
  })

  test("directions point at the centre's coordinates", () => {
    expect(directionsUrl(lakhimpur)).toContain(
      "destination=27.2381231,94.1028255"
    )
  })
})
