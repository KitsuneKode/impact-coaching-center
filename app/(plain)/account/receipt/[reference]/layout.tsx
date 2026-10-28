import type { Metadata } from "next"
import type { ReactNode } from "react"

/** The tab says what is open, and the page stays out of search results. */
export const metadata: Metadata = {
  title: { absolute: "Receipt | Impact Career Tutorials" },
  robots: { index: false, follow: false },
}

export default function ReceiptLayout({ children }: { children: ReactNode }) {
  return children
}
