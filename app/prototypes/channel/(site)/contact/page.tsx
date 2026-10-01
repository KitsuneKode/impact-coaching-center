import type { Metadata } from "next"

import { KitContact } from "../../../_kit/contact"
import { base } from "../../_site"

export const metadata: Metadata = { title: "Contact" }

export default function Page() {
  return <KitContact base={base} />
}
