import { describe, expect, test } from "bun:test"

import {
  parseFeatures,
  slugify,
  splitCourseName,
  toCatalogueRow,
} from "./catalogue-import"

describe("slugify", () => {
  test("lowercases and hyphenates", () => {
    expect(slugify("Lakhya 2027")).toBe("lakhya-2027")
  })

  test("collapses runs of punctuation into one hyphen", () => {
    expect(slugify("Victor 8.0 -- Special!!")).toBe("victor-8-0-special")
  })

  test("trims leading and trailing hyphens", () => {
    expect(slugify("  -Diamond 3.0-  ")).toBe("diamond-3-0")
  })

  test("caps the slug so a long name cannot make an unusable URL", () => {
    expect(slugify("a".repeat(80))).toHaveLength(48)
  })

  test("never ends on a hyphen after the cap", () => {
    // Cutting at 48 can land on a separator, which would produce
    // /courses/some-name- and a trailing-hyphen canonical.
    const slug = slugify(`${"ab ".repeat(20)}tail`)
    expect(slug.endsWith("-")).toBe(false)
  })

  test("falls back rather than returning an empty slug", () => {
    // A fully non-Latin name strips to nothing, which would yield the route
    // /courses/ - the catalogue page itself - instead of a course.
    expect(slugify("অসম পুলিচ", 886514)).toBe("course-886514")
  })

  test("keeps digits", () => {
    expect(slugify("Victor 8 0")).toBe("victor-8-0")
  })
})

describe("splitCourseName", () => {
  test("splits on a spaced dash", () => {
    expect(splitCourseName("Lakhya 2027 - The Complete APSC Course")).toEqual({
      short: "Lakhya 2027",
      subtitle: "The Complete APSC Course",
    })
  })

  test("splits when the space before the dash is missing", () => {
    // ICT writes "Kouxal- Free APSC Workshop".
    expect(splitCourseName("Kouxal- Free APSC Workshop")).toEqual({
      short: "Kouxal",
      subtitle: "Free APSC Workshop",
    })
  })

  test("splits on an en dash", () => {
    expect(splitCourseName("Pragati 2027 – Foundation")).toEqual({
      short: "Pragati 2027",
      subtitle: "Foundation",
    })
  })

  test("leaves a name with no separator whole", () => {
    expect(splitCourseName("Abhigyan")).toEqual({
      short: "Abhigyan",
      subtitle: "",
    })
  })

  test("does not split an intra-word hyphen", () => {
    expect(splitCourseName("Pre-Foundation Batch")).toEqual({
      short: "Pre-Foundation Batch",
      subtitle: "",
    })
  })

  test("rejoins further separators into the subtitle", () => {
    expect(splitCourseName("Victor 8.0 - Mains - Test Series")).toEqual({
      short: "Victor 8.0",
      subtitle: "Mains - Test Series",
    })
  })

  test("trims surrounding whitespace", () => {
    expect(splitCourseName("  Kouxal  -  Free  ")).toEqual({
      short: "Kouxal",
      subtitle: "Free",
    })
  })
})

describe("parseFeatures", () => {
  test("returns nothing when there is no description", () => {
    expect(parseFeatures(null)).toEqual([])
    expect(parseFeatures(undefined)).toEqual([])
    expect(parseFeatures("")).toEqual([])
  })

  test("keeps only bulleted lines, not the prose intro", () => {
    // Without the marker requirement the intro paragraph landed in the first
    // slot of the course card.
    const description = [
      "This course prepares you for the APSC CCE from scratch.",
      "✅ Live classes every day",
      "✅ Recorded lectures",
    ].join("\n")
    expect(parseFeatures(description)).toEqual([
      "Live classes every day",
      "Recorded lectures",
    ])
  })

  test("accepts every marker ICT uses", () => {
    const description = [
      "✅ Tick",
      "✓ Check",
      "• Bullet",
      "* Star",
      "- Hyphen",
      "– En dash",
      "1. Numbered dot",
      "2) Numbered paren",
    ].join("\n")
    expect(parseFeatures(description)).toEqual([
      "Tick",
      "Check",
      "Bullet",
      "Star",
      "Hyphen",
      "En dash",
      "Numbered dot",
      "Numbered paren",
    ])
  })

  test("normalises a dash used as a separator", () => {
    expect(parseFeatures("✅ Mock tests – every week")).toEqual([
      "Mock tests - every week",
    ])
  })

  test("leaves a hyphen inside a word alone", () => {
    expect(parseFeatures("✅ Expert-led doubt sessions")).toEqual([
      "Expert-led doubt sessions",
    ])
  })

  test("drops duplicates regardless of case", () => {
    const description = ["✅ Mock tests", "✅ MOCK TESTS", "✅ Notes"].join(
      "\n"
    )
    expect(parseFeatures(description)).toEqual(["Mock tests", "Notes"])
  })

  test("drops lines that are too short or too long", () => {
    const description = ["✅ ab", "✅ ok feature", `✅ ${"x".repeat(91)}`].join(
      "\n"
    )
    expect(parseFeatures(description)).toEqual(["ok feature"])
  })

  test("caps the list at eight so a card cannot run away", () => {
    const description = Array.from(
      { length: 20 },
      (_, i) => `✅ Feature number ${i}`
    ).join("\n")
    expect(parseFeatures(description)).toHaveLength(8)
  })

  test("ignores a marker with nothing after it", () => {
    expect(parseFeatures("✅\n✅ Real feature")).toEqual(["Real feature"])
  })

  test("handles carriage returns from a pasted description", () => {
    expect(parseFeatures("✅ Live classes\r\n✅ Notes")).toEqual([
      "Live classes",
      "Notes",
    ])
  })
})

describe("toCatalogueRow", () => {
  const raw = {
    id: 886514,
    name: "Lakhya 2027 - The Complete APSC Course",
    description: "✅ Live classes\n✅ Notes",
    price: 30010,
    discount: 5001,
    totalSubscriberCount: 412,
  }

  test("subtracts the discount to get what a student pays", () => {
    const row = toCatalogueRow(raw)
    expect(row.mrp).toBe(30010)
    expect(row.price).toBe(25009)
    expect(row.free).toBe(false)
  })

  test("marks a zero-payable course free", () => {
    expect(toCatalogueRow({ ...raw, price: 0, discount: 0 }).free).toBe(true)
  })

  test("marks an over-discounted course free rather than negative", () => {
    const row = toCatalogueRow({ ...raw, price: 100, discount: 500 })
    expect(row.free).toBe(true)
  })

  test("treats missing price and discount as zero", () => {
    const row = toCatalogueRow({ id: 1, name: "Free Workshop" })
    expect(row.mrp).toBe(0)
    expect(row.price).toBe(0)
    expect(row.free).toBe(true)
  })

  test("defaults a missing learner count to zero", () => {
    expect(toCatalogueRow({ id: 1, name: "X" }).learners).toBe(0)
  })

  test("carries the split name through", () => {
    const row = toCatalogueRow(raw)
    expect(row.short).toBe("Lakhya 2027")
    expect(row.subtitle).toBe("The Complete APSC Course")
    expect(row.slug).toBe("lakhya-2027")
  })

  test("trims the full name", () => {
    expect(toCatalogueRow({ ...raw, name: "  Lakhya 2027  " }).name).toBe(
      "Lakhya 2027"
    )
  })

  test("never produces an empty slug", () => {
    expect(toCatalogueRow({ id: 42, name: "অসম পুলিচ" }).slug).toBe("course-42")
  })
})
