"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { routing, localeNames, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

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

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        // Dismissing counts as keeping the current language.
        if (!next) pick(current)
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(34rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-card p-6 shadow-lift transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] outline-none data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0 md:p-8">
          <DialogPrimitive.Title className="type-lead">
            <strong>{t("title")}</strong> {t("titleOther")}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
            {t("note")}
          </DialogPrimitive.Description>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {routing.locales.map((locale) => (
              <button
                key={locale}
                type="button"
                lang={locale === "as" ? "as-IN" : "en-IN"}
                onClick={() => pick(locale)}
                className={cn(
                  "group flex flex-col items-start rounded-control border p-4 text-left transition-[border-color,background-color,transform] duration-150 active:scale-[0.98]",
                  locale === current
                    ? "border-foreground bg-secondary"
                    : "border-border hover:border-foreground/40 hover:bg-secondary/60"
                )}
              >
                <span className="text-xl font-bold">{localeNames[locale]}</span>
                <span className="mt-1 text-sm text-muted-foreground">
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
