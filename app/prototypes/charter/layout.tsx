import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../_kit/shell"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Charter", template: "%s, Charter" },
}

export default function CharterLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      promos="modal"
      slug="charter"
      theme="charter"
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
