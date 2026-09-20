---
status: done
ticket: KIT-45
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md
---

# Plan 004: Add `/contact` and the four policy routes without inventing a single fact

> **Executor instructions**: Follow this plan step by step. Run every
> verification command. If anything in "STOP conditions" occurs, stop and
> report. When done, update `docs/plans/README.md` and this file's `status:`.
>
> **Drift check (run first)**:
> `git diff --stat 4a6c88e..HEAD -- app components/marketing/site-footer.tsx lib/brand.ts lib/site.ts app/sitemap.ts`
> On any change, re-read the cited excerpts before proceeding.

## Status

- **Priority**: P1 (cheapest item on the board; gates Razorpay onboarding)
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none. Plan 002's change-note should be countersigned before the privacy page's verification wording is treated as approved, but the page can be built now as a labelled draft.
- **Category**: direction (KIT-45)
- **Planned at**: commit `4a6c88e`, 2026-09-20

## Why this matters

Spec §5 lists `/contact`, `/privacy`, `/terms`, `/shipping` and `/refunds` as
launch routes; none exists. Razorpay merchant onboarding requires published
policy pages, so Books (delivery stage 6) cannot even be submitted for review
until these are live. `/contact` is the route several CTAs and the footer
_should_ point at and currently cannot.

The hard constraint is AGENTS.md: "Do not invent facts ... Mark placeholders
and prototype-only values in code and documentation so they cannot be
mistaken for approved content." Shipping charges, refund rules and opening
hours are **not decided** (spec §14 "must be agreed before live payments";
CHECKPOINT §B lists timings as missing). This plan therefore builds the
routes with content that is _true today_ — the site does not yet sell
anything online — and a typed `approved` flag that keeps unapproved pages
`noindex` and out of the sitemap until ICT signs them off.

## Current state

- Page pattern — `app/success-stories/page.tsx:20-25` exports `metadata` with `title`, `description`, `alternates: { canonical: "/success-stories" }`; the body is `<main>` → `<section className="pt-26 pb-10 md:pt-30">` → `<div className="container-page">` → `<h1 className="enter type-display max-w-208">` with a two-tone `<span className="text-foreground">` / `<span className="text-muted-foreground">` pair. Copy this shape.
- `app/not-found.tsx:43-80` — how `Section` (from `@/components/ui/section`), `ButtonLink`, `ButtonAnchor` and `contactHref` are composed. `contactHref({ kind: "call" })` yields `tel:`; `contactHref({ kind: "workshop" })` yields a WhatsApp link.
- `lib/brand.ts:23-38` — the only approved contact facts:
  ```ts
  export const place = {
    street: "D C Bunglow Road, Ward no 6",
    city: "North Lakhimpur",
    region: "Assam",
    pin: "787001",
    spoken: "DC Bungalow Road",
    lat: 27.2381231,
    lng: 94.1028255,
    maps: "https://goo.gl/maps/GibauAfFg2BBtdRu9",
  }
  export const contact = {
    phones: ["+918638061175", "+918134995880"],
    whatsapp: "+918638061175",
    email: "impactcareertutorials@gmail.com",
  }
  ```
  `formatPhone` at `lib/brand.ts:539` renders `+91 86380 61175`. There are **no opening hours anywhere in the repo** — do not add any.
- `lib/brand.ts:548-555` — `toConfirm`, the owner sign-off checklist. Anything this plan cannot verify is appended here.
- `lib/site.ts:51` — `indexable` (site-wide flag). Per-page `robots` in `metadata` overrides it downward only; you cannot make a page indexable that the site is not.
- `app/sitemap.ts:7-27` — hand-listed URLs; add approved pages here only.
- `components/marketing/site-footer.tsx:6-38` — `columns` array of `{ title, items: [{ label, href, external? }] }`. Add a fourth column.
- `app/layout.tsx:72-96` — LocalBusiness JSON-LD already carries `telephone`, `email`, `address`, `geo`. `/contact` must not contradict it.
- Enquiry data flow (for the privacy text): `app/actions/lead.ts` collects name, phone, course, timing; `lib/lead-delivery.ts` posts it to Convex (`/enquiries`) or a webhook; `convex/persons.ts:173-247` stores a Person (phone, name, lead status, interest track) and an `enquiry` activity. The client's IP is used only for rate limiting (`persons.ts:192-200`). Phone verification (`lib/phone-auth.ts`) exists but has no UI yet and sends nothing in production.

Vocabulary (CONTEXT.md): "Enquiry", "Verification", "Book", "Order",
"Library application". In visitor-facing copy use "student" or "you", never
"user"/"customer".

## Commands you will need

| Purpose            | Command                                                                                                                                                            | Expected                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Gate               | `bun run format && bun run check`                                                                                                                                  | exit 0                                         |
| Build (new routes) | `bun run build`                                                                                                                                                    | exit 0; the five routes appear as static pages |
| Route smoke        | `bun run start & sleep 3; for p in contact privacy terms shipping refunds; do curl -s -o /dev/null -w "$p %{http_code}\n" http://localhost:3000/$p; done; kill %1` | five `200` lines                               |
| Robots check       | `curl -s http://localhost:3000/shipping \| grep -o 'name="robots"[^>]*'`                                                                                           | contains `noindex` while unapproved            |

## Scope

**In scope (create/modify):**

- `lib/policies.ts` (create) — typed content + `approved` flags
- `lib/policies.test.ts` (create)
- `app/contact/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/shipping/page.tsx`, `app/refunds/page.tsx` (create)
- `components/marketing/policy-page.tsx` (create) — one shared renderer
- `components/marketing/site-footer.tsx` — add a column
- `app/sitemap.ts` — approved pages only
- `lib/brand.ts` — append to `toConfirm` only

**Out of scope:** any pricing, delivery-charge, refund-window, or hours value; `app/layout.tsx`; the JSON-LD; `lib/contact.ts`; a map embed (a link to `place.maps` is enough — no third-party iframe without a decision on CSP).

## Git workflow

- Branch: `<handle>/kit-45-policy-pages-and-contact`
- Commits: `feat: add /contact from the approved brand facts`, `feat: add draft policy routes that stay unindexed until approved`.
- Do NOT push unless instructed.

## Steps

### Step 1: Typed policy content

Create `lib/policies.ts`:

```ts
/**
 * Visitor-facing policy text. Each document carries `approved`, which is
 * false until ICT signs the wording off; unapproved documents render with a
 * visible draft notice, are `noindex`, and are absent from the sitemap. Flip
 * the flag only with a recorded approval.
 *
 * PLACEHOLDER-AWARE: nothing below states a charge, a time window or an
 * opening hour, because none has been approved. Do not add one here; add it
 * once approved, in the same commit that sets `approved: true`.
 */
export type PolicySection = { heading: string; paragraphs: readonly string[] }
export type PolicyDocument = {
  slug: "privacy" | "terms" | "shipping" | "refunds"
  title: string
  description: string
  updated: string // ISO date of last wording change
  approved: boolean
  sections: readonly PolicySection[]
}
```

Then export `export const policies: readonly PolicyDocument[]` with these four
documents, `approved: false`, `updated: "2026-09-20"`, and this content (edit
only for grammar; do not add facts):

**privacy** — title "Privacy policy"; description "What Impact Career Tutorials collects through this website, why, and how to ask about it."

- "What we collect": "When you send an enquiry we collect your name, mobile number, the course you are asking about and your preferred time of day. Your network address is used only to limit automated submissions and is not stored with your enquiry." / "The site does not currently ask you to sign in and does not send verification codes. If that changes, this policy will be updated first."
- "Why": "To reply to your enquiry and to know which courses people ask about. We do not sell or share this information with anyone outside Impact Career Tutorials."
- "Where it is kept": "Enquiries are stored in a database operated for Impact Career Tutorials. Staff who follow up enquiries can see them."
- "Analytics": "This site does not currently run analytics or advertising scripts."
- "Your choices": `Write to ${contact.email} or message ${formatPhone(contact.whatsapp)} on WhatsApp to see, correct or delete what we hold about you.`

**terms** — title "Terms of use"; description "The terms on which this website is provided."

- "About this site": "This website is published by Impact Career Tutorials, North Lakhimpur, Assam. Course fees, batches and enrolment are handled through ICT's Classplus storefront and app, which have their own terms."
- "Accuracy": "We try to keep course and batch information current. Where this site and ICT's storefront disagree, the storefront is correct."
- "Online purchases": "This website does not currently sell anything online. Terms for online orders will be published here before that changes."
- "Contact": `Questions about these terms: ${contact.email}.`

**shipping** — title "Shipping and delivery"; description "How physical books ordered through this website would be delivered."

- one section "Not yet available": "Impact Career Tutorials does not currently take online orders for books through this website. Books are available at the centre on DC Bungalow Road, North Lakhimpur. Delivery areas, charges and dispatch times will be published on this page before online ordering opens."

**refunds** — title "Cancellations and refunds"; description "How cancellations and refunds are handled for orders placed through this website."

- one section "Not yet available": "Impact Career Tutorials does not currently take online payments through this website, so there is nothing to cancel or refund here. Course fees paid through ICT's Classplus storefront or app are governed by the terms shown there. This page will be updated with the cancellation and refund policy before online ordering opens."

Import `contact` and `formatPhone` from `./brand`. Also export
`export const policyBySlug = (slug: string) => policies.find((p) => p.slug === slug)`.

**Verify**: `bun run typecheck` → exit 0.

### Step 2: Policy content tests

Create `lib/policies.test.ts`:

```ts
import { describe, expect, test } from "bun:test"
import { policies } from "./policies"

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
      for (const s of doc.sections)
        for (const para of s.paragraphs) expect(para).not.toMatch(forbidden)
  })
  test("every document has a title, description and at least one section", () => {
    for (const doc of policies) {
      expect(doc.title.length).toBeGreaterThan(3)
      expect(doc.description.length).toBeGreaterThan(20)
      expect(doc.sections.length).toBeGreaterThan(0)
    }
  })
})
```

**Verify**: `bun test lib/policies.test.ts` → 3 pass.

### Step 3: Shared policy renderer and the four routes

Create `components/marketing/policy-page.tsx` — a Server Component taking
`{ doc: PolicyDocument }`, rendering the `success-stories` header shape (h1 =
`doc.title` in `text-foreground`, `doc.description` in `text-muted-foreground`),
then a `Section` with each section as `<h2 className="type-label ...">` and
`<p>` paragraphs, and — when `!doc.approved` — a visible notice **above the
content**, e.g. a `Badge` (from `@/components/ui/badge`) reading
"Draft — awaiting approval by Impact Career Tutorials" followed by one line
"This wording has not yet been approved and may change." Finish with a
"Last updated" line using `doc.updated`.

Create the four `app/<slug>/page.tsx` files, each:

```tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PolicyPage } from "@/components/marketing/policy-page"
import { policyBySlug } from "@/lib/policies"

const doc = policyBySlug("privacy")! // one literal per file

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description,
  alternates: { canonical: "/privacy" },
  ...(doc.approved ? {} : { robots: { index: false, follow: true } }),
}

export default function Page() {
  if (!doc) notFound()
  return <PolicyPage doc={doc} />
}
```

**Verify**: `bun run build` → exit 0 and the route list shows `/privacy /terms /shipping /refunds` as static. Route smoke (see Commands) → four `200`s. Robots check on `/shipping` → `noindex`.

### Step 4: `/contact`

Create `app/contact/page.tsx` as a Server Component using only `lib/brand`
facts and `contactHref`:

- metadata: title "Contact", description `Phone, WhatsApp, email and the address of Impact Career Tutorials on ${place.spoken}, North Lakhimpur.`, canonical `/contact`. This page **is** approved content (every value is already published on the site), so no `robots` override.
- h1 two-tone: "Talk to someone at ICT." / "Call, message on WhatsApp, or come to the centre."
- A grid of four items: **Call** — both `contact.phones` via `formatPhone`, `href={\`tel:${phone}\`}`; **WhatsApp** — `ButtonAnchor href={contactHref({ kind: "workshop" })} target="_blank"`; **Email** — `mailto:${contact.email}`; **Visit** — `place.street`, `place.city`, `place.region` `place.pin`, and a link "Open in Google Maps" to `place.maps`with`target="_blank" rel="noopener"`.
- Do **not** print opening hours. Add a single line: "Message first to check someone is at the desk." (a request, not a fact).
- Icons from `@tabler/icons-react` with `aria-hidden="true"`, matching `not-found.tsx:68`.

Append to `toConfirm` in `lib/brand.ts`:
`"Opening hours for /contact (none published anywhere by ICT)",`

**Verify**: route smoke → `contact 200`; `bun run check` → exit 0.

### Step 5: Footer and sitemap

- `site-footer.tsx`: add a fourth column `{ title: "Institute", items: [{ label: "Contact", href: "/contact" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Shipping", href: "/shipping" }, { label: "Refunds", href: "/refunds" }] }`. Check the footer grid class supports four columns at `md`; if it is hard-coded to three (`grid-cols-3`), change it to four at the widest breakpoint only.
- `app/sitemap.ts`: add `{ url: \`${siteUrl}/contact\`, changeFrequency: "monthly", priority: 0.6 }`and, for each`policies.filter((p) => p.approved)`, an entry at priority 0.3. With all four unapproved, only `/contact` is added.

**Verify**: `bun run build` → exit 0; `curl -s http://localhost:3000/sitemap.xml | grep -c "<loc>"` equals the previous count + 1; the footer renders five new links at 320 px and 1440 px (check in the browser preview: no horizontal scroll at 320 px).

### Step 6: Gates

`bun run format && bun run check && bun run build`.

## Test plan

- `lib/policies.test.ts` (Step 2) — the forbidden-values guard is the important one; it is what stops a charge from sneaking into an unapproved page.
- Route smoke via `curl` (Commands table).
- Visual: the draft badge is visible on the four policy pages; `/contact` has none.

## Done criteria

- [ ] `bun run check` and `bun run build` exit 0
- [ ] Five routes return 200; `/privacy`, `/terms`, `/shipping`, `/refunds` carry `noindex`; `/contact` does not
- [ ] `rg -n "₹|Rs\.|working days" lib/policies.ts` → 0 matches
- [ ] `rg -n "hours" app/contact/page.tsx` → 0 matches (no hours printed)
- [ ] sitemap gains exactly `/contact`
- [ ] `toConfirm` has the new hours line
- [ ] `docs/plans/README.md` row updated; KIT-45 checklist ticked for the five routes

## STOP conditions

- You find approved policy wording somewhere in the repo or `Website Req.pdf` that differs from the text above — report; do not merge the two.
- The footer cannot fit a fourth column without breaking 320 px — report with a screenshot rather than dropping links.
- Anyone (including a comment in the code) asks you to fill in a charge, hours or a refund window.

## Maintenance notes

- Approving a document = one commit that changes wording **and** sets `approved: true`, referencing the approval (email/date) in the commit body. The sitemap and `robots` follow the flag automatically.
- When Books go live, `shipping` and `refunds` must be rewritten with the approved rules _before_ Razorpay live keys are installed (spec §24).
- `/contact` should also get `ContactPage` structured data once approved hours exist; do not add it before.
