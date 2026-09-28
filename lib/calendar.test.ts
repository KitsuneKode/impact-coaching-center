import { describe, expect, test } from "bun:test"

import {
  byMonth,
  CALENDAR_EXAMS,
  checkExamDate,
  daysBefore,
  isIsoDate,
  splitCalendar,
  todayIst,
  type ExamDate,
  type ExamDateInput,
} from "./calendar"
import { exams } from "./exams"

const input: ExamDateInput = {
  exam: "apsc",
  kind: "exam",
  title: "  CCE   Prelims 2026 ",
  titleAs: "",
  starts: "2026-12-06",
  ends: "",
  tentative: false,
  source: "https://apsc.nic.in/cce.html",
}

describe("checking a date", () => {
  test("tidies the title and accepts a single day", () => {
    const checked = checkExamDate(input)
    expect(checked).toEqual({
      ok: true,
      value: { ...input, title: "CCE Prelims 2026" },
    })
  })

  test("names the field that is wrong", () => {
    expect(checkExamDate({ ...input, title: " " })).toEqual({
      ok: false,
      field: "title",
    })
    expect(checkExamDate({ ...input, starts: "2026-02-30" })).toEqual({
      ok: false,
      field: "starts",
    })
    expect(checkExamDate({ ...input, ends: "2026-12-01" })).toEqual({
      ok: false,
      field: "ends",
    })
    expect(checkExamDate({ ...input, source: "apsc.nic.in/cce.html" })).toEqual(
      {
        ok: false,
        field: "source",
      }
    )
    expect(checkExamDate({ ...input, source: "" })).toEqual({
      ok: false,
      field: "source",
    })
  })

  test("a window may close the day it opens", () => {
    expect(checkExamDate({ ...input, ends: input.starts }).ok).toBe(true)
  })

  test("only real days pass", () => {
    expect(isIsoDate("2028-02-29")).toBe(true)
    expect(isIsoDate("2027-02-29")).toBe(false)
    expect(isIsoDate("6/12/2026")).toBe(false)
  })
})

describe("the calendar", () => {
  const date = (starts: string, ends?: string): ExamDate => ({
    exam: "adre",
    kind: "applications",
    title: starts,
    starts,
    ends,
    tentative: false,
    source: "https://example.gov.in",
  })

  test("an open window stays upcoming until the day it closes", () => {
    const { upcoming, recent } = splitCalendar(
      [
        date("2026-10-15"),
        date("2026-09-01", "2026-09-28"),
        date("2026-09-01", "2026-09-27"),
        date("2026-08-01"),
      ],
      "2026-09-28"
    )
    expect(upcoming.map((d) => d.title)).toEqual(["2026-09-01", "2026-10-15"])
    expect(recent.map((d) => d.ends ?? d.starts)).toEqual([
      "2026-09-27",
      "2026-08-01",
    ])
  })

  test("groups by the month a date starts in", () => {
    const months = byMonth([
      date("2026-10-02"),
      date("2026-10-20"),
      date("2026-11-01"),
    ])
    expect(months.map(([key, list]) => [key, list.length])).toEqual([
      ["2026-10", 2],
      ["2026-11", 1],
    ])
  })

  test("today is the IST day, not the UTC one", () => {
    // 20:00 UTC on 27 Sep is 01:30 on 28 Sep in Assam.
    expect(todayIst(Date.UTC(2026, 8, 27, 20, 0))).toBe("2026-09-28")
    expect(daysBefore("2026-03-01", 1)).toBe("2026-02-28")
  })

  test("covers every exam guide, so each guide can list its dates", () => {
    expect([...CALENDAR_EXAMS].sort()).toEqual(
      exams.map((exam) => exam.slug).sort()
    )
  })
})
