import {
  IconArrowRight,
  IconBook,
  IconBuildingStore,
  IconTruckDelivery,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { publishedBook } from "@/lib/catalog-server"

import { Book3D } from "../_book"
import { TurnBook } from "../_book-turn"
import { courses, rupees, shelf } from "../_data"
import { Reveal } from "../_reveal"
import { container, bookTones, type KitProps } from "./shared"
import { PageHead } from "./head"

const promises = [
  { Icon: IconBook, text: "Read sample pages before you buy" },
  {
    Icon: IconTruckDelivery,
    text: "Delivered to your door, one charge per order",
  },
  {
    Icon: IconBuildingStore,
    text: "Or collect from the centre on DC Bungalow Road",
  },
] as const

export async function KitBook({ base, slug }: KitProps & { slug: string }) {
  const book = await publishedBook(slug).catch(() => null)
  if (!book) notFound()
  const { books } = await shelf()
  const shaped = books.find((b) => b.slug === slug)!
  const others = books.filter((b) => b.slug !== slug)
  const course = courses.find((c) => c.exam === book.exam)

  return (
    <main>
      <PageHead
        base={base}
        trail={[
          { label: "Books", href: `${base}/books` },
          { label: book.title },
        ]}
        title={book.title}
        lede={book.subtitle}
      />

      <section
        className={`${container} grid items-center gap-12 pb-20 lg:grid-cols-12`}
      >
        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-[340px]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[-20%] top-[10%] h-[70%] rounded-[var(--k-pill)] bg-[radial-gradient(closest-side,rgba(var(--cc-glow),0.3),transparent)] blur-2xl"
            />
            <div className="relative">
              <TurnBook label={`${book.title}, front and back cover`}>
                <Book3D book={shaped} tones={bookTones} font="var(--cc-sans)" />
              </TurnBook>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div
            data-coat
            data-k-card
            className="rounded-[var(--k-radius)] p-6 sm:p-8"
          >
            {book.sample && (
              <p
                data-k-tag
                className="mb-5 inline-block rounded-[var(--k-pill)] px-3 py-1.5 text-[0.66rem]"
              >
                A sample title
              </p>
            )}
            <p className="text-[var(--k-muted)]">
              {book.exam}, {book.edition}
            </p>
            <p className="mt-5 max-w-[60ch] leading-relaxed">
              {book.description}
            </p>
            <p className="mt-8 flex flex-wrap items-baseline gap-x-4 tabular-nums">
              <span
                data-k-display
                className="text-[clamp(2.2rem,5vw,3.4rem)] leading-none font-light"
              >
                {rupees(book.pricePaise / 100)}
              </span>
              <span className="text-[var(--k-muted)]">{book.pages} pages</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/books/${book.slug}`}
                data-k-press
                data-k-btn
                className="group inline-flex h-12 items-center gap-2 rounded-[var(--k-pill)] px-6 font-semibold"
              >
                Buy this book
                <IconArrowRight
                  aria-hidden
                  size={18}
                  stroke={2}
                  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href={`/books/${book.slug}`}
                data-k-press
                data-k-outline
                className="inline-flex h-12 items-center rounded-[var(--k-pill)] px-6 font-semibold"
              >
                Read sample pages
              </Link>
            </div>
            <ul className="mt-8 grid gap-3 border-t border-[var(--k-line)] pt-6 text-sm text-[var(--k-muted)]">
              {promises.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <Icon
                    aria-hidden
                    size={18}
                    stroke={1.5}
                    className="text-[var(--k-ink)]"
                  />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {book.contents.length > 0 && (
        <section
          aria-labelledby="toc-h"
          className={`${container} grid gap-8 pb-20 lg:grid-cols-12`}
        >
          <h2 id="toc-h" data-k-h2 className="lg:col-span-4">
            Inside the book.
          </h2>
          <ol
            data-k-card
            className="grid rounded-[var(--k-radius)] px-6 py-2 sm:px-8 lg:col-span-8"
          >
            {book.contents.map((c, i) => (
              <li
                key={c}
                className={`flex items-baseline gap-5 py-4 ${i ? "border-t border-[var(--k-line)]" : ""}`}
              >
                <span className="w-7 shrink-0 text-sm text-[var(--k-accent)] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {book.samplePageUrls && book.samplePageUrls.length > 0 && (
        <section aria-labelledby="pages-h" className="pb-20">
          <div className={container}>
            <h2 id="pages-h" data-k-h2>
              A look inside.
            </h2>
          </div>
          <ul
            data-k-snap
            className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-[max(2rem,calc((100vw-1240px)/2+2rem))]"
          >
            {book.samplePageUrls.map((u, i) => (
              <li
                key={u}
                className="w-[62vw] max-w-[300px] shrink-0 snap-start"
              >
                <span
                  data-k-photo
                  className="relative block aspect-[3/4] overflow-hidden rounded-[var(--k-inner)] bg-white shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)]"
                >
                  <Image
                    src={u}
                    alt={`Sample page ${i + 1}`}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="more-h" className={`${container} pb-20`}>
        <Reveal>
          <h2 id="more-h" data-k-h2 className="max-w-[20ch]">
            More from ICT&apos;s shelf.
          </h2>
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {others.map((b) => (
            <li key={b.slug} className="min-w-0">
              <Link
                data-bk-hover
                href={`${base}/books/${b.slug}`}
                className="group block"
              >
                <Book3D book={b} tones={bookTones} font="var(--cc-sans)" />
                <span className="mt-3 block truncate px-[18px] font-medium">
                  {b.title}
                </span>
                <span className="block px-[18px] text-sm text-[var(--k-muted)] tabular-nums">
                  {b.price}
                </span>
              </Link>
            </li>
          ))}
          {course && (
            <li className="min-w-0">
              <Link
                href={`${base}/courses/${course.slug}`}
                data-k-card
                className="flex h-full min-h-[200px] flex-col justify-end rounded-[var(--k-radius)] p-6"
              >
                <span className="text-sm text-[var(--k-muted)]">
                  The course for {course.exam}
                </span>
                <span data-k-display className="mt-1 text-xl font-light">
                  {course.name}
                </span>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-[var(--k-accent)]">
                  See the course
                  <IconArrowRight aria-hidden size={15} stroke={2} />
                </span>
              </Link>
            </li>
          )}
        </ul>
      </section>
    </main>
  )
}
