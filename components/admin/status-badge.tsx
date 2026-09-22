import { Badge } from "@/components/ui/badge"

/**
 * A lead's status, weighted by whether it still needs someone.
 *
 * Every status rendered identically before, so a queue of thirty rows offered
 * no way to find the six that need a call - which is the only question a
 * follow-up queue exists to answer.
 *
 * Emphasis rather than hue, because the design guide reserves every colour
 * this would otherwise reach for: §3 says green means "verified", not "good",
 * amber means "the phrase that matters", not "warning", and it ends with
 * "never rely on colour alone for status". So the signal is weight. `new` is
 * the only filled badge on the screen; everything else recedes.
 *
 * The dot carries the same distinction a second way, in fill rather than
 * colour - solid while a lead is still someone's job, hollow once it is
 * settled. That survives greyscale, a cheap panel in sunlight, and colour
 * blindness, and the label is always present in words regardless.
 *
 * Classes are written out per branch rather than looked up. `shadcn/
 * require-static-classes` rejects a className assembled from a variable on a
 * registry component, and it is right to: a class string the linter cannot
 * read is one the Tailwind compiler may not emit, which is how a component
 * ships with no styles at all.
 */
export function StatusBadge({ status }: { status: string | undefined }) {
  switch (status) {
    case "new":
      return (
        <Badge variant="solid" className="gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-foreground"
          />
          New
        </Badge>
      )
    case "contacted":
      return (
        <Badge className="gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-muted-foreground"
          />
          Contacted
        </Badge>
      )
    case "interested":
      return (
        <Badge className="gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-muted-foreground"
          />
          Interested
        </Badge>
      )
    case "enrolled":
      return (
        <Badge className="gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full border border-muted-foreground"
          />
          Enrolled
        </Badge>
      )
    case "lost":
      return (
        <Badge className="gap-1.5 opacity-70">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full border border-border"
          />
          Lost
        </Badge>
      )
    default:
      // An unrecognised value is shown as itself rather than swallowed. A
      // status added to the schema and not here should look wrong, not fine.
      return <span className="text-muted-foreground">{status ?? "—"}</span>
  }
}
