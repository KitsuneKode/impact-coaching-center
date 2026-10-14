"use client"

import { IconPlugConnectedX } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import type { ReactNode } from "react"

import { convexConfigured } from "@/app/providers"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminCommandMenu } from "@/components/admin/command-menu"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Section } from "@/components/ui/section"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useStalled } from "@/components/ui/use-stalled"
import { api } from "@/convex/_generated/api"

/** The admin chrome, and who gets to see it. */
export function AdminShell({ children }: { children: ReactNode }) {
  if (!convexConfigured) return children
  return <Shell>{children}</Shell>
}

/** What an admin sees when the query never comes back. */
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
   */
  if (viewer === undefined) return stalled ? <Unreachable /> : null
  if (!isStaff) return children

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
