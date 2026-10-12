"use client"

import { useParams } from "next/navigation"

import { convexConfigured } from "@/app/providers"
import { BundleEditor } from "@/components/admin/bundle-editor"
import { PageShell } from "@/components/ui/page-shell"

export default function EditBundlePage() {
  const { id } = useParams<{ id: string }>()
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Set.">
        Not available here.
      </PageShell>
    )
  return <BundleEditor id={id} />
}
