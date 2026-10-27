import type { CSSProperties } from "react"

import { Book3D, type BookTone } from "@/components/home/book-3d"
import { Link } from "@/i18n/navigation"
import {
  inLanguage,
  type Language,
  type PublicBook,
  type PublicBundle,
} from "@/lib/catalog"

const TONES: readonly BookTone[] = ["amber", "paper", "ink"]

/**
 * Every book ICT prints, as volumes fanned up a diagonal (after the manga
 * changelog on vibrant.design): the whole library in one look before the
 * sets. Scrolling deals them out from one stack (CSS scroll-driven, where
 * supported); hovering lifts one and names its set; each opens its set.
 */
export function VolumeShelf({
  bundles,
  language,
  label,
}: {
  bundles: PublicBundle[]
  language: Language
  label: string
}) {
  // Each book once, with the first set it belongs to.
  const seen = new Set<string>()
  const volumes: { book: PublicBook; set: PublicBundle }[] = []
  for (const set of bundles)
    for (const book of set.books)
      if (!seen.has(book.slug)) {
        seen.add(book.slug)
        volumes.push({ book, set })
      }
  if (volumes.length < 3) return null
  const shown = volumes.slice(0, 10)

  return (
    <div className="container-page pbe-6">
      <ol
        data-shelf
        aria-label={label}
        style={{ "--n": shown.length } as CSSProperties}
      >
        {shown.map(({ book, set }, i) => {
          const edition =
            book.editions[language] ?? book.editions.en ?? book.editions.as
          const setName = inLanguage(set.title, language)
          return (
            <li
              key={book.slug}
              data-shelf-item
              style={{ "--i": i } as CSSProperties}
            >
              <Link href={`/books/${set.slug}`} data-shelf-link>
                <Book3D
                  title={edition?.title ?? ""}
                  subtitle={edition?.subtitle}
                  exam={book.exam}
                  cover={edition?.cover}
                  pages={edition?.pages}
                  tone={TONES[i % TONES.length]}
                />
                <span data-shelf-caption>
                  <span className="block font-semibold text-balance">
                    {edition?.title}
                  </span>
                  <span className="block text-muted-foreground">{setName}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
