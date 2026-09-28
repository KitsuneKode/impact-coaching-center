import { alternatesFor } from "@/lib/site"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { contentFor } from "@/i18n/content-server"
import {
  IconArrowLeft,
  IconBuildingStore,
  IconTruckDelivery,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"

import { BookActions, SampleStrip } from "@/components/commerce/book-actions"
import { BookCard } from "@/components/commerce/book-card"
import { BookCover } from "@/components/commerce/book-cover"
import { SampleNotice, ShopCartButton } from "@/components/commerce/shop-shell"
import { Section } from "@/components/ui/section"
import { publishedBook, publishedBooks } from "@/lib/catalog-server"
import { formatPaise } from "@/lib/money"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/books/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params
  const book = await publishedBook(slug)
  if (!book) return { title: "Book not found" }
  return {
    title: book.title,
    description: book.subtitle || undefined,
    alternates: alternatesFor(`/books/${book.slug}`, locale),
    ...(book.sample ? { robots: { index: false, follow: false } } : {}),
  }
}

export default async function BookPage({
  params,
}: PageProps<"/[locale]/books/[slug]">) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Shop")
  const { phrase } = await contentFor(locale)
  const [book, books] = await Promise.all([
    publishedBook(slug),
    publishedBooks(),
  ])
  if (!book) notFound()

  const related = [
    ...books.filter((b) => b.slug !== book.slug && b.exam === book.exam),
    ...books.filter((b) => b.slug !== book.slug && b.exam !== book.exam),
  ].slice(0, 3)

  return (
    <>
      <Section size="sm" className="pt-8 md:pt-10">
        {book.sample ? (
          <div className="mb-6">
            <SampleNotice>{t("placeholderBook")}</SampleNotice>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft className="size-4" aria-hidden />
            {t("allBooks")}
          </Link>
          <ShopCartButton />
        </div>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div className="grid content-start gap-6">
            <div className="grid place-items-center rounded-card bg-surface px-[22%] py-12">
              <BookCover
                title={book.title}
                subtitle={book.subtitle}
                exam={book.exam}
                tone={book.tone}
                coverUrl={book.coverUrl}
                size="lg"
              />
            </div>
            <SampleStrip book={book} />
          </div>

          <div className="grid content-start gap-7">
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">
                {[
                  phrase(book.exam),
                  book.edition,
                  t("pages", { count: book.pages }),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <h1 className="type-display text-balance">{book.title}</h1>
              {book.subtitle ? (
                <p className="type-lede text-muted-foreground">
                  {book.subtitle}
                </p>
              ) : null}
            </div>

            <p className="tnum font-display text-4xl">
              {formatPaise(book.pricePaise)}
            </p>

            <BookActions book={book} />

            <ul className="grid gap-3 rounded-card border border-border p-5 text-sm">
              <li className="flex gap-3">
                <IconTruckDelivery
                  stroke={1.5}
                  className="size-5 shrink-0"
                  aria-hidden
                />
                <span>
                  <span className="font-medium">{t("delivery")}</span>{" "}
                  <span className="text-muted-foreground">
                    {t("deliveryBody")}
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <IconBuildingStore
                  stroke={1.5}
                  className="size-5 shrink-0"
                  aria-hidden
                />
                <span>
                  <span className="font-medium">{t("collect")}</span>{" "}
                  <span className="text-muted-foreground">
                    {t("collectBody")}
                  </span>
                </span>
              </li>
            </ul>

            {book.description ? (
              <p className="max-w-[62ch] whitespace-pre-line text-muted-foreground">
                {book.description}
              </p>
            ) : null}

            {book.contents.length ? (
              <div className="grid gap-3">
                <h2 className="font-medium">What&rsquo;s inside</h2>
                <ol className="divide-y divide-border rounded-card border border-border">
                  {book.contents.map((chapter, i) => (
                    <li
                      key={`${i}-${chapter}`}
                      className="flex items-baseline gap-4 px-5 py-3"
                    >
                      <span className="tnum w-6 text-sm text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {chapter}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        </div>
      </Section>

      {related.length ? (
        <Section size="sm" className="border-t border-border">
          <h2 className="type-display-sm">More from ICT</h2>
          <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 min-[420px]:grid-cols-2 lg:grid-cols-3">
            {related.map((b) => (
              <li key={b.slug}>
                <BookCard book={b} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  )
}
