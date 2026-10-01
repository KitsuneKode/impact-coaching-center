import type { Metadata } from "next"

import { KitExams } from "../../../_kit/exams"
import { base } from "../../_site"

export const metadata: Metadata = { title: "Exams" }

export default function Page() {
  return <KitExams base={base} />
}
