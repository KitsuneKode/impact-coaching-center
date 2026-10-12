import { useLocale, useTranslations } from "next-intl"

import { BookCover } from "@/components/commerce/book-cover"
import { Link } from "@/i18n/navigation"
import {
  inLanguage,
  LANGUAGES,
  type Language,
  type PublicBundle,
} from "@/lib/catalog"
import { formatPaise } from "@/lib/money"

const tones = ["primary", "highlight", "muted"] as const

/** The cheapest set that can be bought today, or null when none can. */
export function lowestPrice(bundle: PublicBundle) {
  const prices = LANGUAGES.flatMap((language) =>
    bundle.variants[language].available
      ? [bundle.variants[language].pricePaise]
      : []
  )
  return prices.length ? Math.min(...prices) : null
}

/** A set on the shelf: its books fanned out, title, price and how many sold. */
export function BundleCard({ bundle }: { bundle: PublicBundle }) {
  const t = useTranslations("Shop")
  const language = useLocale() as Language
  const title = inLanguage(bundle.title, language)
  const price = lowestPrice(bundle)
  const covers = bundle.books.slice(0, 3)

  return (
    <article className="group grid gap-4">
      <Link
        href={`/books/${bundle.slug}`}
        className="grid gap-4 rounded-card outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-card bg-surface">
          {covers.map((book, i) => {
            const edition =
              book.editions[language] ?? book.editions.en ?? book.editions.as
            const offset = i - (covers.length - 1) / 2
            return (
              <span
                key={book.slug}
                className="absolute w-[32%] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:group-hover:[transform:translateX(calc(var(--x)*1.25))_rotate(calc(var(--r)*1.4))]"
                style={
                  {
                    "--x": `${offset * 46}%`,
                    "--r": `${offset * 6}deg`,
                    transform: `translateX(${offset * 46}%) rotate(${offset * 6}deg)`,
                    zIndex: 3 - Math.abs(offset),
                  } as React.CSSProperties
                }
              >
                <BookCover
                  title={edition?.title ?? title}
                  exam={book.exam}
                  tone={tones[i % tones.length]}
                  cover={edition?.cover}
                  size="sm"
                />
              </span>
            )
          })}
        </span>
        <span className="grid gap-1">
          <span className="text-xs text-muted-foreground">
            {t("booksInSet", { count: bundle.books.length })}
          </span>
          <span className="font-medium text-balance group-hover:underline">
            {title}
          </span>
          {bundle.tagline ? (
            <span className="text-sm text-pretty text-muted-foreground">
              {inLanguage(bundle.tagline, language)}
            </span>
          ) : null}
        </span>
      </Link>
      <p className="tnum flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">
          {price === null
            ? t("notAvailable")
            : t("fromPrice", { price: formatPaise(price) })}
        </span>
        {bundle.soldCount > 0 ? (
          <span className="text-muted-foreground">
            {t("sold", { count: bundle.soldCount })}
          </span>
        ) : null}
      </p>
    </article>
  )
}
