"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { CommandHint } from "@/components/admin/command-menu"
import { sectionForPath } from "@/components/admin/nav"
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

/** The admin's own header: where you are, and how to get around. */
export function AdminHeader() {
  const pathname = usePathname()
  const section = sectionForPath(pathname)
  const atRoot = pathname === "/admin"
  // One level below a section: an order, a post, the labels sheet.
  const leaf =
    section && pathname !== section.href
      ? leafLabel(pathname.slice(section.href.length + 1).split("/")[0])
      : null

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="me-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {atRoot || !section ? (
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
                {leaf ? (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink render={<Link href={section.href} />}>
                        {section.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem className="min-w-0">
                      <BreadcrumbPage className="truncate">
                        {leaf}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage>{section.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ms-auto">
          <CommandHint />
        </div>
      </div>
    </header>
  )
}

/** A path segment as a crumb: references stay as typed, words get a capital. */
function leafLabel(segment: string) {
  const text = decodeURIComponent(segment)
  if (/^ICT-/i.test(text)) return text.toUpperCase()
  if (text === "new") return "New"
  if (/^[a-z]+$/.test(text)) return text[0].toUpperCase() + text.slice(1)
  // Convex ids and slugs: the page's own title names it.
  return "Details"
}
