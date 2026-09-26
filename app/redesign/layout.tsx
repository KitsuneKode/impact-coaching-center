import type { Metadata } from "next"
import type { ReactNode } from "react"

// Design concepts for review: never indexed, never in the sitemap.
export const metadata: Metadata = {
  title: { default: "Design concepts", template: "%s · Design concept" },
  robots: { index: false, follow: false },
}

export default function RedesignLayout({ children }: { children: ReactNode }) {
  return children
}
