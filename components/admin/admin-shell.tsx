"use client"

import {
  IconArrowLeft,
  IconLock,
  IconPlugConnectedX,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { convexConfigured } from "@/app/providers"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminCommandMenu } from "@/components/admin/command-menu"
import { Button, ButtonAnchor } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Section } from "@/components/ui/section"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useStalled } from "@/components/ui/use-stalled"
import { authClient } from "@/lib/auth-client"
import { brand, formatPhone } from "@/lib/brand"
import { useViewer } from "@/hooks/use-viewer"

/** The admin chrome, and who gets to see it. */
export function AdminShell({ children }: { children: ReactNode }) {
  if (!convexConfigured) return children
  return <Shell>{children}</Shell>
}

/**
 * The one screen every admin page shows to someone who is not staff: signed
 * out, a way to sign in (a full page, never the public pop-up over the
 * admin); signed in with a student account, which number that is and a way
 * to switch.
 */
function StaffGate({ phone }: { phone?: string }) {
  const path = usePathname()
  const next = encodeURIComponent(path || "/admin")
  return (
    <main className="grid min-h-dvh place-items-center bg-secondary/40 p-5">
      <div className="w-full max-w-104 rounded-[28px] bg-card p-8 text-center shadow-lift">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary">
          <Image src={brand.mark} alt="" width={30} height={30} />
        </span>
        <p className="mbs-5 inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <IconLock aria-hidden size={14} stroke={2} />
          ICT staff
        </p>
        <h1 className="mbs-2 font-display text-2xl font-semibold tracking-[-0.02em]">
          {phone ? "This account isn't staff" : "Sign in to the admin"}
        </h1>
        <p className="mbs-3 text-sm text-pretty text-muted-foreground">
          {phone
            ? `You're signed in as ${formatPhone(phone)}. Sign in with the number ICT added as staff.`
            : "Use the mobile number ICT added as staff. We'll send a code on WhatsApp."}
        </p>
        <div className="mbs-7 grid gap-2">
          {phone ? (
            <Button
              size="md"
              onClick={() =>
                void authClient
                  .signOut()
                  .then(() => window.location.assign(`/login?next=${next}`))
              }
            >
              Switch account
            </Button>
          ) : (
            <ButtonAnchor href={`/login?next=${next}`} target="_self" size="md">
              Sign in with WhatsApp
            </ButtonAnchor>
          )}
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft aria-hidden size={16} stroke={1.75} />
            Back to the site
          </Link>
        </div>
      </div>
    </main>
  )
}

/** The sidebar and a page, in outline, while the session is checked. */
function ShellWaiting() {
  return (
    <div aria-busy="true" className="flex min-h-dvh">
      <output className="sr-only">Opening the admin…</output>
      <div
        aria-hidden
        className="hidden w-64 flex-none flex-col gap-6 bg-sidebar p-4 md:flex"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-lg" />
          <div className="grid flex-1 gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        {[3, 1, 6, 2].map((rows, group) => (
          <div key={group} className="grid gap-2.5">
            <Skeleton className="h-3 w-14" />
            {Array.from({ length: rows }, (_, i) => (
              <Skeleton key={i} className="h-4 w-32" />
            ))}
          </div>
        ))}
      </div>
      <div aria-hidden className="min-w-0 flex-1">
        <div className="flex h-14 items-center gap-3 border-b border-border px-4">
          <Skeleton className="size-6 rounded-md" />
          <Skeleton className="h-3.5 w-28" />
        </div>
        <div className="grid gap-6 px-5 pt-8 md:px-8 md:pt-10">
          <Skeleton className="h-8 w-56" />
          <div className="grid gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-11 w-full rounded-control" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** What an admin sees when the query never comes back. */
function Unreachable() {
  return (
    <main>
      <Section size="sm" className="pbs-26 md:pbs-30">
        <h1 className="type-display">Not responding.</h1>
        <div className="mbs-10">
          <Empty className="max-w-160 items-start rounded-card border border-border text-left">
            <EmptyHeader className="max-w-none items-start">
              <EmptyMedia variant="icon">
                <IconPlugConnectedX stroke={1.75} />
              </EmptyMedia>
              <EmptyTitle>Cannot reach the enquiry database</EmptyTitle>
              <EmptyDescription>
                Nothing is wrong with your account, and nothing you did caused
                this. The admin area needs the database to know who you are, so
                it cannot show anything until it answers.
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => globalThis.location.reload()} size="md">
              Try again
            </Button>
          </Empty>
        </div>
      </Section>
    </main>
  )
}

function Shell({ children }: { children: ReactNode }) {
  const viewer = useViewer()
  const isStaff = viewer?.role === "staff" || viewer?.role === "owner"
  const stalled = useStalled(viewer === undefined)
  const path = usePathname()

  /*
   * `undefined` is still asking. Rendering the bare page first and then
   * wrapping it in a sidebar is a visible jolt, and a blank screen reads as
   * broken; nearly everyone who opens /admin is staff, so it waits in the
   * admin's own shape.
   */
  if (viewer === undefined) return stalled ? <Unreachable /> : <ShellWaiting />
  if (!isStaff) return <StaffGate phone={viewer?.phone} />
  // A sheet for the printer: staff only, no chrome.
  if (path === "/admin/orders/labels") return children

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="min-w-0">
        <AdminHeader />
        {children}
      </SidebarInset>
      <AdminCommandMenu viewer={viewer} />
    </SidebarProvider>
  )
}
