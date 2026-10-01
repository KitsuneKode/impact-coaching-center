import type { Metadata } from "next"
import type { ReactNode } from "react"

import { GrandFooter } from "../_blocks/grand-footer"
import { KitShell } from "../_kit/shell"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Apogee", template: "%s, Apogee" },
}

export default function ApogeeLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      promos="modal"
      slug="apogee"
      theme="apogee"
      base={base}
      tokens={tokens}
      fontClass={fontClass}
      themeCss={themeCss}
      brand="Impact Career Tutorials"
      footer={<GrandFooter base={base} />}
    >
      {children}
    </KitShell>
  )
}
