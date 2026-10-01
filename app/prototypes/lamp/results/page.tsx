import type { Metadata } from "next"

import { KitResults } from "../../_kit/results"
import { KitIsland } from "../../_kit/island"
import { LampShell } from "../_chrome"
import { base, tokens } from "../_site"

export const metadata: Metadata = { title: "Results" }

export default function Page() {
  return (
    <LampShell>
      <KitIsland theme="lamp" tokens={tokens}>
        <KitResults base={base} />
      </KitIsland>
    </LampShell>
  )
}
