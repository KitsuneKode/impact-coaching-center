import type { Metadata } from "next"

import { KitResults } from "../../../_kit/results"
import { base } from "../../_site"

export const metadata: Metadata = { title: "Results" }

export default function Page() {
  return <KitResults base={base} />
}
