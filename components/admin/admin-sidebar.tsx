"use client"

import { useQuery } from "convex/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { COMMERCE_NAV, NAV, OWNER_NAV } from "@/components/admin/nav"
import { NavUser } from "@/components/admin/nav-user"
import { SidebarMenuBadge } from "@/components/ui/sidebar"
import { api } from "@/convex/_generated/api"
import { brand } from "@/lib/brand"

export function AdminSidebar() {
  const pathname = usePathname()
  const viewer = useQuery(api.auth.getCurrentPerson)
  const isOwner = viewer?.role === "owner"
  /*
   * The closest thing to a notification this product can honestly offer.
   * A real alert needs a channel, and the only one here is WhatsApp, which is
   * not implemented (KIT-46). Rather than a bell that does nothing, the
   * number staff actually act on sits on the nav item they would open anyway.
   */
  const counts = useQuery(api.orders.orderCounts)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <span className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">{brand.shortName}</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Work</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon stroke={1.75} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Commerce</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {COMMERCE_NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon stroke={1.75} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {/*
                   * Unseen, not open. A badge counting everything still to do
                   * never reaches zero on a working day, so it stops being
                   * read; one counting orders nobody has looked at yet is a
                   * thing a person can actually clear.
                   */}
                  {counts && counts.unseen > 0 ? (
                    <SidebarMenuBadge>{counts.unseen}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/*
         * Hidden rather than disabled. A disabled control tells a staff member
         * a capability exists and is being withheld, which invites them to ask
         * for it; the honest reading is that this is not part of their job.
         * The backend refuses regardless - this is chrome, not the gate.
         */}
        {isOwner ? (
          <SidebarGroup>
            <SidebarGroupLabel>Owner</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {OWNER_NAV.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <item.icon stroke={1.75} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      {/*
       * The rail is the thin strip along the sidebar's edge: click it to
       * collapse or expand, drag it to resize. It comes from the registry
       * block and is the affordance that makes icon mode discoverable without
       * hunting for the trigger in the header.
       */}
      <SidebarRail />
    </Sidebar>
  )
}
