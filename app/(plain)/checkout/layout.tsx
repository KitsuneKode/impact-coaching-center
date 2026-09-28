import type { Metadata } from "next"
import type { ReactNode } from "react"

/** A buyer's own order flow; not a page to index. */
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children
}
