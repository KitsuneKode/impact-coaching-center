import { existsSync } from "node:fs"

import { describe, expect, test } from "bun:test"

import { contact, formatPhone } from "./brand"
import {
  markersAsLinks,
  parsePolicy,
  policies,
  policyBySlug,
  policyMarkers,
  withoutMarkers,
} from "./policies"

const prose = (slug: string) => withoutMarkers(policyBySlug(slug)!.body)

describe("policies", () => {
  test("has the four required documents", () => {
    expect(policies.map((p) => p.slug).sort()).toEqual([
      "privacy",
      "refunds",
      "shipping",
      "terms",
    ])
  })

  test("unapproved documents state a charge, window or hour only inside a marker", () => {
    // AGENTS.md: no invented prices, deadlines or hours. A researched default
    // is allowed only as {{proposed: ...}}, where it renders as a proposal.
    const forbidden =
      /(₹|Rs\.?\s?\d|\d+\s?(days?|hours?|working days|months?|years?)|\d{1,2}(:\d{2})?\s?(am|pm))/i
    for (const doc of policies.filter((p) => !p.approved))
      expect(withoutMarkers(doc.body)).not.toMatch(forbidden)
  })

  test("an approved document has no marker left in it", () => {
    for (const doc of policies.filter((p) => p.approved))
      expect(policyMarkers(doc.body)).toEqual([])
  })

  test("every document has a title, description and at least one section", () => {
    for (const doc of policies) {
      expect(doc.title.length).toBeGreaterThan(3)
      expect(doc.description.length).toBeGreaterThan(20)
      expect(doc.body).toMatch(/^## /m)
    }
  })

  test("contact details in the wording match lib/brand.ts", () => {
    // ICT edits the Markdown by hand; a mistyped number there would send
    // complaints nowhere. Every phone and email written must be a real one.
    const known = new Set([
      contact.email,
      ...contact.phones.map((phone) => formatPhone(phone)),
    ])
    for (const doc of policies) {
      const text = withoutMarkers(doc.body)
      for (const email of text.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? [])
        expect(known.has(email)).toBe(true)
      for (const phone of text.match(/\+91 \d{5} \d{5}/g) ?? [])
        expect(known.has(phone)).toBe(true)
    }
  })

  test("the privacy policy describes sign-in iff sign-in exists", () => {
    // This guard has already earned its place once: the policy said the site
    // "does not currently ask you to sign in and does not send verification
    // codes", and the day the log-in route landed the sentence became false. The
    // wording and the code have to move together, in both directions.
    const text = prose("privacy")
    const describesSignIn =
      text.includes("If you sign in") && text.includes("one-time code")
    expect(describesSignIn).toBe(existsSync("app/(plain)/login"))
  })

  test("the policy does not describe an account area that does not exist", () => {
    if (!existsSync("app/(plain)/account"))
      for (const doc of policies)
        expect(doc.body).not.toContain("your account page")
  })

  test("ordering is described as not yet open while none of it is built", () => {
    const ordering = [
      "app/(plain)/checkout",
      "app/cart",
      "app/[locale]/books",
    ].some(existsSync)
    for (const slug of ["shipping", "refunds"]) {
      const doc = policyBySlug(slug)!
      // Each page says ordering is not open until a checkout exists, and
      // neither can be approved (published as binding) before then.
      if (!ordering) {
        expect(prose(slug)).toContain("does not currently take online")
        expect(doc.approved).toBe(false)
      }
    }
  })

  test("looks a document up by slug, and refuses an unknown one", () => {
    expect(policyBySlug("privacy")?.title).toBe("Privacy policy")
    expect(policyBySlug("nope")).toBeUndefined()
  })
})

describe("markers", () => {
  test("finds both kinds in reading order", () => {
    expect(
      policyMarkers("a {{proposed: 7 days}} b {{ fill : officer name }} c")
    ).toEqual([
      { kind: "proposed", text: "7 days" },
      { kind: "fill", text: "officer name" },
    ])
  })

  test("rewrites markers as recognisable links, escaping brackets", () => {
    expect(markersAsLinks("x {{fill: name [legal]}}")).toBe(
      "x [name (legal)](#fill)"
    )
  })

  test("ignores an unknown marker kind rather than guessing", () => {
    expect(policyMarkers("{{maybe: 3 days}}")).toEqual([])
  })
})

describe("parsePolicy", () => {
  const valid = `---
title: T
description: D
updated: 2026-09-26
approved: false
---

## Body`

  test("reads the four keys and the body", () => {
    const doc = parsePolicy("terms", valid)
    expect(doc).toMatchObject({
      title: "T",
      updated: "2026-09-26",
      approved: false,
      body: "## Body",
    })
  })

  test("refuses a typo instead of ignoring it", () => {
    expect(() =>
      parsePolicy("terms", valid.replace("approved:", "aproved:"))
    ).toThrow(/unknown front matter key/)
    expect(() =>
      parsePolicy("terms", valid.replace("approved: false", "approved: yes"))
    ).toThrow(/approved must be/)
    expect(() => parsePolicy("terms", "## no front matter")).toThrow(
      /no front matter/
    )
  })
})
