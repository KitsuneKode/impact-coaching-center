import type { Metadata } from "next"
import type { ReactNode } from "react"

/** Keeps a Person's own record out of search results. */
export const metadata: Metadata = {
  title: "Your details",
  robots: { index: false, follow: false },
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children
}
