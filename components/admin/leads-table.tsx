"use client"

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDownload,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
 * `@tanstack/react-table` came in with the dashboard-01 block and sat
 * unused: the block's own DataTable was stripped because it shipped with
 * invented rows, and a plain `<table>` went in instead. This is the table
 * that was supposed to replace it - sorting, filtering, column visibility
 * and selection, built on the dependency that was already being paid for.
 * (The four `@dnd-kit` packages the block also installed were removed -
 * drag-to-reorder is meaningless for a queue ordered by when people got in
 * touch.)
 *
 * Not taken from the block: the metric cards and area chart, which had no
 * real numbers behind them.
 *
 * **On pagination.** The block paginates an array it already holds, so it can
 * count pages. Convex paginates with cursors: `usePaginatedQuery` accumulates
 * results and reports whether more exist, but it cannot report a total -
 * knowing there are exactly 214 enquiries means counting them, which a cursor
 * does not do. (`@convex-dev/aggregate` maintains real counts and is how a
 * true total would arrive; that is a backend change, recorded rather than
 * faked.)
 *
 * So there is one set of controls, not two. An earlier revision had both
 * these page buttons and a separate "Load more from server", which is two
 * pagination systems stacked on one table and reads exactly as odd as it
 * sounds. Paging past the last loaded row now fetches the next page itself,
 * and the count reads "of 3+" while the server still has more - honest about
 * the one thing cursors cannot tell us, and silent about it the moment they
 * can.
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

/**
 * The status filters, in the order a queue is worked.
 *
 * "All" first because it is the default view, then the statuses in the order
 * a lead moves through them, so the row reads as a pipeline rather than an
 * alphabetised list.
 */
const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "enrolled", label: "Enrolled" },
  { value: "lost", label: "Lost" },
] as const

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
    /*
     * Exact match, declared rather than inferred. v9 does not fall back to a
     * default matcher the way v8's `auto` did, so a column with no `filterFn`
     * silently ignores its filter value - the status buttons appeared to work
     * and changed nothing. Exact is also what is wanted here: "new" must not
     * match a status that merely contains it.
     */
    filterFn: (row, _id, value: string) => row.original.leadStatus === value,
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
  isOwner,
}: {
  leads: Lead[]
  canLoadMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
  /** Export is owner-only. See `exportRows`. */
  isOwner: boolean
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
  const pageCount = Math.max(1, table.getPageCount())
  const onLastLoadedPage = table.state.pagination.pageIndex >= pageCount - 1

  /*
   * Next means next, whether or not the rows are here yet.
   *
   * On the last page we hold, "next" asks the server for another page instead
   * of being disabled - the reader should not have to know which rows arrived
   * in which fetch. `usePaginatedQuery` appends, so the row they were looking
   * at does not move.
   */
  function goNext() {
    if (table.getCanNextPage()) {
      table.nextPage()
      return
    }
    if (canLoadMore) onLoadMore()
  }

  const canGoNext = table.getCanNextPage() || canLoadMore

  const statusFilter =
    (table.getColumn("leadStatus")?.getFilterValue() as string) ?? "all"

  function setStatusFilter(value: string) {
    table
      .getColumn("leadStatus")
      ?.setFilterValue(value === "all" ? undefined : value)
    table.setPageIndex(0)
  }

  /**
   * Download what is on screen, as CSV.
   *
   * Owner-only, and narrow on purpose. It exports the rows the table is
   * currently showing - after the search and the status filter, and only what
   * has been loaded - rather than reaching past the interface for the whole
   * table. An owner who wants more pages through them first, deliberately.
   *
   * Every row is a name and a mobile number, so a file of them is personal
   * data leaving the system. The admin contract's "no automatic staff exports"
   * is about the staff list, but the spirit holds here: nothing exports on a
   * schedule, nothing exports without somebody choosing to, and `/privacy`
   * says this can happen.
   *
   * Built in the browser from rows already rendered, so it adds no query and
   * no server route - no path to this data that the person clicking did not
   * already have.
   */
  function exportRows() {
    const rows = table.getFilteredRowModel().rows.map((row) => row.original)
    const header = ["Name", "Mobile", "Exam", "Status", "Last enquiry"]
    const body = rows.map((lead) => [
      lead.name,
      lead.phone,
      lead.interestTrack ?? "",
      lead.leadStatus ?? "",
      lead.lastEnquiryAt ? new Date(lead.lastEnquiryAt).toISOString() : "",
    ])
    /*
     * Every field quoted, quotes doubled. A name with a comma in it would
     * otherwise shift every later column by one, silently, and the reader
     * would not find out until a phone number turned up in the status column.
     */
    const csv = [header, ...body]
      .map((cells) =>
        cells.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
      )
      .join("\r\n")

    const stamp = new Date().toISOString().slice(0, 10)
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `ict-enquiries-${stamp}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

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

        {/*
         * Owner-only, and it says what it will do. "Export" alone invites the
         * reasonable assumption that it means everything; naming the filtered
         * count means nobody opens the file expecting rows that were never in
         * it.
         */}
        {isOwner ? (
          <Button
            variant="secondary"
            size="md"
            onClick={exportRows}
            disabled={matching === 0}
          >
            <IconDownload stroke={1.75} />
            Export {matching}
          </Button>
        ) : null}

        <p aria-live="polite" className="ml-auto text-sm text-muted-foreground">
          {selected > 0
            ? `${selected} selected`
            : `${matching} of ${leads.length} loaded`}
        </p>
      </div>

      {/*
       * Status as a row of filters rather than a dropdown. There are five, they
       * are the queue's primary axis, and a staff member wanting "just the new
       * ones" should not have to open a menu to find out that is possible.
       */}
      <ToggleGroup
        value={[statusFilter]}
        onValueChange={(value) => setStatusFilter(value[0] ?? "all")}
        aria-label="Filter by status"
        className="flex-wrap"
      >
        {STATUS_FILTERS.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

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
          Page {table.state.pagination.pageIndex + 1} of {pageCount}
          {canLoadMore ? (
            <>
              <span aria-hidden="true">+</span>
              <span className="sr-only">
                {" "}
                or more; the server has further enquiries not yet loaded
              </span>
            </>
          ) : null}
          {loadingMore ? (
            <Spinner className="ml-2 inline align-[-2px]" />
          ) : null}
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
            onClick={goNext}
            disabled={!canGoNext || loadingMore}
          >
            <IconChevronRight stroke={1.75} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Last loaded page"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={onLastLoadedPage}
          >
            <IconChevronsRight stroke={1.75} />
          </Button>
        </div>
      </div>
    </div>
  )
}
