"use client"

import { useLocale } from "next-intl"
import { useTransition } from "react"

import { usePathname, useRouter } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"

const YEAR = 60 * 60 * 24 * 365
/** Set once the reader has answered the language question, either way. */
export const ASKED_COOKIE = "ict-lang-asked"

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${YEAR}; samesite=lax`
}

/** Remember a language and move the current page into it. */
export function useChooseLocale() {
  const current = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const [pending, start] = useTransition()

  function choose(next: Locale) {
    setCookie("ict-lang", next)
    setCookie(ASKED_COOKIE, "1")
    if (next === current) return
    start(() => {
      router.replace(
        // keep the query string and the section the reader was on
        `${pathname}${window.location.search}${window.location.hash}`,
        { locale: next, scroll: false }
      )
    })
  }

  return { current, choose, pending }
}
