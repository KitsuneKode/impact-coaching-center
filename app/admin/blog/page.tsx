"use client"

import { IconNews } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"

import { convexConfigured } from "@/app/providers"
import { CatalogList } from "@/components/admin/catalog-list"
import { OwnerOnly } from "@/components/admin/post-editor"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"

/** Every post, published or not. Owner only. */
export default function AdminBlogPage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Blog.">
        Not available here.
      </PageShell>
    )
  return <Posts />
}

const publishedOn = (at: number | undefined) =>
  at
    ? new Date(at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—"

function Posts() {
  const allowed = useQuery(api.catalogAdmin.canEditCatalog)
  const posts = useQuery(api.blogAdmin.list)
  const setPublished = useMutation(api.blogAdmin.setPublished)

  if (allowed === undefined || posts === undefined)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Blog.</span>}
      >
        <ListSkeleton rows={5} />
      </PageShell>
    )
  if (!allowed) return <OwnerOnly />

  return (
    <CatalogList
      title="Blog."
      noun="post"
      newHref="/admin/blog/new"
      detailHeading="Published"
      truncated={posts.truncated}
      rows={posts.rows.map((p) => ({
        id: p.id,
        title: p.title,
        href: `/admin/blog/${p.id}`,
        thumb: (
          <span className="grid size-full place-items-center bg-muted/40 text-muted-foreground">
            <IconNews stroke={1.5} className="size-4" aria-hidden />
          </span>
        ),
        meta: `${p.language === "as" ? "Assamese · " : ""}${p.excerpt || p.slug}`,
        detail: publishedOn(p.publishedAt),
        published: p.published,
        sample: false,
        updatedAt: p.updatedAt,
      }))}
      onTogglePublished={(row) => {
        const post = posts.rows.find((p) => p.id === row.id)!
        return setPublished({
          id: post.id,
          published: !post.published,
          expectedRevision: post.revision,
        })
      }}
      empty={
        <StatePanel
          icon={<IconNews stroke={1.75} />}
          title="No posts yet"
          description="Write the first one. It stays a draft until you publish it."
        />
      }
    />
  )
}
