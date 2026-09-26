"use client"

import {
  IconLogout,
  IconSelector,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react"
import { useQuery } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import { authClient } from "@/lib/auth-client"
import { formatPhone } from "@/lib/brand"
import { initials } from "@/lib/person"

/**
 * Who is signed in, at the foot of the admin sidebar.
 *
 * Adapted from the registry's sidebar-07 `NavUser`, which is the right shape
 * for this: a full-width row carrying identity, not a lone avatar floating in
 * a centred box, which is what this footer held before. In icon mode the
 * sidebar collapses it to the avatar on its own, and the dropdown moves to the
 * side rather than below - both behaviours come from the block.
 *
 * What the block offered and this does not: Upgrade to Pro, Billing and
 * Notifications. None of the three exists here, and a menu item that leads
 * nowhere is a promise the product cannot keep. AGENTS.md is explicit about
 * inventing surface.
 *
 * The identity line is name over number, both real. Where the block showed a
 * name and an email, a Person here is keyed by their mobile number (ADR-0001)
 * and may have no email at all, so the number is the second line - which also
 * tells staff sharing a handset which account they are in.
 */
export function NavUser() {
  const { isMobile } = useSidebar()
  const viewer = useQuery(api.auth.getCurrentPerson)
  const router = useRouter()
  const [leaving, setLeaving] = useState(false)

  if (!viewer)
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          {/*
           * Holds the row's height while the query answers, so the sidebar
           * does not change shape under the cursor on every navigation.
           */}
          <SidebarMenuButton size="lg" disabled aria-hidden="true" />
        </SidebarMenuItem>
      </SidebarMenu>
    )

  const name = viewer.name.trim()
  const phone = formatPhone(viewer.phone)
  const mark = initials(name)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">
                {mark ?? <IconUser stroke={1.75} className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{name || phone}</span>
              {name ? (
                <span className="tnum truncate text-xs text-muted-foreground">
                  {phone}
                </span>
              ) : null}
            </div>
            <IconSelector stroke={1.75} className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="block truncate">{name || phone}</span>
                {name ? (
                  <span className="tnum block text-xs font-normal text-muted-foreground">
                    {phone}
                  </span>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/account" />}>
                <IconUserCircle stroke={1.75} />
                Your details
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={leaving}
                onClick={async () => {
                  setLeaving(true)
                  await authClient.signOut()
                  router.push("/")
                  router.refresh()
                }}
              >
                {leaving ? <Spinner /> : <IconLogout stroke={1.75} />}
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
