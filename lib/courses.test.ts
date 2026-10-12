import { describe, expect, test } from "bun:test"

import {
  fillFees,
  fromMirror,
  lineup,
  newestBatch,
  type Course,
} from "./courses"

const course = (over: Partial<Course>): Course => ({
  id: 1,
  slug: "c",
  name: "Course",
  short: "Course",
  subtitle: "",
  mrp: 0,
  price: 1000,
  free: false,
  learners: 0,
  features: [],
  cover: null,
  tags: [],
  track: "APSC",
  ...over,
})

const apsc = [
  course({
    id: 3,
    name: "ARJUNA Mains Mock Test Series 2026",
    short: "ARJUNA",
    price: 2509,
    createdAt: 30,
  }),
  course({
    id: 2,
    name: "Lakhya 2027 - The Complete APSC Course",
    short: "Lakhya 2027",
    price: 25009,
    createdAt: 20,
  }),
  course({
    id: 1,
    name: "Kouxal- Free APSC Workshop",
    short: "Kouxal",
    price: 0,
    free: true,
  }),
]

describe("lineup", () => {
  test("a mock-test series is never the lead course", () => {
    const { flagship, also, free } = lineup(apsc, "APSC")
    expect(flagship?.short).toBe("Lakhya 2027")
    expect(also.map((c) => c.short)).toEqual(["ARJUNA"])
    expect(free?.short).toBe("Kouxal")
  })

  test("the newest batch skips test series and free courses", () => {
    expect(newestBatch(apsc)?.short).toBe("Lakhya 2027")
  })
})

test("fee placeholders fill from each exam's lead course", () => {
  expect(fillFees("APSC ({apsc}) is {apscFee}.", apsc)).toBe(
    "APSC (Lakhya 2027) is ₹25,009."
  )
})

test("an exam in the title beats the ClassPlus category", () => {
  const mirror = {
    classplusId: 893950,
    slug: "kouxal",
    name: "Kouxal- Free APSC Workshop",
    short: "Kouxal",
    subtitle: "Free APSC Workshop",
    features: [],
    pricePaise: 0,
    finalPricePaise: 0,
    free: true,
    enrolled: 18,
    category: "State govt exams- SSC",
    tags: [],
    cover: null,
  }
  expect(fromMirror(mirror).track).toBe("APSC")
  expect(fromMirror({ ...mirror, track: "Bank, SSC, Railway" }).track).toBe(
    "Bank, SSC, Railway"
  )
})
