"use client"

import { useEffect } from "react"

import { PigeonholeFigure } from "@/components/site/pigeonhole-figure"
import { HOLES } from "@/components/site/pigeonholes-art"
import { Button, ButtonLink } from "@/components/ui/button"
import { Section } from "@/components/ui/section"

/** What a visitor sees when a route throws. */
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
      <Section size="sm" className="pbs-26 md:pbs-30">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="max-w-160 lg:col-span-5">
            <h1 className="type-display">
              <span className="text-foreground">This page did not load.</span>{" "}
              <span className="text-muted-foreground">
                Nothing you did caused it. Trying again often works.
              </span>
            </h1>
            <div className="mbs-10 flex flex-wrap gap-3">
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
              <p className="tnum mbs-8 text-sm text-muted-foreground">
                Reference {error.digest}
              </p>
            ) : null}
          </div>
          <div className="lg:col-span-7">
            <PigeonholeFigure
              mode="error"
              names={HOLES.map((hole) => hole.name)}
              labels={{
                title: "Pigeonholes at the centre",
                hint: "Or go straight to a section",
                empty: "404 · nothing filed here",
                open: "tap to open",
                out: "The lamp is out · try again",
              }}
            />
          </div>
        </div>
      </Section>
    </main>
  )
}
