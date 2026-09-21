"use client"

import { useEffect } from "react"

import { Button, ButtonLink } from "@/components/ui/button"
import { Section } from "@/components/ui/section"

/**
 * What a visitor sees when a route throws.
 *
 * Replaces Next's built-in fallback, which arrives with no header, no footer
 * and no indication that this is still ICT's site. Verified against a
 * production build on 21 September: a failing Convex query on /admin/leads
 * dropped straight to that bare screen.
 *
 * The recovery action is `retry()`, not `reset()`. Per the installed docs for
 * 16.3.5, `retry()` re-fetches and re-renders the boundary's children, while
 * `reset()` only re-renders what is already there - which for a failed fetch
 * reproduces the same failure. Training data says `reset`; it is wrong here.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    // No error reporting service is wired up yet, so the console is the only
    // place this is recoverable from. `digest` is the id that ties a visitor's
    // report to the server log for the same failure.
    console.error("[route error]", error.digest ?? "", error)
  }, [error])

  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <div className="max-w-160">
          <h1 className="type-display">
            <span className="text-foreground">This page did not load.</span>{" "}
            <span className="text-muted-foreground">
              Nothing you did caused it. Trying again often works.
            </span>
          </h1>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button onClick={() => retry()}>Try again</Button>
            <ButtonLink href="/" variant="secondary">
              Home
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost">
              Talk to ICT
            </ButtonLink>
          </div>
          {error.digest ? (
            // Shown, not hidden: it is meaningless to the visitor and the only
            // thing that lets staff find this exact failure in the logs.
            <p className="tnum mt-8 text-sm text-muted-foreground">
              Reference {error.digest}
            </p>
          ) : null}
        </div>
      </Section>
    </main>
  )
}
