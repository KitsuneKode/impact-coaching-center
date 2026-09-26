import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BookCover } from "@/components/commerce/book-cover"
import { BookActions } from "@/components/commerce/book-actions"
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

  return (
    <Section size="sm" className="pt-8 md:pt-10">
      <Link
        href="/preview/books"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All books
      </Link>
      <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,320px)_1fr] md:gap-14">
        <BookCover
          title={book.title}
          subtitle={book.subtitle}
          tone={book.tone}
          className="mx-auto w-full max-w-72 md:max-w-none"
        />
        <div className="grid content-start gap-6">
          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">
              {book.exam} · {book.edition} · {book.pages} pages
            </p>
            <h1 className="type-display-sm text-balance">{book.title}</h1>
            <p className="text-lg text-muted-foreground">{book.subtitle}</p>
          </div>
          <p className="tnum text-2xl font-medium">
            {formatPaise(book.pricePaise)}
          </p>
          <BookActions slug={book.slug} title={book.title} />
          <p className="max-w-160 text-muted-foreground">{book.description}</p>
          <div className="grid gap-3">
            <h2 className="font-medium">What&rsquo;s inside</h2>
            <ol className="grid gap-2 text-sm">
              {book.contents.map((chapter, i) => (
                <li
                  key={chapter}
                  className="flex gap-3 border-b border-border pb-2"
                >
                  <span className="tnum w-5 text-muted-foreground">
                    {i + 1}
                  </span>
                  {chapter}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Section>
  )
}
