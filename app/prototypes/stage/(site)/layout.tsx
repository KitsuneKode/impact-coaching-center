import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../../_kit/shell"
import { base, fontClass, themeCss, tokens } from "../_site"

export const metadata: Metadata = {
  title: { default: "Stage", template: "%s, Stage" },
}

export default function StageSiteLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      slug="stage"
      theme="stage"
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
