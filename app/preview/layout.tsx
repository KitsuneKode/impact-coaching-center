import type { Metadata } from "next"
import type { ReactNode } from "react"

import { PreviewShell } from "@/components/commerce/preview-shell"

// Sample content: never indexed, never in the sitemap.
export const metadata: Metadata = {
  title: { default: "Preview", template: "%s · Preview" },
  robots: { index: false, follow: false },
}

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <main>
      <PreviewShell>{children}</PreviewShell>
    </main>
  )
}
