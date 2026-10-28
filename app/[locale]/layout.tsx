import type { Metadata } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import { DocumentLang } from "@/components/i18n/document-lang"
import { LanguagePrompt } from "@/components/i18n/language-prompt"
import { SiteChrome } from "@/components/marketing/site-chrome"
import { routing } from "@/i18n/routing"
import { alternatesFor, openGraphFor } from "@/lib/site"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Meta" })
  return {
    // Absolute: the root layout's template would add the name a second time.
    title: { absolute: t("title"), template: `%s | ${t("site")}` },
    description: t("description"),
    alternates: alternatesFor("/", locale),
    openGraph: openGraphFor("/", t("ogTitle"), t("ogDescription"), locale),
  }
}

/** Every public page, in English at / or Assamese at /as. */
export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <NextIntlClientProvider>
      <DocumentLang lang={locale === "as" ? "as-IN" : "en-IN"} />
      <div lang={locale === "as" ? "as-IN" : "en-IN"} className="contents">
        <SiteChrome entrance>{children}</SiteChrome>
        <LanguagePrompt />
      </div>
    </NextIntlClientProvider>
  )
}
