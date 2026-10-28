import { IconArrowRight } from "@tabler/icons-react"
import { useLocale, useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import {
  inLanguage,
  lowestPrice,
  type Language,
  type PublicBundle,
} from "@/lib/catalog"
import { formatPaise } from "@/lib/money"
import { Book3D, type BookTone } from "./book-3d"

const TONES: readonly BookTone[] = ["amber", "paper", "ink"]

/** ICT's book sets on the second blue field, each shown as its lead book. */
export function Books({ bundles }: { bundles: readonly PublicBundle[] }) {
  const t = useTranslations("Pulse")
  const shop = useTranslations("Shop")
  const language = useLocale() as Language
  if (!bundles.length) return null
  const samples = bundles.every((bundle) => bundle.sample)

  return (
    <section
      id="books"
      aria-labelledby="books-heading"
      className="pbe-20 md:pbe-28"
    >
      <div className="container-page">
        <div className="overflow-clip rounded-[40px] bg-primary ps-5 pe-5 pbs-12 pbe-12 text-white md:ps-12 md:pe-12 md:pbs-16 md:pbe-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 id="books-heading" className="type-display max-w-[16ch]">
                {t("booksHeading")}
              </h2>
              {samples ? (
                <p className="mbs-3 text-sm text-on-primary">
                  {t("booksSample")}
                </p>
              ) : null}
            </div>
            <Link
              href="/books"
              className="inline-flex items-center gap-1.5 font-semibold"
            >
              {shop("allSets")}
              <IconArrowRight aria-hidden size={18} stroke={2} />
            </Link>
          </div>
          <ul className="mbs-12 grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-4 md:gap-x-8">
            {bundles.slice(0, 4).map((bundle, i) => {
              const lead = bundle.books[0]
              const edition =
                lead?.editions[language] ??
                lead?.editions.en ??
                lead?.editions.as
              const price = lowestPrice(bundle)
              const title = inLanguage(bundle.title, language)
              return (
                <li key={bundle.slug} className="min-w-0">
                  <Link
                    data-book-open
                    href={`/books/${bundle.slug}`}
                    className="block"
                  >
                    <Book3D
                      title={edition?.title ?? title}
                      subtitle={edition?.subtitle}
                      exam={bundle.exam}
                      cover={edition?.cover}
                      pages={edition?.pages}
                      tone={TONES[i % TONES.length]}
                    />
                    <span className="mbs-4 block ps-1 pe-1 font-semibold text-balance sm:ps-[18px] sm:pe-[18px]">
                      {title}
                    </span>
                    <span className="flex items-center justify-between gap-2 ps-1 pe-1 text-sm text-on-primary sm:ps-[18px] sm:pe-[18px]">
                      <span className="tnum">
                        {price === null
                          ? shop("notAvailable")
                          : shop("fromPrice", { price: formatPaise(price) })}
                      </span>
                      <span
                        data-book-more
                        className="hidden items-center gap-1 text-highlight sm:inline-flex"
                      >
                        {t("lookInside")}
                        <IconArrowRight aria-hidden size={14} stroke={2} />
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
