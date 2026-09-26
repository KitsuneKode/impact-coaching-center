import type { Metadata } from "next"
import type { ReactNode } from "react"

// Sample content: never indexed, never in the sitemap.
export const metadata: Metadata = {
  title: { default: "Preview", template: "%s · Preview" },
  robots: { index: false, follow: false },
}

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return <main className="pt-24 md:pt-28">{children}</main>
}
