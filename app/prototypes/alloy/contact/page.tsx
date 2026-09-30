import type { Metadata } from "next"

import { KitContact } from "../../_kit/contact"
import { base } from "../_theme"

export const metadata: Metadata = { title: "Contact" }

export default function Page() {
  return <KitContact base={base} />
}
