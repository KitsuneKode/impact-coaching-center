"use client"

import { useParams } from "next/navigation"

import { convexConfigured } from "@/app/providers"
import { ResourceEditor } from "@/components/admin/resource-editor"
import { PageShell } from "@/components/ui/page-shell"

export default function EditResourcePage() {
  const { id } = useParams<{ id: string }>()
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Resource.">
        Not available here.
      </PageShell>
    )
  return <ResourceEditor id={id} />
}
