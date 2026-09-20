/**
 * Says, in words, that what follows has not been approved.
 *
 * AGENTS.md requires a placeholder to be impossible to mistake for approved
 * content. `noindex` keeps a draft out of search results but is invisible to
 * the person reading it, so unapproved content carries this as well.
 */
export function DraftNotice({
  children,
  drafted,
}: {
  children: React.ReactNode
  /** Human-readable date, already formatted. */
  drafted?: string
}) {
  return (
    <div className="max-w-160 rounded-card border border-highlight bg-highlight/20 p-5">
      <p className="text-sm font-medium text-foreground">
        Draft — not yet approved by Impact Career Tutorials
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {children}
        {drafted ? ` Drafted ${drafted}.` : null}
      </p>
    </div>
  )
}
