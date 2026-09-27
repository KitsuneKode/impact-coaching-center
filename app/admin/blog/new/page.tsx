"use client"

import { convexConfigured } from "@/app/providers"
import { PostEditor } from "@/components/admin/post-editor"
import { PageShell } from "@/components/ui/page-shell"

export default function NewPostPage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="New post.">
        Not available here.
      </PageShell>
    )
  return <PostEditor />
}
