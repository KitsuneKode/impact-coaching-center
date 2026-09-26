import {
  IconInbox,
  IconLayoutDashboard,
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
] as const

/** What to call the screen at this path, for the breadcrumb. */
export function labelForPath(pathname: string): string | null {
  const match = [...NAV, ...COMMERCE_NAV, ...OWNER_NAV].find(
    (item) => item.href === pathname
  )
  return match?.label ?? null
}
