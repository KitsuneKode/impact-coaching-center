# Domain Docs

How the engineering skills should consume this repo's domain documentation when
exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists: it points at one `CONTEXT.md` per
  context. Read each one relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in. In
  multi-context repos, also check `src/<context>/docs/adr/` for context-scoped
  decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't
suggest creating them upfront. The `/domain-modeling` skill (reached via
`/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms
or decisions actually get resolved.

## Layout

This repo is **single-context**: no workspaces, no `packages/`, one Next.js app.

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-….md
│   └── 0002-….md
└── app/ components/ lib/
```

Both exist in this repo: `CONTEXT.md` holds the project vocabulary, and
`docs/adr/` holds the recorded decisions. Read `CONTEXT.md` before renaming
domain terms, and check the ADRs before proposing an architectural change.

For reference, a multi-context repo (signalled by `CONTEXT-MAP.md` at the root) would
instead look like:

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a
hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to
synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're
inventing language the project doesn't use (reconsider) or there's a real gap (note it
for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently
overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_

## Related, but not domain docs

- `docs/superpowers/specs/` — design specs: what we're building and why.
- `docs/plans/` — step-by-step implementation plans. See `docs/agents/plans.md`.
- `docs/research/` — research notes.
- `docs/proposals/` — client-facing material. Not an input to engineering skills.
