"use client"

import { useParams } from "next/navigation"

import { convexConfigured } from "@/app/providers"
import { DateEditor } from "@/components/admin/date-editor"
import { PageShell } from "@/components/ui/page-shell"

export default function EditDatePage() {
  const { id } = useParams<{ id: string }>()
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Date.">
        Not available here.
      </PageShell>
    )
  return <DateEditor id={id} />
}
