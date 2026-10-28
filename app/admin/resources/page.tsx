"use client"

import { IconFileText } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"

import { convexConfigured } from "@/app/providers"
import { CatalogOnly } from "@/components/admin/book-editor"
import { CatalogList } from "@/components/admin/catalog-list"
import { PaperPage } from "@/components/commerce/paper-page"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"

/** Every free resource, published or not. Owner only. */
export default function AdminResourcesPage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Resources.">
        Not available here.
      </PageShell>
    )
  return <Resources />
}

function Resources() {
  const allowed = useQuery(api.catalogAdmin.canEditCatalog)
  const resources = useQuery(api.catalogAdmin.adminResources)
  const setPublished = useMutation(api.catalogAdmin.setResourcePublished)

  if (allowed === undefined || resources === undefined)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Resources.</span>}
      >
        <ListSkeleton rows={5} />
      </PageShell>
    )
  if (!allowed) return <CatalogOnly />

  return (
    <CatalogList
      title="Resources."
      noun="resource"
      newHref="/admin/resources/new"
      detailHeading="Pages"
      truncated={resources.truncated}
      rows={resources.rows.map((r) => ({
        id: r.id,
        title: r.title,
        href: `/admin/resources/${r.id}`,
        thumb: <PaperPage running="" lines={6} compact className="h-full" />,
        meta: `${r.kind} · ${r.exam}`,
        detail: r.pages ? `${r.pages}${r.pdf ? " (PDF)" : ""}` : "None yet",
        published: r.published,
        sample: r.sample,
        updatedAt: r.updatedAt,
        publishBlocked: r.pages
          ? undefined
          : "Add a PDF or the page images before publishing.",
      }))}
      onTogglePublished={(row) => {
        const resource = resources.rows.find((r) => r.id === row.id)!
        return setPublished({
          id: resource.id,
          published: !resource.published,
          expectedRevision: resource.revision,
        })
      }}
      empty={
        <StatePanel
          icon={<IconFileText stroke={1.75} />}
          title="No resources yet"
          description="Add the first one. It stays a draft until you publish it."
        />
      }
    />
  )
}
