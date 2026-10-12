"use client"

import { convexConfigured } from "@/app/providers"
import { BundleEditor } from "@/components/admin/bundle-editor"
import { PageShell } from "@/components/ui/page-shell"

export default function NewBundlePage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="New set.">
        Not available here.
      </PageShell>
    )
  return <BundleEditor />
}
