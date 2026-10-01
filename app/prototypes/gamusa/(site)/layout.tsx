import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../../_kit/shell"
import { base, fontClass, themeCss, tokens } from "../_site"

export const metadata: Metadata = {
  title: { default: "Gamusa", template: "%s, Gamusa" },
}

export default function GamusaSiteLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <KitShell
      slug="gamusa"
      theme="gamusa"
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
