# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to
the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the
corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.

## These labels exist in Linear

All five were created on team `Kitsunekode` during setup, alongside the pre-existing
`Bug`, `Feature` and `Improvement`.

Linear will **not** create a label implicitly when you try to apply one, so if a label
is ever missing, create it with `save_issue_label` (note: `create_issue_label` still
works but is deprecated). Check with `list_issue_labels` first — a retired label carries
`retiredAt`, cannot be applied to new issues, and must be restored with
`restore_issue_label` rather than recreated.

## Applying them without destroying existing labels

Linear labels are team-scoped and an issue can carry several. Apply and remove triage
labels with `addLabels` / `removeLabels` on `save_issue`, never with the `labels` field
— `labels` replaces the entire set and would strip an issue's `Bug` or `Feature` label
as a side effect of triaging it.
