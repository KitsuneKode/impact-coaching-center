"use client"

import { useQuery } from "convex/react"
import type { ReactNode } from "react"

import { convexConfigured } from "@/app/providers"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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

function Shell({ children }: { children: ReactNode }) {
  const viewer = useQuery(api.auth.getCurrentPerson)
  const isStaff = viewer?.role === "staff" || viewer?.role === "owner"

  // `undefined` is still asking. Rendering the bare page first and then
  // wrapping it in a sidebar is a visible jolt on every admin navigation, so
  // the shell waits for an answer rather than guessing at one.
  if (viewer === undefined) return null
  if (!isStaff) return children

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
