import { IconInbox, IconLayoutDashboard, IconUsers } from "@tabler/icons-react"

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

/** Owner-only destinations, hidden from staff rather than merely disabled. */
export const OWNER_NAV = [
  { href: "/admin/people", label: "People", icon: IconUsers },
] as const
