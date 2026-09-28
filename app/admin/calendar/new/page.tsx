"use client"

import { convexConfigured } from "@/app/providers"
import { DateEditor } from "@/components/admin/date-editor"
import { PageShell } from "@/components/ui/page-shell"

export default function NewDatePage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="New date.">
        Not available here.
      </PageShell>
    )
  return <DateEditor />
}
