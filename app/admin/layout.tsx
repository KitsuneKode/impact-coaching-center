import type { Metadata } from "next"
import type { ReactNode } from "react"

/**
 * Keeps the whole admin area out of search results.
 *
 * It lives in a layout because the pages under it are client components,
 * which cannot export `metadata` themselves. `robots` only ever narrows what
 * `lib/site.ts` already allows, so this cannot make anything more visible.
 *
 * This is not access control - `convex/leads.ts` refuses a non-staff caller
 * itself. Keeping the route unindexed just stops it turning up in a search
 * result for someone who was never going to get past that check anyway.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children
}
