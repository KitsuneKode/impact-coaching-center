import type { Metadata } from "next"

import { KitContact } from "../../_kit/contact"
import { KitIsland } from "../../_kit/island"
import { LampShell } from "../_chrome"
import { base, tokens } from "../_site"

export const metadata: Metadata = { title: "Contact" }

export default function Page() {
  return (
    <LampShell>
      <KitIsland theme="lamp" tokens={tokens}>
        <KitContact base={base} />
      </KitIsland>
    </LampShell>
  )
}
