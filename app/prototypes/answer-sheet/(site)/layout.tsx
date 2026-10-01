import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../../_kit/shell"
import { base, fontClass, themeCss, tokens } from "../_site"

export const metadata: Metadata = {
  title: { default: "Answer sheet", template: "%s, Answer sheet" },
}

export default function AnswerSheetSiteLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <KitShell
      slug="answer-sheet"
      theme="answer-sheet"
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
