import { expect, test } from "bun:test"

import { visitSource } from "./attribution"

test("campaign tags take priority without leaking raw values", () => {
  expect(
    visitSource(
      "https://ict.test/?utm_source=chatgpt.com",
      "https://google.com/search?q=phone"
    )
  ).toBe("chatgpt")
  expect(visitSource("https://ict.test/?ref=instagram", "")).toBe("instagram")
  expect(visitSource("https://ict.test/?refer=yt", "")).toBe("youtube")
  expect(
    visitSource("https://ict.test/?utm_source=someone%40example.com", "")
  ).toBe("other")
})

test("referrers identify a channel by host only", () => {
  expect(
    visitSource(
      "https://ict.test/",
      "https://m.facebook.com/private/path?email=a@b.com"
    )
  ).toBe("facebook")
  expect(
    visitSource("https://ict.test/", "https://ict.test/contact?phone=123")
  ).toBe("direct")
  expect(visitSource("https://ict.test/", "")).toBe("direct")
})
