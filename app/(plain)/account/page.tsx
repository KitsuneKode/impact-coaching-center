"use client"

import {
  IconCircleCheck,
  IconLock,
  IconPlugConnectedX,
} from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { convexConfigured } from "@/app/providers"
import { AboutYouCard } from "@/components/account/about-you-card"
import { DeleteAccount } from "@/components/account/delete-account"
import { DetailsCard } from "@/components/account/details-card"
import { OrdersCard } from "@/components/account/orders-card"
import { ButtonLink } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"

/** A Person's own record. */
export default function AccountPage() {
  if (!convexConfigured) return <Unavailable />
  // useSearchParams needs a boundary for the static shell to prerender.
  return (
    <Suspense>
      <Account />
    </Suspense>
  )
}

function Unavailable() {
  return (
    <PageShell title={<span className="text-foreground">Your details.</span>}>
      <StatePanel
        icon={<IconPlugConnectedX stroke={1.75} />}
        title="Not available here"
        description="Accounts aren't available on this copy of the site."
      />
    </PageShell>
  )
}

function Account() {
  const viewer = useQuery(api.auth.getCurrentPerson)
  // Set by DeleteAccount after erasure. The session is gone by then, so the
  // confirmation has to live on the signed-out screen, not in the dialog.
  const justDeleted = useSearchParams().get("deleted") === "1"

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

  if (viewer === null && justDeleted)
    return (
      <PageShell
        title={<span className="text-foreground">Account deleted.</span>}
      >
        <StatePanel
          icon={<IconCircleCheck stroke={1.75} />}
          title="Your account has been deleted"
          description="Your details have been erased and you've been signed out."
          action={
            <ButtonLink href="/" size="md">
              Back to the home page
            </ButtonLink>
          }
        />
      </PageShell>
    )

  if (viewer === null)
    return (
      <PageShell title={<span className="text-foreground">Your details.</span>}>
        <StatePanel
          icon={<IconLock stroke={1.75} />}
          title="Log in to see your account"
          description="Use your mobile number. New here? The same step creates your account."
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
      <div className="grid gap-6">
        <DetailsCard viewer={viewer} />
        <OrdersCard />
        <AboutYouCard />
        <DeleteAccount role={viewer.role} />
      </div>
    </PageShell>
  )
}
