import type { Metadata } from "next"
import type { ReactNode } from "react"

import { KitShell } from "../../_kit/shell"
import { base, fontClass, themeCss, tokens } from "../_site"

export const metadata: Metadata = {
  title: { default: "Channel", template: "%s, Channel" },
}

export default function ChannelSiteLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <KitShell
      slug="channel"
      theme="channel"
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
