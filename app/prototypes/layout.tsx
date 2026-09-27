import type { Metadata } from "next"
import type { ReactNode } from "react"

// Landing-page prototypes for review: never indexed, never in the sitemap.
export const metadata: Metadata = {
  title: { default: "Landing prototypes", template: "%s · Prototype" },
  robots: { index: false, follow: false },
}

export default function PrototypesLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
