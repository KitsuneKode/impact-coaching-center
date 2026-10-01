import type { Metadata } from "next"

import { KitNotes } from "../../../_kit/notes"
import { base } from "../../_site"

export const metadata: Metadata = { title: "Free notes" }

export default function Page() {
  return <KitNotes base={base} />
}
