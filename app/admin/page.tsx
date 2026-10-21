"use client"

import {
  IconAlertTriangle,
  IconBrandWhatsapp,
  IconCalendarDue,
  IconCash,
  IconChevronRight,
  IconCircleCheck,
  IconCreditCard,
  IconInbox,
  IconLock,
  IconPackage,
  IconPhone,
  IconRefresh,
  IconTruckDelivery,
  IconUserCheck,
} from "@tabler/icons-react"
import { useQuery } from "convex/react"
import Link from "next/link"
import type { ComponentType, ReactNode } from "react"

import { convexConfigured } from "@/app/providers"
import { AddEnquiry } from "@/components/admin/add-enquiry"
import { ButtonAnchor } from "@/components/ui/button"
import { PageShell, StatePanel } from "@/components/ui/page-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { useMinute } from "@/hooks/use-minute"
import { useViewer } from "@/hooks/use-viewer"
import { brand, formatPhone } from "@/lib/brand"
import { cn } from "@/lib/utils"

/**
 * The admin home is a work queue, not a report. First what is waiting for
 * somebody, worst first; then who to call, with a reason for each; then a
 * quiet look at the week against the last one.
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

const rupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
const count = (n: number) => new Intl.NumberFormat("en-IN").format(n)
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

/** "3 h", "2 days": how long something has waited. */
function waited(since: number, now: number) {
  const hours = Math.max(0, (now - since) / 3_600_000)
  if (hours < 1) return "under an hour"
  if (hours < 48) return `${Math.round(hours)} h`
  return `${Math.round(hours / 24)} days`
}

const today = (now: number) =>
  new Date(now).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
  })

function Home() {
  const now = useMinute()
  const viewer = useViewer()
  const isStaff = viewer?.role === "staff" || viewer?.role === "owner"

  if (viewer === undefined) return null
  if (!isStaff)
    return (
      <PageShell density="working" title="Staff only.">
        <StatePanel
          icon={<IconLock stroke={1.75} />}
          title="This area is for ICT staff"
          description="If you are staff and seeing this, log in with the number ICT has on file for you."
          action={
            <ButtonAnchor href="/login?next=/admin" target="_self" size="md">
              Log in
            </ButtonAnchor>
          }
        />
      </PageShell>
    )

  return (
    <PageShell
      density="working"
      title={
        <>
          <span className="text-foreground">Today.</span>{" "}
          <span className="text-muted-foreground">{today(now)}</span>
        </>
      }
    >
      <div className="grid items-start gap-3 lg:grid-cols-5">
        <div className="grid gap-3 lg:col-span-3">
          <Queue now={now} />
          <ToCall now={now} />
        </div>
        <div className="grid gap-3 lg:col-span-2">
          <Week now={now} />
        </div>
      </div>
    </PageShell>
  )
}

function Card({
  title,
  action,
  children,
  className,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-[22px] bg-card p-5 shadow-[0_0_0_1px_var(--border)]",
        className
      )}
    >
      <header className="flex min-h-8 items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}

/* ------------------------------------------------------------- the queue */

type Need = {
  key: string
  href: string
  icon: ComponentType<{
    size?: number
    stroke?: number
    "aria-hidden"?: boolean
  }>
  label: string
  detail?: string
  urgent?: boolean
}

function Queue({ now }: { now: number }) {
  const data = useQuery(api.dashboard.today, { now })

  if (data === undefined)
    return (
      <Card title="Waiting for you" action={<AddEnquiry />}>
        <div aria-busy="true" className="grid gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 rounded-[14px] bg-secondary" />
          ))}
        </div>
      </Card>
    )
  if (data === null) return null

  const plus = (capped: boolean) => (capped ? "+" : "")
  const needs: Need[] = []
  if (data.syncFailedAt)
    needs.push({
      key: "sync",
      href: "/admin/courses",
      icon: IconRefresh,
      label: "The ClassPlus course sync failed",
      detail: `${waited(data.syncFailedAt, now)} ago · open Courses and sync now`,
      urgent: true,
    })
  if (data.refundsDue)
    needs.push({
      key: "refunds",
      href: "/admin/orders",
      icon: IconCash,
      label: `${count(data.refundsDue)} ${plural(data.refundsDue, "refund", "refunds")} to make in Razorpay`,
      detail: "Then mark the order refunded",
      urgent: true,
    })
  if (data.followUps.overdue)
    needs.push({
      key: "overdue",
      href: "/admin/leads?view=due",
      icon: IconCalendarDue,
      label: `${count(data.followUps.overdue)} overdue ${plural(data.followUps.overdue, "follow-up", "follow-ups")}`,
      detail: "Promised a call before today",
      urgent: true,
    })
  if (data.uncalled.count)
    needs.push({
      key: "uncalled",
      href: "/admin/leads?view=new",
      icon: IconInbox,
      label: `${count(data.uncalled.count)}${plus(data.uncalled.capped)} new ${plural(data.uncalled.count, "enquiry", "enquiries")} nobody has called`,
      detail: data.uncalled.oldestAt
        ? `Oldest waiting ${waited(data.uncalled.oldestAt, now)}`
        : undefined,
    })
  const dueToday = data.followUps.due - data.followUps.overdue
  if (dueToday > 0)
    needs.push({
      key: "due",
      href: "/admin/leads?view=due",
      icon: IconUserCheck,
      label: `${count(dueToday)}${plus(data.followUps.capped)} ${plural(dueToday, "follow-up", "follow-ups")} due today`,
    })
  if (data.toPack.count)
    needs.push({
      key: "pack",
      href: "/admin/orders",
      icon: IconPackage,
      label: `${count(data.toPack.count)}${plus(data.toPack.capped)} paid ${plural(data.toPack.count, "order", "orders")} to pack`,
      detail: data.toPack.oldestAt
        ? `Oldest placed ${waited(data.toPack.oldestAt, now)} ago`
        : undefined,
    })
  if (data.toShip)
    needs.push({
      key: "ship",
      href: "/admin/orders",
      icon: IconTruckDelivery,
      label: `${count(data.toShip)} packed ${plural(data.toShip, "parcel", "parcels")} to hand to the courier`,
    })
  if (data.collection.count)
    needs.push({
      key: "collect",
      href: "/admin/orders",
      icon: IconPackage,
      label: `${count(data.collection.count)} ${plural(data.collection.count, "set", "sets")} waiting to be collected`,
      detail: data.collection.waitingLong
        ? `${count(data.collection.waitingLong)} for more than 3 days: call them`
        : undefined,
      urgent: data.collection.waitingLong > 0,
    })
  if (data.unpaid)
    needs.push({
      key: "unpaid",
      href: "/admin/orders",
      icon: IconCreditCard,
      label: `${count(data.unpaid)} ${plural(data.unpaid, "order", "orders")} waiting for the buyer to pay`,
      detail: "Cancelled automatically after 3 days",
    })

  return (
    <Card title="Waiting for you" action={<AddEnquiry />}>
      {needs.length ? (
        <ul className="-mx-2 grid">
          {needs.map((need) => (
            <li key={need.key}>
              <Link
                href={need.href}
                className="group flex items-center gap-3 rounded-[14px] px-2 py-2.5 hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span
                  className={cn(
                    "grid size-9 flex-none place-items-center rounded-full",
                    need.urgent
                      ? "bg-[color-mix(in_oklch,var(--destructive)_12%,transparent)] text-destructive"
                      : "bg-secondary text-foreground"
                  )}
                >
                  <need.icon aria-hidden size={18} stroke={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-pretty">
                    {need.label}
                  </span>
                  {need.detail ? (
                    <span className="block text-xs text-muted-foreground">
                      {need.detail}
                    </span>
                  ) : null}
                </span>
                <IconChevronRight
                  aria-hidden
                  size={16}
                  stroke={2}
                  className="flex-none text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
          <IconCircleCheck aria-hidden size={18} stroke={1.75} />
          Nothing is waiting on anyone.
        </p>
      )}
    </Card>
  )
}

/* ----------------------------------------------------------- who to call */

const REASON = {
  overdue: { text: "overdue", tone: "font-medium text-destructive" },
  due: { text: "due today", tone: "" },
  new: { text: "new enquiry", tone: "" },
} as const

/** A first message staff can send as is, or edit before sending. */
function whatsappHref(phone: string, name: string, track?: string) {
  const first = name.trim().split(" ")[0]
  const text = `Hello${first ? ` ${first}` : ""}, this is ${brand.legalName}, North Lakhimpur.${
    track && track !== "Not sure yet" ? ` You asked about ${track}.` : ""
  } Is this a good time to talk?`
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`
}

function ToCall({ now }: { now: number }) {
  const data = useQuery(api.dashboard.today, { now })
  if (!data) return null
  return (
    <Card
      title="Who to call first"
      action={
        <Link
          href="/admin/leads"
          className="rounded-sm text-xs font-medium underline-offset-4 hover:underline"
        >
          All enquiries
        </Link>
      }
    >
      {data.toCall.length ? (
        <ul className="-mx-2 grid">
          {data.toCall.map((lead) => {
            const reason = REASON[lead.reason]
            return (
              <li
                key={lead.id}
                className="flex items-center gap-3 rounded-[14px] px-2 py-2 hover:bg-secondary/60"
              >
                <Link
                  href={`/admin/leads?lead=${lead.id}`}
                  className="min-w-0 flex-1 rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="block truncate font-medium">
                    {lead.name || formatPhone(lead.phone)}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {lead.track ?? "Exam not given"} ·{" "}
                    <span className={reason.tone}>{reason.text}</span>
                    {lead.reason === "new"
                      ? `, waiting ${waited(lead.at, now)}`
                      : ""}
                  </span>
                </Link>
                <a
                  href={`tel:${lead.phone}`}
                  aria-label={`Call ${lead.name || lead.phone}`}
                  className="grid size-10 flex-none place-items-center rounded-full bg-secondary active:scale-95"
                >
                  <IconPhone aria-hidden size={18} stroke={1.75} />
                </a>
                <a
                  href={whatsappHref(lead.phone, lead.name, lead.track)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`WhatsApp ${lead.name || lead.phone}`}
                  className="grid size-10 flex-none place-items-center rounded-full bg-secondary active:scale-95"
                >
                  <IconBrandWhatsapp aria-hidden size={18} stroke={1.75} />
                </a>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="py-2 text-sm text-muted-foreground">
          Nobody is waiting for a call.
        </p>
      )}
    </Card>
  )
}

/* -------------------------------------------------------------- the week */

/** "+4 on last week": plain numbers; a percentage of 2 is noise. */
function Change({ now, before }: { now: number; before: number }) {
  const diff = now - before
  return (
    <span className="text-xs text-muted-foreground">
      {diff === 0
        ? "same as last week"
        : `${diff > 0 ? "+" : "−"}${count(Math.abs(diff))} on last week`}
    </span>
  )
}

function ChangeMoney({ now, before }: { now: number; before: number }) {
  const diff = now - before
  return (
    <span className="text-xs text-muted-foreground">
      {diff === 0
        ? "same as last week"
        : `${diff > 0 ? "+" : "−"}${rupees(Math.abs(diff))} on last week`}
    </span>
  )
}

function Stat({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note?: ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-0">
      <span className="text-sm">{label}</span>
      <span className="grid justify-items-end">
        <span className="tnum font-display text-xl font-semibold tracking-[-0.02em]">
          {value}
        </span>
        {note}
      </span>
    </div>
  )
}

const SOURCE_NAMES: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  google: "Google",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  "walk in": "Walk-in",
  "phone call": "Phone call",
  referral: "Referral",
  other: "Other",
  "website, direct": "Website, direct",
}
const sourceName = (source: string) => SOURCE_NAMES[source] ?? source

const STAGES = [
  ["new", "New", "bg-primary/25"],
  ["contacted", "Contacted", "bg-primary/45"],
  ["interested", "Interested", "bg-primary/70"],
  ["enrolled", "Enrolled", "bg-primary"],
  ["lost", "Lost", "bg-muted-foreground/30"],
] as const

function Week({ now }: { now: number }) {
  const data = useQuery(api.dashboard.week, { now })

  if (data === undefined)
    return (
      <div aria-busy="true" className="grid gap-3">
        <Skeleton className="h-64 rounded-[22px] bg-secondary" />
        <Skeleton className="h-48 rounded-[22px] bg-secondary" />
      </div>
    )
  if (data === null) return null

  const people = STAGES.reduce((n, [key]) => n + data.stages[key], 0)
  const firstCall = data.firstCall.medianHours

  return (
    <>
      <Card title="This week">
        <div className="grid">
          <Stat
            label="Enquiries"
            value={`${count(data.enquiries.thisWeek)}${data.enquiries.capped ? "+" : ""}`}
            note={
              <Change
                now={data.enquiries.thisWeek}
                before={data.enquiries.lastWeek}
              />
            }
          />
          <Stat
            label="First call after enquiring"
            value={
              firstCall === null
                ? "–"
                : firstCall < 1
                  ? "< 1 h"
                  : firstCall < 48
                    ? `${Math.round(firstCall)} h`
                    : `${Math.round(firstCall / 24)} days`
            }
            note={
              <span className="text-xs text-muted-foreground">
                {data.firstCall.waiting
                  ? `typical · ${count(data.firstCall.waiting)} not called yet`
                  : "typical wait"}
              </span>
            }
          />
          <Stat
            label="Enrolled"
            value={count(data.enrolled.thisWeek)}
            note={
              <Change
                now={data.enrolled.thisWeek}
                before={data.enrolled.lastWeek}
              />
            }
          />
          {data.sales ? (
            <Stat
              label={`Book sales · ${count(data.sales.orders)} ${plural(data.sales.orders, "order", "orders")}`}
              value={rupees(data.sales.thisWeekPaise)}
              note={
                <ChangeMoney
                  now={data.sales.thisWeekPaise}
                  before={data.sales.lastWeekPaise}
                />
              }
            />
          ) : null}
          <Stat
            label="WhatsApp and call taps"
            value={count(data.taps.whatsapp + data.taps.call)}
            note={
              <span className="text-xs text-muted-foreground">
                WhatsApp {count(data.taps.whatsapp)} · calls{" "}
                {count(data.taps.call)}
              </span>
            }
          />
        </div>
      </Card>

      <Card title="Last 30 days">
        {people ? (
          <>
            <div>
              <p className="text-sm">
                <span className="tnum font-semibold">{count(people)}</span>{" "}
                {plural(people, "person", "people")} enquired. Where they are
                now:
              </p>
              <div
                className="mbs-2 flex h-2.5 overflow-clip rounded-full bg-secondary"
                aria-hidden
              >
                {STAGES.map(([key, , tone]) =>
                  data.stages[key] ? (
                    <span
                      key={key}
                      className={tone}
                      style={{ width: `${(data.stages[key] / people) * 100}%` }}
                    />
                  ) : null
                )}
              </div>
              <ul className="mbs-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {STAGES.map(([key, label, tone]) => (
                  <li key={key} className="inline-flex items-center gap-1.5">
                    <span className={cn("size-2 rounded-full", tone)} />
                    {label}{" "}
                    <span className="tnum">{count(data.stages[key])}</span>
                  </li>
                ))}
              </ul>
            </div>

            <table className="w-full text-sm">
              <caption className="sr-only">Where enquiries came from</caption>
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pbe-1.5 font-medium">Came from</th>
                  <th className="pbe-1.5 text-right font-medium">People</th>
                  <th className="pbe-1.5 text-right font-medium">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {data.sources.map((row) => (
                  <tr key={row.source} className="border-t border-border">
                    <td className="py-1.5 pe-2">{sourceName(row.source)}</td>
                    <td className="tnum py-1.5 text-right">
                      {count(row.people)}
                    </td>
                    <td className="tnum py-1.5 text-right">
                      {count(row.enrolled)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.pages.length ? (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground">
                  Pages people enquired from
                </h3>
                <ol className="mbs-1.5 grid gap-1 text-sm">
                  {data.pages.map((row) => (
                    <li key={row.page} className="flex justify-between gap-3">
                      <a
                        href={row.page}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 truncate underline-offset-4 hover:underline"
                      >
                        {row.page}
                      </a>
                      <span className="tnum text-muted-foreground">
                        {count(row.people)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            {data.capped ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconAlertTriangle aria-hidden size={14} stroke={1.75} />
                Busy month: the latest 600 enquiries are counted.
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No enquiries in the last 30 days yet.
          </p>
        )}
      </Card>
    </>
  )
}
