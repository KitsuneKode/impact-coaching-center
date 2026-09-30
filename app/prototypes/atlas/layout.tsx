import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../_kit/shell"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Atlas", template: "%s, Atlas" },
}

export default function AtlasLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      slug="atlas"
      theme="atlas"
      base={base}
      tokens={tokens}
      fontClass={fontClass}
      themeCss={themeCss}
      brand="Impact Career Tutorials"
      decoration={
        <div aria-hidden data-at-contours>
          <i />
          <i />
          <i />
        </div>
      }
    >
      {children}
    </KitShell>
  )
}
