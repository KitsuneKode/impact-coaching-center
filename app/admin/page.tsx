"use client"

import {
  IconAlertTriangle,
  IconArrowDownRight,
  IconArrowRight,
  IconArrowUpRight,
  IconBrandWhatsapp,
  IconCircleCheck,
  IconLock,
  IconPhone,
  IconRefresh,
} from "@tabler/icons-react"
import { useQuery } from "convex/react"
import Link from "next/link"
import type { ReactNode } from "react"

import { convexConfigured } from "@/app/providers"
import { AddEnquiry } from "@/components/admin/add-enquiry"
import { EnquiryTrend } from "@/components/admin/enquiry-trend"
import { ButtonAnchor } from "@/components/ui/button"
import { PageShell, StatePanel } from "@/components/ui/page-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { QUARTER_HOUR, useClock, useMinute } from "@/hooks/use-minute"
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
  // Labels tick by the minute; the queries move only every quarter hour,
  // which their day-sized windows allow, rather than re-running each minute.
  const now = useMinute()
  const asOf = useClock(QUARTER_HOUR)
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
      {/* Work first: what is waiting and who to call sit side by side; the
          numbers that say how the week went follow at full width. */}
      <div className="grid items-start gap-3 xl:grid-cols-12">
        <Queue now={now} asOf={asOf} />
        <ToCall now={now} asOf={asOf} />
        <Week asOf={asOf} />
      </div>
    </PageShell>
  )
}

function Card({
  title,
  aside,
  action,
  children,
  className,
}: {
  title: string
  /** A quiet count or note beside the title. */
  aside?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-5 rounded-card bg-card p-5 shadow-frame md:p-6",
        className
      )}
    >
      <header className="flex min-h-9 flex-wrap items-center justify-between gap-3">
        <h2 className="flex flex-wrap items-baseline gap-x-2 text-base font-semibold">
          <span className="whitespace-nowrap">{title}</span>
          {aside ? (
            <span className="tnum text-sm font-normal tracking-normal whitespace-nowrap text-muted-foreground">
              {aside}
            </span>
          ) : null}
        </h2>
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
  /** The figure that leads the tile; a tile without one says it in words. */
  count?: string
  label: string
  detail?: string
  urgent?: boolean
}

const QUEUE_SPAN = "xl:col-span-7"

function Queue({ now, asOf }: { now: number; asOf: number }) {
  const data = useQuery(api.dashboard.today, { now: asOf })

  if (data === undefined)
    return (
      <Card
        title="Waiting for you"
        action={<AddEnquiry />}
        className={QUEUE_SPAN}
      >
        <div
          aria-busy="true"
          className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-2"
        >
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-control" />
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
      label: "The ClassPlus course sync failed",
      detail: `${waited(data.syncFailedAt, now)} ago · open Courses and sync now`,
      urgent: true,
    })
  if (data.refundsDue)
    needs.push({
      key: "refunds",
      href: "/admin/orders?tab=refund_due",
      count: count(data.refundsDue),
      label: `${plural(data.refundsDue, "refund", "refunds")} to make in Razorpay`,
      detail: "The order closes itself once Razorpay refunds it",
      urgent: true,
    })
  if (data.followUps.overdue)
    needs.push({
      key: "overdue",
      href: "/admin/leads?view=due",
      count: count(data.followUps.overdue),
      label: `overdue ${plural(data.followUps.overdue, "follow-up", "follow-ups")}`,
      detail: "Promised a call before today",
      urgent: true,
    })
  if (data.uncalled.count)
    needs.push({
      key: "uncalled",
      href: "/admin/leads?view=new",
      count: `${count(data.uncalled.count)}${plus(data.uncalled.capped)}`,
      label: `new ${plural(data.uncalled.count, "enquiry", "enquiries")} nobody has called`,
      detail: data.uncalled.oldestAt
        ? `Oldest waiting ${waited(data.uncalled.oldestAt, now)}`
        : undefined,
    })
  const dueToday = data.followUps.due - data.followUps.overdue
  if (dueToday > 0)
    needs.push({
      key: "due",
      href: "/admin/leads?view=due",
      count: `${count(dueToday)}${plus(data.followUps.capped)}`,
      label: `${plural(dueToday, "follow-up", "follow-ups")} due today`,
    })
  if (data.toSend.count)
    needs.push({
      key: "send",
      href: "/admin/orders?tab=to_send",
      count: `${count(data.toSend.count)}${plus(data.toSend.capped)}`,
      label: `paid ${plural(data.toSend.count, "order", "orders")} to send`,
      detail: data.toSend.oldestAt
        ? `Oldest paid ${waited(data.toSend.oldestAt, now)} ago`
        : undefined,
    })
  if (data.collection.count)
    needs.push({
      key: "collect",
      href: "/admin/orders?tab=to_collect",
      count: count(data.collection.count),
      label: `${plural(data.collection.count, "set", "sets")} waiting to be collected`,
      detail: data.collection.waitingLong
        ? `${count(data.collection.waitingLong)} for more than 3 days: call them`
        : undefined,
      urgent: data.collection.waitingLong > 0,
    })

  const urgent = needs.filter((need) => need.urgent).length

  return (
    <Card
      title="Waiting for you"
      aside={urgent ? `${count(urgent)} urgent` : undefined}
      action={<AddEnquiry />}
      className={QUEUE_SPAN}
    >
      {needs.length ? (
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-2">
          {needs.map((need) => (
            <li
              key={need.key}
              className={need.count ? undefined : "col-span-full"}
            >
              <Link
                href={need.href}
                data-urgent={need.urgent || undefined}
                className="group relative flex h-full flex-col gap-1 rounded-control bg-secondary/55 p-3.5 transition-[background-color] duration-150 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring sm:p-4"
              >
                {need.count ? (
                  <span
                    className={cn(
                      "tnum text-3xl leading-none font-semibold tracking-tight",
                      need.urgent ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {need.count}
                  </span>
                ) : (
                  <IconRefresh
                    aria-hidden
                    size={24}
                    stroke={1.75}
                    className="text-destructive"
                  />
                )}
                <span className="mbs-1 text-sm leading-snug font-medium text-pretty">
                  {need.label}
                </span>
                {need.detail ? (
                  <span className="text-xs leading-snug text-pretty text-muted-foreground">
                    {need.detail}
                  </span>
                ) : null}
                <IconArrowRight
                  aria-hidden
                  size={16}
                  stroke={2}
                  className="absolute end-3.5 top-3.5 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 sm:end-4 sm:top-4"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 rounded-control bg-secondary/55 p-4 text-sm text-muted-foreground">
          <IconCircleCheck aria-hidden size={18} stroke={1.75} />
          Nothing is waiting on anyone.
        </p>
      )}
    </Card>
  )
}

/* ----------------------------------------------------------- who to call */

/* Colour only where it means something: a dot beside plain text. */
const REASON = {
  overdue: { text: "Overdue", dot: "bg-destructive" },
  due: { text: "Due today", dot: "bg-primary" },
  new: { text: "New", dot: "bg-muted-foreground/50" },
} as const

/** A first message staff can send as is, or edit before sending. */
function whatsappHref(phone: string, name: string, track?: string) {
  const first = name.trim().split(" ")[0]
  const text = `Hello${first ? ` ${first}` : ""}, this is ${brand.legalName}, North Lakhimpur.${
    track && track !== "Not sure yet" ? ` You asked about ${track}.` : ""
  } Is this a good time to talk?`
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`
}

const CALL_SPAN = "xl:col-span-5"

function ToCall({ now, asOf }: { now: number; asOf: number }) {
  const data = useQuery(api.dashboard.today, { now: asOf })
  if (data === undefined)
    return (
      <Card title="Who to call first" className={CALL_SPAN}>
        <div aria-busy="true" className="grid gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 rounded-control" />
          ))}
        </div>
      </Card>
    )
  if (!data) return null
  return (
    <Card
      title="Who to call first"
      aside={
        data.toCall.length ? `${count(data.toCall.length)} people` : undefined
      }
      action={
        <Link
          href="/admin/leads"
          className="inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-sm font-medium hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
        >
          All
          <IconArrowRight aria-hidden size={14} stroke={2} />
        </Link>
      }
      className={CALL_SPAN}
    >
      {data.toCall.length ? (
        // In order: the sheet is worked top down.
        <ol className="-mx-2 grid">
          {data.toCall.map((lead, i) => {
            const reason = REASON[lead.reason]
            return (
              <li
                key={lead.id}
                className="flex items-center gap-3 rounded-control px-2 py-2 hover:bg-secondary/60"
              >
                <span
                  aria-hidden
                  className="tnum w-5 flex-none text-end text-sm font-medium text-muted-foreground"
                >
                  {i + 1}
                </span>
                <Link
                  href={`/admin/leads?lead=${lead.id}`}
                  className="grid min-w-0 flex-1 gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="truncate font-medium">
                    {lead.name || formatPhone(lead.phone)}
                  </span>
                  <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex flex-none items-center gap-1.5 font-medium text-foreground">
                      <span
                        aria-hidden
                        className={cn("size-1.5 rounded-full", reason.dot)}
                      />
                      {reason.text}
                      {lead.reason === "new" ? `, ${waited(lead.at, now)}` : ""}
                    </span>
                    <span className="truncate">
                      {lead.track ?? "Exam not given"}
                    </span>
                  </span>
                </Link>
                <a
                  href={`tel:${lead.phone}`}
                  aria-label={`Call ${lead.name || lead.phone}`}
                  className="grid size-10 flex-none place-items-center rounded-full bg-secondary transition-transform duration-150 active:scale-[0.96]"
                >
                  <IconPhone aria-hidden size={18} stroke={1.75} />
                </a>
                <a
                  href={whatsappHref(lead.phone, lead.name, lead.track)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`WhatsApp ${lead.name || lead.phone}`}
                  className="grid size-10 flex-none place-items-center rounded-full bg-secondary transition-transform duration-150 active:scale-[0.96]"
                >
                  <IconBrandWhatsapp aria-hidden size={18} stroke={1.75} />
                </a>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="flex items-center gap-2 rounded-control bg-secondary/55 p-4 text-sm text-muted-foreground">
          <IconCircleCheck aria-hidden size={18} stroke={1.75} />
          Nobody is waiting for a call.
        </p>
      )}
    </Card>
  )
}

/* -------------------------------------------------------------- the week */

/** "+4 on last week": plain numbers; a percentage of 2 is noise. */
function Change({
  now,
  before,
  format = count,
}: {
  now: number
  before: number
  format?: (n: number) => string
}) {
  const diff = now - before
  if (diff === 0)
    return (
      <span className="text-xs text-muted-foreground">same as last week</span>
    )
  const Arrow = diff > 0 ? IconArrowUpRight : IconArrowDownRight
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Arrow aria-hidden size={14} stroke={2} className="text-foreground" />
      <span>
        <span className="tnum font-medium text-foreground">
          {diff > 0 ? "+" : "−"}
          {format(Math.abs(diff))}
        </span>{" "}
        on last week
      </span>
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
    <div className="grid content-start gap-1.5 bg-card p-4 md:p-5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="tnum text-3xl leading-none font-semibold tracking-tight">
        {value}
      </span>
      {note}
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
  chatgpt: "ChatGPT",
  direct: "Direct or typed",
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

const percent = (part: number, whole: number) =>
  whole ? `${Math.round((part / whole) * 100)}%` : "0%"

function firstCallText(hours: number | null) {
  if (hours === null) return "–"
  if (hours < 1) return "< 1 h"
  if (hours < 48) return `${Math.round(hours)} h`
  return `${Math.round(hours / 24)} days`
}

function Week({ asOf }: { asOf: number }) {
  const data = useQuery(api.dashboard.week, { now: asOf })

  if (data === undefined)
    return (
      <div aria-busy="true" className="grid gap-3 xl:col-span-12">
        <Skeleton className="h-36 rounded-card" />
        <Skeleton className="h-80 rounded-card" />
      </div>
    )
  if (data === null) return null

  const people = STAGES.reduce((n, [key]) => n + data.stages[key], 0)
  const topSource = Math.max(1, ...data.sources.map((row) => row.people))
  const topPage = Math.max(1, ...data.pages.map((row) => row.people))
  const topVisits = Math.max(1, ...data.visits.map((row) => row.visits))

  return (
    <>
      <Card title="This week" className="xl:col-span-12">
        {/* Hairlines between the figures come from the gap over a border
            fill, so they meet cleanly however the grid wraps. */}
        <div className="grid grid-cols-2 gap-px overflow-clip rounded-control bg-border shadow-[0_0_0_1px_var(--border)] lg:grid-cols-5 max-lg:[&>:last-child:nth-child(odd)]:col-span-2">
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
            value={firstCallText(data.firstCall.medianHours)}
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
          <Stat
            label={
              data.sales
                ? `Book sales · ${count(data.sales.orders)} ${plural(data.sales.orders, "order", "orders")}`
                : "Book sales"
            }
            value={data.sales ? rupees(data.sales.thisWeekPaise) : rupees(0)}
            note={
              data.sales ? (
                <Change
                  now={data.sales.thisWeekPaise}
                  before={data.sales.lastWeekPaise}
                  format={rupees}
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  no orders yet
                </span>
              )
            }
          />
          <Stat
            label="WhatsApp and call taps"
            value={count(data.taps.whatsapp + data.taps.call)}
            note={
              <span className="tnum text-xs text-muted-foreground">
                WhatsApp {count(data.taps.whatsapp)} · calls{" "}
                {count(data.taps.call)}
              </span>
            }
          />
        </div>
      </Card>

      <Card
        title="Last 30 days"
        aside={
          people
            ? `${count(people)} ${plural(people, "person", "people")} enquired`
            : undefined
        }
        className="xl:col-span-12"
      >
        {people ? (
          <div className="grid gap-8">
            <EnquiryTrend daily={data.daily} asOf={asOf} />
            <div className="grid gap-3">
              <h3 className="text-sm font-medium">Where they are now</h3>
              <div
                className="flex h-3 gap-0.5 overflow-clip rounded-full"
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
              <ul className="grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-5">
                {STAGES.map(([key, label, tone]) => (
                  <li key={key} className="grid gap-1">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={cn("size-2 rounded-full", tone)} />
                      {label}
                    </span>
                    <span className="flex items-baseline gap-1.5">
                      <span className="tnum text-xl leading-none font-semibold">
                        {count(data.stages[key])}
                      </span>
                      <span className="tnum text-xs text-muted-foreground">
                        {percent(data.stages[key], people)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
              <div className="grid content-start gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-medium">Where they came from</h3>
                  <span className="inline-flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-primary/25" />
                      Enquired
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-primary" />
                      Enrolled
                    </span>
                  </span>
                </div>
                <table className="w-full text-sm">
                  <caption className="sr-only">
                    Where enquiries came from, and how many enrolled
                  </caption>
                  <thead className="sr-only">
                    <tr>
                      <th>Came from</th>
                      <th>People</th>
                      <th>Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sources.map((row) => (
                      <tr key={row.source}>
                        <th
                          scope="row"
                          className="w-full py-1.5 pe-4 text-start font-normal"
                        >
                          {sourceName(row.source)}
                          <span
                            aria-hidden
                            className="relative mbs-1.5 block h-1.5 overflow-clip rounded-full"
                            style={{
                              width: `${(row.people / topSource) * 100}%`,
                            }}
                          >
                            <span className="absolute inset-0 bg-primary/25" />
                            <span
                              className="absolute inset-y-0 start-0 bg-primary"
                              style={{
                                width: `${row.people ? (row.enrolled / row.people) * 100 : 0}%`,
                              }}
                            />
                          </span>
                        </th>
                        <td className="tnum py-1.5 pe-4 text-end align-top font-medium">
                          {count(row.people)}
                        </td>
                        <td className="tnum py-1.5 text-end align-top whitespace-nowrap text-muted-foreground">
                          {count(row.enrolled)} enrolled
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.pages.length ? (
                <div className="grid content-start gap-3">
                  <h3 className="text-sm font-medium">
                    Pages people enquired from
                  </h3>
                  <ol className="grid gap-1">
                    {data.pages.map((row) => (
                      <li
                        key={row.page}
                        className="grid gap-1.5 py-1.5 text-sm"
                      >
                        <span className="flex justify-between gap-3">
                          <a
                            href={row.page}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 truncate underline-offset-4 hover:underline"
                          >
                            {row.page === "/" ? "Home page" : row.page}
                          </a>
                          <span className="tnum font-medium">
                            {count(row.people)}
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className="block h-1.5 rounded-full bg-primary/25"
                          style={{ width: `${(row.people / topPage) * 100}%` }}
                        />
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>

            {data.visits.length ? (
              <div className="grid content-start gap-3">
                <h3 className="text-sm font-medium">
                  Website visits, and how many enquired
                </h3>
                <table className="w-full text-sm">
                  <caption className="sr-only">
                    Website visits in the last 30 days by where they came from,
                    with the enquiries each source brought
                  </caption>
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="pbe-1 text-start font-normal">From</th>
                      <th className="pe-4 pbe-1 text-end font-normal">
                        Visits
                      </th>
                      <th className="pe-4 pbe-1 text-end font-normal">
                        Enquired
                      </th>
                      <th className="pbe-1 text-end font-normal">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.visits.map((row) => (
                      <tr key={row.source}>
                        <th
                          scope="row"
                          className="w-full py-1.5 pe-4 text-start font-normal"
                        >
                          {sourceName(row.source)}
                          <span
                            aria-hidden
                            className="mbs-1.5 block h-1.5 rounded-full bg-primary/25"
                            style={{
                              width: `${(row.visits / topVisits) * 100}%`,
                            }}
                          />
                        </th>
                        <td className="tnum py-1.5 pe-4 text-end align-top font-medium">
                          {count(row.visits)}
                        </td>
                        <td className="tnum py-1.5 pe-4 text-end align-top">
                          {count(row.enquired)}
                        </td>
                        <td className="tnum py-1.5 text-end align-top whitespace-nowrap text-muted-foreground">
                          {/* Visits are counted from launch; older
                              enquiries can outnumber them at first. */}
                          {percent(
                            Math.min(row.enquired, row.visits),
                            row.visits
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-muted-foreground">
                  One visit per browser session. Tag links you share with
                  ?utm_source=whatsapp (or facebook, instagram, youtube) so they
                  count under the right name.
                </p>
              </div>
            ) : null}

            {data.capped ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconAlertTriangle aria-hidden size={14} stroke={1.75} />
                Busy month: the latest 600 enquiries are counted.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No enquiries in the last 30 days yet.
          </p>
        )}
      </Card>
    </>
  )
}
