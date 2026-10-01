import type { Metadata } from "next"

import { KitCourses } from "../../_kit/courses"
import { KitIsland } from "../../_kit/island"
import { LampShell } from "../_chrome"
import { base, tokens } from "../_site"

export const metadata: Metadata = { title: "Courses" }

export default function Page() {
  return (
    <LampShell>
      <KitIsland theme="lamp" tokens={tokens}>
        <KitCourses base={base} />
      </KitIsland>
    </LampShell>
  )
}
