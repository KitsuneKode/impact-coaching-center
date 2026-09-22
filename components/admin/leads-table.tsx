"use client"

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconSearch,
} from "@tabler/icons-react"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"

import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPhone } from "@/lib/brand"

export type Lead = {
  id: string
  name: string
  phone: string
  leadStatus: string | undefined
  interestTrack: string | undefined
  lastEnquiryAt: number | undefined
  verifiedAt: number | undefined
}

/**
 * The follow-up queue as a real data table.
 *
 * `@tanstack/react-table` and the four `@dnd-kit` packages have been in
 * package.json since dashboard-01 was installed, and nothing used them: the
 * block's own DataTable was stripped because it shipped with invented rows,
 * and a plain `<table>` went in instead. This is the table that was supposed
 * to replace it - sorting, filtering, column visibility and selection, built
 * on the dependency that was already being paid for.
 *
 * Not taken from the block: drag-to-reorder, which is meaningless for a queue
 * ordered by when people got in touch, and the metric cards and area chart,
 * which had no real numbers behind them.
 *
 * **On pagination, and why it is not "Page 3 of 12".** The block paginates a
 * fixed array it already holds, so it can count pages. Convex pagination is
 * cursor-based: there is no total and no random access to page seven without
 * walking there. So the page controls below move through the rows *loaded so
 * far*, the count says exactly that, and fetching more from the server stays
 * an explicit action. A "Page 1 of 12" derived from one fetched page is the
 * same lie as the "N to follow up" count KIT-55 removed - it looks
 * authoritative and stops being true at the second page.
 */
const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, Lead>()

/** Sort order for statuses: what needs doing first, settled last. */
const STATUS_ORDER: Record<string, number> = {
  new: 0,
  contacted: 1,
  interested: 2,
  enrolled: 3,
  lost: 4,
}

function ago(at: number) {
  const minutes = Math.round((Date.now() - at) / 60000)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  if (minutes < 2) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  if (days < 31) return `${days} ${days === 1 ? "day" : "days"} ago`
  const months = Math.round(days / 30)
  return `${months} ${months === 1 ? "month" : "months"} ago`
}

function exact(at: number) {
  return new Date(at).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select every row on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select ${row.original.name || row.original.phone}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) =>
      row.original.name || (
        <span className="text-muted-foreground">Not given</span>
      ),
    enableHiding: false,
  }),
  columnHelper.accessor("phone", {
    header: "Mobile",
    cell: ({ row }) => (
      /*
       * A tel: link, because staff read this queue on a handset and the next
       * action is always a call. Underlined on hover rather than always:
       * thirty underlined numbers is a wall of rules fighting the data.
       */
      <a
        href={`tel:${row.original.phone}`}
        className="tnum whitespace-nowrap text-foreground underline-offset-4 hover:underline focus-visible:underline"
      >
        {formatPhone(row.original.phone)}
      </a>
    ),
    enableHiding: false,
    // Matches on the stored E.164 and on what is displayed, so "94352" finds
    // a number the reader can see even though the stored value is +9194352…
    filterFn: (row, _id, value: string) => {
      const needle = value.toLowerCase().replaceAll(/\s/g, "")
      const lead = row.original
      return (
        lead.phone.toLowerCase().includes(needle) ||
        formatPhone(lead.phone)
          .toLowerCase()
          .replaceAll(/\s/g, "")
          .includes(needle) ||
        lead.name.toLowerCase().includes(value.toLowerCase())
      )
    },
  }),
  columnHelper.accessor("interestTrack", {
    header: "Exam",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.interestTrack ?? "—"}
      </span>
    ),
  }),
  columnHelper.accessor("leadStatus", {
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.leadStatus} />,
    sortFn: (a, b) =>
      (STATUS_ORDER[a.original.leadStatus ?? ""] ?? 99) -
      (STATUS_ORDER[b.original.leadStatus ?? ""] ?? 99),
  }),
  columnHelper.accessor("lastEnquiryAt", {
    header: "Last enquiry",
    cell: ({ row }) => {
      const at = row.original.lastEnquiryAt
      if (!at) return <span className="text-muted-foreground">—</span>
      return (
        <time
          dateTime={new Date(at).toISOString()}
          title={exact(at)}
          className="whitespace-nowrap text-muted-foreground"
        >
          {ago(at)}
        </time>
      )
    },
  }),
])

export function LeadsTable({
  leads,
  canLoadMore,
  loadingMore,
  onLoadMore,
}: {
  leads: Lead[]
  canLoadMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })

  const data = useMemo(() => leads, [leads])

  const table = useTable({
    features,
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  })

  const selected = table.getFilteredSelectedRowModel().rows.length
  const matching = table.getFilteredRowModel().rows.length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="w-full max-w-xs">
          <InputGroupAddon className="pl-3">
            <IconSearch
              stroke={1.75}
              className="size-4 text-muted-foreground"
            />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search name or number"
            aria-label="Search enquiries by name or number"
            value={(table.getColumn("phone")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("phone")?.setFilterValue(event.target.value)
            }
          />
        </InputGroup>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="secondary" size="md" />}
          >
            <IconLayoutColumns stroke={1.75} />
            Columns
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Show</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuItem
                    key={column.id}
                    closeOnClick={false}
                    onClick={() =>
                      column.toggleVisibility(!column.getIsVisible())
                    }
                  >
                    <Checkbox
                      checked={column.getIsVisible()}
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <p aria-live="polite" className="ml-auto text-sm text-muted-foreground">
          {selected > 0
            ? `${selected} selected`
            : `${matching} of ${leads.length} loaded`}
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-border">
        <Table className="min-w-200">
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 rounded-control hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <FlexRender header={header} />
                        <span aria-hidden="true" className="text-xs">
                          {header.column.getIsSorted() === "asc"
                            ? "▲"
                            : header.column.getIsSorted() === "desc"
                              ? "▼"
                              : ""}
                        </span>
                      </button>
                    ) : (
                      <FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                {/*
                 * No-match, not empty. §6 insists these are different
                 * problems with different words: the collection has rows,
                 * this filter excluded them, and the way out is clearing it.
                 */}
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex flex-col items-start gap-3">
                    <span className="text-muted-foreground">
                      Nothing matched that search.
                    </span>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() =>
                        table.getColumn("phone")?.setFilterValue("")
                      }
                    >
                      Clear search
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="rows-per-page" className="text-sm">
            Rows per page
          </Label>
          <Select
            value={`${table.state.pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
            items={[10, 20, 30, 50].map((size) => ({
              label: `${size}`,
              value: `${size}`,
            }))}
          >
            <SelectTrigger id="rows-per-page" className="w-20">
              <SelectValue />
            </SelectTrigger>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">
          Page {table.state.pagination.pageIndex + 1} of{" "}
          {Math.max(1, table.getPageCount())}
          <span className="sr-only"> of the enquiries loaded so far</span>
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            aria-label="First page"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronsLeft stroke={1.75} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft stroke={1.75} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronRight stroke={1.75} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Last page loaded"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronsRight stroke={1.75} />
          </Button>
        </div>

        {/*
         * Server fetching stays a separate, named action. These page controls
         * move through what is already here; this one goes and gets more.
         * Collapsing the two would mean "Last page" silently meaning "last
         * page we happen to hold", which is the kind of half-truth a queue
         * cannot afford.
         */}
        {canLoadMore ? (
          <Button
            variant="secondary"
            size="md"
            className="ml-auto"
            disabled={loadingMore}
            onClick={onLoadMore}
          >
            {loadingMore ? <Spinner /> : null}
            Load more from server
          </Button>
        ) : (
          <p className="ml-auto text-sm text-muted-foreground">
            All enquiries loaded.
          </p>
        )}
      </div>
    </div>
  )
}
