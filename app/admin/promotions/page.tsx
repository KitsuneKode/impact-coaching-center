"use client"

import { IconPlus, IconSpeakerphone } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { convexConfigured } from "@/app/providers"
import { NoPromotions, pagesLabel } from "@/components/admin/promotion-editor"
import { Badge } from "@/components/ui/badge"
import { Button, ButtonLink } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { campaignPhase, CAMPAIGN_KIND_LABEL } from "@/lib/campaigns"

const PHASE: Record<
  ReturnType<typeof campaignPhase>,
  { label: string; variant: "solid" | "neutral" }
> = {
  live: { label: "Live", variant: "solid" },
  scheduled: { label: "Scheduled", variant: "neutral" },
  ended: { label: "Ended", variant: "neutral" },
  paused: { label: "Paused", variant: "neutral" },
  draft: { label: "Draft", variant: "neutral" },
}

const when = (ms: number | undefined) =>
  ms === undefined
    ? null
    : new Date(ms).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })

/** Every promotion with its one switch, for staff with the promotions grant. */
export default function AdminPromotionsPage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Promotions.">
        Not available here.
      </PageShell>
    )
  return <Promotions />
}

function Promotions() {
  const allowed = useQuery(api.campaigns.canEditCampaigns)
  const list = useQuery(api.campaigns.adminCampaigns)
  const setStatus = useMutation(api.campaigns.setCampaignStatus)
  const [now, setNow] = useState(() => Date.now())
  const [pending, setPending] = useState<string | null>(null)
  // The hour, so the stats subscription is not renewed every minute.
  const hour = Math.floor(now / 3_600_000) * 3_600_000
  const stats = useQuery(api.campaigns.adminCampaignStats, { now: hour })
  const statsOf = new Map(stats?.map((row) => [row.id, row]))

  // Scheduled and ended come from the dates, so the clock keeps the badges honest.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])

  if (allowed === undefined || list === undefined)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Promotions.</span>}
      >
        <ListSkeleton rows={5} />
      </PageShell>
    )
  if (!allowed) return <NoPromotions />

  async function toggle(id: Id<"campaigns">, revision: number, status: string) {
    setPending(id)
    try {
      const result = await setStatus({
        id,
        expectedRevision: revision,
        status: status === "live" ? "paused" : "live",
      })
      if (!result.ok)
        toast.error(
          result.reason === "revision-conflict"
            ? "This was changed in another tab. Reload and try again."
            : "Not changed."
        )
      else toast.success(status === "live" ? "Paused" : "Live on the site")
    } catch {
      toast.error("Could not reach the server. Try again.")
    } finally {
      setPending(null)
    }
  }

  return (
    <PageShell
      density="working"
      title={<span className="text-foreground">Promotions.</span>}
    >
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <ButtonLink href="/admin/promotions/new" size="md">
            <IconPlus stroke={1.75} aria-hidden />
            New promotion
          </ButtonLink>
          <p className="text-sm text-muted-foreground">
            Bars, banners, pop-ups and video reels. Pausing is how one stops;
            nothing is deleted.
          </p>
        </div>

        {list.rows.length === 0 ? (
          <StatePanel
            icon={<IconSpeakerphone stroke={1.75} />}
            title="No promotions yet"
            description="Add the first one. It stays a draft until you switch it on."
          />
        ) : (
          <ul className="grid gap-3">
            {list.rows.map((c) => {
              const phase = PHASE[campaignPhase(c, now)]
              const from = when(c.startsAt)
              const until = when(c.endsAt)
              return (
                <li
                  key={c.id}
                  className="grid gap-3 rounded-card border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/promotions/${c.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {c.name}
                      </Link>
                      <Badge variant={phase.variant}>{phase.label}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {CAMPAIGN_KIND_LABEL[c.kind]} · {pagesLabel(c.routes)} ·
                      Priority {c.priority}
                    </p>
                    <Stats row={statsOf.get(c.id)} />
                    {from || until ? (
                      <p className="tnum mt-0.5 text-sm text-muted-foreground">
                        {from ? `From ${from}` : "From now"}
                        {until ? ` to ${until}` : ", no end"}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <ButtonLink
                      href={`/admin/promotions/${c.id}`}
                      variant="ghost"
                      size="sm"
                    >
                      Edit
                    </ButtonLink>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pending === c.id}
                      onClick={() => toggle(c.id, c.revision, c.status)}
                    >
                      {c.status === "live" ? "Pause" : "Go live"}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {list.truncated ? (
          <p className="text-sm text-muted-foreground">
            Showing the newest 100. Pause and tidy older ones to see the rest.
          </p>
        ) : null}
      </div>
    </PageShell>
  )
}

const count = new Intl.NumberFormat("en-IN")

/** The last 30 days: seen, clicked (with the rate), closed. */
function Stats({
  row,
}: {
  row: { views: number; clicks: number; closes: number } | undefined
}) {
  if (!row) return null
  if (row.views === 0)
    return (
      <p className="mt-0.5 text-sm text-muted-foreground">
        Not seen in the last 30 days
      </p>
    )
  const rate = ((row.clicks / row.views) * 100).toFixed(1)
  return (
    <p className="tnum mt-0.5 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">
        {count.format(row.views)}
      </span>{" "}
      seen ·{" "}
      <span className="font-medium text-foreground">
        {count.format(row.clicks)}
      </span>{" "}
      {row.clicks === 1 ? "click" : "clicks"} ({rate}%) ·{" "}
      {count.format(row.closes)} closed · 30 days
    </p>
  )
}
