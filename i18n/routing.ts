import { defineRouting } from "next-intl/routing"

/**
 * English at today's URLs, Assamese under /as. The cookie remembers the
 * reader's choice so a returning Assamese reader lands on /as.
 */
export const routing = defineRouting({
  locales: ["en", "as"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeCookie: { name: "ict-lang", maxAge: 60 * 60 * 24 * 365 },
})

export type Locale = (typeof routing.locales)[number]

/** How each language names itself, for the dialog and the switch. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  as: "অসমীয়া",
}
