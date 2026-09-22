"use client"

import { IconInbox, IconLock } from "@tabler/icons-react"
import { useQuery } from "convex/react"

import { convexConfigured } from "@/app/providers"
import { ButtonLink } from "@/components/ui/button"
import { PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"

/**
 * The admin home.
 *
 * Deliberately not a dashboard of numbers. The registry block this shell came
 * from shipped four metric cards and two charts of invented data, and both
 * KIT-55 ("without sample metrics or unnecessary charts") and AGENTS.md ("do
 * not invent facts, rankings, outcomes") rule that out. There is exactly one
 * real thing to count right now and the inbox already counts it, so this page
 * points at the work instead of decorating it.
 *
 * When there are real figures worth showing - enquiries this week, orders
 * awaiting fulfilment - they belong here, sourced from a query rather than a
 * fixture.
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

  return (
    <PageShell
      density="working"
      title={
        <>
          <span className="text-foreground">Admin.</span>{" "}
          <span className="text-muted-foreground">
            {viewer.name.trim() || "Signed in"}.
          </span>
        </>
      }
    >
      <div className="max-w-160">
        <ButtonLink href="/admin/leads" size="md">
          <IconInbox stroke={1.75} />
          Go to enquiries
        </ButtonLink>
        <p className="mt-6 text-sm text-muted-foreground">
          Books, resources and orders appear here as they are built. Nothing is
          hidden behind a placeholder.
        </p>
      </div>
    </PageShell>
  )
}
