import {
  IconBook2,
  IconCalendarEvent,
  IconFileText,
  IconInbox,
  IconLayoutDashboard,
  IconNews,
  IconPackage,
  IconUsers,
} from "@tabler/icons-react"

/** Where staff can go, in one place. */
export const NAV = [
  { href: "/admin", label: "Overview", icon: IconLayoutDashboard },
  { href: "/admin/leads", label: "Enquiries", icon: IconInbox },
] as const

/** Fulfilment, kept apart from the enquiry work. */
export const COMMERCE_NAV = [
  { href: "/admin/orders", label: "Orders", icon: IconPackage },
] as const

/** Owner-only destinations, hidden from staff rather than merely disabled. */
export const OWNER_NAV = [
  { href: "/admin/people", label: "People", icon: IconUsers },
  { href: "/admin/books", label: "Books", icon: IconBook2 },
  { href: "/admin/resources", label: "Resources", icon: IconFileText },
  { href: "/admin/blog", label: "Blog", icon: IconNews },
  { href: "/admin/calendar", label: "Calendar", icon: IconCalendarEvent },
] as const

/** Whether a nav item is the current screen, or a screen inside it. */
export function isActivePath(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** What to call the screen at this path, for the breadcrumb. */
export function labelForPath(pathname: string): string | null {
  const match = [...NAV, ...COMMERCE_NAV, ...OWNER_NAV].find((item) =>
    isActivePath(item.href, pathname)
  )
  return match?.label ?? null
}
