import { describe, expect, test } from "bun:test"

import {
  checkPost,
  excerptFrom,
  ownLanguageFirst,
  type PostInput,
} from "./blog"

const post: PostInput = {
  slug: "prelims-dates",
  title: "Prelims dates",
  excerpt: "",
  body: "Text.",
  language: "as",
}

describe("post language", () => {
  test("only English and Assamese are accepted", () => {
    expect(checkPost(post).ok).toBe(true)
    expect(
      checkPost({ ...post, language: "hi" as PostInput["language"] })
    ).toEqual({ ok: false, field: "language" })
  })

  test("each list shows its own language first, keeping order within", () => {
    const posts = [
      { slug: "a", language: "en" as const },
      { slug: "b", language: "as" as const },
      { slug: "c" },
      { slug: "d", language: "as" as const },
    ]
    expect(ownLanguageFirst(posts, "as").map((p) => p.slug)).toEqual([
      "b",
      "d",
      "a",
      "c",
    ])
    // A post saved before the field existed counts as English.
    expect(ownLanguageFirst(posts, "en").map((p) => p.slug)).toEqual([
      "a",
      "c",
      "b",
      "d",
    ])
  })
})

describe("an excerpt nobody wrote", () => {
  test("is the first paragraph of prose, Markdown removed", () => {
    expect(
      excerptFrom(
        "# Heading\n\n![cover](x.png)\n\nThe **APSC** prelims test [general studies](/gs) and `CSAT`.\n\nMore."
      )
    ).toBe("The APSC prelims test general studies and CSAT.")
  })

  test("is cut on a word, near what search results show", () => {
    const long = "word ".repeat(80).trim()
    const excerpt = excerptFrom(long)
    expect(excerpt.length).toBeLessThanOrEqual(181)
    expect(excerpt.endsWith("word…")).toBe(true)
  })

  test("is empty when the body has no prose yet", () => {
    expect(excerptFrom("")).toBe("")
    expect(excerptFrom("## Only a heading")).toBe("")
  })

  test("reads Assamese as well", () => {
    expect(excerptFrom("এপিএছচি প্ৰিলিমছৰ বাবে প্ৰস্তুতি।")).toBe(
      "এপিএছচি প্ৰিলিমছৰ বাবে প্ৰস্তুতি।"
    )
  })
})
