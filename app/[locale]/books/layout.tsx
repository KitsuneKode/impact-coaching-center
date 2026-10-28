import type { ReactNode } from "react"

/* The cart sheet is site-wide (SiteChrome); pages own their spacing. */
export default function BooksLayout({ children }: { children: ReactNode }) {
  return children
}
