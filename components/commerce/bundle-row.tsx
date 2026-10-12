import { IconArrowRight } from "@tabler/icons-react"
import { useLocale, useTranslations } from "next-intl"
import type { CSSProperties } from "react"

import { Book3D, type BookTone } from "@/components/home/book-3d"
import { Link } from "@/i18n/navigation"
import {
  inLanguage,
  LANGUAGES,
  type Language,
  type PublicBundle,
} from "@/lib/catalog"
import { formatPaise } from "@/lib/money"

const TONES: readonly BookTone[] = ["amber", "paper", "ink"]

/**
 * A set as a wide card: its books standing fanned on a blue stage, then the
 * name, the books by title, and a price per language with its availability.
 */
export function BundleRow({ bundle }: { bundle: PublicBundle }) {
  const t = useTranslations("Pulse")
  const shop = useTranslations("Shop")
  const language = useLocale() as Language
  const books = bundle.books.slice(0, 3)
  const title = inLanguage(bundle.title, language)

  return (
    <Link
      href={`/books/${bundle.slug}`}
      data-row-card
      data-book-open
      className="grid overflow-clip md:grid-cols-12"
    >
      <span
        data-set-stage
        className="relative grid min-h-72 place-items-center p-8 md:col-span-5"
      >
        {books.map((book, i) => {
          const edition =
            book.editions[language] ?? book.editions.en ?? book.editions.as
          const offset = i - (books.length - 1) / 2
          return (
            <span
              key={book.slug}
              data-set-book
              style={
                {
                  "--offset": offset,
                  "--abs": Math.abs(offset),
                } as CSSProperties
              }
            >
              <Book3D
                title={edition?.title ?? title}
                subtitle={edition?.subtitle}
                exam={book.exam}
                cover={edition?.cover}
                pages={edition?.pages}
                tone={TONES[i % TONES.length]}
              />
            </span>
          )
        })}
      </span>
      <span className="flex flex-col gap-5 p-6 md:col-span-7 md:p-9">
        <span>
          <span className="block text-sm text-muted-foreground">
            {[
              shop("booksInSet", { count: bundle.books.length }),
              bundle.soldCount > 0
                ? shop("sold", { count: bundle.soldCount })
                : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <span className="mbs-2 block font-display text-2xl font-semibold tracking-[-0.02em] text-balance md:text-3xl">
            {title}
          </span>
          {bundle.tagline ? (
            <span className="mbs-2 block text-muted-foreground">
              {inLanguage(bundle.tagline, language)}
            </span>
          ) : null}
        </span>
        <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {bundle.books.map((book) => {
            const edition =
              book.editions[language] ?? book.editions.en ?? book.editions.as
            return (
              <span key={book.slug} className="text-muted-foreground">
                {edition?.title}
              </span>
            )
          })}
        </span>
        <span className="mbs-auto flex flex-wrap items-end justify-between gap-4">
          <span className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => {
              const variant = bundle.variants[l]
              return (
                <span
                  key={l}
                  data-set-price
                  data-off={variant.available ? undefined : ""}
                  className="tnum inline-flex flex-col rounded-2xl ps-4 pe-4 pbs-2 pbe-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {l === "as" ? shop("assameseSet") : shop("englishSet")}
                  </span>
                  {variant.available ? (
                    <span className="font-display text-lg font-semibold">
                      {formatPaise(variant.pricePaise)}
                    </span>
                  ) : (
                    <span className="pbs-1 text-sm font-medium">
                      {shop("notAvailable")}
                    </span>
                  )}
                </span>
              )
            })}
          </span>
          <span className="inline-flex items-center gap-3 font-semibold">
            {t("seeSet")}
            <span
              data-row-go
              className="grid size-11 place-items-center rounded-full"
            >
              <IconArrowRight aria-hidden size={18} stroke={2} />
            </span>
          </span>
        </span>
      </span>
    </Link>
  )
}
