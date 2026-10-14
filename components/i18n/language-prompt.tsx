"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { routing, localeNames, type Locale } from "@/i18n/routing"

import { ASKED_COOKIE, useChooseLocale } from "./use-choose-locale"

/** A line in each language, shown under its name so the choice reads itself. */
const samples: Record<Locale, string> = {
  en: "Read the site in English",
  as: "ৱেবছাইটটো অসমীয়াত পঢ়ক",
}

/**
 * Asks a first-time visitor which language to read in. Shown once: answering
 * or dismissing sets a cookie, and the header switch changes it later.
 */
export function LanguagePrompt() {
  const t = useTranslations("Language")
  const { current, choose } = useChooseLocale()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (document.cookie.includes(`${ASKED_COOKIE}=`)) return
    const timer = window.setTimeout(() => setOpen(true), 700)
    return () => window.clearTimeout(timer)
  }, [])

  function pick(locale: Locale) {
    setOpen(false)
    choose(locale)
  }

  /*
   * Non-modal and small, at the bottom of the screen: the question is asked
   * of every first visitor, so it must not hide the page they came for (a
   * centred modal also became the page's largest paint, delaying LCP). It
   * still takes focus once so keyboard and screen-reader users meet it.
   */
  return (
    <DialogPrimitive.Root
      modal={false}
      open={open}
      onOpenChange={(next) => {
        // Dismissing counts as keeping the current language.
        if (!next) pick(current)
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Popup data-language-prompt>
          <DialogPrimitive.Title className="font-semibold">
            {t("title")}{" "}
            <span className="font-normal text-muted-foreground" lang="as-IN">
              {t("titleOther")}
            </span>
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t("note")}
          </DialogPrimitive.Description>
          <div className="mbs-3 grid grid-cols-2 gap-2">
            {routing.locales.map((locale) => (
              <button
                key={locale}
                type="button"
                lang={locale === "as" ? "as-IN" : "en-IN"}
                onClick={() => pick(locale)}
                aria-label={samples[locale]}
                data-language-choice={locale === current ? "current" : ""}
                className="flex min-h-12 flex-col items-start justify-center rounded-2xl px-4 py-2 text-left"
              >
                <span className="font-semibold">{localeNames[locale]}</span>
                <span className="text-xs text-muted-foreground">
                  {samples[locale]}
                </span>
              </button>
            ))}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
