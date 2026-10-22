"use client"

import {
  IconArrowRight,
  IconBook2,
  IconCircleCheck,
  IconFolder,
  IconLock,
  IconMessageCircle,
  IconPlugConnectedX,
  IconSchool,
} from "@tabler/icons-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useSyncExternalStore } from "react"

import { convexConfigured } from "@/app/providers"
import { AboutYouCard } from "@/components/account/about-you-card"
import { DeleteAccount } from "@/components/account/delete-account"
import { DetailsCard } from "@/components/account/details-card"
import { OrdersCard } from "@/components/account/orders-card"
import { ButtonLink } from "@/components/ui/button"
import {
  PageShell,
  PanelSkeleton,
  StatePanel,
} from "@/components/ui/page-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { useViewer } from "@/hooks/use-viewer"

const noSubscribe = () => () => {}

/* This browser was signed in last time: wait in the signed-in layout. */
const SIGNED_IN_KEY = "ict-signed-in"
const wasSignedIn = () => {
  try {
    return localStorage.getItem(SIGNED_IN_KEY) === "1"
  } catch {
    return false
  }
}

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
  const live = useViewer()
  // The server cannot know who is signed in; the first browser render must
  // match it (the loading screen) before showing the greeting.
  const hydrated = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false
  )
  const viewer = hydrated ? live : undefined
  // Set by DeleteAccount after erasure. The session is gone by then, so the
  // confirmation has to live on the signed-out screen, not in the dialog.
  const justDeleted = useSearchParams().get("deleted") === "1"
  const signedInBefore = useSyncExternalStore(
    noSubscribe,
    wasSignedIn,
    () => false
  )
  useEffect(() => {
    if (live === undefined) return
    try {
      if (live) localStorage.setItem(SIGNED_IN_KEY, "1")
      else localStorage.removeItem(SIGNED_IN_KEY)
    } catch {
      // Blocked storage: the next visit waits as the sign-in card.
    }
  }, [live])

  if (viewer === undefined)
    return signedInBefore ? (
      <AccountWaiting />
    ) : (
      <PageShell title={<span className="text-foreground">Your details.</span>}>
        <PanelSkeleton />
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

  const first = viewer.name.trim().split(/\s+/)[0]
  return (
    <PageShell
      title={
        <>
          <span className="text-foreground">
            {first ? `Hi, ${first}.` : "Your account."}
          </span>{" "}
          <span className="text-muted-foreground">
            Your orders and details.
          </span>
        </>
      }
    >
      {/* Who you are and where to go on the side; what you came for (orders,
          your preparation) in the main column; deleting last and quiet. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        <div className="grid gap-6 lg:sticky lg:top-[calc(var(--header-height)+var(--strip-height)+1.5rem)]">
          <DetailsCard viewer={viewer} />
          <nav
            aria-label="For you"
            className="grid gap-1 rounded-[24px] bg-secondary/60 p-3"
          >
            {[
              {
                href: "/courses",
                label: "Courses and timings",
                icon: IconSchool,
              },
              {
                href: "/resources",
                label: "Free notes and papers",
                icon: IconFolder,
              },
              { href: "/books", label: "Books", icon: IconBook2 },
              {
                href: "/contact",
                label: "Talk to ICT",
                icon: IconMessageCircle,
              },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                data-press
                className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium hover:bg-card"
              >
                <Icon
                  aria-hidden
                  size={18}
                  stroke={1.75}
                  className="text-muted-foreground"
                />
                {label}
                <IconArrowRight
                  aria-hidden
                  size={16}
                  stroke={1.75}
                  className="ms-auto text-muted-foreground"
                />
              </Link>
            ))}
          </nav>
        </div>
        <div className="grid gap-6">
          <OrdersCard />
          <AboutYouCard />
          <DeleteAccount role={viewer.role} phone={viewer.phone} />
        </div>
      </div>
    </PageShell>
  )
}

/** The signed-in page in outline: details and links beside the orders. */
function AccountWaiting() {
  return (
    <PageShell title={<Skeleton className="h-[0.9em] w-[min(36rem,100%)]" />}>
      <output className="sr-only">Opening your account…</output>
      <div
        aria-hidden
        className="grid w-full gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start"
      >
        <div className="grid gap-6">
          <div className="grid gap-3 rounded-[24px] bg-card p-6 shadow-[0_0_0_1px_var(--border)]">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mbs-2 h-3.5 w-24" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mbs-3 h-11 w-40 rounded-xl" />
          </div>
          <div className="grid gap-3 rounded-[24px] bg-secondary/60 p-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-5 w-44" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 rounded-[24px] bg-card p-6 shadow-[0_0_0_1px_var(--border)]">
          <Skeleton className="h-5 w-28" />
          {[0, 1].map((i) => (
            <div key={i} className="grid gap-3 pbs-3">
              <Skeleton className="h-5 w-72 max-w-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
