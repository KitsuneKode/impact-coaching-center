import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../_kit/shell"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Meridian", template: "%s, Meridian" },
}

export default function MeridianLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      slug="meridian"
      theme="meridian"
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
