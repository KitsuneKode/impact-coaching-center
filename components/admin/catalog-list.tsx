"use client"

import { IconPlus } from "@tabler/icons-react"
import Link from "next/link"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import {
  CATALOG_REFUSALS,
  PublishState,
} from "@/components/admin/catalog-fields"
import { refreshSite } from "@/app/admin/refresh-site"
import { Button, ButtonLink } from "@/components/ui/button"
import { PageShell } from "@/components/ui/page-shell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type CatalogRow = {
  id: string
  title: string
  href: string
  thumb: ReactNode
  meta: string
  detail: string
  published: boolean
  sample: boolean
  updatedAt: number
  /** Why publishing is off the table, e.g. "Add page images first". */
  publishBlocked?: string
}

type Toggle = (
  row: CatalogRow
) => Promise<{ ok: true } | { ok: false; reason: string }>

const updated = (at: number) =>
  new Date(at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

/** Books or resources: what exists, whether it is live, and the one switch. */
export function CatalogList({
  title,
  noun,
  newHref,
  detailHeading,
  rows,
  truncated,
  onTogglePublished,
  empty,
}: {
  title: string
  noun: string
  newHref: string
  detailHeading: string
  rows: CatalogRow[]
  /** The server capped this list; the oldest records are not shown. */
  truncated?: boolean
  onTogglePublished: Toggle
  empty: ReactNode
}) {
  const [pending, setPending] = useState<string | null>(null)

  async function toggle(row: CatalogRow) {
    setPending(row.id)
    try {
      const result = await onTogglePublished(row)
      if (!result.ok)
        toast.error(CATALOG_REFUSALS[result.reason] ?? "Not changed.")
      else {
        void refreshSite("catalog")
        // Taking something off the site is one tap to reverse, so it gets
        // Undo rather than a "are you sure" first.
        // The page reads the live record, so Undo flips it back from
        // whatever it is now.
        if (row.published)
          toast.success(`Unpublished ${row.title}`, {
            action: {
              label: "Undo",
              onClick: () => void toggle({ ...row, published: false }),
            },
          })
        else toast.success(row.published ? "Unpublished" : "Published")
      }
    } catch {
      toast.error("Could not reach the server. Try again.")
    } finally {
      setPending(null)
    }
  }

  return (
    <PageShell
      density="working"
      title={<span className="text-foreground">{title}</span>}
    >
      <div className="grid gap-6">
        <div>
          <ButtonLink href={newHref} size="md">
            <IconPlus stroke={1.75} aria-hidden />
            New {noun}
          </ButtonLink>
        </div>
        {rows.length === 0 ? (
          empty
        ) : (
          <>
            {/* Phones: one card per item, nothing cut off at the screen edge. */}
            <ul className="grid gap-3 md:hidden">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="grid gap-3 rounded-card border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-14 w-10 shrink-0 overflow-clip rounded-[2px] ring-1 ring-border">
                      {row.thumb}
                    </div>
                    <div className="grid min-w-0 gap-0.5">
                      <Link href={row.href} className="font-medium text-pretty">
                        {row.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {row.meta}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <PublishState
                      published={row.published}
                      sample={row.sample}
                    />
                    <span className="tnum text-muted-foreground">
                      {detailHeading}: {row.detail}
                    </span>
                    <span className="text-muted-foreground">
                      {updated(row.updatedAt)}
                    </span>
                  </div>
                  <PublishButton
                    row={row}
                    pending={pending === row.id}
                    onToggle={() => toggle(row)}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>
            <div className="overflow-x-auto rounded-card border border-border max-md:hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-64">Title</TableHead>
                    <TableHead>{detailHeading}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>
                      <span className="sr-only">Publish</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-9 shrink-0 overflow-clip rounded-[2px] ring-1 ring-border">
                            {row.thumb}
                          </div>
                          <div className="grid min-w-0">
                            <Link
                              href={row.href}
                              className="truncate font-medium hover:underline"
                            >
                              {row.title}
                            </Link>
                            <span className="truncate text-xs text-muted-foreground">
                              {row.meta}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="tnum">{row.detail}</TableCell>
                      <TableCell>
                        <PublishState
                          published={row.published}
                          sample={row.sample}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {updated(row.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <PublishButton
                          row={row}
                          pending={pending === row.id}
                          onToggle={() => toggle(row)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        {truncated ? (
          <p className="text-xs text-muted-foreground">
            Showing the newest {rows.length}. Older {noun}s are not listed here.
          </p>
        ) : null}
      </div>
    </PageShell>
  )
}

function PublishButton({
  row,
  pending,
  onToggle,
  className,
}: {
  row: CatalogRow
  pending: boolean
  onToggle: () => void
  className?: string
}) {
  const blocked = !row.published && !!row.publishBlocked
  return (
    <span className={className}>
      <Button
        variant="secondary"
        size="sm"
        disabled={pending || blocked}
        title={row.published ? undefined : row.publishBlocked}
        aria-label={`${row.published ? "Unpublish" : "Publish"} ${row.title}`}
        onClick={onToggle}
        className={className}
      >
        {row.published ? "Unpublish" : "Publish"}
      </Button>
      {blocked ? (
        <span className="mbs-1 block text-xs text-muted-foreground md:hidden">
          {row.publishBlocked}
        </span>
      ) : null}
    </span>
  )
}
