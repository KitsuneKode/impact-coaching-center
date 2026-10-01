import type { Metadata } from "next"

import { KitPromos } from "../../../_kit/promos"
import { base } from "../../_site"

export const metadata: Metadata = { title: "Promotions kit" }

export default function Page() {
  return <KitPromos base={base} />
}
