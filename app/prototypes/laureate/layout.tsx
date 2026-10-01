import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../_kit/shell"
import { ModeRoot, ModeToggle } from "./_client"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Laureate", template: "%s, Laureate" },
}

export default function LaureateLayout({ children }: { children: ReactNode }) {
  return (
    <ModeRoot>
      <KitShell
        promos="modal"
        slug="laureate"
        theme="laureate"
        base={base}
        tokens={tokens}
        fontClass={fontClass}
        themeCss={themeCss}
        brand="Impact Career Tutorials"
        decoration={<div aria-hidden data-lr-rosette />}
        headerExtra={<ModeToggle />}
      >
        {children}
      </KitShell>
    </ModeRoot>
  )
}
