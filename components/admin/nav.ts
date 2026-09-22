import {
  IconInbox,
  IconLayoutDashboard,
  IconPackage,
  IconUsers,
} from "@tabler/icons-react"

/**
 * Where staff can go, in one place.
 *
 * Shared by the sidebar and the command palette so the two cannot disagree
 * about what exists. A destination that appears in one and not the other is
 * the kind of drift nobody notices until a staff member asks why the shortcut
 * knows about a page the menu does not.
 *
 * Only routes that exist appear here. A nav item pointing at an unwritten page
 * is a promise the product cannot keep, and this is the surface ICT's staff
 * will judge the tool by.
 */
export const NAV = [
  { href: "/admin", label: "Overview", icon: IconLayoutDashboard },
  { href: "/admin/leads", label: "Enquiries", icon: IconInbox },
] as const

/**
 * Fulfilment, kept apart from the enquiry work.
 *
 * Its own group rather than another row under "Work" because it is a
 * different job with a different rhythm: enquiries are worked by calling
 * people, orders by packing parcels, and the two are usually the same person
 * at different times of day. A sidebar that separates them lets someone open
 * the one they are in the middle of without reading past the other.
 */
export const COMMERCE_NAV = [
  { href: "/admin/orders", label: "Orders", icon: IconPackage },
] as const

/** Owner-only destinations, hidden from staff rather than merely disabled. */
export const OWNER_NAV = [
  { href: "/admin/people", label: "People", icon: IconUsers },
] as const

/**
 * What to call the screen at this path, for the breadcrumb.
 *
 * Read from the same two lists the sidebar and the palette render, so a
 * renamed screen is renamed in three places at once. Returns null for a path
 * nothing here claims, and the breadcrumb then shows only the root - better
 * than inventing a title from the URL segment, which turns /admin/people into
 * "people" and every future hyphenated route into nonsense.
 */
export function labelForPath(pathname: string): string | null {
  const match = [...NAV, ...COMMERCE_NAV, ...OWNER_NAV].find(
    (item) => item.href === pathname
  )
  return match?.label ?? null
}
