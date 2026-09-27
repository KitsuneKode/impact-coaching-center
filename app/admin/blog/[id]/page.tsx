"use client"

import { useParams } from "next/navigation"

import { convexConfigured } from "@/app/providers"
import { PostEditor } from "@/components/admin/post-editor"
import { PageShell } from "@/components/ui/page-shell"

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Post.">
        Not available here.
      </PageShell>
    )
  return <PostEditor id={id} />
}
