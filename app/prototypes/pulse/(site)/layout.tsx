import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../../_kit/shell"
import { base, fontClass, themeCss, tokens } from "../_site"

export const metadata: Metadata = {
  title: { default: "Pulse", template: "%s, Pulse" },
}

export default function PulseSiteLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      slug="pulse"
      theme="pulse"
      base={base}
      tokens={tokens}
      fontClass={fontClass}
      themeCss={themeCss}
      brand="Impact Career Tutorials"
    >
      {children}
    </KitShell>
  )
}
