"use client"

import { useParams } from "next/navigation"

import { convexConfigured } from "@/app/providers"
import { PromotionEditor } from "@/components/admin/promotion-editor"
import { PageShell } from "@/components/ui/page-shell"

export default function EditPromotionPage() {
  const { id } = useParams<{ id: string }>()
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Promotion.">
        Not available here.
      </PageShell>
    )
  return <PromotionEditor id={id} />
}
