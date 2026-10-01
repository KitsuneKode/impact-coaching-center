import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../../_kit/shell"
import { base, fontClass, themeCss, tokens } from "../_site"

export const metadata: Metadata = {
  title: { default: "Sandhya", template: "%s, Sandhya" },
}

export default function SandhyaSiteLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <KitShell
      slug="sandhya"
      theme="sandhya"
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
