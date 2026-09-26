"use client"

import { convexConfigured } from "@/app/providers"
import { BookEditor } from "@/components/admin/book-editor"
import { PageShell } from "@/components/ui/page-shell"

export default function NewBookPage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="New book.">
        Not available here.
      </PageShell>
    )
  return <BookEditor />
}
