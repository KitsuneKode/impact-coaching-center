"use client"

import { IconArrowUpRight } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import Image from "next/image"
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
import {
  COMMERCE_NAV,
  isActivePath,
  contentNavFor,
  NAV,
  OWNER_NAV,
} from "@/components/admin/nav"
import { NavUser } from "@/components/admin/nav-user"
import { SidebarMenuBadge } from "@/components/ui/sidebar"
import { api } from "@/convex/_generated/api"
import { useMinute } from "@/hooks/use-minute"
import { agency, brand } from "@/lib/brand"
import { useViewer } from "@/hooks/use-viewer"

export function AdminSidebar() {
  const pathname = usePathname()
  const viewer = useViewer()
  const isOwner = viewer?.role === "owner"
  const content = viewer ? contentNavFor(viewer) : []
  /*
   * The closest thing to a notification this product can honestly offer. A real
   * alert needs a channel, and the only one here is WhatsApp, which is not
   * implemented (KIT-46).
   */
  const counts = useQuery(api.orders.orderCounts)
  const leads = useQuery(api.leads.leadCounts, { now: useMinute() })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="View the site"
              render={<Link href="/" />}
            >
              <span className="grid size-8 flex-none place-items-center rounded-lg bg-card shadow-[0_0_0_1px_var(--border)]">
                <Image src={brand.mark} alt="" width={20} height={20} />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5 leading-none">
                <span className="font-semibold">{brand.shortName} Admin</span>
                <span className="text-xs text-muted-foreground">
                  View the site
                </span>
              </span>
              <IconArrowUpRight
                aria-hidden
                stroke={1.75}
                className="ms-auto text-muted-foreground"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent data-edge-fade>
        <SidebarGroup>
          <SidebarGroupLabel>Work</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActivePath(item.href, pathname)}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon stroke={1.75} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {/* New enquiries nobody has called yet. */}
                  {item.href === "/admin/leads" && leads && leads.fresh > 0 ? (
                    <SidebarMenuBadge>
                      {leads.fresh}
                      {leads.capped ? "+" : ""}
                    </SidebarMenuBadge>
                  ) : null}
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
                    isActive={isActivePath(item.href, pathname)}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon stroke={1.75} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {/*
                    Unseen, not open.
                  */}
                  {counts && counts.unseen > 0 ? (
                    <SidebarMenuBadge>
                      {counts.unseen}
                      {counts.capped ? "+" : ""}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {content.length ? (
          <SidebarGroup>
            <SidebarGroupLabel>Content</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {content.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActivePath(item.href, pathname)}
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

        {/*
          Hidden rather than disabled. A disabled control tells a staff member a
          capability exists and is being withheld, which invites them to ask for it;
          the honest reading is that this is not part of their job.
        */}
        {isOwner ? (
          <SidebarGroup>
            <SidebarGroupLabel>Owner</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {OWNER_NAV.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActivePath(item.href, pathname)}
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
        <a
          href={agency.url}
          target="_blank"
          rel="noopener"
          className="px-2 pbe-1 text-[0.6875rem] text-muted-foreground underline-offset-4 group-data-[collapsible=icon]:hidden hover:text-foreground hover:underline"
        >
          Built and looked after by {agency.name}
        </a>
      </SidebarFooter>

      {/*
        The rail is the thin strip along the sidebar's edge: click it to collapse or
        expand, drag it to resize.
      */}
      <SidebarRail />
    </Sidebar>
  )
}
