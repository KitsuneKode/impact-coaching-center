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
import { toast } from "sonner"

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

/** Who is signed in, at the foot of the admin sidebar. */
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
                  try {
                    await authClient.signOut()
                  } catch {
                    setLeaving(false)
                    toast.error("Couldn't log you out. Try again.")
                    return
                  }
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
