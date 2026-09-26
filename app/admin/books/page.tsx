"use client"

import { IconBooks } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"

import { convexConfigured } from "@/app/providers"
import { BookCover } from "@/components/commerce/book-cover"
import { OwnerOnly } from "@/components/admin/book-editor"
import { CatalogList } from "@/components/admin/catalog-list"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"
import { formatPaise } from "@/lib/money"

/** Every book, published or not. Owner only. */
export default function AdminBooksPage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Books.">
        Not available here.
      </PageShell>
    )
  return <Books />
}

function Books() {
  const allowed = useQuery(api.catalogAdmin.canEditCatalog)
  const books = useQuery(api.catalogAdmin.adminBooks)
  const setPublished = useMutation(api.catalogAdmin.setBookPublished)

  if (allowed === undefined || books === undefined)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Books.</span>}
      >
        <ListSkeleton rows={5} />
      </PageShell>
    )
  if (!allowed) return <OwnerOnly />

  return (
    <CatalogList
      title="Books."
      noun="book"
      newHref="/admin/books/new"
      detailHeading="Price"
      truncated={books.truncated}
      rows={books.rows.map((b) => ({
        id: b.id,
        title: b.title,
        href: `/admin/books/${b.id}`,
        thumb: (
          <BookCover
            title={b.title}
            tone="muted"
            coverUrl={b.coverUrl}
            size="sm"
          />
        ),
        meta: b.exam,
        detail: formatPaise(b.pricePaise),
        published: b.published,
        sample: b.sample,
        updatedAt: b.updatedAt,
      }))}
      onTogglePublished={(row) => {
        const book = books.rows.find((b) => b.id === row.id)!
        return setPublished({
          id: book.id,
          published: !book.published,
          expectedRevision: book.revision,
        })
      }}
      empty={
        <StatePanel
          icon={<IconBooks stroke={1.75} />}
          title="No books yet"
          description="Add the first one. It stays a draft until you publish it."
        />
      }
    />
  )
}
