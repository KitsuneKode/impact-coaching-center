"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { CommandHint } from "@/components/admin/command-menu"
import { labelForPath } from "@/components/admin/nav"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

/**
 * The admin's own header: where you are, and how to get around.
 *
 * Taken from the registry's sidebar-07 header - trigger, a vertical rule, then
 * a breadcrumb - because the pattern answers a real question on a screen with
 * no page title above the fold once you scroll. It replaces a bar that held a
 * lone trigger and nothing else.
 *
 * The trail is two levels because the admin is two levels deep. Inventing a
 * third from URL segments would produce "admin / people" with no page that
 * "admin" alone means, and a breadcrumb whose links go nowhere is worse than
 * no breadcrumb.
 *
 * It shrinks with the sidebar: `group-has-data-[collapsible=icon]` is the
 * block's own mechanism, so the header height follows icon mode rather than
 * staying tall above a collapsed rail.
 */
export function AdminHeader() {
  const pathname = usePathname()
  const label = labelForPath(pathname)
  const atRoot = pathname === "/admin"

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {atRoot || !label ? (
              <BreadcrumbItem>
                <BreadcrumbPage>Admin</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink render={<Link href="/admin" />}>
                    Admin
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <CommandHint />
        </div>
      </div>
    </header>
  )
}
