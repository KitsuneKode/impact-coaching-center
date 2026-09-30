import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../_kit/shell"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Sovereign", template: "%s, Sovereign" },
}

export default function SovereignLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      slug="sovereign"
      theme="sovereign"
      base={base}
      tokens={tokens}
      fontClass={fontClass}
      themeCss={themeCss}
      brand="Impact Career Tutorials"
      decoration={<div aria-hidden data-sv-rosette />}
    >
      {children}
    </KitShell>
  )
}
