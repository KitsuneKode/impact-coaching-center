import type { Metadata } from "next"

import { KitAssist } from "../../_kit/assist"
import { KitIsland } from "../../_kit/island"
import { LampShell } from "../_chrome"
import { base, tokens } from "../_site"

export const metadata: Metadata = { title: "ASSIST scholarship test" }

export default function Page() {
  return (
    <LampShell>
      <KitIsland theme="lamp" tokens={tokens}>
        <KitAssist base={base} />
      </KitIsland>
    </LampShell>
  )
}
