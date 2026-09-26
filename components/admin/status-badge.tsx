import { Badge } from "@/components/ui/badge"

/** A lead's status, weighted by whether it still needs someone. */
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
