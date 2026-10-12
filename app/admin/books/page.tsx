"use client"

import { IconBooks, IconPlus } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { convexConfigured } from "@/app/providers"
import {
  CATALOG_REFUSALS,
  PublishState,
} from "@/components/admin/catalog-fields"
import { CatalogOnly } from "@/components/admin/book-editor"
import { BookCover } from "@/components/commerce/book-cover"
import { Button, ButtonLink } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { LANGUAGES, type Language } from "@/lib/catalog"
import { formatPaise } from "@/lib/money"

const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  as: "Assamese",
}

/** Sets and the books in them. Owner, or staff with catalogue access. */
export default function AdminShopPage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Shop.">
        Not available here.
      </PageShell>
    )
  return <Shop />
}

function Shop() {
  const allowed = useQuery(api.catalogAdmin.canEditCatalog)
  const bundles = useQuery(api.catalogAdmin.adminBundles)
  const books = useQuery(api.catalogAdmin.adminBooks)

  if (allowed === undefined || bundles === undefined || books === undefined)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Shop.</span>}
      >
        <ListSkeleton rows={5} />
      </PageShell>
    )
  if (!allowed) return <CatalogOnly />

  return (
    <PageShell
      density="working"
      title={<span className="text-foreground">Shop.</span>}
    >
      <div className="grid gap-12">
        <section className="grid gap-4" aria-labelledby="sets-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="sets-heading" className="text-lg font-medium">
              Sets
            </h2>
            <ButtonLink href="/admin/bundles/new" size="md">
              <IconPlus stroke={1.75} aria-hidden />
              New set
            </ButtonLink>
          </div>
          {bundles.rows.length ? (
            <SetsTable rows={bundles.rows} />
          ) : (
            <StatePanel
              icon={<IconBooks stroke={1.75} />}
              title="No sets yet"
              description="Add the books first, then group them into a set. Visitors buy sets, in English or Assamese."
            />
          )}
        </section>

        <section className="grid gap-4" aria-labelledby="books-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="books-heading" className="text-lg font-medium">
              Books
            </h2>
            <ButtonLink href="/admin/books/new" size="md" variant="secondary">
              <IconPlus stroke={1.75} aria-hidden />
              New book
            </ButtonLink>
          </div>
          {books.rows.length ? (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
              {books.rows.map((book) => (
                <li key={book.id}>
                  <Link
                    href={`/admin/books/${book.id}`}
                    className="flex items-center gap-3 rounded-card border border-border p-3 hover:bg-secondary/50"
                  >
                    <span className="w-9 shrink-0">
                      <BookCover
                        title={book.titles.en ?? book.titles.as ?? ""}
                        cover={book.cover}
                        size="sm"
                      />
                    </span>
                    <span className="grid min-w-0">
                      <span className="truncate font-medium">
                        {book.titles.en ?? book.titles.as}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {[
                          book.titles.en ? "English" : "",
                          book.titles.as ? "Assamese" : "",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                        {book.sample ? " · Sample" : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <StatePanel
              icon={<IconBooks stroke={1.75} />}
              title="No books yet"
              description="A book holds its English and Assamese editions: title, cover and sample pages."
            />
          )}
        </section>
      </div>
    </PageShell>
  )
}

type SetRow = NonNullable<
  ReturnType<typeof useQuery<typeof api.catalogAdmin.adminBundles>>
>["rows"][number]

function SetsTable({ rows }: { rows: SetRow[] }) {
  const setAvailable = useMutation(api.catalogAdmin.setVariantAvailable)
  const setPublished = useMutation(api.catalogAdmin.setBundlePublished)
  const [pending, setPending] = useState<string | null>(null)

  async function run(
    key: string,
    action: () => Promise<{ ok: true } | { ok: false; reason: string }>,
    done: string
  ) {
    setPending(key)
    try {
      const result = await action()
      if (result.ok) toast.success(done)
      else toast.error(CATALOG_REFUSALS[result.reason] ?? "Not changed.")
    } catch {
      toast.error("Could not reach the server. Try again.")
    } finally {
      setPending(null)
    }
  }

  const toggleLanguage = (row: SetRow, language: Language, next: boolean) =>
    run(
      `${row.id}:${language}`,
      () =>
        setAvailable({
          id: row.id as Id<"bundles">,
          language,
          available: next,
          expectedRevision: row.revision,
        }),
      `${LANGUAGE_NAMES[language]} set ${next ? "available" : "switched off"}`
    )

  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-56">Set</TableHead>
            {LANGUAGES.map((language) => (
              <TableHead key={language}>{LANGUAGE_NAMES[language]}</TableHead>
            ))}
            <TableHead>Sold</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Publish</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="grid min-w-0">
                  <Link
                    href={`/admin/bundles/${row.id}`}
                    className="truncate font-medium hover:underline"
                  >
                    {row.title.en}
                  </Link>
                  <span className="truncate text-xs text-muted-foreground">
                    {row.exam} · {row.books} book{row.books === 1 ? "" : "s"}
                  </span>
                </div>
              </TableCell>
              {LANGUAGES.map((language) => {
                const variant = row.variants[language]
                return (
                  <TableCell key={language}>
                    <label className="flex items-center gap-2.5">
                      <Switch
                        checked={variant.available}
                        disabled={pending === `${row.id}:${language}`}
                        onCheckedChange={(next) =>
                          toggleLanguage(row, language, next)
                        }
                        aria-label={`${LANGUAGE_NAMES[language]} set of ${row.title.en} available`}
                      />
                      <span
                        className={
                          variant.available
                            ? "tnum"
                            : "tnum text-muted-foreground line-through"
                        }
                      >
                        {formatPaise(variant.pricePaise)}
                      </span>
                    </label>
                  </TableCell>
                )
              })}
              <TableCell className="tnum">{row.soldCount}</TableCell>
              <TableCell>
                <PublishState published={row.published} sample={row.sample} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={
                    pending === row.id || (!row.published && !row.books)
                  }
                  title={
                    !row.published && !row.books
                      ? "Add books to the set first"
                      : undefined
                  }
                  onClick={() =>
                    run(
                      row.id,
                      () =>
                        setPublished({
                          id: row.id as Id<"bundles">,
                          published: !row.published,
                          expectedRevision: row.revision,
                        }),
                      row.published ? "Unpublished" : "Published on /books"
                    )
                  }
                >
                  {row.published ? "Unpublish" : "Publish"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
