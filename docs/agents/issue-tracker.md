# Issue tracker: Linear

Issues and specs for this repo live in **Linear**. Agents reach Linear through the
Linear MCP server, not a CLI — there is no `gh`-style command for it.

## Prerequisite

The Linear MCP server must be connected in this session. Its tools are namespaced
`mcp__linear-server__*`. If no such tools are available, stop and tell the user to run
`/mcp` and authenticate `linear-server`. Do not fall back to writing issues into files
or to GitHub.

The server is registered at **local scope** (`~/.claude.json`), so it is private to this
machine. A fresh clone of this repo will not have it until it is added there too:

```bash
claude mcp add --transport http linear-server https://mcp.linear.app/mcp
```

## Workspace facts

- **Team**: `Kitsunekode`, key `KIT` — the only team in the workspace, so use it as the
  default and don't ask which team an issue belongs to.
- **Project**: `Impact Website` — _"Marketing and reception front website for lead
  collection and book storefront, free test access and promotional stuff."_
  <https://linear.app/kitsunekode/project/impact-website-448e4535d0cb/overview>
- **Identifiers**: `KIT-<n>` (e.g. `KIT-38`). Use the identifier in prose, commit
  messages and PR titles; use the UUID only when a tool demands one.
- **Workflow states**: `Backlog`, `Todo`, `In Progress`, `In Review`, `Done`,
  `Duplicate`, `Canceled`.

## Every issue belongs to the project

**Always pass `project: "Impact Website"` on `save_issue`.** Linear does not infer it,
and an issue created without it lands loose in the team backlog where it will not show
up on the project board, in its milestones, or in any progress figure.

This applies to issues created by any skill — `/to-tickets`, `/triage`, `/wayfinder`
maps and their children alike. The one thing that never gets a project is an issue the
user explicitly says belongs elsewhere.

## Milestones

The project's milestones mirror the delivery stages in spec §23, with one addition:
**`0. Current site launch`** covers shipping the marketing site that already exists. It
is deliberately _not_ gated on stages 1-10, because that site is built and deployed and
does not need Convex, auth or payments to go live.

| Milestone                                    | Source                          |
| -------------------------------------------- | ------------------------------- |
| `0. Current site launch`                     | `docs/CHECKPOINT.md` open items |
| `1. Production foundations`                  | spec §23 stage 1                |
| `2. Public IA and visual refinement`         | stage 2                         |
| `3. Identity and messaging`                  | stage 3                         |
| `4. Lead CRM and conversion instrumentation` | stage 4                         |
| `5. Resource library`                        | stage 5                         |
| `6. Physical books and checkout`             | stage 6                         |
| `7. Library workflow`                        | stage 7                         |
| `8. Promotions, dashboard and exports`       | stage 8                         |
| `9. SEO, discovery and qualification`        | stage 9                         |
| `10. Onboarding, launch and support`         | stage 10, gated on spec §24     |

Set `milestone` on `save_issue` whenever the work clearly belongs to one. Leave it unset
rather than guessing — an issue in the wrong milestone distorts that milestone's
progress figure, which is the number the project board reports.

Milestones carry no target dates. Add them when there is a real schedule; don't invent
one to fill the field.

## Conventions

Linear's MCP server uses one **`save_issue`** tool for both create and update: passing
`id` updates, omitting it creates.

- **Create an issue**: `save_issue` with `team: "Kitsunekode"`, a `title`, and a
  markdown `description`. Omit `id`. Pass literal newlines in the description, not
  escaped `\n`.
- **Read an issue**: `get_issue` by identifier (e.g. `KIT-42`), then `list_comments`
  separately — the issue payload does not include them.
- **List issues**: `list_issues`, filtered by `team`, `label`, `assignee`, `state`, or
  `query`. Use `fields` to fetch only what's needed rather than the full payload.
- **Comment**: `save_comment` with `issueId` and `body`. Reply in-thread with
  `parentId` instead of `issueId`.
- **Apply / remove labels**: `save_issue` with `addLabels` / `removeLabels`, which are
  incremental. Do **not** use the `labels` field for triage — it replaces the entire
  label set and will silently drop `Bug`/`Feature`/`Improvement`.
- **Close**: `save_issue` with `state: "Done"` (or `"Canceled"` for work that will not
  be done). Linear has no separate close action — the state _is_ the close.
- **Edit a description in place**: `save_issue` with `patch` rather than rewriting the
  whole `description`. Each anchor must match exactly once.

## Labels vs. states

Linear has both. The triage vocabulary in `docs/agents/triage-labels.md` maps to
**labels**, applied on top of whatever workflow state the issue is in. Never convert a
triage label into a workflow state, and never assume a state implies a triage label.

## Pull requests as a request surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as
feature requests; `/triage` reads this flag.)_

Code lives on GitHub (`KitsuneKode/impact-coaching-center`) while issues live in Linear.
Link the two by putting the `KIT-<n>` identifier in the branch name, PR title or PR body
so Linear's GitHub integration attaches it.

## When a skill says "publish to the issue tracker"

Create a Linear issue on team `Kitsunekode`.

## When a skill says "fetch the relevant ticket"

`get_issue` by identifier, then `list_comments` for its discussion.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: one issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far /
  Fog body.
- **Child ticket**: `save_issue` with `parentId` set to the map — Linear's native
  sub-issue. Label `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`).
- **Blocking**: Linear's native issue relations, via `blockedBy` / `blocks` on
  `save_issue` (append-only; clear with `removeBlockedBy` / `removeBlocks`). These are
  visible in the UI, so prefer them over a text convention. A ticket is unblocked when
  every blocker sits in `Done`, `Duplicate` or `Canceled`.
- **Frontier query**: `list_issues` with `parentId` of the map, keeping `Backlog` /
  `Todo` / `In Progress`; drop any with an incomplete blocker or an assignee; first in
  map order wins.
- **Claim**: `save_issue` with `assignee: "me"` — the session's first write.
- **Resolve**: `save_comment` with the answer, `save_issue` to `state: "Done"`, then
  append a context pointer to the map's Decisions-so-far using a `patch` with an
  `append` op.
