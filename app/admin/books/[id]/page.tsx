"use client"

import { useParams } from "next/navigation"

import { convexConfigured } from "@/app/providers"
import { BookEditor } from "@/components/admin/book-editor"
import { PageShell } from "@/components/ui/page-shell"

export default function EditBookPage() {
  const { id } = useParams<{ id: string }>()
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Book.">
        Not available here.
      </PageShell>
    )
  return <BookEditor id={id} />
}
