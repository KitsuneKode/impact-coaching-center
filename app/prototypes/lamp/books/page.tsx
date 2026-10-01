import type { Metadata } from "next"

import { KitBooks } from "../../_kit/books"
import { KitIsland } from "../../_kit/island"
import { LampShell } from "../_chrome"
import { base, tokens } from "../_site"

export const metadata: Metadata = { title: "Books" }

export default function Page() {
  return (
    <LampShell>
      <KitIsland theme="lamp" tokens={tokens}>
        <KitBooks base={base} />
      </KitIsland>
    </LampShell>
  )
}
