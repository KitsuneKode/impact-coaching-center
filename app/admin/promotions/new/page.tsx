"use client"

import { convexConfigured } from "@/app/providers"
import { PromotionEditor } from "@/components/admin/promotion-editor"
import { PageShell } from "@/components/ui/page-shell"

export default function NewPromotionPage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="New promotion.">
        Not available here.
      </PageShell>
    )
  return <PromotionEditor />
}
