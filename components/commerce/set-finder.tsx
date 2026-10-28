"use client"

import { IconBooks, IconSearch, IconX } from "@tabler/icons-react"
import { useLocale, useTranslations } from "next-intl"
import { useDeferredValue, useState } from "react"

import { BundleRow } from "@/components/commerce/bundle-row"
import { Reveal } from "@/components/motion/reveal"
import { inLanguage, type Language, type PublicBundle } from "@/lib/catalog"
import { normalise, searchScore } from "@/lib/search-match"

export type SetGroup = {
  /** Anchor id, from the exam. */
  id: string
  /** The exam as this page's language says it. */
  label: string
  bundles: PublicBundle[]
}

/** Every word a set can be found by: both titles, its exam, every book in both languages. */
function wordsOf(bundle: PublicBundle, examLabel: string) {
  return [
    bundle.title.en,
    bundle.title.as ?? "",
    bundle.tagline?.en ?? "",
    bundle.tagline?.as ?? "",
    bundle.exam,
    examLabel,
    ...bundle.books.flatMap((book) => [
      book.editions.en?.title ?? "",
      book.editions.as?.title ?? "",
      book.editions.en?.subtitle ?? "",
      book.editions.as?.subtitle ?? "",
    ]),
  ].filter(Boolean)
}

/** The titles of a set's books that the query names, in this page's language. */
function booksMatching(
  bundle: PublicBundle,
  query: string,
  language: Language
) {
  const q = normalise(query)
  if (!q) return []
  return bundle.books.flatMap((book) => {
    const titles = [book.editions.en?.title, book.editions.as?.title]
    if (!titles.some((title) => title && normalise(title).includes(q)))
      return []
    const shown =
      book.editions[language]?.title ?? book.editions.en?.title ?? ""
    return shown ? [shown] : []
  })
}

/**
 * Opens the site search the same way Ctrl+K does (components/site/site-search.tsx
 * listens on the document). Sent from the body, an element, because that
 * listener asks the target whether it is a text field.
 */
function openSiteSearch() {
  document.body.dispatchEvent(
    new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
  )
}

/**
 * The sets, grouped by exam, with a search over them: a set is found by its
 * name, its exam, or the name of any book in it ("polity" finds the set
 * that holds Polity in Focus), in English or Assamese. Matching is the
 * site search's own, so the two never disagree.
 */
export function SetFinder({ groups }: { groups: SetGroup[] }) {
  const t = useTranslations("Shop")
  const language = useLocale() as Language
  const [query, setQuery] = useState("")
  const typed = useDeferredValue(query.trim())

  const shown = groups
    .map((group) => ({
      ...group,
      bundles: group.bundles
        .map((bundle) => ({
          bundle,
          score: searchScore(
            inLanguage(bundle.title, language),
            typed,
            wordsOf(bundle, group.label)
          ),
        }))
        .filter((row) => row.score > 0)
        .sort((a, b) => (typed ? b.score - a.score : 0))
        .map((row) => row.bundle),
    }))
    .filter((group) => group.bundles.length)
  const sets = shown.reduce((n, group) => n + group.bundles.length, 0)
  const books = new Set(
    shown.flatMap((group) =>
      group.bundles.flatMap((bundle) => bundle.books.map((book) => book.slug))
    )
  ).size

  return (
    <>
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pbe-8">
        <label data-notes-search className="sm:order-2">
          <IconSearch aria-hidden size={18} stroke={1.75} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("")
            }}
            placeholder={t("searchSets")}
            aria-label={t("searchSetsLabel")}
            aria-controls="set-results"
            // Our own clear button below works in every browser.
            className="[&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("clearSearch")}
              className="-me-2 grid size-8 flex-none place-items-center rounded-full hover:bg-secondary"
            >
              <IconX aria-hidden size={16} stroke={2} />
            </button>
          ) : null}
        </label>
        <p aria-live="polite" className="tnum text-sm text-muted-foreground">
          {typed
            ? t("setsMatched", { count: sets, query: typed })
            : t("setsShown", { shown: sets, books })}
        </p>
      </div>

      <div id="set-results">
        {shown.length ? (
          shown.map((group) => (
            <section
              key={group.id}
              id={group.id}
              aria-labelledby={`${group.id}-heading`}
              className="container-page pbe-16"
            >
              <h2
                id={`${group.id}-heading`}
                className="flex items-baseline gap-3 font-display text-xl font-semibold"
              >
                {group.label}
                <span className="tnum text-sm font-normal text-muted-foreground">
                  {t("setCount", { count: group.bundles.length })}
                </span>
              </h2>
              <ul className="mbs-6 grid gap-6">
                {group.bundles.map((bundle, i) => (
                  <li key={bundle.slug}>
                    <Reveal delay={typed ? 0 : i * 0.05}>
                      <BundleRow
                        bundle={bundle}
                        matched={booksMatching(bundle, typed, language)}
                      />
                    </Reveal>
                  </li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <div className="container-page grid justify-items-center gap-3 pbe-20 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground">
              <IconBooks aria-hidden size={24} stroke={1.5} />
            </span>
            <p className="font-semibold">{t("noSetMatch", { query: typed })}</p>
            <p className="max-w-[44ch] text-sm text-pretty text-muted-foreground">
              {t("noSetMatchNote")}
            </p>
            <div className="mbs-2 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                data-press
                data-chip
                onClick={() => setQuery("")}
                className="inline-flex h-11 items-center rounded-full ps-5 pe-5 text-sm font-semibold"
              >
                {t("clearSearch")}
              </button>
              <button
                type="button"
                data-press
                data-chip
                onClick={openSiteSearch}
                className="inline-flex h-11 items-center gap-2 rounded-full ps-5 pe-5 text-sm font-semibold"
              >
                <IconSearch aria-hidden size={16} stroke={1.75} />
                {t("searchEverything")}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
