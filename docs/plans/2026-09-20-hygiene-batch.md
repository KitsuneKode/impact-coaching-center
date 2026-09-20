---
status: draft
ticket: none (raise one KIT-<n> "Audit hygiene batch" under "Impact Website")
spec: none
---

# Plan 003: Close the small audit findings in one batch

> **Executor instructions**: Follow this plan step by step, in order. Each
> step is independent and separately committable; if one step hits a STOP
> condition, skip it, report it, and continue with the next. Run every
> verification command. When done, update the status row in
> `docs/plans/README.md` and set `status:` in this file's header.
>
> **Drift check (run first)**:
> `git diff --stat 4a6c88e..HEAD -- scripts/sync-courses.ts lib/catalogue-import.ts lib/catalogue-import.test.ts components/motion-primitives/progressive-blur.tsx components/motion/edge-blur.tsx components/marketing/hero.tsx convex/persons.ts lib/otp-transport.ts tsconfig.json package.json next.config.ts app/actions/lead.ts convex/http.ts`
> On any change, re-read the cited lines before editing that step.

## Status

- **Priority**: P2
- **Effort**: M (eight S-sized steps)
- **Risk**: LOW
- **Depends on**: none. Step 5 (`otp-transport.ts` comment) should land **after or with** Plan 001 if both are in flight, to avoid a merge conflict on a comment.
- **Category**: tech-debt / perf / security
- **Planned at**: commit `4a6c88e`, 2026-09-20

## Why this matters

An audit at `4a6c88e` found eight small defects that are each cheap alone and
not worth eight separate tickets: a sync-time slug collision that silently
hides a course page; a site-wide client component that never animates yet
hydrates ten `backdrop-filter` layers on the mid-range Android phones the
project explicitly targets; a `transition-all` the repo's own rules forbid;
two comments on security paths that now say the opposite of the code; the one
destructive script excluded from typechecking; two dead dependencies; no
security response headers; and two minor input-handling holes on public
write paths. None is urgent; together they are a half-day that removes a
class of "why does this look wrong" questions before client review.

## Concurrent-work notice (check before starting)

At planning time the working tree held **uncommitted** changes that already:
fix both comments in Step 5; validate `x-forwarded-for` through a new
`lib/client-address.ts` (touches `app/actions/lead.ts` and `convex/http.ts`,
which Step 8 also edits); and add rate-limit pruning. Before each of Steps 5
and 8, run the step's own `rg`/`grep` verification first — if it already
passes, mark the step "already landed" and move on. Do not revert or
re-implement work that is already in the tree.

## Current state

Repo conventions that apply to every step:

- Gates: `bun run format` (write), `bun run check` (format:check + lint + typecheck + test), `bun run build` for anything under `app/`, `next.config.ts`, or server/client boundaries.
- Tests: Bun's runner, `describe/test/expect` from `"bun:test"`, colocated `*.test.ts`. Exemplar: `lib/catalogue-import.test.ts`.
- AGENTS.md: "Do not use `transition-all`." and "Do NOT add or remove comments unless asked" — this plan explicitly asks for the two comment fixes in Step 5 and nothing else.
- Commit style (from `git log`): `fix: normalize phone identifiers and make a resend replace the live code`, `chore: ...`, `refactor: ...`, `build: ...`.

Per-step facts are inlined under each step.

## Commands you will need

| Purpose       | Command                        | Expected                              |
| ------------- | ------------------------------ | ------------------------------------- |
| Format        | `bun run format`               | rewrites                              |
| Full gate     | `bun run check`                | exit 0                                |
| Build         | `bun run build`                | exit 0                                |
| One test file | `bun test <path>`              | pass                                  |
| Remove deps   | `bun remove lenis next-themes` | updates `package.json` and `bun.lock` |

## Scope

**In scope:** exactly the files named in each step. **Out of scope:** everything else — in particular `lib/catalogue.ts` (generated; never hand-edit), `convex/auth.ts`, `lib/phone-auth.ts` (Plan 001's territory), any component not named below, and `.oxlintrc.json` (do not add rule exceptions to make a step pass).

## Git workflow

- Branch: `<handle>/kit-<n>-hygiene-batch`
- One commit per step, conventional-commit prefix as suggested in each step.
- Do NOT push unless instructed.

## Steps

### Step 1: Refuse a catalogue sync that produces duplicate slugs

**Facts.** `lib/catalogue-import.ts:30-42` — `slugify(name, fallbackId)` only falls back on an _empty_ slug. `scripts/sync-courses.ts:50-53` dedupes courses by `id`, never by slug, and writes `lib/catalogue.ts` at line 152. `app/courses/[slug]/page.tsx:39-45` sets `dynamicParams = false` and builds routes from `course.slug`; `courseBySlug` uses `.find`, so a second course with the same slug has no page and its tile links to its sibling.

**Change.** In `lib/catalogue-import.ts` add and export:

```ts
/**
 * Two Courses whose short names slugify identically would share one route:
 * the second has no page and its card links to the first. Refuse at sync
 * time, where a human is reading the output, rather than shipping it.
 */
export function assertUniqueSlugs(
  rows: ReadonlyArray<{ slug: string; id: number }>
) {
  const seen = new Map<string, number>()
  for (const row of rows) {
    const other = seen.get(row.slug)
    if (other !== undefined)
      throw new Error(
        `Slug "${row.slug}" is produced by courses ${other} and ${row.id}; refusing to write lib/catalogue.ts`
      )
    seen.set(row.slug, row.id)
  }
}
```

In `scripts/sync-courses.ts`, import it alongside `toCatalogueRow` and call
`assertUniqueSlugs(rows)` immediately after the `rows` loop ends (before the
stale-cover removal loop at line 97), so nothing on disk changes on collision.

**Test.** Append to `lib/catalogue-import.test.ts`:

```ts
describe("assertUniqueSlugs", () => {
  test("passes distinct slugs", () => {
    expect(() =>
      assertUniqueSlugs([
        { slug: "a", id: 1 },
        { slug: "b", id: 2 },
      ])
    ).not.toThrow()
  })
  test("names both colliding courses", () => {
    expect(() =>
      assertUniqueSlugs([
        { slug: "lakhya-2027", id: 1 },
        { slug: "lakhya-2027", id: 2 },
      ])
    ).toThrow(/1 and 2/)
  })
})
```

**Verify**: `bun test lib/catalogue-import.test.ts` → pass. Do **not** run `bun run sync:courses` (network + rewrites committed content). Commit: `fix: refuse a catalogue sync whose slugs collide`.

### Step 2: Make `ProgressiveBlur` a Server Component

**Facts.** `components/motion-primitives/progressive-blur.tsx:1` is `"use client"`; line 48 renders `motion.div` with only `className`/`style`/spread props — no `animate`, `initial`, `whileInView` etc. Its only consumer is `components/motion/edge-blur.tsx` (lines 20-25, 32-37), which passes `direction`, `blurLayers`, `blurIntensity`, `className` and nothing else. `edge-blur.tsx` is mounted in `app/layout.tsx:115` on every page.

**Change.** In `progressive-blur.tsx`: remove line 1 (`"use client"`); replace the `motion` import with `import type { ComponentProps } from "react"`; change the props type's `& HTMLMotionProps<"div">` to `& Omit<ComponentProps<"div">, "children">`; change `<motion.div` to `<div`. Nothing else.

**Verify**: `grep -c '"use client"' components/motion-primitives/progressive-blur.tsx` → 0; `bun run check` → exit 0; `bun run build` → exit 0 (server/client boundary changed). Commit: `perf: stop hydrating the edge blur, which never animates`.

### Step 3: Remove the `transition-all`

**Facts.** `components/marketing/hero.tsx:152` contains `... opacity-0 shadow-frame transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100`. Only `opacity` and `translate` change on hover. Tailwind 4's `translate-*` utilities set the CSS `translate` property.

**Change.** Replace `transition-all` with `transition-[opacity,translate]` on that line only.

**Guard.** Create `lib/no-transition-all.test.ts`:

```ts
import { expect, test } from "bun:test"

// AGENTS.md: "Do not use transition-all." Oxlint cannot see class strings,
// so the rule is enforced here.
test("no component uses transition-all", () => {
  const offenders: string[] = []
  for (const dir of ["app", "components"]) {
    for (const file of new Bun.Glob("**/*.tsx").scanSync({ cwd: dir })) {
      const text = require("node:fs").readFileSync(`${dir}/${file}`, "utf8")
      if (/\btransition-all\b/.test(text)) offenders.push(`${dir}/${file}`)
    }
  }
  expect(offenders).toEqual([])
})
```

**Verify**: `bun test lib/no-transition-all.test.ts` → pass; `rg -n "transition-all" app components` → 0 matches. Commit: `fix: transition only the properties the hero badge changes`.

### Step 4: Typecheck `scripts/`

**Facts.** `tsconfig.json:34` — `"exclude": ["node_modules", "scripts"]`. `package.json` `typecheck` is `next typegen && tsc --noEmit`. `scripts/sync-courses.ts` uses `Bun.$`, `Bun.write`, `Bun.Glob`; `@types/bun` is installed. The two `.mjs` generators import from an absolute path and must stay excluded.

**Change.** Create `tsconfig.scripts.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "noEmit": true, "incremental": false, "plugins": [] },
  "include": ["scripts/**/*.ts", "lib/**/*.ts"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

Change the `typecheck` script to `next typegen && tsc --noEmit && tsc --noEmit -p tsconfig.scripts.json`.

**Verify**: `bun run typecheck` → exit 0. If `sync-courses.ts` has type errors, fix them minimally in that file only (typically a missing `!` or a narrowed type on `payload`); if a fix needs a new dependency, STOP. Commit: `build: typecheck the catalogue sync script`.

### Step 5: Fix the two comments that contradict the code

**Facts.**

- `convex/persons.ts:216-221` ends with "Throttling abusive volume is the route's job, per phone and per IP, and is not implemented yet." Lines 192-209 of the same function implement exactly that.
- `lib/otp-transport.ts:17-22` says "Resolve this once at module load - see convex/auth.ts - so a misconfigured deployment fails while the auth module is being constructed". `convex/auth.ts:22-25` now resolves per call and explains why (CONVEX_SITE_URL is only available inside a running function).

**Change.**

- `convex/persons.ts`: replace the final sentence of that comment with: "Throttling abusive volume is handled above, per phone and per address, before any write."
- `lib/otp-transport.ts`: replace the sentence beginning "Resolve this once at module load" through "before any request can reach the plugin." with: "Resolved per call in convex/auth.ts, before the plugin is constructed, because CONVEX_SITE_URL is only available inside a running function. It still runs before any request reaches the plugin." Keep the following sentence about deferring to send time being too late.

**Verify**: `rg -n "not implemented yet" convex/persons.ts` → 0 matches; `rg -n "module load" lib/otp-transport.ts` → 0 matches; `bun run check` → exit 0. Commit: `docs: make two security-path comments describe the code again`.

### Step 6: Remove dead dependencies

**Facts.** `lenis` and `next-themes` are in `dependencies` and imported nowhere under `app/`, `components/`, `lib/`, `convex/`, `hooks/`, `scripts/`, or `app/globals.css`. `shadcn` is a CLI but its `tailwind.css` is `@import`ed in `globals.css`; leave it where it is.

**Change.** `bun remove lenis next-themes`.

**Verify**: `rg -n "lenis|next-themes" --glob '!node_modules' --glob '!bun.lock' .` → 0 matches; `bun install --frozen-lockfile` → exit 0; `bun run build` → exit 0. Commit: `chore: drop lenis and next-themes, which nothing imports`.

### Step 7: Add baseline security headers

**Facts.** `next.config.ts` (15 lines) has only `images.remotePatterns`. The site embeds `youtube-nocookie.com` iframes and inlines a JSON-LD `<script>` in `app/layout.tsx:108-113`, so a strict CSP needs nonces and is **deferred**. Non-CSP headers are safe to add now.

**Change.** Add to `nextConfig`:

```ts
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
```

**Verify**: `bun run build` → exit 0. Then `bun run start & sleep 3; curl -sI http://localhost:3000/ | grep -iE "x-content-type|referrer-policy|x-frame|permissions-policy"; kill %1` → four header lines. Commit: `feat: send baseline security headers on every response`.

### Step 8: Two small input-hardening fixes

**8a.** `app/actions/lead.ts:37-42` does `String(formData.get("name") ?? "")`. A `File` part stringifies to `[object File]`, which passes `lib/leads.ts:75`'s 2–80 length check and becomes a Person name. Add above `submitLead`:

```ts
/** FormData values may be Files; only strings are ever a field value here. */
const text = (data: FormData, key: string) => {
  const value = data.get(key)
  return typeof value === "string" ? value : ""
}
```

and use `text(formData, "name")` etc. for the four fields and for the honeypot read at line 67.

**8b.** `convex/http.ts:17` compares the bearer secret with `!==`. Replace with a constant-time comparison. Add to `lib/env.ts`:

```ts
/** Constant-time string equality, so a shared secret cannot be recovered by timing. */
export function secretsMatch(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a)
  const y = new TextEncoder().encode(b)
  let diff = x.length ^ y.length
  for (let i = 0; i < Math.max(x.length, y.length); i++)
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return diff === 0
}
```

In `convex/http.ts`, import it and change the check to:
`const header = request.headers.get("authorization") ?? ""; if (!secret || !secretsMatch(header, \`Bearer ${secret}\`)) return new Response(null, { status: 401 })`.

**Tests.** Add to `lib/env.test.ts`: `secretsMatch("a","a")` true, `("a","b")` false, `("a","ab")` false, `("","")` true. Add to `app/actions/lead.test.ts` a case that appends `new File(["x"], "x.txt")` as `name` and asserts the result is `status: "error"` with `errors.name` set (look at the existing tests in that file for how `submitLead` is invoked and how `headers()` is stubbed; if `headers()` cannot be stubbed in that file, put the assertion on `parseLead({ name: "", ... })` instead and note it).

**Verify**: `bun run check` → exit 0. Commit: `fix: ignore file parts in the enquiry form and compare the ingest secret in constant time`.

## Done criteria

- [ ] `bun run check` exits 0; `bun run build` exits 0
- [ ] `rg -n "transition-all" app components` → 0
- [ ] `grep -c '"use client"' components/motion-primitives/progressive-blur.tsx` → 0
- [ ] `rg -n "lenis|next-themes" package.json` → 0
- [ ] `rg -n "assertUniqueSlugs" scripts/sync-courses.ts` → 1
- [ ] `rg -n "secretsMatch" convex/http.ts` → 1
- [ ] `curl -sI` on the running build shows the four headers
- [ ] `git status --short` shows only files named in the steps
- [ ] `docs/plans/README.md` row updated

## STOP conditions

- Any cited line does not contain the quoted text.
- Step 2: `edge-blur.tsx` or any other file passes a `motion` prop (`animate`, `initial`, `whileInView`, `transition`) to `ProgressiveBlur`.
- Step 4: making `scripts/` typecheck requires changing `lib/` files or adding a dependency.
- Step 7: the `curl` check shows the headers missing on `/` — report; do not add `middleware.ts`.
- Any step needs an `.oxlintrc.json` override to pass lint.

## Maintenance notes

- Step 3's test is the only enforcement of the `transition-all` rule; keep it when adding directories with components (add the dir to the array).
- Step 7 deliberately omits CSP. Adding one requires a nonce for the JSON-LD script in `app/layout.tsx` and `frame-src` for `youtube-nocookie.com`; do it when the sign-in UI lands, since that is when the origin starts carrying sessions.
- Step 1's assertion means a future Classplus rename that collides will _fail the sync_ rather than ship. That is intended; the fix is a slug override in the importer, not weakening the assertion.
