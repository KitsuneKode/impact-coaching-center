"use client"

import {
  IconArrowLeft,
  IconBook,
  IconChevronLeft,
  IconChevronRight,
  IconShieldCheck,
  IconTruckDelivery,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"

import { AddToCart } from "@/components/commerce/add-to-cart"
import { PageViewer } from "@/components/commerce/lazy-page-viewer"
import type { ViewerPage } from "@/components/commerce/page-viewer"
import { ShopCartButton, useOpenCart } from "@/components/commerce/shop-shell"
import { Book3D, type BookTone } from "@/components/home/book-3d"
import { Link } from "@/i18n/navigation"
import {
  inLanguage,
  LANGUAGES,
  type Language,
  type PublicBook,
  type PublicBundle,
} from "@/lib/catalog"
import { formatPaise } from "@/lib/money"

const TONES: readonly BookTone[] = ["amber", "paper", "ink"]

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
 * A set's page: the blue hero with its buy card, then its books as a
 * coverflow the visitor swipes through. The language the visitor picks drives
 * both the price and which edition of each book is shown.
 */
export function SetView({
  bundle,
  initialLanguage,
  examLabel,
}: {
  bundle: PublicBundle
  initialLanguage: Language
  examLabel: string
}) {
  const t = useTranslations("Shop")
  const pulse = useTranslations("Pulse")
  const openCart = useOpenCart()
  const [language, setLanguage] = useState<Language>(() =>
    bundle.variants[initialLanguage].available
      ? initialLanguage
      : (LANGUAGES.find((l) => bundle.variants[l].available) ?? initialLanguage)
  )
  const [reading, setReading] = useState<PublicBook | null>(null)
  const variant = bundle.variants[language]
  const title = inLanguage(bundle.title, language)
  const setName = (l: Language) =>
    l === "as" ? t("assameseSet") : t("englishSet")

  return (
    <>
      <section data-hero="blue" aria-labelledby="set-heading">
        <div data-hero-glow aria-hidden />
        <div aria-hidden className="h-(--header-height)" />
        <div className="relative container-page grid gap-10 pbs-8 pbe-14 lg:grid-cols-12 lg:items-end lg:gap-14 lg:pbe-20">
          <div className="lg:col-span-7">
            <Link
              href="/books"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm text-on-primary"
            >
              <IconArrowLeft aria-hidden size={16} />
              {t("allSets")}
            </Link>
            <p className="mbs-6 text-sm text-on-primary">
              {[
                examLabel,
                t("booksInSet", { count: bundle.books.length }),
                bundle.soldCount > 0
                  ? t("sold", { count: bundle.soldCount })
                  : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h1
              id="set-heading"
              data-rise
              className="mbs-3 font-display text-[clamp(2.1rem,1.475rem+3.13vw,3.9rem)] leading-[1.04] font-semibold tracking-[-0.04em] text-balance"
            >
              {title}
            </h1>
            {bundle.tagline ? (
              <p className="mbs-5 max-w-[46ch] text-lg text-on-primary">
                {inLanguage(bundle.tagline, language)}
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[28px] bg-card p-6 text-foreground shadow-lift md:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{t("chooseSet")}</p>
                <ShopCartButton />
              </div>
              <fieldset className="mbs-3 grid grid-cols-2 gap-2">
                <legend className="sr-only">{t("chooseSet")}</legend>
                {LANGUAGES.map((l) => {
                  const v = bundle.variants[l]
                  return (
                    <label
                      key={l}
                      data-language-option
                      className="grid cursor-pointer gap-0.5 rounded-2xl p-3"
                    >
                      <input
                        type="radio"
                        name="set-language"
                        value={l}
                        checked={language === l}
                        onChange={() => setLanguage(l)}
                        className="sr-only"
                      />
                      <span className="text-xs text-muted-foreground">
                        {setName(l)}
                      </span>
                      <span className="tnum font-display text-lg font-semibold">
                        {v.available
                          ? formatPaise(v.pricePaise)
                          : t("notAvailable")}
                      </span>
                    </label>
                  )
                })}
              </fieldset>
              <p className="tnum mbs-5 flex items-baseline gap-3">
                <span
                  key={language}
                  data-swap
                  className="flex items-baseline gap-3"
                >
                  <span className="font-display text-4xl font-semibold">
                    {formatPaise(variant.pricePaise)}
                  </span>
                  {variant.comparePaise ? (
                    <s className="text-lg text-muted-foreground">
                      {formatPaise(variant.comparePaise)}
                    </s>
                  ) : null}
                </span>
              </p>
              <div className="mbs-5">
                {variant.available ? (
                  <AddToCart
                    slug={bundle.slug}
                    language={language}
                    title={t("setOf", {
                      set: title,
                      language: setName(language),
                    })}
                    onOpenCart={openCart}
                    size="lg"
                    className="w-full rounded-full"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("notAvailable")}
                  </p>
                )}
              </div>
              {/* How it is paid for and how it arrives, before the click. */}
              <ul className="mbs-5 grid gap-2 pbs-4 text-sm text-muted-foreground [border-block-start:1px_solid_var(--border)]">
                <li className="flex items-center gap-2.5">
                  <IconShieldCheck
                    aria-hidden
                    size={17}
                    stroke={1.75}
                    className="flex-none text-verified"
                  />
                  {t("buyPay")}
                </li>
                <li className="flex items-center gap-2.5">
                  <IconTruckDelivery
                    aria-hidden
                    size={17}
                    stroke={1.75}
                    className="flex-none text-primary"
                  />
                  {t("buyGet")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="inside-heading" className="pbs-16 pbe-10">
        <div className="container-page flex items-end justify-between gap-4">
          <h2 id="inside-heading" className="type-display">
            {t("insideSet")}
          </h2>
          <span className="text-sm text-muted-foreground">
            {setName(language)}
          </span>
        </div>
        <Coverflow
          key={language}
          books={bundle.books}
          language={language}
          sample={bundle.sample}
          onRead={setReading}
          readLabel={t("readSample")}
          pagesLabel={(count) => t("pages", { count })}
          prevLabel={pulse("previousBook")}
          nextLabel={pulse("nextBook")}
        />
      </section>

      {/* Mounted only while reading, so the reader's code loads on demand. */}
      {reading ? (
        <PageViewer
          open
          onOpenChange={(open) => !open && setReading(null)}
          title={reading.editions[language]?.title ?? ""}
          note={
            reading.editions[language]?.samplePages.length
              ? t("samplePages", {
                  count: reading.editions[language]!.samplePages.length,
                })
              : t("placeholderBookPages")
          }
          pages={pagesOf(reading, language, bundle.sample)}
        />
      ) : null}
    </>
  )
}

/**
 * The set's books. Wide screens: a still shelf, every book in view (a set
 * has two to four), dealt out from one stack. Phones: a swipe row with the
 * current book whole in the middle and its neighbours peeking in, smaller and
 * dimmed, with dots and arrows. Both are the same list; CSS decides.
 */
function Coverflow({
  books,
  language,
  sample,
  onRead,
  readLabel,
  pagesLabel,
  prevLabel,
  nextLabel,
}: {
  books: readonly PublicBook[]
  language: Language
  sample: boolean
  onRead: (book: PublicBook) => void
  readLabel: string
  pagesLabel: (count: number) => string
  prevLabel: string
  nextLabel: string
}) {
  const t = useTranslations("Shop")
  const row = useRef<HTMLUListElement>(null)
  const [state, setState] = useState({ scrollable: false, active: 0 })
  const middle = (books.length - 1) / 2

  const sync = useCallback(() => {
    const el = row.current
    if (!el) return
    const scrollable = el.scrollWidth > el.clientWidth + 1
    const centre = el.getBoundingClientRect().left + el.clientWidth / 2
    let active = 0
    let best = Infinity
    el.querySelectorAll<HTMLElement>("[data-flow-item]").forEach((item, i) => {
      const box = item.getBoundingClientRect()
      const gap = Math.abs(box.left + box.width / 2 - centre)
      if (gap < best) [best, active] = [gap, i]
    })
    setState((prev) =>
      prev.scrollable === scrollable && prev.active === active
        ? prev
        : { scrollable, active }
    )
  }, [])

  useEffect(() => {
    const el = row.current
    if (!el) return
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [sync])

  const go = (index: number) => {
    const el = row.current
    const item = el?.querySelectorAll<HTMLElement>("[data-flow-item]")[index]
    if (!el || !item) return
    const box = item.getBoundingClientRect()
    const frame = el.getBoundingClientRect()
    el.scrollBy({
      left: box.left + box.width / 2 - (frame.left + frame.width / 2),
    })
  }

  return (
    <div className="relative mbs-6">
      {/* Focusable so the arrow keys scroll it without a mouse (WCAG 2.1.1). */}
      <ul
        ref={row}
        data-flow
        onScroll={sync}
        // A scrolling region with no focusable items must take focus itself.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={state.scrollable ? 0 : undefined}
        aria-label={t("booksInSet", { count: books.length })}
      >
        {books.map((book, i) => {
          const edition =
            book.editions[language] ?? book.editions.en ?? book.editions.as
          const pages = pagesOf(book, language, sample)
          return (
            <li
              key={book.slug}
              data-flow-item
              data-current={
                state.scrollable && i === state.active ? "" : undefined
              }
              style={{ "--deal": i - middle, "--order": i } as CSSProperties}
            >
              <div data-flow-book>
                <Book3D
                  title={edition?.title ?? ""}
                  subtitle={edition?.subtitle}
                  exam={book.exam}
                  cover={edition?.cover}
                  pages={edition?.pages}
                  tone={TONES[i % TONES.length]}
                />
              </div>
              <div
                data-flow-caption
                className="mbs-5 grid justify-items-center gap-1 text-center"
              >
                <span className="font-display text-lg font-semibold text-balance">
                  {edition?.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {[edition?.edition, edition ? pagesLabel(edition.pages) : ""]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {pages.length ? (
                  <button
                    type="button"
                    data-press
                    data-cta="ghost-paper"
                    onClick={() => onRead(book)}
                    className="mbs-3 inline-flex h-10 items-center gap-2 rounded-full ps-4 pe-4 text-sm font-semibold shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_20%,transparent)]"
                  >
                    <IconBook aria-hidden size={16} stroke={1.75} />
                    {readLabel}
                  </button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
      {state.scrollable && books.length > 1 ? (
        <div className="container-page mbs-5 flex items-center justify-center gap-3">
          <button
            type="button"
            data-press
            data-flow-arrow
            aria-label={prevLabel}
            disabled={state.active === 0}
            onClick={() => go(state.active - 1)}
            className="grid size-11 place-items-center rounded-full"
          >
            <IconChevronLeft aria-hidden size={20} stroke={1.75} />
          </button>
          <div className="flex items-center gap-1">
            {books.map((book, i) => (
              <button
                key={book.slug}
                type="button"
                data-flow-dot
                aria-label={t("bookOf", { n: i + 1, count: books.length })}
                aria-current={i === state.active ? "true" : undefined}
                onClick={() => go(i)}
                className="grid size-6 place-items-center"
              >
                <span aria-hidden />
              </button>
            ))}
          </div>
          <button
            type="button"
            data-press
            data-flow-arrow
            aria-label={nextLabel}
            disabled={state.active === books.length - 1}
            onClick={() => go(state.active + 1)}
            className="grid size-11 place-items-center rounded-full"
          >
            <IconChevronRight aria-hidden size={20} stroke={1.75} />
          </button>
        </div>
      ) : null}
    </div>
  )
}
