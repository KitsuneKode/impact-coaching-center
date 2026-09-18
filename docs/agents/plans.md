# Plans

Step-by-step implementation plans live in `docs/plans/`, committed to the repo.

## Why committed, not scratch

A plan's job is to survive the session that wrote it. This repo gitignores
`/.claude/worktrees/`, so an untracked plan is invisible from any other worktree —
exactly the case where resuming matters most. Plans are tracked.

## Naming

`docs/plans/YYYY-MM-DD-<slug>.md`, matching the date-prefix convention already used in
`docs/proposals/` and `docs/superpowers/specs/`.

## Required header

Every plan opens with:

```yaml
---
status: draft | in-progress | done | abandoned
ticket: KIT-42 # or "none" for unticketed work
spec: docs/superpowers/specs/<file>.md # or "none"
---
```

`status` is what makes a plan resumable: an agent picking up cold reads the header, then
diffs the checklist against the working tree before touching anything.

## Steps are checkboxes

Each step is a `- [ ]` item, checked off as it lands. Don't delete completed steps — the
record of what was done and in what order is the point. A step that turned out wrong
gets struck through with a one-line note, not removed.

## Lifecycle

- **Write**: before multi-step work, not during. If a plan already exists for this
  effort, resume it instead of writing a second one.
- **Resume**: read the header, verify which checked steps are actually reflected in the
  code, then continue. Trust the tree over the checklist when they disagree.
- **Finish**: set `status: done`. Leave the file — it is the history of how the work
  actually went, which the spec (intent) and the commits (outcome) don't capture.
- **Abandon**: set `status: abandoned` with a one-line reason at the top. Don't delete.

## Boundaries

- Plans are execution detail. What to build and why belongs in the spec; scope and
  priority belong in the Linear ticket. Don't restate either here.
- `docs/CHECKPOINT.md` is a point-in-time snapshot of the whole project, not a plan.
  Plans don't replace it and shouldn't duplicate its open-questions list.
- Plans are not client-facing. `docs/proposals/` is.

## Gates still apply

A plan step is not done until the repo's gates pass for it. Per `AGENTS.md`: `bun run
check` after code changes, and `bun run build` for anything touching routes, framework
config, server/client boundaries, metadata or data fetching.
