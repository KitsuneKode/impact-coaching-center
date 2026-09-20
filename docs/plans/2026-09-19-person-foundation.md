---
status: done
ticket: KIT-39
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md
---

# Person Foundation Implementation Plan

## Audit remediation — 19 September 2026

The original checklist records implementation history, not current release approval.
The follow-up audit at `891e1f5` reopened this plan with user authorization.

All eight items landed across `7c1e560..b1e7cf8`, verified against `bun run check`
(157 tests) and `bun run build`. Two defects were found while closing them out and
are fixed in that range: a resend left two live verification rows, so which code
was accepted depended on a `createdAt` tie and the stale one could win; and the
enquiry throttle rejected a genuine second enquiry inside a minute, telling a real
enquirer their message had failed. The honeypot also briefly became detectable and
was restored to a byte-identical reply, with the autofill false-positive it was
reacting to fixed at the field name instead.

- [x] Normalize phone identifiers before Better Auth reads or stores them; reject unsupported phone replacement before consuming a code.
- [x] Keep temporary auth names out of Person names; resolve authenticated identities to domain Person IDs and roles.
- [x] Exercise the actual phone plugin with a memory auth adapter and Convex test database: alternate formats, invalid inputs, retries, replay, attempt exhaustion, expiry, callback failure, and phone replacement.
- [x] Restrict logger transport to local Convex origins and reject unavailable transports before code creation.
- [x] Return truthful enquiry delivery states, preserve the WhatsApp fallback, and test missing configuration, timeout, rejection, validation and honeypot behavior.
- [x] Repair expired announcement wording, responsive menu scroll locking and video dialog height containment without redesign.
- [x] Reconcile the specification and record remaining launch slices, decision dependencies and migration/production checks.
- [x] Add CI for frozen-lockfile installation, check and production build; run local gates and review the final diff.

Implementation uses the installed Better Auth 1.6.33 plugin and Next.js 16.3.5
docs. No production data is migrated automatically. Existing noncanonical auth
identities require a separately reviewed reconciliation before deployment.
Product decisions are confirmed: enabled/disabled Book availability without stock
counts; no email verification fallback; Reader and checkout stay unavailable until
phone verification works. Hosting remains undecided pending comparison.

## Foundation dependencies confirmed — 20 September 2026

Domain-routing research and the proposed cutover sequence are recorded in
`docs/research/2026-09-20-course-domain-migration.md`. Preferred learning subdomain:
`learn.impactcareertutorials.in`, conditional on provider support and owner approval.
This is not permission to change DNS. Preserve numeric legacy Course URLs and
existing-student access before replacing the main-domain storefront.
Provider evidence and account-manager questions are recorded in
`docs/research/2026-09-20-classplus-integration.md`; custom-domain tutorials are
evidence of a product capability, not confirmation of ICT's API entitlement.

### Follow-up scope review — 20 September 2026

These are not part of this slice. They are tracked as their own Linear issues so
KIT-39 can close; the list is kept here only as the record of where they came from.

KIT-40 enquiry delivery, KIT-41 content sign-off, KIT-42 domain and deployment,
KIT-43 Business Profile and Search Console, KIT-44 accessibility and device passes,
KIT-45 policy pages and `/contact`, KIT-46 WhatsApp OTP transport, KIT-47 Classplus
access, KIT-48 missing content assets.

- [ ] Keep `learn.` migration documentation-only until preview validation and
      separately authorized deployment cutover. Vercel preview must not replace the
      existing site or use live payment credentials; see the migration research note.
- [ ] Confirm Blog publishing ownership and Careers meaning before designing the
      content workflow. Prefer existing editorial components and a small shared admin
      shell based on official shadcn blocks, not a second CMS/dashboard template.
- [ ] Before adding content editors, specify draft/published/archived visibility,
      stable slugs, owner-only publishing, safe rich-text rendering, image permissions
      and truthful metadata. Recruitment, if approved, needs vacancy expiry and a
      defined application destination; do not add CV storage or an applicant-tracking
      system without a real requirement and retention/access rules.
- [ ] Reconcile historical component-research claims (stock counts, broad staff
      writes and package-version recommendations) with current decisions at execution.
- [ ] Close operational gaps alongside features: owner bootstrap/recovery, bounded
      public submissions, minimal staff data access, backup/restore procedure, payment
      reconciliation, delivery failures, privacy-safe analytics and alerts for failed
      enquiry delivery/sync. These are release work, not decorative dashboard metrics.

This section records follow-on work, not completed functionality. The maintainer
requested implementation focus, not additional test scaffolding. Existing required
checks and production qualification remain gates; do not claim live readiness from
this plan update.

- [ ] Confirm ICT's supported Classplus catalogue access with its account manager:
      credentials/scopes, publication permissions, pagination, rate limits, stable IDs,
      media reuse, removal semantics and supported purchase URLs. Account ownership
      alone does not establish API access. Never use staff session cookies as a
      production integration credential.
- [ ] Resolve domain cutover before redirect changes: the new site replaces
      `www.impactcareertutorials.in`; Classplus must retain a supported separate
      storefront/purchase address. An API sync does not replace Classplus checkout or
      classroom URLs. Preserve old course-ID links without redirect loops.
- [ ] Evolve `scripts/sync-courses.ts` and `lib/catalogue-import.ts` into one
      server-side import path shared by scheduled and owner-triggered jobs. Keep
      `lib/catalogue.ts` as the current snapshot until a validated persisted snapshot
      can replace it; do not introduce dual manual catalogue editing.
- [ ] Persist sync run status and published snapshot identity in Convex. Validate
      all pages, IDs, prices, URLs and response bounds before atomically publishing;
      reject incomplete results, preserve last-good data, and never infer deletions
      from a failed or partial page. Use bounded retries/backoff, request timeouts,
      overlapping-job exclusion and stale-job recovery. Retain stable public slugs
      across title changes and local course visibility overrides across imports.
- [ ] Add owner-only Resync using existing UI primitives: pending/disabled state,
      last successful sync, counts and sanitized failure information. Staff may read
      status but cannot trigger jobs. Keep secrets and raw provider payloads off the
      client. Choose the schedule after provider limits are confirmed.
- [ ] Replace course purchase-intent WhatsApp links with verified Classplus
      destinations; keep counselling secondary. Public course browsing/handoff does
      not require our phone verification. Do not mirror Classplus identities,
      enrolments, payments or protected classroom content.
- [ ] Build Books as a separate owner-managed catalogue in Convex, independent of
      Classplus: approved titles, covers, editions, prices and enabled availability.
      Reuse existing Base UI/shadcn controls; no generic multi-provider commerce layer
      or shared Course/Book cart. Staff are read-only initially, including no exports
      by default; enforce role and field access on the backend, not only navigation.
- [ ] Build online-only Book ordering initially for both shipping and ICT
      collection. Cash collection, unpaid reservations and seller-created accounts
      require a later owner decision and are excluded from initial implementation.
      Never mark a seller-entered phone as verified or automatically opt a buyer into
      marketing. Owner manages fulfilment, cancellations and refunds with audit logs.
- [ ] Implement server-side delivery eligibility and quote calculation with
      explicit unconfigured/unsupported outcomes. Shipping stays unavailable until
      serviceable PIN codes, charges and dispatch rules are approved. Do not claim
      Assam-wide coverage or invent free delivery. Collection needs approved centre
      instructions and pickup timing; no shipping address should be required for it.
- [ ] Keep immutable Book/price/delivery snapshots on Orders; calculate totals in
      integer paise on the server and revalidate availability and quotes before
      payment. Reuse Razorpay checkout. Separate verified payment state from
      fulfilment state; deduplicate payment attempts/webhooks and reconcile delayed
      success without duplicate Orders. Disabled Books cannot enter new checkout;
      existing paid Orders require owner resolution, not silent deletion/backorder.
- [ ] Obtain owner decisions on serviceability/charges, collection readiness,
      cancellation/refund policy and contact-data visibility before enabling their
      dependent operations. Owner-only destructive/access changes must preserve
      financial history and prevent removal of the last owner.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Person model end to end — a phone number is parsed, verified by OTP, and stored in Convex as one record — with no third-party vendor involved, so the whole path is testable offline.

**Architecture:** Three seam-creating refactors land first, because Convex attaches to them: `resolveSiteUrl` takes its environment as a parameter, lead parsing moves out of the server action behind a `LeadSink`, and site-wide contact CTAs collapse behind an `EnquiryIntent`. Convex then arrives with the `persons` schema, and Better Auth's Phone Number plugin is wired with a logger OTP transport. WhatsApp, Turnstile, the Reader and the admin are deliberately absent — they are plans 2 and 3.

**Tech Stack:** Next.js 16.3.5 (App Router, React 19.2.4), Convex 1.46, `@convex-dev/better-auth` 0.12.5, `better-auth` 1.6.33, Bun's built-in test runner, Oxfmt + Oxlint.

**Spec:** `docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md`, sections 8–13. Decisions: `docs/adr/0001`, `0002`, `0003`. Vocabulary: `CONTEXT.md`.

## Global Constraints

- **Next.js floor:** `@opennextjs/cloudflare` declares `next: ">=15.5.24 <16 || >=16.3.3"`. Never downgrade below 16.3.3. Current: 16.3.5.
- **Version pins:** `better-auth` is pinned at `1.6.33` because `@convex-dev/better-auth@0.12.5` requires `>=1.6.11 <1.7.0`. Do not upgrade `better-auth` independently.
- **Vocabulary is binding.** Use `Person`, `Track`, `Course`, `Exam`, `Resource`, `Reader`, `Book`, `Order` exactly as `CONTEXT.md` defines them. Never write `user`, `customer` or `student` as a table or type name. `Lead` is sanctioned for the follow-up pipeline and its validated payload (`Lead`, `LeadSink`, `parseLead`) but never as a table; `student`/`staff`/`owner` are role _values_, not type names.
- **One record per mobile number.** There is no `leads` table and no `users` table. See ADR-0001.
- **Never log or return an OTP.** The development transport must be gated on deployment environment: the plugin stores the code even when delivery does nothing, so a no-op transport in production is a silent authentication bypass.
- **Authentication is not authorization.** Every Convex function checks role and record ownership itself.
- **No `transition-all`.** Respect `prefers-reduced-motion`. Animate transform and opacity only.
- **Gates:** `bun run check` after any code change; `bun run build` for anything touching routes, framework config, server/client boundaries, metadata or data fetching.
- **Personal data never enters analytics.** No phone numbers, names, emails, free text or verification codes.

---

### Task 1: Test runner and the site-URL seam

`lib/site.ts` resolves the deployment URL from `VERCEL_*` variables that do not exist on Cloudflare Workers, then silently falls back to `http://localhost:3000`. That value flows into `metadataBase`, every canonical URL, the sitemap, the OG image and the LocalBusiness `@id`. It is also a module-scope `const`, so its resolution order — the entire point of the module — cannot be exercised. This task adds the runner and fixes it.

**Files:**

- Modify: `package.json` (add the `test` script)
- Modify: `lib/site.ts`
- Create: `lib/site.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: `resolveSiteUrl(env: NodeJS.ProcessEnv): string` — exported, pure. `siteUrl: string` and `indexable: boolean` keep their current names and types so existing importers are untouched.

- [x] **Step 1: Add the test script**

In `package.json`, add to `"scripts"`:

```json
"test": "bun test"
```

Bun's runner is built in and Jest-compatible; no dependency is added.

- [x] **Step 2: Write the failing test**

Create `lib/site.test.ts`:

```ts
import { describe, expect, test } from "bun:test"

import { resolveSiteUrl } from "./site"

describe("resolveSiteUrl", () => {
  test("prefers an explicit site URL", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://impactcareertutorials.in",
      })
    ).toBe("https://impactcareertutorials.in")
  })

  test("strips a trailing slash", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://ict.in/" })).toBe(
      "https://ict.in"
    )
  })

  test("falls back to localhost outside production", () => {
    expect(resolveSiteUrl({ NODE_ENV: "development" })).toBe(
      "http://localhost:3000"
    )
  })

  test("throws in production rather than publishing localhost", () => {
    expect(() => resolveSiteUrl({ NODE_ENV: "production" })).toThrow(
      /NEXT_PUBLIC_SITE_URL/
    )
  })
})
```

- [x] **Step 3: Run it and watch it fail**

Run: `bun test lib/site.test.ts`
Expected: FAIL — `resolveSiteUrl` is not exported.

- [x] **Step 4: Make it pass**

In `lib/site.ts`, replace the `resolveSiteUrl` function and the `siteUrl` const with:

```ts
export function resolveSiteUrl(env: NodeJS.ProcessEnv): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, "")

  // Workers exposes no deployment-URL variable of its own - unlike
  // Cloudflare Pages - so production must set NEXT_PUBLIC_SITE_URL
  // explicitly in wrangler.jsonc. There is nothing to fall back to.
  if (env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be set in production. Falling back to localhost would publish localhost URLs in canonicals, the sitemap and the LocalBusiness @id."
    )
  }

  return "http://localhost:3000"
}

export const siteUrl = resolveSiteUrl(process.env)
```

Keep the existing doc comment, updating "then Vercel's own system variables" to name Cloudflare instead. Leave `indexable` exactly as it is.

- [x] **Step 5: Run the test and the gates**

Run: `bun test lib/site.test.ts` — Expected: PASS, 4 tests.
Run: `bun run check` — Expected: clean.
Run: `bun run build` — Expected: success. This touches metadata, so the build gate is required.

- [x] **Step 6: Commit**

```bash
git add package.json lib/site.ts lib/site.test.ts
git commit -m "fix: resolve the site URL from the host we actually deploy to

lib/site.ts read Vercel system variables that do not exist on Cloudflare
Workers, then fell back to http://localhost:3000 silently. That value
feeds metadataBase, every canonical, the sitemap, the OG image and the
LocalBusiness @id, so one unset variable would have published localhost
URLs to search engines.

resolveSiteUrl now takes env as a parameter, which makes its resolution
order testable, and throws in production instead of falling back. Adds
Bun's built-in test runner, which the repo had no equivalent of."
```

---

### Task 2: The Lead module and its `LeadSink` seam

`app/actions/lead.ts` holds four separable concerns in one server action. The allowed-course vocabulary is duplicated byte-identically at `components/marketing/lead-form.tsx:25` and `app/actions/lead.ts:22`. Phone normalisation is written twice with the same regex, in `lead.ts` and `lib/brand.ts:560`. The honeypot branch returns the raw phone while the real path returns `+91`-prefixed, an undocumented divergence that survives only because `formatPhone` re-normalises. Delivery is inlined and swallows every failure into `console.error`.

**Files:**

- Create: `lib/leads.ts`
- Create: `lib/leads.test.ts`
- Modify: `app/actions/lead.ts`
- Modify: `components/marketing/lead-form.tsx:25`

**Interfaces:**

- Consumes: `tracks`, `timings` from `lib/brand.ts`.
- Produces:
  - `type E164 = string & { readonly __e164: unique symbol }`
  - `const enquiryCourses: readonly string[]` — the single source of the option list
  - `type Lead = { name: string; phone: E164; course: string; timing: string; source: string }`
  - `type FieldErrors = Partial<Record<"name" | "phone" | "course" | "timing", string>>`
  - `parseLead(input: Record<string, string>): { ok: true; lead: Lead } | { ok: false; errors: FieldErrors }`
  - `interface LeadSink { submit(lead: Lead): Promise<void> }`

- [x] **Step 1: Write the failing test**

Create `lib/leads.test.ts`:

```ts
import { describe, expect, test } from "bun:test"

import { enquiryCourses, parseLead } from "./leads"

const valid = {
  name: "Rituparna Das",
  phone: "98765 43210",
  course: enquiryCourses[0]!,
  timing: "Morning",
}

describe("parseLead", () => {
  test("normalises a spaced mobile number to E.164", () => {
    const result = parseLead(valid)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.lead.phone).toBe("+919876543210")
  })

  test("accepts a number already carrying the country code", () => {
    const result = parseLead({ ...valid, phone: "+91 98765 43210" })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.lead.phone).toBe("+919876543210")
  })

  test("rejects a mobile number that is too short", () => {
    const result = parseLead({ ...valid, phone: "98765" })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.phone).toBeDefined()
  })

  test("rejects an Indian landline prefix", () => {
    const result = parseLead({ ...valid, phone: "1234567890" })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.phone).toBeDefined()
  })

  test("rejects a course outside the published list", () => {
    const result = parseLead({ ...valid, course: "Astrophysics" })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.course).toBeDefined()
  })

  test("reports every invalid field at once", () => {
    const result = parseLead({ name: "R", phone: "1", course: "", timing: "" })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "course",
        "name",
        "phone",
        "timing",
      ])
    }
  })

  test("offers 'Not sure yet' as a real choice", () => {
    expect(enquiryCourses).toContain("Not sure yet")
  })
})
```

- [x] **Step 2: Run it and watch it fail**

Run: `bun test lib/leads.test.ts`
Expected: FAIL — cannot resolve `./leads`.

- [x] **Step 3: Write the module**

Create `lib/leads.ts`:

```ts
import { timings, tracks } from "@/lib/brand"

/** A mobile number in E.164, the only phone shape that may leave this module. */
export type E164 = string & { readonly __e164: unique symbol }

/** The enquiry options, declared once. The form renders these; the action validates against them. */
export const enquiryCourses = [
  ...tracks.map((track) => track.exam),
  "Not sure yet",
] as const satisfies readonly string[]

export const enquiryTimings = [...timings] as const satisfies readonly string[]

export type Lead = {
  name: string
  phone: E164
  course: string
  timing: string
  source: string
}

export type LeadField = "name" | "phone" | "course" | "timing"
export type FieldErrors = Partial<Record<LeadField, string>>

export type ParseResult =
  { ok: true; lead: Lead } | { ok: false; errors: FieldErrors }

/** Indian mobile numbers start 6-9 and are ten digits. */
const MOBILE = /^[6-9]\d{9}$/

function toE164(input: string): E164 | null {
  const digits = input.replace(/\D/g, "").slice(-10)
  return MOBILE.test(digits) ? (`+91${digits}` as E164) : null
}

export function parseLead(input: Record<string, string>): ParseResult {
  const name = (input.name ?? "").trim()
  const course = input.course ?? ""
  const timing = input.timing ?? ""
  const phone = toE164(input.phone ?? "")

  const errors: FieldErrors = {}
  if (name.length < 2 || name.length > 80) {
    errors.name = "Please enter your name."
  }
  if (!phone) errors.phone = "Please enter a 10 digit mobile number."
  if (!enquiryCourses.includes(course as (typeof enquiryCourses)[number])) {
    errors.course = "Please pick a course."
  }
  if (!enquiryTimings.includes(timing as (typeof enquiryTimings)[number])) {
    errors.timing = "Please pick a time of day."
  }

  if (Object.keys(errors).length > 0 || !phone) return { ok: false, errors }

  return {
    ok: true,
    lead: { name, phone, course, timing, source: input.source ?? "website" },
  }
}

/**
 * Where a parsed Lead goes. Two adapters exist, which is what makes this a
 * real seam rather than a hypothetical one: the webhook today, Convex next.
 */
export interface LeadSink {
  submit(lead: Lead): Promise<void>
}
```

- [x] **Step 4: Run the test**

Run: `bun test lib/leads.test.ts`
Expected: PASS, 7 tests.

- [x] **Step 5: Use the module from the server action**

In `app/actions/lead.ts`, delete the local `courseOptions`, `timingOptions`, the inline `digits` normalisation and the inline validation block. Import `parseLead` and build the webhook adapter:

```ts
import { type Lead, type LeadSink, parseLead } from "@/lib/leads"

const webhookSink: LeadSink = {
  async submit(lead: Lead) {
    const webhook = process.env.LEAD_WEBHOOK_URL
    if (!webhook) return
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...lead, receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) {
      throw new Error(`Lead webhook responded ${response.status}`)
    }
  },
}
```

Keep the honeypot early return, but return the _parsed_ values so the `ok` branch has one phone format rather than two:

```ts
const parsed = parseLead({
  name: String(formData.get("name") ?? ""),
  phone: String(formData.get("phone") ?? ""),
  course: String(formData.get("course") ?? ""),
  timing: String(formData.get("timing") ?? ""),
})

// Honeypot: real people never see this field. Bots fill it. Pretend success.
if (String(formData.get("company") ?? "").length > 0) {
  return { status: "ok", name: "", phone: "", course: "", timing: "" }
}

if (!parsed.ok) {
  return {
    status: "error",
    errors: parsed.errors,
    values: {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      course: String(formData.get("course") ?? ""),
      timing: String(formData.get("timing") ?? ""),
    },
  }
}
```

- [x] **Step 6: Remove the duplicated option list from the form**

In `components/marketing/lead-form.tsx`, delete line 25's local `const courseOptions = [...tracks.map((t) => t.exam), "Not sure yet"]` and import the shared list instead:

```ts
import { enquiryCourses } from "@/lib/leads"
```

Replace every use of `courseOptions` in that file with `enquiryCourses`. Remove the now-unused `tracks` import if nothing else in the file uses it.

- [x] **Step 7: Run the gates**

Run: `bun test` — Expected: PASS, 11 tests across both files.
Run: `bun run check` — Expected: clean. Oxlint will flag the unused `tracks` import if step 6 missed it.
Run: `bun run build` — Expected: success. This touches a server action.

- [x] **Step 8: Commit**

```bash
git add lib/leads.ts lib/leads.test.ts app/actions/lead.ts components/marketing/lead-form.tsx
git commit -m "refactor: put lead parsing behind a LeadSink seam

The enquiry option list was duplicated byte-identically in the form and
the server action, phone normalisation was written twice with the same
regex, and the honeypot branch returned a raw phone while the real path
returned E.164 - a divergence that only survived because formatPhone
re-normalised on the way out.

parseLead is now a pure function over a plain object, so every rule is
assertable without FormData or a server action, and LeadSink gives
Convex somewhere to attach as a second adapter."
```

---

### Task 3: Convex and the `persons` schema

Convex arrives with one table. Per ADR-0001 there is no separate lead or user table: an unverified enquirer and a verified account holder are the same record, distinguished by `verifiedAt`.

**Files:**

- Modify: `package.json`
- Create: `convex/convex.config.ts`
- Create: `convex/schema.ts`
- Create: `convex/persons.ts`
- Create: `convex/persons.test.ts`
- Modify: `tsconfig.json`

**Interfaces:**

- Consumes: `E164` from `lib/leads.ts`.
- Produces:
  - Convex table `persons`, indexed `by_phone` on `["phone"]`.
  - `upsertPersonByPhone(ctx, { phone, name, source })` — internal helper returning `Id<"persons">`. Creates when the phone is unseen, updates `name` only when the stored one is empty.
  - Convex table `activities`, indexed `by_person` on `["personId"]`.

- [x] **Step 1: Install Convex**

```bash
bun add convex@latest
```

- [x] **Step 2: Declare the component app**

Create `convex/convex.config.ts`:

```ts
import { defineApp } from "convex/server"

const app = defineApp()

export default app
```

Better Auth is registered here in Task 4, not now.

- [x] **Step 3: Write the schema**

Create `convex/schema.ts`:

```ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

/**
 * One record per mobile number. See docs/adr/0001 and CONTEXT.md: an
 * anonymous enquirer and a verified account holder are the same Person,
 * separated by verifiedAt, not by living in different tables.
 */
export default defineSchema({
  persons: defineTable({
    phone: v.string(), // E.164, the natural key
    name: v.string(),
    email: v.optional(v.string()), // a real address, never the synthetic one
    verifiedAt: v.optional(v.number()),
    role: v.union(v.literal("student"), v.literal("staff"), v.literal("owner")),
    // Absent until the Person shows intent. Reading a Resource does not
    // make someone a lead, or staff drown in casual readers.
    leadStatus: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("interested"),
        v.literal("enrolled"),
        v.literal("lost")
      )
    ),
    assigneeId: v.optional(v.id("persons")),
    nextFollowUpAt: v.optional(v.number()),
    source: v.string(),
    campaignId: v.optional(v.string()),
    interestTrack: v.optional(v.string()),
    consent: v.optional(
      v.object({
        granted: v.boolean(),
        at: v.number(),
        wordingVersion: v.string(),
      })
    ),
    waWindowExpiresAt: v.optional(v.number()),
  }).index("by_phone", ["phone"]),

  // Free text lives here, never on the Person record, so an export of
  // persons cannot leak staff notes.
  activities: defineTable({
    personId: v.id("persons"),
    kind: v.union(
      v.literal("status_change"),
      v.literal("note"),
      v.literal("call"),
      v.literal("whatsapp_handoff")
    ),
    body: v.optional(v.string()),
    actorId: v.optional(v.id("persons")),
  }).index("by_person", ["personId"]),
})
```

- [x] **Step 4: Write the failing test for the upsert rule**

Create `convex/persons.test.ts`:

```ts
import { describe, expect, test } from "bun:test"

import { mergePersonName } from "./persons"

describe("mergePersonName", () => {
  test("keeps the stored name when one already exists", () => {
    expect(mergePersonName("Rituparna Das", "R")).toBe("Rituparna Das")
  })

  test("adopts the incoming name when the stored one is empty", () => {
    expect(mergePersonName("", "Rituparna Das")).toBe("Rituparna Das")
  })

  test("trims the incoming name", () => {
    expect(mergePersonName("", "  Rituparna  ")).toBe("Rituparna")
  })
})
```

- [x] **Step 5: Run it and watch it fail**

Run: `bun test convex/persons.test.ts`
Expected: FAIL — cannot resolve `./persons`.

- [x] **Step 6: Write the persons module**

Create `convex/persons.ts`:

```ts
import type { MutationCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

/**
 * A Person's name is whatever we learned first. A later enquiry that
 * carries a worse name - an initial, a nickname - must not overwrite a
 * good one, but an empty stored name should be filled.
 */
export function mergePersonName(stored: string, incoming: string): string {
  const trimmed = incoming.trim()
  if (stored.trim().length > 0) return stored
  return trimmed
}

export async function upsertPersonByPhone(
  ctx: MutationCtx,
  args: { phone: string; name: string; source: string }
): Promise<Id<"persons">> {
  const existing = await ctx.db
    .query("persons")
    .withIndex("by_phone", (q) => q.eq("phone", args.phone))
    .unique()

  if (existing) {
    const name = mergePersonName(existing.name, args.name)
    if (name !== existing.name) await ctx.db.patch(existing._id, { name })
    return existing._id
  }

  return await ctx.db.insert("persons", {
    phone: args.phone,
    name: args.name.trim(),
    role: "student",
    source: args.source,
  })
}
```

- [x] **Step 7: Run the test**

Run: `bun test convex/persons.test.ts`
Expected: PASS, 3 tests.

- [x] **Step 8: Deploy the schema to a local Convex deployment**

```bash
CONVEX_AGENT_MODE=anonymous bunx convex dev --once
```

Expected: `Convex functions ready!`. This runs a local backend and creates no cloud account. It writes `.env.local` with `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`.

- [x] **Step 9: Confirm `.env.local` is ignored**

Run: `git check-ignore -v .env.local`
Expected: a match from `.gitignore`. If there is no match, add `.env.local` to `.gitignore` and commit that first — the file names a deployment.

- [x] **Step 10: Run the gates**

Run: `bun test` — Expected: PASS, 14 tests.
Run: `bun run check` — Expected: clean. If `tsc` reports that `convex/_generated` is missing, re-run step 8 to generate it.
Run: `bun run build` — Expected: success.

- [x] **Step 11: Commit**

```bash
git add package.json bun.lock convex/ tsconfig.json
git commit -m "feat: add Convex with the persons schema

One table keyed by mobile number, per ADR-0001: an unverified enquirer
and a verified account holder are the same Person, separated by
verifiedAt rather than by living in different tables.

leadStatus is deliberately optional. Reading a Resource creates a Person
but not a lead, so the staff work queue stays the people who showed
intent rather than every casual reader. Free text lives in activities,
so an export of persons cannot leak staff notes."
```

---

### Task 4: Better Auth phone verification with a logger transport

The spike proved this path end to end: `send-otp` fires the transport, `verify` creates the account with `phoneNumberVerified: true`, and an authenticated Convex query returns the Person. It also found that `getAuthUser` throws for anonymous visitors, which is why public surfaces use `safeGetAuthUser`.

**Files:**

- Modify: `package.json`
- Modify: `convex/convex.config.ts`
- Create: `convex/auth.config.ts`
- Create: `convex/auth.ts`
- Create: `convex/http.ts`
- Create: `lib/auth-server.ts`
- Create: `lib/auth-client.ts`
- Create: `app/api/auth/[...all]/route.ts`
- Create: `lib/otp-transport.ts`
- Create: `lib/otp-transport.test.ts`

**Interfaces:**

- Consumes: `upsertPersonByPhone` from `convex/persons.ts`.
- Produces:
  - `createAuth(ctx)` — the Better Auth instance with the Phone Number plugin.
  - `authComponent` — the component client.
  - `getCurrentPerson` — a Convex query returning the signed-in Person or `null`.
  - `sendOtp(target: { phoneNumber: string; code: string }): void` from `lib/otp-transport.ts`.

- [x] **Step 1: Install the pinned versions**

```bash
bun add @convex-dev/better-auth@0.12.5 better-auth@1.6.33
```

The pin is mandatory: the component requires `better-auth >=1.6.11 <1.7.0` while upstream is already past 1.7.

- [x] **Step 2: Write the failing transport test**

Create `lib/otp-transport.test.ts`:

```ts
import { describe, expect, test } from "bun:test"

import { chooseTransport } from "./otp-transport"

describe("chooseTransport", () => {
  test("uses the logger in development", () => {
    expect(chooseTransport("development")).toBe("logger")
  })

  test("refuses the logger in production", () => {
    expect(() => chooseTransport("production")).toThrow(/production/i)
  })
})
```

The rule under test is the one that matters: the plugin stores the code even when delivery does nothing, so a logger reaching production is a silent authentication bypass.

- [x] **Step 3: Run it and watch it fail**

Run: `bun test lib/otp-transport.test.ts`
Expected: FAIL — cannot resolve `./otp-transport`.

- [x] **Step 4: Write the transport**

Create `lib/otp-transport.ts`:

```ts
export type TransportName = "logger" | "whatsapp"

/**
 * Which OTP transport may run. The Phone Number plugin stores the code
 * even when sendOTP does nothing and raises no warning, so a logger that
 * reaches production would verify anyone. Fail loudly instead.
 */
export function chooseTransport(nodeEnv: string | undefined): TransportName {
  if (nodeEnv === "production") {
    throw new Error(
      "No production OTP transport is configured. The development logger must never run in production: it would store a code nobody received and accept it."
    )
  }
  return "logger"
}

export function sendOtp(target: { phoneNumber: string; code: string }): void {
  chooseTransport(process.env.NODE_ENV)
  // Development only. Replaced by the WhatsApp adapter in plan 2.
  console.log(`[otp] ${target.phoneNumber}: ${target.code}`)
}
```

- [x] **Step 5: Run the test**

Run: `bun test lib/otp-transport.test.ts`
Expected: PASS, 2 tests.

- [x] **Step 6: Register the Better Auth component**

Replace `convex/convex.config.ts`:

```ts
import betterAuth from "@convex-dev/better-auth/convex.config"
import { defineApp } from "convex/server"

const app = defineApp()
app.use(betterAuth)

export default app
```

- [x] **Step 7: Configure the auth provider**

Create `convex/auth.config.ts`:

```ts
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config"
import type { AuthConfig } from "convex/server"

export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig
```

- [x] **Step 8: Wire the Phone Number plugin**

Create `convex/auth.ts`:

```ts
import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { betterAuth } from "better-auth/minimal"
import { phoneNumber } from "better-auth/plugins"

import { sendOtp } from "../lib/otp-transport"
import authConfig from "./auth.config"
import { components } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import { query } from "./_generated/server"

export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    database: authComponent.adapter(ctx),
    plugins: [
      phoneNumber({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 5,
        // Not awaited: awaiting it adds request latency and leaks,
        // through timing, whether a number is already registered.
        sendOTP: (data) => {
          void sendOtp({ phoneNumber: data.phoneNumber, code: data.code })
        },
        signUpOnVerification: {
          // Better Auth's core requires a unique email, so verified
          // Persons carry a placeholder. It must never receive mail and
          // must never appear in an export as a contactable address.
          getTempEmail: (phone) => `${phone}@person.ict.invalid`,
        },
      }),
      convex({ authConfig }),
    ],
  })

/**
 * The signed-in Person, or null when nobody is signed in.
 *
 * Uses safeGetAuthUser deliberately: getAuthUser throws ConvexError
 * "Unauthenticated" for anonymous visitors, which on a public page renders
 * a 500 for everyone who is not signed in.
 */
export const getCurrentPerson = query({
  args: {},
  handler: async (ctx) => authComponent.safeGetAuthUser(ctx),
})
```

- [x] **Step 9: Register the HTTP routes**

Create `convex/http.ts`:

```ts
import { httpRouter } from "convex/server"

import { authComponent, createAuth } from "./auth"

const http = httpRouter()

authComponent.registerRoutesLazy(http, createAuth, {
  basePath: "/api/auth",
  cors: true,
  trustedOrigins: [process.env.SITE_URL!],
})

export default http
```

- [x] **Step 10: Add the Next.js side**

Create `lib/auth-server.ts`:

```ts
import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs"

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
})
```

Create `app/api/auth/[...all]/route.ts`:

```ts
import { handler } from "@/lib/auth-server"

export const { GET, POST } = handler
```

- [x] **Step 11: Set the deployment environment variables**

```bash
CONVEX_AGENT_MODE=anonymous bunx convex env set SITE_URL http://localhost:3000
CONVEX_AGENT_MODE=anonymous bunx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
```

- [x] **Step 12: Verify the flow end to end by hand**

Start both servers:

```bash
CONVEX_AGENT_MODE=anonymous bunx convex dev --tail-logs always
bun run dev
```

Request a code:

```bash
curl -s -X POST http://localhost:3000/api/auth/phone-number/send-otp \
  -H 'content-type: application/json' \
  -d '{"phoneNumber":"+919876543210"}'
```

Expected: `{"message":"code sent"}`, and `[otp] +919876543210: <six digits>` in the Convex log.

Verify it, substituting the code:

```bash
curl -s -X POST http://localhost:3000/api/auth/phone-number/verify \
  -H 'content-type: application/json' \
  -d '{"phoneNumber":"+919876543210","code":"<code>"}'
```

Expected: HTTP 200, a `token`, and a user carrying `phoneNumberVerified: true`.

- [x] **Step 13: Run the gates**

Run: `bun test` — Expected: PASS, 16 tests.
Run: `bun run check` — Expected: clean.
Run: `bun run build` — Expected: success. This adds a route handler.

- [x] **Step 14: Commit**

```bash
git add package.json bun.lock convex/ lib/auth-server.ts lib/otp-transport.ts lib/otp-transport.test.ts app/api/
git commit -m "feat: verify a phone number with Better Auth on Convex

Phone Number plugin with a development logger transport, so the whole
verification path runs offline with no vendor involved. WhatsApp arrives
in plan 2 as a second transport behind the same call.

The logger throws rather than running in production: the plugin stores
the code even when delivery does nothing and raises no warning, so a
no-op transport in production would accept a code nobody received.

getCurrentPerson uses safeGetAuthUser because getAuthUser throws for
anonymous visitors, which would render a 500 on every public page for
everyone who is not signed in."
```

---

## What this plan deliberately excludes

- **Plan 2 — the gate and the Reader:** the WhatsApp Cloud API transport behind the same `sendOtp` call, Turnstile verified server-side before any billed send, Convex rate limiting per phone and per IP with a daily ceiling, the resource gate UI, browser-side rasterisation at upload, and the Reader itself.
- **Plan 3 — operations:** the admin action queue, the Person detail and activity history, CSV export with an audit record, and the PostHog adapter with its typed event union.

Each produces working software on its own. Neither can be specified honestly until this one lands, because both attach to `persons` and to `sendOtp`.

## Where execution diverged from the plan

- **Enquiry ingestion landed in this slice.** `/enquiries`, `recordEnquiry`, the
  `enquiry` activity kind and `persons.lastEnquiryAt`/`lastEnquiryKey` are in none of
  Task 3's produces list. Recorded after the fact in `docs/adr/0004`.
- **Rate limiting moved forward from plan 2.** This slice introduced the unauthenticated
  public write path the ceilings exist to bound, so shipping it without them was not
  defensible. It does not discharge spec §10's ceilings on billed OTP sends, which are
  still outstanding (KIT-46).
- **`course` was renamed to `track` across the enquiry path.** The options are Tracks
  labelled by their Exam, and CONTEXT.md reserves Course for a Classplus product with an
  id. Done before merge, while the Convex field had no rows to migrate.

- **Task 1 parameter type.** `NodeJS.ProcessEnv` makes `NODE_ENV` mandatory, so every
  caller would have had to supply it. Changed to `Record<string, string | undefined>`.
- **Task 1 throw condition.** Throwing on every production build broke `bun run build`,
  a gate AGENTS.md asks every contributor to run. Narrowed to an _indexable_ production
  build, which is where the fallback does irreversible damage.
- **Task 1 host coupling.** `CF_PAGES_URL` was dropped and no platform is named: the
  host is no longer settled, and reading one platform's variables is what coupled this
  module to Vercel originally.
- **Task 4 transport signal.** `NODE_ENV` cannot distinguish development from production
  inside Convex functions, which always report `production`. Replaced with an explicit
  `OTP_TRANSPORT` deployment setting that fails closed when unset — stronger than the
  original design, because choosing the logger became a deliberate, auditable act.
- **Branded `E164` in tests.** Comparing against a string literal fails typecheck, which
  is the brand working; assertions widened with `String(...)`.

## Divergences found by review, not by the plan

A review of the branch found four things the divergence log above missed, all now fixed:

- **`upsertPersonByPhone` had zero callers**, so verification created a Better Auth
  user and no Person. The slice's headline deliverable did not exist. Now wired through
  `callbackOnVerification`.
- **`lib/auth-client.ts` was listed under Task 4's files and never created.** It is not
  needed until a client component signs in, which is plan 2.
- **`E164` was not consumed at the Convex boundary**, despite Task 3 declaring it.
- **The `tsconfig.json` change Task 3 lists** was never made; Convex generates its own
  `convex/tsconfig.json`, which is what the project actually uses.

It also found that `toE164` silently rewrote numbers — `"9876543210 ext 123"` became
`+916543210123`, a different real mobile — and that three comments in this slice
asserted the opposite of what the code did. Both classes of defect are fixed, and the
comments now match behaviour.

## Open questions this plan assumes an answer to

- **`leadStatus` starts absent.** A Person created by reading a Resource is not a lead until they show intent. If that is wrong, `convex/schema.ts` and the admin's default queue both change.
- **Local Convex for development.** Anonymous mode keeps a cloud account out of it. A production deployment is a separate, client-owned decision.
