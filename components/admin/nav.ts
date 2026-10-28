import {
  IconBook2,
  IconCalendarEvent,
  IconFileText,
  IconInbox,
  IconLayoutDashboard,
  IconNews,
  IconPackage,
  IconSchool,
  IconSettings,
  IconSpeakerphone,
  IconUsers,
} from "@tabler/icons-react"

import { hasGrant } from "@/lib/grants"

/** Where staff can go, in one place. */
export const NAV = [
  { href: "/admin", label: "Overview", icon: IconLayoutDashboard },
  { href: "/admin/leads", label: "Enquiries", icon: IconInbox },
] as const

/** Fulfilment, kept apart from the enquiry work. */
export const COMMERCE_NAV = [
  { href: "/admin/orders", label: "Orders", icon: IconPackage },
] as const

/** Areas the owner opens to staff one grant at a time. */
export const CONTENT_NAV = [
  { href: "/admin/books", label: "Shop", icon: IconBook2, grant: "catalog" },
  {
    href: "/admin/courses",
    label: "Courses",
    icon: IconSchool,
    grant: "catalog",
  },
  {
    href: "/admin/resources",
    label: "Resources",
    icon: IconFileText,
    grant: "catalog",
  },
  {
    href: "/admin/promotions",
    label: "Promotions",
    icon: IconSpeakerphone,
    grant: "promotions",
  },
  { href: "/admin/blog", label: "Blog", icon: IconNews, grant: "content" },
  {
    href: "/admin/calendar",
    label: "Calendar",
    icon: IconCalendarEvent,
    grant: "content",
  },
] as const

/** Owner-only destinations, hidden from staff rather than merely disabled. */
export const OWNER_NAV = [
  { href: "/admin/people", label: "People", icon: IconUsers },
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
] as const

/** The content areas this viewer may open. */
export const contentNavFor = (viewer: Parameters<typeof hasGrant>[0]) =>
  CONTENT_NAV.filter((item) => hasGrant(viewer, item.grant))

/** Whether a nav item is the current screen, or a screen inside it. */
export function isActivePath(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** What to call the screen at this path, for the breadcrumb. */
export function labelForPath(pathname: string): string | null {
  return sectionForPath(pathname)?.label ?? null
}

/** The nav section a path sits in. */
export function sectionForPath(pathname: string) {
  return (
    [...NAV, ...COMMERCE_NAV, ...CONTENT_NAV, ...OWNER_NAV].find((item) =>
      isActivePath(item.href, pathname)
    ) ?? null
  )
}
