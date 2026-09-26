import { describe, expect, test } from "bun:test"

import {
  endOfTodayIst,
  fromIstDateInput,
  isDueIst,
  morningInIst,
  toIstDateInput,
} from "./ist"

// 22 Sep 2026, 11:00 PM IST = 17:30 UTC. Late evening is where UTC and IST
// disagree about which day it is.
const LATE_EVENING = Date.UTC(2026, 8, 22, 17, 30)

describe("IST day arithmetic", () => {
  test("today ends at IST midnight, not UTC midnight", () => {
    expect(endOfTodayIst(LATE_EVENING)).toBe(Date.UTC(2026, 8, 22, 18, 30))
  })

  test("due means before tomorrow in IST", () => {
    expect(isDueIst(LATE_EVENING + 60_000, LATE_EVENING)).toBe(true)
    expect(isDueIst(Date.UTC(2026, 8, 22, 18, 31), LATE_EVENING)).toBe(false)
    expect(isDueIst(undefined, LATE_EVENING)).toBe(false)
  })

  test("tomorrow morning is 10 AM IST on the next IST day", () => {
    expect(morningInIst(1, LATE_EVENING)).toBe(Date.UTC(2026, 8, 23, 4, 30))
  })

  test("date inputs round-trip through 10 AM IST", () => {
    expect(toIstDateInput(LATE_EVENING)).toBe("2026-09-22")
    expect(fromIstDateInput("2026-09-23")).toBe(Date.UTC(2026, 8, 23, 4, 30))
    expect(fromIstDateInput("")).toBeUndefined()
    expect(toIstDateInput(undefined)).toBe("")
  })
})
