"use client"

import { IconInbox, IconLock } from "@tabler/icons-react"
import { useQuery } from "convex/react"

import { convexConfigured } from "@/app/providers"
import { ButtonLink } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Section } from "@/components/ui/section"
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
    <main>
      <Section size="sm">
        <h1 className="type-display">Admin</h1>
        <p className="type-lede mt-4 text-muted-foreground">
          This copy of the site has no connection to the database.
        </p>
      </Section>
    </main>
  )
}

function Home() {
  const viewer = useQuery(api.auth.getCurrentPerson)
  const isStaff = viewer?.role === "staff" || viewer?.role === "owner"

  if (viewer === undefined) return null

  if (!isStaff)
    return (
      <main>
        <Section size="sm" className="pt-26 md:pt-30">
          <h1 className="type-display">
            <span className="text-foreground">Staff only.</span>
          </h1>
          <div className="mt-10">
            <Empty className="max-w-160 items-start rounded-card border border-border text-left">
              <EmptyHeader className="max-w-none items-start">
                <EmptyMedia variant="icon">
                  <IconLock stroke={1.75} />
                </EmptyMedia>
                <EmptyTitle>This area is for ICT staff</EmptyTitle>
                <EmptyDescription>
                  If you are staff and seeing this, log in with the number ICT
                  has on file for you.
                </EmptyDescription>
              </EmptyHeader>
              <ButtonLink href="/login?next=/admin" size="md">
                Log in
              </ButtonLink>
            </Empty>
          </div>
        </Section>
      </main>
    )

  return (
    <main>
      <Section size="sm">
        <h1 className="type-display">
          <span className="text-foreground">Admin.</span>{" "}
          <span className="text-muted-foreground">
            {viewer.name.trim() || "Signed in"}.
          </span>
        </h1>
        <div className="mt-10 max-w-160">
          <ButtonLink href="/admin/leads" size="md">
            <IconInbox stroke={1.75} />
            Go to enquiries
          </ButtonLink>
          <p className="mt-6 text-sm text-muted-foreground">
            Books, resources and orders appear here as they are built. Nothing
            is hidden behind a placeholder.
          </p>
        </div>
      </Section>
    </main>
  )
}
