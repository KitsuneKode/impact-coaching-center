"use client"

import { useTranslations } from "next-intl"

import { routing, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

import { useChooseLocale } from "./use-choose-locale"

/** Short labels for the switch: the language's own first letters. */
const short: Record<Locale, string> = { en: "EN", as: "অ" }

/** A two-way switch between English and Assamese. */
export function LocaleSwitch({ className }: { className?: string }) {
  const t = useTranslations("Language")
  const { current, choose, pending } = useChooseLocale()
  return (
    <fieldset
      aria-label={t("switch")}
      className={cn(
        "inline-flex items-center rounded-md bg-secondary p-0.5 text-sm",
        pending && "opacity-60",
        className
      )}
    >
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale === "as" ? "as-IN" : "en-IN"}
          aria-pressed={locale === current}
          aria-label={t(`name.${locale}`)}
          onClick={() => choose(locale)}
          className="h-8 min-w-9 rounded-[0.3rem] px-2 font-bold text-muted-foreground transition-colors duration-150 aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-frame"
        >
          {short[locale]}
        </button>
      ))}
    </fieldset>
  )
}
