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

- **Team**: `Kitsunekode` — the only team in the workspace, so use it as the default
  and don't ask which team an issue belongs to.
- **Identifiers**: `KIT-<n>` (e.g. `KIT-38`). Use the identifier in prose, commit
  messages and PR titles; use the UUID only when a tool demands one.
- **Workflow states**: `Backlog`, `Todo`, `In Progress`, `In Review`, `Done`,
  `Duplicate`, `Canceled`.

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
