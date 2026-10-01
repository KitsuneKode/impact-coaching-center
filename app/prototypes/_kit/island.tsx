import type { CSSProperties, ReactNode } from "react"

import { bookCss } from "../_book"
import {
  enquiryCss,
  examGuideCss,
  folderBrowserCss,
  mobileMenuCss,
  promoCss,
} from "../_block-css"
import { folderCss } from "../_folder"
import { kitCss } from "./css"

/**
 * A patch of the kit's blocks (promotions, books, free notes, enquiry form)
 * inside a page that has its own look. The page passes the `--k-*` tokens for
 * its palette; the blocks read them exactly as they do inside `KitShell`.
 */
export function KitIsland({
  theme,
  tokens,
  children,
}: {
  theme: string
  tokens: CSSProperties
  children: ReactNode
}) {
  return (
    <div data-kit data-theme={theme} style={tokens}>
      <style>
        {kitCss +
          bookCss +
          folderCss +
          examGuideCss +
          enquiryCss +
          folderBrowserCss +
          mobileMenuCss +
          promoCss}
      </style>
      {children}
    </div>
  )
}
