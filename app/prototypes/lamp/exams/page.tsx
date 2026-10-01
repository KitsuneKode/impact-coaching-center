import type { Metadata } from "next"

import { KitExams } from "../../_kit/exams"
import { KitIsland } from "../../_kit/island"
import { LampShell } from "../_chrome"
import { base, tokens } from "../_site"

export const metadata: Metadata = { title: "Exams" }

export default function Page() {
  return (
    <LampShell>
      <KitIsland theme="lamp" tokens={tokens}>
        <KitExams base={base} />
      </KitIsland>
    </LampShell>
  )
}
