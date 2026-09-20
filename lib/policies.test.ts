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

  test("nothing claims the site sells or verifies anything yet", () => {
    // The whole point of these drafts is that they describe what is true
    // today. If a later change makes one of these claims, the flag and the
    // wording must move together.
    const unapproved = policies.filter((p) => !p.approved)
    expect(unapproved).toHaveLength(policies.length)
  })

  test("looks a document up by slug, and refuses an unknown one", () => {
    expect(policyBySlug("privacy")?.title).toBe("Privacy policy")
    expect(policyBySlug("nope")).toBeUndefined()
  })
})
