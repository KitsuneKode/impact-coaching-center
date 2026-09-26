import {
  IconArrowLeft,
  IconBuildingStore,
  IconTruckDelivery,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BookActions, SampleStrip } from "@/components/commerce/book-actions"
import { BookCard } from "@/components/commerce/book-card"
import { BookCover } from "@/components/commerce/book-cover"
import { Section } from "@/components/ui/section"
import { formatPaise } from "@/lib/money"
import { previewBookBySlug, previewBooks } from "@/lib/preview-catalogue"

export function generateStaticParams() {
  return previewBooks.map((book) => ({ slug: book.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/preview/books/[slug]">): Promise<Metadata> {
  const { slug } = await params
  return { title: previewBookBySlug(slug)?.title ?? "Book" }
}

export default async function PreviewBook({
  params,
}: PageProps<"/preview/books/[slug]">) {
  const { slug } = await params
  const book = previewBookBySlug(slug)
  if (!book) notFound()

  const related = [
    ...previewBooks.filter((b) => b.slug !== book.slug && b.exam === book.exam),
    ...previewBooks.filter((b) => b.slug !== book.slug && b.exam !== book.exam),
  ].slice(0, 3)

  return (
    <>
      <Section size="sm" className="pt-8 md:pt-10">
        <Link
          href="/preview/books"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft className="size-4" aria-hidden />
          All books
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div className="grid content-start gap-6">
            <div className="grid place-items-center rounded-card bg-surface px-[22%] py-12">
              <BookCover
                title={book.title}
                subtitle={book.subtitle}
                exam={book.exam}
                tone={book.tone}
                size="lg"
              />
            </div>
            <SampleStrip book={book} />
          </div>

          <div className="grid content-start gap-7">
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">
                {book.exam} · {book.edition} · {book.pages} pages
              </p>
              <h1 className="type-display text-balance">{book.title}</h1>
              <p className="type-lede text-muted-foreground">{book.subtitle}</p>
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
                  <span className="font-medium">Delivery.</span>{" "}
                  <span className="text-muted-foreground">
                    One charge for the whole order, shown before you pay.
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
                  <span className="font-medium">Collect from the centre.</span>{" "}
                  <span className="text-muted-foreground">
                    Free. DC Bungalow Road, North Lakhimpur.
                  </span>
                </span>
              </li>
            </ul>

            <p className="max-w-[62ch] text-muted-foreground">
              {book.description}
            </p>

            <div className="grid gap-3">
              <h2 className="font-medium">What&rsquo;s inside</h2>
              <ol className="divide-y divide-border rounded-card border border-border">
                {book.contents.map((chapter, i) => (
                  <li
                    key={chapter}
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
