import { describe, expect, test } from "bun:test"

import { classplusFeedUrl, parseClassplusFeed } from "./classplus"

const course = (over: Record<string, unknown> = {}) => ({
  id: 886514,
  name: "Lakhya 2027 - The Complete APSC Course",
  description: "Features:\n✅ Complete APSC Coaching",
  price: 30010,
  discount: 5001,
  finalPrice: 25009,
  totalSubscriberCount: 10,
  categories: "State PSC Exams",
  courseTags: [{ text: "LIVE CLASS" }, { text: "VIDEOS" }],
  imageUrl: "https://cdn.example/cover.png",
  createdAt: "2026-10-10T04:14:22.000Z",
  ...over,
})

describe("parseClassplusFeed", () => {
  test("reads a course once across sections, in paise", () => {
    const rows = parseClassplusFeed({
      status: "success",
      data: {
        popular: { coursesData: [course()] },
        all: { coursesData: [course()] },
        upcomingLiveClasses: null,
      },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      classplusId: 886514,
      slug: "lakhya-2027",
      pricePaise: 3_001_000,
      finalPricePaise: 2_500_900,
      free: false,
      enrolled: 10,
      category: "State PSC Exams",
      tags: ["LIVE CLASS", "VIDEOS"],
    })
    expect(rows[0]!.createdAt).toBe(Date.parse("2026-10-10T04:14:22.000Z"))
  })

  test("a fully discounted course is free, never negative", () => {
    const [row] = parseClassplusFeed({
      status: "success",
      data: { all: { coursesData: [course({ price: 0, finalPrice: 0 })] } },
    })
    expect(row).toMatchObject({ free: true, finalPricePaise: 0 })
  })

  test("skips rows without an id or name", () => {
    const rows = parseClassplusFeed({
      status: "success",
      data: { all: { coursesData: [course(), { id: 1 }, { name: "x" }] } },
    })
    expect(rows).toHaveLength(1)
  })

  test("refuses an unrecognised or empty feed rather than emptying the site", () => {
    expect(() => parseClassplusFeed({ status: "error" })).toThrow()
    expect(() =>
      parseClassplusFeed({
        status: "success",
        data: { all: { coursesData: [] } },
      })
    ).toThrow()
  })
})

test("the feed URL carries ICT's org id", () => {
  const hash = classplusFeedUrl().split("/similar/")[1]!.split("?")[0]!
  expect(JSON.parse(atob(hash))).toEqual({
    tutorId: null,
    orgId: 445114,
    categoryId: null,
  })
})
