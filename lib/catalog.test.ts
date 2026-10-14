import { describe, expect, test } from "bun:test"

import {
  checkBook,
  checkBundle,
  checkResource,
  inLanguage,
  pageCountDraft,
  rupeeDraft,
  rupeesToPaise,
  slugify,
  type BookInput,
  type BundleInput,
} from "./catalog"

const book: BookInput = {
  slug: "assam-gk-capsule",
  exam: "ADRE and Assam Police",
  description: { en: "Notes.", as: "   " },
  contents: ["Geography", " ", "Polity"],
  editions: {
    en: { title: "  Assam GK   Capsule ", edition: "2026", pages: 120 },
  },
}

const bundle: BundleInput = {
  slug: "adre-police-set",
  exam: "ADRE and Assam Police",
  title: { en: " ADRE  Set ", as: "ADRE সংকলন" },
  description: { en: "Two books." },
  variants: {
    en: { pricePaise: 44900, comparePaise: 54000, available: true },
    as: { pricePaise: 44900, available: false },
  },
  sortOrder: 2,
}

describe("catalog rules", () => {
  test("tidies text, drops empty contents lines and blank Assamese", () => {
    const result = checkBook(book)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.editions.en?.title).toBe("Assam GK Capsule")
      expect(result.value.contents).toEqual(["Geography", "Polity"])
      expect(result.value.description).toEqual({ en: "Notes." })
    }
  })

  test("names the field that is wrong", () => {
    expect(checkBook({ ...book, slug: "Bad Slug" })).toEqual({
      ok: false,
      field: "slug",
    })
    expect(checkBook({ ...book, editions: {} })).toEqual({
      ok: false,
      field: "editions",
    })
    expect(
      checkBook({
        ...book,
        editions: { as: { title: "   ", edition: "", pages: 10 } },
      })
    ).toEqual({ ok: false, field: "as.title" })
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

  test("a bundle needs whole-paise prices and a struck price above the price", () => {
    const ok = checkBundle(bundle)
    expect(ok.ok && ok.value.title.en).toBe("ADRE Set")
    expect(
      checkBundle({
        ...bundle,
        variants: {
          ...bundle.variants,
          en: { pricePaise: 12.5, available: true },
        },
      })
    ).toEqual({ ok: false, field: "en.price" })
    expect(
      checkBundle({
        ...bundle,
        variants: {
          ...bundle.variants,
          en: { pricePaise: 44900, comparePaise: 44900, available: true },
        },
      })
    ).toEqual({ ok: false, field: "en.comparePrice" })
    // ₹0 on sale cannot be paid through Razorpay; ₹0 switched off is fine.
    expect(
      checkBundle({
        ...bundle,
        variants: {
          ...bundle.variants,
          en: { pricePaise: 0, available: true },
        },
      })
    ).toEqual({ ok: false, field: "en.price" })
    expect(
      checkBundle({
        ...bundle,
        variants: {
          ...bundle.variants,
          en: { pricePaise: 0, available: false },
        },
      }).ok
    ).toBe(true)
  })

  test("Assamese text falls back to English", () => {
    expect(inLanguage({ en: "Set" }, "as")).toBe("Set")
    expect(inLanguage({ en: "Set", as: "সংকলন" }, "as")).toBe("সংকলন")
  })

  test("keeps a rupee field to digits and two decimal places", () => {
    expect(rupeeDraft("349abc")).toBe("349")
    expect(rupeeDraft("12.3456")).toBe("12.34")
    expect(rupeeDraft("12.3.4")).toBe("12.34")
  })

  test("keeps a page count to four digits", () => {
    expect(pageCountDraft("120 pages")).toBe("120")
    expect(pageCountDraft("123456")).toBe("1234")
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
