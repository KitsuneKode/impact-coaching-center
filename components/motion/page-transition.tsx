import { ViewTransition, type ReactNode } from "react"

/**
 * Every navigation between pages: the old page fades out fast, the new one
 * rises a few pixels into place (app/pulse.css, "Page transitions"). In a
 * template, so it re-mounts per page; the header and strip are named and
 * stay still. Browsers without the View Transitions API just swap.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  )
}
