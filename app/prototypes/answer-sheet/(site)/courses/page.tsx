import type { Metadata } from "next"

import { KitCourses } from "../../../_kit/courses"
import { base } from "../../_site"

export const metadata: Metadata = { title: "Courses" }

export default function Page() {
  return <KitCourses base={base} />
}
