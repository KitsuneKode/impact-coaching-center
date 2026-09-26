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
import { createContext, useContext, useMemo, useState } from "react"

import { RowsPerPage } from "@/components/admin/rows-per-page"
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
import { isDueIst } from "@/lib/ist"

export type Lead = {
  id: string
  name: string
  phone: string
  leadStatus: string | undefined
  interestTrack: string | undefined
  lastEnquiryAt: number | undefined
  verifiedAt: number | undefined
  nextFollowUpAt: number | undefined
  revision: number
}

/** The follow-up queue as a real data table. */
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

/** The status filters, in the order a queue is worked. */
const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "due", label: "Follow-up due" },
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
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

/**
 * Columns are defined once at module scope, so the open handler reaches the
 * name cell through context rather than being baked into a column.
 */
const OpenLeadContext = createContext<(id: string) => void>(() => {})

function OpenLead({ lead }: { lead: Lead }) {
  const open = useContext(OpenLeadContext)
  return (
    <button
      type="button"
      onClick={() => open(lead.id)}
      className="rounded-control text-left font-medium underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {lead.name || (
        <span className="font-normal text-muted-foreground">Not given</span>
      )}
      <span className="sr-only">, open enquiry</span>
    </button>
  )
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
    cell: ({ row }) => <OpenLead lead={row.original} />,
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
    // Matches the stored E.164 and the displayed form, so "94352" finds
    // "+91 94352 …" as well as "+9194352…".
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
    /* Exact match, declared rather than inferred. */
    filterFn: (row, _id, value: string) =>
      value === "due"
        ? isDueIst(row.original.nextFollowUpAt, Date.now()) &&
          row.original.leadStatus !== "enrolled" &&
          row.original.leadStatus !== "lost"
        : row.original.leadStatus === value,
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
  columnHelper.accessor("nextFollowUpAt", {
    header: "Follow-up",
    cell: ({ row }) => {
      const at = row.original.nextFollowUpAt
      if (!at) return <span className="text-muted-foreground">—</span>
      const due = isDueIst(at, Date.now())
      return (
        <time
          dateTime={new Date(at).toISOString()}
          title={exact(at)}
          className={
            due
              ? "font-medium whitespace-nowrap"
              : "whitespace-nowrap text-muted-foreground"
          }
        >
          {due ? "Due " : ""}
          {new Date(at).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
          })}
        </time>
      )
    },
    sortUndefined: "last",
  }),
])

export function LeadsTable({
  leads,
  canLoadMore,
  loadingMore,
  onLoadMore,
  isOwner,
  onOpen,
}: {
  leads: Lead[]
  canLoadMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
  /** Export is owner-only. See `exportRows`. */
  isOwner: boolean
  /** Opens one enquiry for follow-up. */
  onOpen: (id: string) => void
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

  /* Next means next, whether or not the rows are here yet. */
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

  /** Download the ticked rows, as CSV. */
  const selectedCount = table.getSelectedRowModel().rows.length

  function exportRows() {
    const rows = table.getSelectedRowModel().rows.map((row) => row.original)
    const header = [
      "Name",
      "Mobile",
      "Exam",
      "Status",
      "Last enquiry",
      "Next follow-up",
    ]
    const body = rows.map((lead) => [
      lead.name,
      lead.phone,
      lead.interestTrack ?? "",
      lead.leadStatus ?? "",
      lead.lastEnquiryAt ? new Date(lead.lastEnquiryAt).toISOString() : "",
      lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toISOString() : "",
    ])
    /*
     * Every field quoted, quotes doubled. A name with a comma in it would
     * otherwise shift every later column by one, silently, and the reader
     * would not find out until a phone number turned up in the status column.
     */
    const csv = [header, ...body]
      .map((cells) =>
        cells
          .map((cell) => {
            const text = String(cell)
            const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
            return `"${safe.replaceAll('"', '""')}"`
          })
          .join(",")
      )
      .join("\r\n")

    const stamp = new Date().toISOString().slice(0, 10)
    const url = URL.createObjectURL(
      // The byte-order mark is what makes Excel read the file as UTF-8, so an
      // Assamese or Bengali name opens as itself rather than as mojibake.
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `ict-enquiries-${stamp}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <OpenLeadContext.Provider value={onOpen}>
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
              value={
                (table.getColumn("phone")?.getFilterValue() as string) ?? ""
              }
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
            Owner-only, and only what the owner ticked. Exporting the whole filtered
            list by default put more personal data in a file than the task needed;
            choosing rows keeps each file to the people it is for.
          */}
          {isOwner ? (
            <Button
              variant="secondary"
              size="md"
              onClick={exportRows}
              disabled={selectedCount === 0}
            >
              <IconDownload stroke={1.75} />
              {selectedCount === 0
                ? "Export selected"
                : `Export ${selectedCount} selected`}
            </Button>
          ) : null}

          <p
            aria-live="polite"
            className="ml-auto text-sm text-muted-foreground"
          >
            {selected > 0
              ? `${selected} selected`
              : `${matching} of ${leads.length} loaded`}
          </p>
        </div>

        {/*
          Status as a row of filters rather than a dropdown. There are five, they
          are the queue's primary axis, and a staff member wanting "just the new
          ones" should not have to open a menu to find out that is possible.
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
                    <TableHead
                      key={header.id}
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
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
                    No-match, not empty. §6 insists these are different
                    problems with different words: the collection has rows,
                    this filter excluded them, and the way out is clearing it.
                  */}
                  <TableCell colSpan={columns.length} className="h-24">
                    <div className="flex flex-col items-start gap-3">
                      <span className="text-muted-foreground">
                        Nothing matched that search.
                      </span>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => table.resetColumnFilters()}
                      >
                        Clear filters
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
          <RowsPerPage
            id="rows-per-page"
            value={table.state.pagination.pageSize}
            onChange={(size) => {
              table.setPageSize(size)
              // A bigger page may need rows the server has not sent yet.
              if (size > leads.length && canLoadMore) onLoadMore()
            }}
          />

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
    </OpenLeadContext.Provider>
  )
}
