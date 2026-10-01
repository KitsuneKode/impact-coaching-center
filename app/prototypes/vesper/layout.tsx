import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../_kit/shell"
import { ChapterRail } from "./_client"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Vesper", template: "%s, Vesper" },
}

export default function VesperLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      promos="modal"
      slug="vesper"
      theme="vesper"
      base={base}
      tokens={tokens}
      fontClass={fontClass}
      themeCss={themeCss}
      brand="Impact Career Tutorials"
      decoration={<div aria-hidden data-vs-grain />}
    >
      <ChapterRail />
      <div data-vs-main>{children}</div>
    </KitShell>
  )
}
