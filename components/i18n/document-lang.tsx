"use client"

import { useEffect } from "react"

/**
 * The root layout serves both languages and cannot know which one a page is
 * in, so the page's language is set on <html> here. The locale layout also
 * wraps its content in an element with the right `lang` for the first paint.
 */
export function DocumentLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  return null
}
