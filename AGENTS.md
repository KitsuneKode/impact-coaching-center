# Impact Coaching Centre engineering guide

## Installed Next.js documentation is authoritative

This repository uses Next.js 16.3.5. Its APIs and conventions can differ from older Next.js versions and from model training data. Before changing framework behavior, read the relevant guide under `node_modules/next/dist/docs/` and follow its deprecation notices.

Useful starting points:

- App Router fundamentals: `node_modules/next/dist/docs/01-app/01-getting-started/`
- API and file conventions: `node_modules/next/dist/docs/01-app/03-api-reference/`
- Next.js 16 migration notes: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`
- Production and security: `node_modules/next/dist/docs/01-app/02-guides/production-checklist.md` and `data-security.md`

Next.js 16 removed `next lint`; this project uses the standalone Oxlint command. Dynamic route `params` and `searchParams` are promises. Prefer Server Components and introduce `"use client"` only at the smallest interactive boundary.

## Repository map

- `app/`: App Router pages, layouts, metadata, route handlers, and server actions.
- `components/ui/`: reusable low-level controls and layout primitives.
- `components/marketing/`: composed public-site sections and conversion flows.
- `components/motion/` and `components/motion-primitives/`: reusable animation behavior.
- `lib/`: typed domain data, brand constants, catalogue data, and shared helpers.
- `public/`: approved local brand, course, faculty, campus, and video assets.
- `scripts/`: explicit maintenance and content-sync commands; scripts are excluded from the app TypeScript project unless deliberately added.
- `docs/`: project decisions, research notes, and handoff material.

Keep domain data out of page components when it is shared or likely to move to Convex. Pages should compose sections and set route metadata; reusable behavior belongs in components or `lib`.

## Commands and required gates

Use Bun and keep `bun.lock` current.

- `bun run dev`: local development server.
- `bun run format`: write Oxfmt formatting, including Tailwind CSS class ordering.
- `bun run format:check`: check formatting without writes.
- `bun run lint`: run Oxlint with React, TypeScript, JSX accessibility, and native Next.js rules; warnings fail the command.
- `bun run typecheck`: generate Next.js route types, then run TypeScript without emitting files.
- `bun run test`: run the Bun test suite.
- `bun run check`: run formatting, linting, type checking, and tests.
- `bun run build`: production Next.js build and route-generation gate.

Run `bun run check` after code changes and `bun run build` for changes that affect routes, framework configuration, server/client boundaries, metadata, data fetching, or release readiness.

Oxlint is the sole lint runner. Its native `nextjs` plugin implements every rule in Next.js 16.3.5's `@next/eslint-plugin-next` recommended and Core Web Vitals sets, so retaining ESLint would duplicate coverage and dependency cost. Reassess this boundary when either tool changes; add a narrow ESLint layer only for a demonstrated rule gap.

The file-level lint exceptions in `.oxlintrc.json` cover analyzer limitations and vendored primitives: the polymorphic button anchor receives content through typed props, the lead-success container intentionally uses `role="status"` because an HTML `output` element cannot contain its block layout, and the `components/ui` shadcn/Base-UI primitives carry narrow file-scoped exceptions (mostly `prefer-tag-over-role` on library markup the analyzer misreads). Each exception is scoped to a named file — do not broaden a rule globally, and add a file-scoped exception only when the markup is genuinely correct and the analyzer is wrong.

## Design system and composition

Use the existing tokens in `app/globals.css`; avoid one-off colors, radii, shadows, and spacing when a semantic token exists. Preserve the brand's editorial academic direction: strong typographic hierarchy, warm surfaces, restrained blue and amber accents, documentary imagery, and clear information density. Do not invent facts, rankings, outcomes, prices, deadlines, seat counts, or testimonials to fill a design.

Build reusable controls in `components/ui/` from shadcn patterns and Base UI primitives already installed in the project. Compose those controls into feature sections rather than copying markup between pages. Keep component APIs small, typed, and accessible. Add a dependency only when it removes meaningful implementation or maintenance work and fits the existing stack.

Use motion to explain state changes or reinforce hierarchy. Respect `prefers-reduced-motion`, avoid blocking interactions, and keep important content usable without animation. Do not use `transition-all`.

## Content truth and product data

Treat approved client material, `Website Req.pdf`, current catalogue data, and verified public business channels as factual sources. If sources conflict, surface the conflict rather than choosing silently. Mark placeholders and prototype-only values in code and documentation so they cannot be mistaken for approved content.

Keep frequently changing content such as courses, batches, fees, sale banners, books, library plans, resources, and contact channels in typed data or Convex records rather than scattering literals through components. Every public CTA must point to a real route or an explicitly labelled prototype state.

## Responsive and accessibility baseline

Design and verify mobile first, then tablet, laptop, and wide desktop. Check narrow 320 px layouts, common mobile widths, tablet portrait and landscape, and desktop widths. Avoid fixed widths that cause horizontal scrolling. Navigation, dialogs, forms, carts, tables, and admin views must work with touch and keyboard input.

Use semantic HTML, one descriptive page heading, a visible keyboard focus state, correct labels and autocomplete values, and meaningful alternative text. Decorative icons must be hidden from assistive technology. Interactive targets should be at least 44 by 44 CSS pixels where practical. Do not rely on color alone for status. Preserve readable contrast, reduced-motion behavior, zoom support, and logical focus order. Use `next/image`, `next/font`, `next/link`, and Next metadata APIs according to the installed docs.

## SEO and analytics boundaries

Each indexable route needs unique metadata derived from truthful page content. Keep canonical URLs, Open Graph data, robots rules, and `app/sitemap.ts` aligned with the deployed production URL. Add structured data only when the visible page supports every claim. Course, book, organization, breadcrumb, and FAQ schema must use real values and must not promise unavailable inventory or outcomes.

Centralize analytics events behind a small typed adapter. Track meaningful funnel steps such as CTA click, lead submission, resource unlock, add to cart, checkout start, payment result, and library enrollment. Never place sensitive personal details, phone numbers, email addresses, payment payloads, or free-text form content in analytics events.

## Convex, admin, and payment boundaries

Convex should own mutable business records that need an admin workflow: leads, resource-access consent, courses, books, inventory, orders, library applications, banners, and audit timestamps. Validate every public and admin mutation server-side (`args` and `returns` validators on every registered function, so the client boundary is enforced rather than conventional). Authentication is not authorization; enforce roles and record-level access in backend functions. Return only fields the client needs and keep secrets in server-only modules. Closed validator unions (`PERSON_ROLE`, `LEAD_STATUS`, `ORDER_STATUS`) live in `convex/schema.ts` so schema, function args and return validators share one source; shared refusal/pagination result validators live in `convex/authz.ts`.

The `activities` table is the audit trail and is **insert-only**: never patch or delete a row, and record a correction as a new row. Privileged writes (role changes, order status changes) must write an activity row in the same transaction, with `actorId` and the structured `from*`/`to*` fields populated - `body` is for reading, the structured fields are for querying.

The admin surface should remain deliberately small and task focused. Reuse shadcn blocks for navigation, tables, forms, dialogs, filters, and status badges, then adapt them to this design system. Prioritize the actions staff perform: update catalogue content, publish or schedule banners, review leads and enrollments, manage inventory and orders, and export operational data. Keep irreversible actions explicit and auditable.

Payment amounts, inventory, discounts, and order ownership must be calculated and verified on the server. Create payment orders server-side, verify provider signatures or webhooks server-side, use idempotency keys, and record provider identifiers without storing card or UPI credentials. A client redirect or success screen is not proof of payment. Keep provider code behind a typed adapter so checkout UI and order state do not depend directly on Razorpay or another gateway. Until live credentials, webhook verification, refund handling, and failure recovery are tested, label checkout as a prototype and do not imply that money was captured.

## Agent skills

### Issue tracker

Issues live in Linear (team `Kitsunekode`, project `Impact Website`, identifiers `KIT-<n>`), reached through the `linear-server` MCP server. Every issue must be created with `project: "Impact Website"`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name, all present on team `Kitsunekode`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root, both created lazily. See `docs/agents/domain.md`.

### Plans

Implementation plans live in `docs/plans/` as `YYYY-MM-DD-<slug>.md`, committed. Before starting multi-step work, check for an existing plan there and resume it rather than writing a new one. See `docs/agents/plans.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
