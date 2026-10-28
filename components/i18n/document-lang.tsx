"use client"

import { useEffect } from "react"

import { InlineScript } from "@/components/site/inline-script"

/**
 * The root layout serves both languages and cannot know which one a page is
 * in, so the page's language is set on <html> here, as early as possible:
 * an inline script in the server HTML sets it while the page is still being
 * parsed (Chrome decides whether to offer translation from that, and its
 * detector has no Assamese, so without `as` it guesses Bengali), and the
 * effect keeps it right when the language is switched without a reload.
 * The locale layout also wraps its content in an element with the same
 * `lang`, which screen readers and translators honour with no script at all.
 */
export function DocumentLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  return (
    <InlineScript
      code={`document.documentElement.lang=${JSON.stringify(lang)}`}
    />
  )
}
