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
import { Suspense, useSyncExternalStore } from "react"

import { convexConfigured } from "@/app/providers"
import { AboutYouCard } from "@/components/account/about-you-card"
import { DeleteAccount } from "@/components/account/delete-account"
import { DetailsCard } from "@/components/account/details-card"
import { OrdersCard } from "@/components/account/orders-card"
import { ButtonLink } from "@/components/ui/button"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { useViewer } from "@/hooks/use-viewer"

const noSubscribe = () => () => {}

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
