import { describe, expect, test } from "bun:test"

import {
  rankAll,
  recommend,
  startHour,
  timeOfDay,
  type FinderCourse,
} from "./course-finder"

const examOf = {
  apsc: "APSC",
  adre: "ADRE and Assam Police",
  banking: "Bank, SSC, Railway",
}

const course = (
  over: Partial<FinderCourse> & Pick<FinderCourse, "slug">
): FinderCourse => ({
  name: over.slug,
  short: over.slug,
  subtitle: "",
  free: false,
  price: 1000,
  ...over,
})

const courses: FinderCourse[] = [
  course({ slug: "lakhya", track: "APSC", timing: "12 to 2 PM", createdAt: 3 }),
  course({
    slug: "pragati",
    track: "APSC",
    subtitle: "The Working Professionals Batch",
    timing: "6 to 8 PM",
    createdAt: 2,
  }),
  course({
    slug: "arjuna",
    name: "ARJUNA Mains Mock Test Series",
    track: "APSC",
    createdAt: 4,
  }),
  course({
    slug: "kouxal",
    track: "APSC",
    free: true,
    price: 0,
    timing: "4 to 5:30 PM",
  }),
  course({
    slug: "victor-8",
    track: "ADRE and Assam Police",
    timing: "8 to 10 AM",
    createdAt: 5,
  }),
  course({
    slug: "victor-7",
    track: "ADRE and Assam Police",
    timing: "8 to 10 AM",
    createdAt: 1,
  }),
  course({
    slug: "abhigyan",
    track: "Bank, SSC, Railway",
    free: true,
    price: 0,
  }),
]

describe("startHour", () => {
  test("reads ICT's timings, where only the end carries AM or PM", () => {
    expect(startHour("8 to 10 AM")).toBe(8)
    expect(startHour("12 to 2 PM")).toBe(12)
    expect(startHour("6 to 8 PM")).toBe(18)
    expect(startHour("4 to 5:30 PM")).toBe(16)
    expect(startHour("10 to 12 PM")).toBe(10)
    expect(startHour("11 to 1 PM")).toBe(11)
    expect(startHour("9 PM to 11 PM")).toBe(21)
    expect(startHour("Ask us")).toBeUndefined()
    expect(startHour(undefined)).toBeUndefined()
  })

  test("buckets the day", () => {
    expect(timeOfDay("8 to 10 AM")).toBe("morning")
    expect(timeOfDay("12 to 2 PM")).toBe("day")
    expect(timeOfDay("6 to 8 PM")).toBe("evening")
  })
})

describe("recommend", () => {
  test("an exam narrows to its courses, the main batch first", () => {
    const [best, ...rest] = recommend(
      courses,
      { exam: "apsc", stage: "starting", time: "day" },
      examOf
    )
    expect(best?.course.slug).toBe("lakhya")
    expect(best?.reasons).toContain("time")
    expect(rest.every((pick) => pick.course.track === "APSC")).toBe(true)
  })

  test("evenings lead a working person to the working professionals batch", () => {
    const [best] = recommend(
      courses,
      { exam: "apsc", stage: "some", time: "evening" },
      examOf
    )
    expect(best?.course.slug).toBe("pragati")
    expect(best?.reasons).toContain("working")
  })

  test("someone after practice gets the mock test series", () => {
    const [best] = recommend(courses, { exam: "apsc", stage: "tests" }, examOf)
    expect(best?.course.slug).toBe("arjuna")
    expect(best?.reasons).toContain("tests")
  })

  test("a newer batch replaces an older one still listed", () => {
    const picks = recommend(
      courses,
      { exam: "adre", stage: "starting" },
      examOf
    )
    expect(picks[0]?.course.slug).toBe("victor-8")
    expect(picks[0]?.reasons).toContain("newest")
  })

  test("not sure yet leads with a free workshop", () => {
    const [best] = recommend(
      courses,
      { exam: "unsure", stage: "starting" },
      examOf
    )
    expect(best?.course.free).toBe(true)
    expect(best?.reasons).toContain("free")
  })

  test("returns nothing rather than guessing when there are no courses", () => {
    expect(recommend([], { exam: "apsc" }, examOf)).toEqual([])
  })
})

describe("rankAll", () => {
  test("keeps every course, the chosen exam's first", () => {
    const all = rankAll(courses, { exam: "apsc" }, examOf)
    expect(all.length).toBe(courses.filter((c) => c.track).length)
    const firstOther = all.findIndex((p) => p.course.track !== "APSC")
    const lastApsc = all.findLastIndex((p) => p.course.track === "APSC")
    expect(lastApsc).toBeLessThan(firstOther)
  })
  test("with no answers it still lists everything", () => {
    expect(rankAll(courses, {}, examOf).length).toBe(
      courses.filter((c) => c.track).length
    )
  })
})
