"use client"

import { IconLock, IconPlugConnectedX } from "@tabler/icons-react"
import { useQuery } from "convex/react"

import { convexConfigured } from "@/app/providers"
import { DetailsCard } from "@/components/account/details-card"
import { ButtonLink } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"

/**
 * A Person's own record.
 *
 * Deliberately small. Orders, saved addresses and reading history all belong
 * here eventually - docs/plans/2026-09-22-commerce-and-account-surfaces.md
 * settles that - but none of them exists yet, and a page of empty sections
 * announcing features that are not built is the placeholder AGENTS.md rules
 * out. What is here is real and editable today.
 *
 * Reached from the account menu in the site header and from the admin
 * sidebar, because staff are Persons too and their own details live in the
 * same place as everyone's.
 */
export default function AccountPage() {
  if (!convexConfigured) return <Unavailable />
  return <Account />
}

function Unavailable() {
  return (
    <PageShell title={<span className="text-foreground">Your details.</span>}>
      <StatePanel
        icon={<IconPlugConnectedX stroke={1.75} />}
        title="Not available here"
        description="This copy of the site has no connection to the database, so it cannot look up your account. Nothing is wrong with your details."
      />
    </PageShell>
  )
}

function Account() {
  const viewer = useQuery(api.auth.getCurrentPerson)

  if (viewer === undefined)
    return (
      <PageShell
        title={
          <>
            <span className="text-foreground">Your details.</span>{" "}
            <span className="text-muted-foreground">Loading…</span>
          </>
        }
      >
        <ListSkeleton rows={3} className="max-w-160" />
      </PageShell>
    )

  if (viewer === null)
    return (
      <PageShell title={<span className="text-foreground">Your details.</span>}>
        <StatePanel
          icon={<IconLock stroke={1.75} />}
          title="Log in to see your details"
          description="Your mobile number is your account. Entering it either finds you or sets one up."
          action={
            <ButtonLink href="/login?next=/account" size="md">
              Log in
            </ButtonLink>
          }
        />
      </PageShell>
    )

  return (
    <PageShell
      title={
        <>
          <span className="text-foreground">Your details.</span>{" "}
          <span className="text-muted-foreground">
            What ICT has on file for you.
          </span>
        </>
      }
    >
      <DetailsCard viewer={viewer} />
    </PageShell>
  )
}
