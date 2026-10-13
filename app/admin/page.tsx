"use client"

import {
  IconArrowRight,
  IconCalendarDue,
  IconInbox,
  IconLock,
  IconPackage,
} from "@tabler/icons-react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { useEffect, useState } from "react"

import { convexConfigured } from "@/app/providers"
import { ButtonLink } from "@/components/ui/button"
import { PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"

/** The admin home: what needs somebody today. */
export default function AdminHome() {
  if (!convexConfigured) return <Unavailable />
  return <Home />
}

function Unavailable() {
  return (
    <PageShell density="working" title="Admin">
      <StatePanel
        title="Not available here"
        description="This copy of the site has no connection to the database, so there is nothing to show. Nothing is wrong with your account."
      />
    </PageShell>
  )
}

function Home() {
  const viewer = useQuery(api.auth.getCurrentPerson)
  const leads = useQuery(api.leads.leadCounts)
  const orders = useQuery(api.orders.orderCounts)
  const isStaff = viewer?.role === "staff" || viewer?.role === "owner"

  if (viewer === undefined) return null

  if (!isStaff)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Staff only.</span>}
      >
        <StatePanel
          icon={<IconLock stroke={1.75} />}
          title="This area is for ICT staff"
          description="If you are staff and seeing this, log in with the number ICT has on file for you."
          action={
            <ButtonLink href="/login?next=/admin" size="md">
              Log in
            </ButtonLink>
          }
        />
      </PageShell>
    )

  const plus = leads?.capped ? "+" : ""
  const rows = [
    {
      href: "/admin/leads",
      icon: IconInbox,
      count: leads?.fresh,
      label: (n: number) =>
        n === 1
          ? "new enquiry nobody has called"
          : "new enquiries nobody has called",
      suffix: plus,
    },
    {
      href: "/admin/leads",
      icon: IconCalendarDue,
      count: leads?.due,
      label: (n: number) =>
        n === 1 ? "follow-up due today" : "follow-ups due today",
      suffix: plus,
    },
    {
      href: "/admin/orders",
      icon: IconPackage,
      count: orders?.open,
      label: (n: number) => (n === 1 ? "order to fulfil" : "orders to fulfil"),
      suffix: orders?.capped ? "+" : "",
      note:
        [
          orders && orders.unseen > 0
            ? `${orders.unseen}${orders.capped ? "+" : ""} not yet opened`
            : null,
          orders && orders.unpaid > 0
            ? `${orders.unpaid} waiting for the buyer to pay`
            : null,
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
    },
  ]

  return (
    <PageShell
      density="working"
      title={
        <>
          <span className="text-foreground">Today.</span>{" "}
          <span className="text-muted-foreground">
            {viewer.name.trim()
              ? `Hello, ${viewer.name.trim().split(" ")[0]}.`
              : "What needs you."}
          </span>
        </>
      }
    >
      <ul className="grid max-w-160 divide-y divide-border rounded-card border border-border">
        {rows.map((row) => {
          const Icon = row.icon
          const loading = row.count === undefined
          const count = row.count ?? 0
          return (
            <li key={row.label(2)}>
              <Link
                href={row.href}
                className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <Icon
                  stroke={1.75}
                  aria-hidden
                  className="size-5 shrink-0 text-muted-foreground"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span>
                    <span
                      className={
                        count > 0
                          ? "tnum font-medium"
                          : "tnum text-muted-foreground"
                      }
                    >
                      {loading ? "…" : `${count}${count > 0 ? row.suffix : ""}`}
                    </span>{" "}
                    {row.label(count)}
                  </span>
                  {row.note ? (
                    <span className="text-sm text-muted-foreground">
                      {row.note}
                    </span>
                  ) : null}
                </span>
                <IconArrowRight
                  stroke={1.75}
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          )
        })}
      </ul>

      <Week />
    </PageShell>
  )
}

/** The time to the minute, for queries that cannot read the clock. */
function useMinute() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 60_000) * 60_000)
  useEffect(() => {
    const timer = setInterval(
      () => setNow(Math.floor(Date.now() / 60_000) * 60_000),
      60_000
    )
    return () => clearInterval(timer)
  }, [])
  return now
}

const rupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)

const ago = (at: number, now: number) => {
  const minutes = Math.max(0, Math.round((now - at) / 60_000))
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  return hours < 48 ? `${hours} h ago` : `${Math.round(hours / 24)} days ago`
}

/**
 * The week at a glance, in cards: each appears only for staff who may see
 * what it counts (orders and sets for the shop, promotions for promotions).
 */
function Week() {
  const now = useMinute()
  const week = useQuery(api.dashboard.weekly, { now })
  if (!week) return null

  return (
    <section aria-labelledby="week-heading" className="mt-12 max-w-4xl">
      <h2 id="week-heading" className="text-lg font-medium">
        This week
      </h2>
      <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,15rem),1fr))] gap-3">
        {week.sales ? (
          <Card href="/admin/orders" label="Paid, last 7 days">
            <span className="tnum text-2xl font-semibold">
              {rupees(week.sales.paidPaise)}
            </span>
            <span className="tnum text-sm text-muted-foreground">
              {week.sales.paidOrders}
              {week.sales.capped ? "+" : ""}{" "}
              {week.sales.paidOrders === 1 ? "order" : "orders"}
              {week.sales.unpaidStale > 0
                ? ` · ${week.sales.unpaidStale} unpaid over a day`
                : ""}
            </span>
          </Card>
        ) : null}
        <Card href="/admin/leads" label="Enquiries, last 7 days">
          <span className="tnum text-2xl font-semibold">
            {week.enquiries.total}
            {week.enquiries.capped ? "+" : ""}
          </span>
          {week.enquiries.bySource.length ? (
            <span className="text-sm text-muted-foreground">
              {week.enquiries.bySource
                .map((row) => `${row.source} ${row.count}`)
                .join(" · ")}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">None yet</span>
          )}
        </Card>
        <Card href="/admin/leads" label="WhatsApp and call taps, 7 days">
          <span className="tnum text-2xl font-semibold">
            {week.taps.whatsapp + week.taps.call}
          </span>
          <span className="tnum text-sm text-muted-foreground">
            WhatsApp {week.taps.whatsapp} · calls {week.taps.call}
          </span>
          {week.taps.topPages.length ? (
            <span className="truncate text-xs text-muted-foreground">
              Most from{" "}
              {week.taps.topPages
                .map((row) => `${row.page} (${row.count})`)
                .join(", ")}
            </span>
          ) : null}
        </Card>
        {week.topSets ? (
          <Card href="/admin/books" label="Best-selling sets">
            {week.topSets.length ? (
              <ol className="grid gap-0.5 text-sm">
                {week.topSets.map((set) => (
                  <li key={set.slug} className="flex justify-between gap-3">
                    <span className="truncate">{set.title}</span>
                    <span className="tnum text-muted-foreground">
                      {set.sold}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <span className="text-sm text-muted-foreground">
                No sets sold yet
              </span>
            )}
          </Card>
        ) : null}
        {week.livePromotions !== undefined ? (
          <Card href="/admin/promotions" label="Promotions live now">
            <span className="tnum text-2xl font-semibold">
              {week.livePromotions}
            </span>
          </Card>
        ) : null}
        {week.lastSync ? (
          <Card href="/admin/courses" label="ClassPlus sync">
            <span
              className={
                week.lastSync.status === "ok"
                  ? "text-sm font-medium"
                  : "text-sm font-medium text-destructive"
              }
            >
              {week.lastSync.status === "ok"
                ? `${week.lastSync.seen} courses`
                : "Last sync failed"}
            </span>
            <span className="text-sm text-muted-foreground">
              {ago(week.lastSync.at, now)}
            </span>
          </Card>
        ) : null}
      </ul>
    </section>
  )
}

function Card({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex h-full flex-col gap-1 rounded-card border border-border p-4 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring active:scale-[0.99]"
      >
        <span className="text-xs text-muted-foreground">{label}</span>
        {children}
      </Link>
    </li>
  )
}
