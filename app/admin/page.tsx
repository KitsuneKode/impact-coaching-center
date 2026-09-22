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

import { convexConfigured } from "@/app/providers"
import { ButtonLink } from "@/components/ui/button"
import { PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"

/**
 * The admin home: what needs somebody today.
 *
 * Not a dashboard of metrics. The registry block this shell came from shipped
 * cards and charts of invented data, and KIT-55 and AGENTS.md rule that out.
 * Each row here is a real, bounded count from Convex that ends in a place to
 * act on it, and a zero says "nothing waiting" rather than hiding the row.
 */
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
      suffix: "",
      note:
        orders && orders.unseen > 0
          ? `${orders.unseen} not yet opened`
          : undefined,
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
    </PageShell>
  )
}
