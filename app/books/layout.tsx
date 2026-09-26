import type { ReactNode } from "react"

import { ShopShell } from "@/components/commerce/shop-shell"

export default function BooksLayout({ children }: { children: ReactNode }) {
  return (
    <main className="pt-24 md:pt-28">
      <ShopShell>{children}</ShopShell>
    </main>
  )
}
