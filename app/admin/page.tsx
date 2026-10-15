"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useMinute } from "@/hooks/use-minute"
import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconCalendarDue,
  IconInbox,
  IconLock,
  IconPackage,
  IconPhone,
} from "@tabler/icons-react"
import Link from "next/link"
import { useQuery } from "convex/react"
import type { ReactNode } from "react"

import { convexConfigured } from "@/app/providers"
import { Sparkline } from "@/components/admin/sparkline"
import { ButtonAnchor } from "@/components/ui/button"
import { PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"
import { formatPhone } from "@/lib/brand"
import { cn } from "@/lib/utils"

/**
 * The admin home. First what needs somebody now, then whether enquiries
 * and sales are rising, then the lead funnel and where enrolments come
 * from, then who to call. One screen on a laptop, a scroll on a phone.
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

const ago = (at: number, now: number) => {
  const minutes = Math.max(0, Math.round((now - at) / 60_000))
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  return hours < 48 ? `${hours} h ago` : `${Math.round(hours / 24)} days ago`
}

function greeting(now: number) {
  const hour = Number(
    new Date(now).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    })
  )
  return hour < 12
    ? "Good morning"
    : hour < 17
      ? "Good afternoon"
      : "Good evening"
}

function Home() {
  const now = useMinute()
  const viewer = useQuery(api.auth.getCurrentPerson)
  const leads = useQuery(api.leads.leadCounts, { now })
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
            // A plain link: a full sign-in page, never the public site's
            // pop-up over the admin with the admin loading behind it.
            <ButtonAnchor href="/login?next=/admin" target="_self" size="md">
              Log in
            </ButtonAnchor>
          }
        />
      </PageShell>
    )

  const first = viewer.name.trim().split(" ")[0]
  const plus = leads?.capped ? "+" : ""

  return (
    <PageShell
      density="working"
      title={
        <>
          <span className="text-foreground">Today.</span>{" "}
          <span className="text-muted-foreground">
            {greeting(now)}
            {first ? `, ${first}` : ""}.
          </span>
        </>
      }
    >
      <h2 className="sr-only">Needs you</h2>
      <ul className="grid gap-3 md:grid-cols-3">
        <NeedTile
          href="/admin/leads"
          icon={IconInbox}
          tone="blue"
          value={leads?.fresh}
          suffix={plus}
          label={(n) =>
            plural(
              n,
              "new enquiry nobody has called",
              "new enquiries nobody has called"
            )
          }
        />
        <NeedTile
          href="/admin/leads"
          icon={IconCalendarDue}
          tone="amber"
          value={leads?.due}
          suffix={plus}
          label={(n) =>
            plural(n, "follow-up due today", "follow-ups due today")
          }
        />
        <NeedTile
          href="/admin/orders"
          icon={IconPackage}
          tone="ink"
          value={orders?.open}
          suffix={orders?.capped ? "+" : ""}
          label={(n) => plural(n, "order to fulfil", "orders to fulfil")}
          note={
            [
              orders && orders.unseen > 0
                ? `${orders.unseen}${orders.capped ? "+" : ""} not opened`
                : null,
              orders && orders.unpaid > 0
                ? `${orders.unpaid} awaiting payment`
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || undefined
          }
        />
      </ul>

      <Insights now={now} />
    </PageShell>
  )
}

const TONES = {
  blue: "bg-primary text-primary-foreground",
  amber: "bg-highlight text-foreground",
  ink: "bg-foreground text-background",
} as const

/** One thing that needs somebody, as a tile you can act on. */
function NeedTile({
  href,
  icon: Icon,
  tone,
  value,
  suffix,
  label,
  note,
}: {
  href: string
  icon: typeof IconInbox
  tone: keyof typeof TONES
  value: number | undefined
  suffix: string
  label: (n: number) => string
  note?: string
}) {
  const n = value ?? 0
  const calm = value !== undefined && n === 0
  return (
    <li>
      <Link
        href={href}
        data-need-tile
        className={cn(
          "group flex h-full min-h-28 flex-col justify-between gap-3 rounded-[22px] p-5 md:min-h-36",
          calm
            ? "bg-card text-foreground shadow-[0_0_0_1px_var(--border)]"
            : TONES[tone]
        )}
      >
        <span className="flex items-start justify-between gap-3">
          <Icon aria-hidden stroke={1.75} className="size-5 opacity-80" />
          <IconArrowRight
            aria-hidden
            stroke={2}
            className="size-4 opacity-70 transition-transform group-hover:translate-x-0.5"
          />
        </span>
        <span>
          <span className="tnum block font-display text-4xl leading-none font-semibold tracking-[-0.03em]">
            {value === undefined ? "–" : `${count(n)}${n > 0 ? suffix : ""}`}
          </span>
          <span className="mbs-2 block text-sm font-medium text-pretty">
            {label(n)}
          </span>
          {note ? (
            <span className="mbs-0.5 block text-xs opacity-75">{note}</span>
          ) : null}
        </span>
      </Link>
    </li>
  )
}

function Delta({ now, before }: { now: number; before: number }) {
  if (before === 0)
    return now > 0 ? (
      <span className="text-xs text-muted-foreground">new this week</span>
    ) : null
  const change = Math.round(((now - before) / before) * 100)
  const up = change >= 0
  return (
    <span
      className={cn(
        "tnum rounded-full px-2 py-0.5 text-xs font-medium",
        up
          ? "bg-[color-mix(in_oklch,oklch(62%_0.15_150)_14%,transparent)] text-[oklch(42%_0.12_150)]"
          : "bg-[color-mix(in_oklch,var(--destructive)_12%,transparent)] text-destructive"
      )}
    >
      {up ? "+" : "−"}
      {Math.abs(change)}% vs last week
    </span>
  )
}

function Panel({
  title,
  href,
  action,
  children,
  className,
}: {
  title: string
  href?: string
  action?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-[22px] bg-card p-5 shadow-[0_0_0_1px_var(--border)]",
        className
      )}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {href ? (
          <Link
            href={href}
            className="rounded-sm text-xs font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {action ?? "Open"}
            <span className="sr-only"> {title}</span>
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  )
}

/** Sources as ICT would say them; anything else keeps its own spelling. */
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
const sourceName = (source: string) =>
  SOURCE_NAMES[source.toLowerCase()] ?? source

const STAGES = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["interested", "Interested"],
  ["enrolled", "Enrolled"],
] as const

function Insights({ now }: { now: number }) {
  const insights = useQuery(api.dashboard.leadInsights, { now })
  const sales = useQuery(api.dashboard.salesTrend, { now })
  const week = useQuery(api.dashboard.weekly, { now })

  if (!insights || !week)
    return (
      <div
        aria-busy="true"
        className="mbs-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
      >
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-[22px] bg-secondary" />
        ))}
      </div>
    )

  const total =
    insights.funnel.new +
    insights.funnel.contacted +
    insights.funnel.interested +
    insights.funnel.enrolled +
    insights.funnel.lost
  const decided = insights.funnel.enrolled + insights.funnel.lost
  const rate = decided
    ? Math.round((insights.funnel.enrolled / decided) * 100)
    : null
  const maxSource = Math.max(1, ...insights.sources.map((s) => s.people))

  return (
    <div className="mbs-8 grid gap-3">
      <h2 className="sr-only">This week and this month</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="Enquiries · 7 days" href="/admin/leads">
          <div className="flex items-end justify-between gap-3">
            <span className="tnum font-display text-3xl font-semibold tracking-[-0.03em]">
              {count(insights.thisWeek)}
            </span>
            <Sparkline
              values={insights.days.map((d) => d.count)}
              label={`Enquiries per day for two weeks, ${insights.days.at(-1)?.count ?? 0} today`}
              className="h-9 w-28 text-primary"
            />
          </div>
          <Delta now={insights.thisWeek} before={insights.lastWeek} />
        </Panel>

        {sales ? (
          <Panel title="Paid · 7 days" href="/admin/orders">
            <div className="flex items-end justify-between gap-3">
              <span className="tnum font-display text-3xl font-semibold tracking-[-0.03em]">
                {rupees(sales.thisWeek)}
              </span>
              <Sparkline
                values={sales.days.map((d) => d.paise)}
                label="Money paid per day for two weeks"
                className="h-9 w-28 text-[oklch(55%_0.13_150)]"
              />
            </div>
            <Delta now={sales.thisWeek} before={sales.lastWeek} />
          </Panel>
        ) : null}

        <Panel title="Enrolled · 30 days" href="/admin/leads">
          <span className="tnum font-display text-3xl font-semibold tracking-[-0.03em]">
            {count(insights.funnel.enrolled)}
          </span>
          <span className="text-xs text-muted-foreground">
            {rate === null
              ? "No one decided yet"
              : `${rate}% of those who decided joined · ${insights.funnel.lost} lost`}
          </span>
        </Panel>

        <Panel title="WhatsApp and calls · 7 days">
          <span className="tnum font-display text-3xl font-semibold tracking-[-0.03em]">
            {count(week.taps.whatsapp + week.taps.call)}
          </span>
          <span className="tnum text-xs text-muted-foreground">
            WhatsApp {week.taps.whatsapp} · calls {week.taps.call}
            {week.taps.topPages[0]
              ? ` · most from ${week.taps.topPages[0].page}`
              : ""}
          </span>
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <Panel
          title="Who to call"
          href="/admin/leads"
          action="Follow-ups"
          className="lg:col-span-3"
        >
          {insights.followUps.length ? (
            <ul className="-mx-2 grid">
              {insights.followUps.map((lead) => {
                const overdue = lead.due < now - 12 * 60 * 60 * 1000
                return (
                  <li
                    key={lead.id}
                    className="flex items-center gap-3 rounded-[14px] px-2 py-2 hover:bg-secondary/60"
                  >
                    <Link
                      href={`/admin/leads?lead=${lead.id}`}
                      className="min-w-0 flex-1 rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="block font-medium text-pretty">
                        {lead.name || formatPhone(lead.phone)}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {lead.track ?? "Exam not given"} ·{" "}
                        <span
                          className={
                            overdue ? "font-medium text-destructive" : undefined
                          }
                        >
                          {overdue ? "overdue" : "due today"}
                        </span>
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
                      href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
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
            <p className="text-sm text-muted-foreground">
              Nobody is due a call today.
            </p>
          )}
        </Panel>

        <Panel title="Lead funnel, last 30 days" className="lg:col-span-2">
          <ol className="grid gap-2.5">
            {STAGES.map(([key, label]) => {
              const n = insights.funnel[key]
              const share = total ? n / total : 0
              return (
                <li key={key} className="grid gap-1">
                  <span className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="tnum text-muted-foreground">
                      {count(n)}
                    </span>
                  </span>
                  <span className="h-2 overflow-clip rounded-full bg-secondary">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(share * 100, n ? 3 : 0)}%` }}
                    />
                  </span>
                </li>
              )
            })}
          </ol>
          <p className="text-xs text-muted-foreground">
            {count(total)} {plural(total, "person", "people")} enquired
            {insights.capped ? " (the latest 800 counted)" : ""} ·{" "}
            {count(insights.funnel.lost)} lost
          </p>
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <Panel
          title="Where people come from, last 30 days"
          className="lg:col-span-3"
        >
          {insights.sources.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pbe-2 font-medium">Source</th>
                  <th className="pbe-2 text-right font-medium">People</th>
                  <th className="pbe-2 text-right font-medium">Enrolled</th>
                  <th className="hidden w-1/3 ps-3 pbe-2 font-medium sm:table-cell">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {insights.sources.map((row) => (
                  <tr key={row.source} className="border-t border-border">
                    <td className="py-2 pe-2">{sourceName(row.source)}</td>
                    <td className="tnum py-2 text-right">
                      {count(row.people)}
                    </td>
                    <td className="tnum py-2 text-right">
                      {count(row.enrolled)}
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        ({Math.round((row.enrolled / row.people) * 100)}%)
                      </span>
                    </td>
                    <td className="hidden py-2 ps-3 sm:table-cell">
                      <span className="sr-only">
                        {Math.round((row.people / maxSource) * 100)}% of the
                        largest source
                      </span>
                      <span
                        aria-hidden
                        className="block h-1.5 overflow-clip rounded-full bg-secondary"
                      >
                        <span
                          className="block h-full rounded-full bg-primary/70"
                          style={{
                            width: `${(row.people / maxSource) * 100}%`,
                          }}
                        />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">No enquiries yet.</p>
          )}
        </Panel>

        <Panel title="Pages that bring enquiries" className="lg:col-span-2">
          {insights.pages.length ? (
            <ol className="grid gap-1.5 text-sm">
              {insights.pages.map((row) => (
                <li key={row.page} className="flex justify-between gap-3">
                  <a
                    href={row.page}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 truncate underline-offset-4 hover:underline"
                    title={row.page}
                  >
                    {row.page}
                  </a>
                  <span className="tnum text-muted-foreground">
                    {count(row.people)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">
              Website enquiries will show the page they came from.
            </p>
          )}
        </Panel>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {week.topSets ? (
          <Panel title="Best-selling sets" href="/admin/books" action="Shop">
            {week.topSets.length ? (
              <ol className="grid gap-1 text-sm">
                {week.topSets.map((set) => (
                  <li key={set.slug} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">{set.title}</span>
                    <span className="tnum text-muted-foreground">
                      {count(set.sold)} sold
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No sets sold yet.</p>
            )}
          </Panel>
        ) : null}
        {week.livePromotions !== undefined ? (
          <Panel
            title="Promotions live now"
            href="/admin/promotions"
            action="Promotions"
          >
            <span className="tnum font-display text-3xl font-semibold">
              {week.livePromotions}
            </span>
          </Panel>
        ) : null}
        {week.lastSync ? (
          <Panel title="ClassPlus sync" href="/admin/courses" action="Courses">
            <span
              className={
                week.lastSync.status === "ok"
                  ? "text-sm font-medium"
                  : "text-sm font-medium text-destructive"
              }
            >
              {week.lastSync.status === "ok"
                ? `${week.lastSync.seen} courses up to date`
                : "Last sync failed"}
            </span>
            <span className="text-xs text-muted-foreground">
              {ago(week.lastSync.at, now)}
            </span>
          </Panel>
        ) : null}
      </div>
    </div>
  )
}
