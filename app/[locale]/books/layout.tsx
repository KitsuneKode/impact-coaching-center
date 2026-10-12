import type { ReactNode } from "react"

import { ShopShell } from "@/components/commerce/shop-shell"

/** Every page under /books shares the cart sheet. Pages own their spacing. */
export default function BooksLayout({ children }: { children: ReactNode }) {
  return <ShopShell>{children}</ShopShell>
}
