import { describe, expect, test } from "bun:test"

import {
  checkBook,
  checkResource,
  rupeesToPaise,
  slugify,
  type BookInput,
} from "./catalog"

const book: BookInput = {
  slug: "assam-gk-capsule",
  title: "  Assam GK   Capsule ",
  subtitle: "Quick revision",
  exam: "ADRE and Assam Police",
  edition: "2026",
  pages: 120,
  pricePaise: 19900,
  tone: "muted",
  description: "Notes.",
  contents: ["Geography", " ", "Polity"],
}

describe("catalog rules", () => {
  test("tidies text and drops empty contents lines", () => {
    const result = checkBook(book)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.title).toBe("Assam GK Capsule")
      expect(result.value.contents).toEqual(["Geography", "Polity"])
    }
  })

  test("names the field that is wrong", () => {
    expect(checkBook({ ...book, slug: "Bad Slug" })).toEqual({
      ok: false,
      field: "slug",
    })
    expect(checkBook({ ...book, pricePaise: 12.5 })).toEqual({
      ok: false,
      field: "price",
    })
    expect(checkBook({ ...book, title: "   " })).toEqual({
      ok: false,
      field: "title",
    })
    expect(
      checkResource({
        slug: "x",
        title: "Paper",
        exam: "APSC",
        kind: "Poster" as never,
        description: "",
      })
    ).toEqual({ ok: false, field: "kind" })
  })

  test("turns typed rupees into paise, refusing nonsense", () => {
    expect(rupeesToPaise("349")).toBe(34900)
    expect(rupeesToPaise("₹1,299.50")).toBe(129950)
    expect(rupeesToPaise("12.345")).toBeNull()
    expect(rupeesToPaise("free")).toBeNull()
  })

  test("makes slugs from titles", () => {
    expect(slugify("APSC Prelims: Solved Papers!")).toBe(
      "apsc-prelims-solved-papers"
    )
  })
})
