import { describe, expect, test } from "bun:test"

import { headingsOf, headingSlug, readingMinutes, youTubeId } from "./article"

describe("headingsOf", () => {
  test("reads ## and ###, skips code and repeats get a number", () => {
    const md = [
      "# Title",
      "## The pattern",
      "```",
      "## not a heading",
      "```",
      "### Prelims [paper](https://x.y)",
      "## The pattern",
    ].join("\n")
    expect(headingsOf(md)).toEqual([
      { id: "the-pattern", text: "The pattern", depth: 2 },
      { id: "prelims-paper", text: "Prelims paper", depth: 3 },
      { id: "the-pattern-2", text: "The pattern", depth: 2 },
    ])
  })
  test("keeps Assamese letters", () => {
    expect(headingSlug("পৰীক্ষাৰ আৰ্হি")).toBe("পৰীক্ষাৰ-আৰ্হি")
  })
})

test("readingMinutes", () => {
  expect(readingMinutes("word ".repeat(10))).toBe(1)
  expect(readingMinutes("word ".repeat(1000))).toBe(5)
})

test("youTubeId", () => {
  expect(youTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
    "dQw4w9WgXcQ"
  )
  expect(youTubeId("https://youtu.be/dQw4w9WgXcQ?t=3")).toBe("dQw4w9WgXcQ")
  expect(youTubeId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe(
    "dQw4w9WgXcQ"
  )
  expect(youTubeId("https://example.com/watch?v=dQw4w9WgXcQ")).toBeNull()
  expect(youTubeId("not a url")).toBeNull()
})
