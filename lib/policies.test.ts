import { existsSync } from "node:fs"

import { describe, expect, test } from "bun:test"

import { policies, policyBySlug } from "./policies"

describe("policies", () => {
  test("has the four required documents", () => {
    expect(policies.map((p) => p.slug).sort()).toEqual([
      "privacy",
      "refunds",
      "shipping",
      "terms",
    ])
  })

  test("unapproved documents never state a charge, window or hour", () => {
    // AGENTS.md: no invented prices, deadlines or hours. Approved text may
    // contain them; unapproved text must not.
    const forbidden =
      /(₹|Rs\.?\s?\d|\d+\s?(days?|hours?|working days)|\d{1,2}(:\d{2})?\s?(am|pm))/i
    for (const doc of policies.filter((p) => !p.approved))
      for (const section of doc.sections)
        for (const para of section.paragraphs)
          expect(para).not.toMatch(forbidden)
  })

  test("every document has a title, description and at least one section", () => {
    for (const doc of policies) {
      expect(doc.title.length).toBeGreaterThan(3)
      expect(doc.description.length).toBeGreaterThan(20)
      expect(doc.sections.length).toBeGreaterThan(0)
      for (const section of doc.sections)
        expect(section.paragraphs.length).toBeGreaterThan(0)
    }
  })

  test("the privacy policy describes sign-in iff sign-in exists", () => {
    // This guard has already earned its place once: the policy said the site
    // "does not currently ask you to sign in and does not send verification
    // codes", and the day the log-in route landed the sentence became false. The
    // wording and the code have to move together, in both directions.
    const privacy = policies.find((p) => p.slug === "privacy")!
    const text = privacy.sections.flatMap((s) => s.paragraphs).join(" ")
    const describesSignIn =
      text.includes("If you sign in") && text.includes("one-time code")
    expect(describesSignIn).toBe(existsSync("app/login"))
  })

  test("the policy does not describe an account area that does not exist", () => {
    const text = policies
      .flatMap((p) => p.sections.flatMap((s) => s.paragraphs))
      .join(" ")
    if (!existsSync("app/account"))
      expect(text).not.toContain("your account page")
  })

  test("no document sells or takes payment while none of that is built", () => {
    const text = policies
      .flatMap((p) => p.sections.flatMap((s) => s.paragraphs))
      .join(" ")
    // Each of these routes would make a policy claim false if it appeared.
    for (const route of ["app/checkout", "app/cart", "app/books"])
      expect(existsSync(route)).toBe(false)
    expect(text).toContain("does not currently take online")
  })

  test("looks a document up by slug, and refuses an unknown one", () => {
    expect(policyBySlug("privacy")?.title).toBe("Privacy policy")
    expect(policyBySlug("nope")).toBeUndefined()
  })
})
