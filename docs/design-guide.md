# ICT design guide

**Status:** draft, 22 September 2026. Two decisions are still open (§9) and are
marked inline. Everything else is a contract: if you are building a screen for
this project, this file and `app/globals.css` are the two things to read.

`app/globals.css` is the **source of truth** for tokens. This file explains the
system, covers what CSS cannot express, and fills the gaps that made the
transactional screens drift.

## 1. The diagnosis this guide exists to fix

The marketing pages and the transactional pages look like two different
products. They aren't governed by two systems — there is only one, documented
at the top of `app/globals.css`. The transactional screens simply don't use it.

`components/marketing/sign-in-form.tsx` defines its input as a 13-line inline
class string that exists nowhere else in the codebase. That is the whole bug.
Every fix below is a way of making the shortest path also the correct one.

## 2. Register

One system, two voices. Pick by what the screen asks of the person.

**Editorial** — home, courses, success stories, contact, library, blog.
Persuasion. Generous rhythm, fluid display type, the highlighter, documentary
photography, reveal-on-scroll. Read the register note at the top of
`app/globals.css`: calm editorial, near-white ground, two-tone paragraphs
instead of shouting headlines, hairlines instead of boxes.

**Transactional** — sign-in, cart, checkout, orders, admin, the Reader.
Clarity. Same tokens, same type scale, same radii — but tighter vertical
rhythm, no decorative motion, no highlighter, denser information. Ornament is
friction once someone is entering a delivery address.

**What does not change between them:** colour roles, radii, shadows, focus
treatment, type scale, spacing units. A transactional screen is not a different
design — it is the same design with the persuasion removed.

## 3. Colour

All roles derive from the ICT logo and are already defined. Do not add a colour
without adding a role.

| Role  | Token                       | Used for                        | Never                          |
| ----- | --------------------------- | ------------------------------- | ------------------------------ |
| ink   | `--foreground`, `--primary` | text, every CTA                 | —                              |
| blue  | `--brand`                   | links, focus ring, brand marks  | body text                      |
| amber | `--highlight`               | the highlighter mark, selection | backgrounds, badges            |
| green | `--verified`                | verified state only             | success toasts, generic "good" |
| red   | `--destructive`             | errors, destructive actions     | emphasis                       |

**Amber is not a warning colour and green is not a success colour.** They mean
"this is the phrase that matters" and "this number is verified". Reusing them
generically destroys the one signal they carry. The draft notice on `/library`
and the policy pages is the single sanctioned amber surface.

Never rely on colour alone for status — AGENTS.md accessibility baseline.

## 4. Shape, depth, type

**Radius, no exceptions.** Control (button, input, chip) → `rounded-control`
(10px). Surface (card, panel, frame) → `rounded-card` (16px). If you are
reaching for a third radius, you are building the wrong element.

**Shadows** are `--shadow-frame` (resting) and `--shadow-lift` (raised). Both
are tinted to the ink; pure black shadow is a bug.

**Borders** are hairlines at 9% ink. Prefer a hairline to a filled box.

**Type** is Inter only (`--font-sans`), with `--font-as` for Assamese.
`.type-display` for page and section heads, `.type-lede` for openers,
`.type-label` for the quiet grey label above a lede, `.tnum` for any number
that changes — prices, counts, phone numbers, OTP boxes. Weight stays 400 for
display type; the hierarchy comes from size and colour, not from bolding.

## 5. Forms — the gap that caused the drift

**Never hand-roll an input again.** Forms use shadcn's `Field` family on Base
UI. Layout is `FieldGroup` + `Field`, never a `div` with `space-y-*`.

- Validation state is `data-invalid` on `Field` and `aria-invalid` on the
  control. Disabled is `data-disabled` on `Field`, `disabled` on the control.
- **Validate on blur, not on keystroke.** Keystroke validation shows an error
  while someone is still typing the fourth digit of a ten-digit number.
  Re-validate on change only _after_ a field has already failed once, so a
  correction clears the error immediately.
- Error text replaces the description in place; it never appears above the
  field or in a floating toast. The person is looking at the field.
- Every input has a real `<label>` and a correct `autocomplete`
  (`tel-national`, `one-time-code`, `street-address`, `postal-code`).
- Fixed affixes use `InputGroup` + `InputGroupAddon`. **`+91` is a
  non-editable addon**, not placeholder text — a Person is keyed by an Indian
  mobile number (ADR-0001), so the country is a fact about the system, not a
  choice.
- Six-digit codes use `InputOTP`, never a text input with `maxLength`.

**Preserve input on failure, always.** A submission that fails for any reason —
validation, network, expired session — must leave every field as the person
left it. This is a hard rule, not a nicety: the runbook makes it an acceptance
gate for every lane.

## 6. The state convention

This is the shared contract the execution runbook (§2) requires before the
parallel lanes can start. Every list and every form implements these, built
from the same primitives, with the same words.

| State             | Built from                            | Rule                                                                                                                       |
| ----------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| loading           | `Skeleton` in the shape of the result | Never a bare spinner for a first load; never a bare "Loading…" with no heading                                             |
| loading-more      | `Spinner` inside the Load more button | The list stays put; nothing reflows                                                                                        |
| empty             | `Empty`                               | "Nothing here yet" — the collection is genuinely empty                                                                     |
| no-match          | `Empty`, **different copy**           | "Nothing matched" — filters excluded everything. A different problem, so different words and an action to clear the filter |
| error + retry     | `error.tsx` with `retry()`            | Keeps site chrome. Says what failed. Next 16 uses `retry()`, not `reset()`                                                 |
| saving            | Button `disabled` + `Spinner`         | Button keeps its width; no layout shift                                                                                    |
| success           | after acknowledgement only            | Never optimistic for anything involving money, a message or a record                                                       |
| permission expiry | inline, input preserved               | Offer re-auth in place. Never discard what they typed                                                                      |
| unavailable       | inline panel                          | The dependency is missing (e.g. no Convex URL). Say it is not their fault                                                  |

**Every page keeps its heading in every state.** A page that cannot say what it
is until data arrives has no heading for a screen reader to announce. This was a
real defect on `/admin/leads`, fixed in `2180505`.

## 7. Motion

Motion explains a state change or reinforces hierarchy. It never decorates.

- `.enter` for above-the-fold content — CSS, so it paints without hydration.
- `Reveal` / `RevealGroup` for below-the-fold editorial sections only.
- `.mark` — the highlighter — **at most twice per page**, on the phrase that
  matters.
- **No `transition-all`.** Ever. There is a test guarding this.
- Respect `prefers-reduced-motion`; the global rule in `globals.css` collapses
  durations. Content must be readable and usable with every animation removed.
- **Transactional screens get no reveal animation.** A form does not need to
  introduce itself.

`Reveal` renders visible in SSR and arms the hidden state only after hydration
for blocks still below the fold, so a stalled bundle can never strand content.
The trade-off: above-the-fold blocks do not animate on first paint.

## 8. Primitives

Installed (see `components/ui/`): accordion, alert, avatar, badge, breadcrumb,
button, card, checkbox, command, dialog, draft-notice, drawer, dropdown-menu,
empty, field, input, input-group, input-otp, label, page-shell, section,
select, separator, sheet, sidebar, skeleton, sonner, spinner, table, tabs,
textarea, toggle, toggle-group, tooltip.

To add, from the **installed** shadcn registry on Base UI — this is reuse of the
existing system, not a second one:

`field` · `input` · `input-group` · `input-otp` · `textarea` · `select` ·
`skeleton` · `spinner` · `empty` · `alert` · `separator` · `table` · `dialog` ·
`toast`

**Do not** paste blocks from Radix-based registries into this project. The
project is on Base UI (`"base": "base"` in `components.json`); Radix components
use `asChild` where Base UI uses `render`, and mixing them drags a second
primitive library into the bundle. Use such blocks as _visual reference_ and
rebuild on Base UI, or change the project's base deliberately — see §9.

## 9. Open decisions

1. **Base UI or Radix.** The `components/ui` set is on Base UI. One exception
   already shipped: `cmdk` (the admin ⌘K menu) pulls a small Radix subtree —
   accepted deliberately or replaced under this decision. Staying on Base UI
   means rebuilding third-party blocks; moving to Radix opens the ecosystem
   (tailark, 21st.dev) and costs a migration of what exists.
2. **The palette for dark mode.** No user-facing dark mode yet — the site is
   light-only for visitors. The `data-theme` mechanism and dark token sets do
   exist, powering the dev-only palette harness (KIT-67). ICT has a stated
   colour preference that has not been captured. Every token in §3 needs a
   second value, and the framework's own not-found and global-error screens
   follow the OS scheme regardless of app theme. KIT-67, with KIT-65.

Until these are answered, build on what §1–§8 already fixes. None of it depends
on either decision.
