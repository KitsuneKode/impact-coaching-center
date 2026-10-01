import type { Metadata } from "next"

import { KitAssist } from "../../../_kit/assist"
import { base } from "../../_site"

export const metadata: Metadata = { title: "ASSIST scholarship test" }

export default function Page() {
  return <KitAssist base={base} />
}
