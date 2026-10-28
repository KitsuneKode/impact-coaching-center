import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"

import en from "@/messages/en.json"

import { routing } from "./routing"

type Messages = { [key: string]: unknown }

/** Assamese over English, so an untranslated key falls back, never shows raw. */
function over(base: Messages, top: Messages): Messages {
  const out: Messages = { ...base }
  for (const [key, value] of Object.entries(top)) {
    const under = base[key]
    out[key] =
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      under &&
      typeof under === "object" &&
      !Array.isArray(under)
        ? over(under as Messages, value as Messages)
        : value
  }
  return out
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale
  const messages =
    locale === "en"
      ? en
      : over(
          en as Messages,
          (await import(`@/messages/${locale}.json`)).default as Messages
        )
  return { locale, messages, timeZone: "Asia/Kolkata" }
})
