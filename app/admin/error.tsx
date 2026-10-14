"use client"

import { IconAlertTriangle } from "@tabler/icons-react"
import { useEffect } from "react"

import { Button, ButtonLink } from "@/components/ui/button"
import { PageShell, StatePanel } from "@/components/ui/page-shell"

/** A screen in the admin that throws: the sidebar stays, with a way back. */
export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error("[admin error]", error.digest ?? "", error)
  }, [error])

  return (
    <PageShell density="working" title="Something went wrong.">
      <StatePanel
        icon={<IconAlertTriangle stroke={1.75} />}
        title="This screen did not load"
        description={
          error.digest
            ? `Try again. If it keeps happening, send KitsuneKode this reference: ${error.digest}`
            : "Try again. If it keeps happening, tell KitsuneKode what you clicked."
        }
      />
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <ButtonLink href="/admin" variant="secondary">
          Overview
        </ButtonLink>
      </div>
    </PageShell>
  )
}
