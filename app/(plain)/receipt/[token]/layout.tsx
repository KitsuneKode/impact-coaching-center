import type { Metadata } from "next"
import type { ReactNode } from "react"

/** A receipt opened from WhatsApp: private, never indexed or followed. */
export const metadata: Metadata = {
  title: "Receipt",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

export default function SharedReceiptLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
