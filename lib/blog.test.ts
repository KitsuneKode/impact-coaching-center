import { describe, expect, test } from "bun:test"

import { checkPost, ownLanguageFirst, type PostInput } from "./blog"

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
