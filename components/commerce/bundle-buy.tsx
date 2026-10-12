"use client"

import { IconBook } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { AddToCart } from "@/components/commerce/add-to-cart"
import { BookCover } from "@/components/commerce/book-cover"
import { PageViewer, type ViewerPage } from "@/components/commerce/page-viewer"
import { useOpenCart } from "@/components/commerce/shop-shell"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  inLanguage,
  LANGUAGES,
  type Language,
  type PublicBook,
  type PublicBundle,
} from "@/lib/catalog"
import { formatPaise } from "@/lib/money"

const tones = ["primary", "highlight", "muted"] as const

/** Sample pages of one edition, or blank sheets for a placeholder title. */
function pagesOf(book: PublicBook, language: Language, sample: boolean) {
  const edition = book.editions[language]
  if (edition?.samplePages.length)
    return edition.samplePages.map((page): ViewerPage => ({ src: page.url }))
  if (!sample) return []
  return [
    { heading: "Contents" },
    { heading: edition?.title ?? "" },
    { heading: edition?.title ?? "" },
  ]
}

/**
 * Choose English or Assamese, see that set's price and books, add it to the
 * cart, and read any book's sample pages. The visitor always picks the
 * language; the page language only suggests it.
 */
export function BundleBuy({
  bundle,
  initialLanguage,
}: {
  bundle: PublicBundle
  initialLanguage: Language
}) {
  const t = useTranslations("Shop")
  const openCart = useOpenCart()
  const [language, setLanguage] = useState<Language>(() =>
    bundle.variants[initialLanguage].available
      ? initialLanguage
      : (LANGUAGES.find((l) => bundle.variants[l].available) ?? initialLanguage)
  )
  const [reading, setReading] = useState<PublicBook | null>(null)
  const variant = bundle.variants[language]
  const label = language === "as" ? t("assameseSet") : t("englishSet")
  const title = inLanguage(bundle.title, language)

  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <p className="text-sm font-medium" id="set-language">
          {t("chooseSet")}
        </p>
        <ToggleGroup
          value={[language]}
          onValueChange={(value) =>
            value[0] && setLanguage(value[0] as Language)
          }
          aria-labelledby="set-language"
          className="w-fit"
        >
          {LANGUAGES.map((l) => (
            <ToggleGroupItem key={l} value={l} className="px-4">
              {l === "as" ? t("assameseSet") : t("englishSet")}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid gap-4">
        <p className="tnum flex flex-wrap items-baseline gap-3">
          <span className="font-display text-4xl">
            {formatPaise(variant.pricePaise)}
          </span>
          {variant.comparePaise ? (
            <s className="text-lg text-muted-foreground">
              {formatPaise(variant.comparePaise)}
            </s>
          ) : null}
        </p>
        {variant.available ? (
          <AddToCart
            slug={bundle.slug}
            language={language}
            title={t("setOf", { set: title, language: label })}
            onOpenCart={openCart}
            size="lg"
            className="w-fit"
          />
        ) : (
          <p className="text-sm text-muted-foreground">{t("notAvailable")}</p>
        )}
      </div>

      <div className="grid gap-4">
        <h2 className="font-medium">{t("insideSet")}</h2>
        <ul className="grid gap-3">
          {bundle.books.map((book, i) => {
            const edition = book.editions[language]
            const pages = pagesOf(book, language, bundle.sample)
            return (
              <li
                key={book.slug}
                className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 rounded-card border border-border p-3"
              >
                <BookCover
                  title={edition?.title ?? ""}
                  exam={book.exam}
                  tone={tones[i % tones.length]}
                  cover={edition?.cover}
                  size="sm"
                />
                <span className="grid gap-0.5">
                  <span className="font-medium text-balance">
                    {edition?.title}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {[
                      edition?.edition,
                      edition ? t("pages", { count: edition.pages }) : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                {pages.length ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setReading(book)}
                  >
                    <IconBook stroke={1.75} aria-hidden />
                    {t("readSample")}
                  </Button>
                ) : (
                  <span />
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <PageViewer
        open={reading !== null}
        onOpenChange={(open) => !open && setReading(null)}
        title={reading?.editions[language]?.title ?? ""}
        note={
          reading?.editions[language]?.samplePages.length
            ? t("samplePages", {
                count: reading.editions[language]!.samplePages.length,
              })
            : t("placeholderBookPages")
        }
        pages={reading ? pagesOf(reading, language, bundle.sample) : []}
      />
    </div>
  )
}
