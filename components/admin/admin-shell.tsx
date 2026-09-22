"use client"

import { IconPlugConnectedX } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import type { ReactNode } from "react"

import { convexConfigured } from "@/app/providers"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminCommandMenu, CommandHint } from "@/components/admin/command-menu"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Section } from "@/components/ui/section"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useStalled } from "@/components/ui/use-stalled"
import { api } from "@/convex/_generated/api"

/**
 * The admin chrome, and who gets to see it.
 *
 * Staff get the sidebar. Everybody else gets their page unwrapped, so the
 * route can say "staff only" in its own words rather than inside a navigation
 * frame for a product they cannot use. Showing an empty admin shell to a
 * student tells them a door exists and is locked; showing none tells them the
 * truth, which is that this is not their part of the site.
 *
 * This is chrome, not a gate. `convex/authz.ts` refuses on the server and
 * every query re-checks: a student who guesses /admin/people still gets
 * nothing, because the decision was never made here.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  if (!convexConfigured) return children
  return <Shell>{children}</Shell>
}

/**
 * What an admin sees when the query never comes back.
 *
 * Distinct from `Unavailable` on the pages themselves: that one means the
 * build has no Convex URL at all, this one means it has one and nothing is
 * answering. Staff need to be able to tell "misconfigured" from "down",
 * because only one of them is worth waiting out.
 */
function Unreachable() {
  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <h1 className="type-display">Not responding.</h1>
        <div className="mt-10">
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
  const viewer = useQuery(api.auth.getCurrentPerson)
  const isStaff = viewer?.role === "staff" || viewer?.role === "owner"
  const stalled = useStalled(viewer === undefined)

  /*
   * `undefined` is still asking. Rendering the bare page first and then
   * wrapping it in a sidebar is a visible jolt on every admin navigation, so
   * the shell waits for an answer rather than guessing at one.
   *
   * It waits, but it does not wait forever. This returned a bare `null`, and
   * because `undefined` is also what a query that never resolves looks like,
   * an unreachable backend rendered the site header, an empty void and the
   * footer - on every admin route, permanently, with nothing to click and
   * nothing naming the problem. Observed, not theorised: it is what /admin
   * did whenever the local Convex backend was not running.
   */
  if (viewer === undefined) return stalled ? <Unreachable /> : null
  if (!isStaff) return children

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
          {/*
           * The hint sits at the end of the header rather than beside the
           * trigger: a keyboard shortcut nobody can see is a shortcut nobody
           * uses, but it is also not the first thing on the screen.
           */}
          <div className="ml-auto">
            <CommandHint />
          </div>
        </header>
        {children}
      </SidebarInset>
      <AdminCommandMenu isOwner={viewer.role === "owner"} />
    </SidebarProvider>
  )
}
