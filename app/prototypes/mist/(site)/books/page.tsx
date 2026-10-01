import type { Metadata } from "next"

import { KitBooks } from "../../../_kit/books"
import { base } from "../../_site"

export const metadata: Metadata = { title: "Books" }

export default function Page() {
  return <KitBooks base={base} />
}
