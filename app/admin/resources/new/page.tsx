"use client"

import { convexConfigured } from "@/app/providers"
import { ResourceEditor } from "@/components/admin/resource-editor"
import { PageShell } from "@/components/ui/page-shell"

export default function NewResourcePage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="New resource.">
        Not available here.
      </PageShell>
    )
  return <ResourceEditor />
}
