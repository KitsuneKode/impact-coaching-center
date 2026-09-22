import type { Metadata } from "next"
import type { ReactNode } from "react"

/**
 * Keeps a Person's own record out of search results.
 *
 * It lives in a layout because the page under it is a client component, which
 * cannot export `metadata` itself - the same reason `/admin` has one. `robots`
 * only ever narrows what `lib/site.ts` already allows, so this cannot make
 * anything more visible.
 *
 * This is not access control. The page refuses an anonymous caller itself and
 * `convex/authz.ts` refuses the data regardless; keeping the route unindexed
 * just stops it appearing in a search result for somebody who was never going
 * to get past that check.
 */
export const metadata: Metadata = {
  title: "Your details",
  robots: { index: false, follow: false },
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children
}
