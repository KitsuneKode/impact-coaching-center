import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../../_kit/shell"
import { base, fontClass, themeCss, tokens } from "../_site"

export const metadata: Metadata = {
  title: { default: "Season", template: "%s, Season" },
}

export default function SeasonSiteLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <KitShell
      slug="season"
      theme="season"
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
