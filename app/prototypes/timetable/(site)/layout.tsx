import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../../_kit/shell"
import { base, fontClass, themeCss, tokens } from "../_site"

export const metadata: Metadata = {
  title: { default: "Timetable", template: "%s, Timetable" },
}

export default function TimetableSiteLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <KitShell
      slug="timetable"
      theme="timetable"
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
