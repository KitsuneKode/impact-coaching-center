import {
  IconArrowRight,
  IconBook,
  IconBuildingStore,
  IconChevronRight,
  IconTruckDelivery,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { publishedBook } from "@/lib/catalog-server"

import { Book3D } from "../../../_book"
import { courses, rupees, shelf } from "../../../_data"
import { Reveal } from "../../../_reveal"
import { TurnBook } from "../../../_book-turn"
import { bookTones, container, h2, LampShell } from "../../_chrome"

export async function generateMetadata({
  params,
}: PageProps<"/prototypes/lamp/books/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const book = await publishedBook(slug).catch(() => null)
  return { title: book ? `${book.title}, Lamp` : "Book" }
}

/** The shop's promises, as the live /books page states them. */
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

export default async function LampBook({
  params,
}: PageProps<"/prototypes/lamp/books/[slug]">) {
  const { slug } = await params
  const book = await publishedBook(slug).catch(() => null)
  if (!book) notFound()
  const { books } = await shelf()
  const shaped = books.find((b) => b.slug === slug)!
  const others = books.filter((b) => b.slug !== slug)
  const course = courses.find((c) => c.exam === book.exam)

  return (
    <LampShell>
      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute top-10 left-[8%] h-[30rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgba(245,181,68,0.2),transparent)] blur-2xl"
          />
          <div className={`${container} relative pt-8 pb-16 md:pt-12 md:pb-24`}>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-sm text-[var(--lp-muted)]"
            >
              <Link data-quiet href="/prototypes/lamp#books">
                Books
              </Link>
              <IconChevronRight aria-hidden size={14} stroke={1.75} />
              <span className="text-[var(--lp-text)]">{book.title}</span>
            </nav>
            {book.sample && (
              <p className="mt-6 inline-flex rounded-full bg-[rgba(245,181,68,0.1)] px-4 py-2 text-sm text-[var(--lp-amber)]">
                A sample title. ICT&apos;s own books replace it before launch.
              </p>
            )}
            <div className="mt-10 grid items-center gap-14 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="mx-auto max-w-[340px]">
                  <TurnBook label={`${book.title}, front and back cover`}>
                    <Book3D
                      book={shaped}
                      tones={bookTones}
                      font="var(--lp-sans)"
                    />
                  </TurnBook>
                </div>
              </div>
              <div className="lg:col-span-7">
                <p className="text-[var(--lp-muted)]">
                  {book.exam}, {book.edition}
                </p>
                <h1 className="mt-2 text-[clamp(2.4rem,5vw,4rem)] leading-[1] font-semibold tracking-[-0.03em] [font-stretch:112%]">
                  {book.title}
                </h1>
                <p className="mt-4 text-xl text-[var(--lp-muted)]">
                  {book.subtitle}
                </p>
                <p className="mt-8 max-w-[60ch] leading-relaxed">
                  {book.description}
                </p>
                <p className="mt-8 flex items-baseline gap-3 tabular-nums">
                  <span className="text-5xl font-semibold tracking-[-0.03em]">
                    {rupees(book.pricePaise / 100)}
                  </span>
                  <span className="text-[var(--lp-muted)]">
                    {book.pages} pages
                  </span>
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    data-press
                    data-primary
                    href={`/books/${book.slug}`}
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-[var(--lp-amber)] px-6 font-semibold text-[var(--lp-bg)]"
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
                    data-press
                    data-ghost
                    href={`/books/${book.slug}`}
                    className="inline-flex h-12 items-center rounded-full px-5 font-medium shadow-[inset_0_0_0_1px_var(--lp-line-hi)]"
                  >
                    Read sample pages
                  </Link>
                </div>
                <ul className="mt-10 grid gap-3 border-t border-[var(--lp-line)] pt-8 text-sm text-[var(--lp-muted)]">
                  {promises.map(({ Icon, text }) => (
                    <li key={text} className="flex items-center gap-3">
                      <Icon
                        aria-hidden
                        size={18}
                        stroke={1.5}
                        className="text-[var(--lp-text)]"
                      />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {book.contents.length > 0 && (
          <section aria-labelledby="toc-h" className="py-16 md:py-24">
            <div className={`${container} grid gap-10 lg:grid-cols-12`}>
              <h2 id="toc-h" className={`${h2} lg:col-span-4`}>
                Inside the book.
              </h2>
              <ol className="grid gap-px overflow-hidden rounded-[24px] bg-[var(--lp-line)] lg:col-span-8">
                {book.contents.map((c, i) => (
                  <li
                    key={c}
                    className="flex items-baseline gap-5 bg-[var(--lp-card)] px-6 py-5"
                  >
                    <span className="w-6 shrink-0 text-sm text-[var(--lp-amber)] tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{c}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {book.samplePageUrls && book.samplePageUrls.length > 0 && (
          <section aria-labelledby="pages-h" className="py-16 md:py-24">
            <div className={container}>
              <h2 id="pages-h" className={h2}>
                A look inside.
              </h2>
              <ul className="-mx-5 mt-10 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-5 pb-4">
                {book.samplePageUrls.map((u, i) => (
                  <li
                    key={u}
                    className="w-[62vw] max-w-[300px] shrink-0 snap-start"
                  >
                    <span className="relative block aspect-[3/4] overflow-hidden rounded-[14px] bg-white shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]">
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
            </div>
          </section>
        )}

        <section aria-labelledby="more-h" className="py-16 md:py-24">
          <div className={container}>
            <Reveal>
              <h2 id="more-h" className={`${h2} max-w-[18ch]`}>
                More from ICT&apos;s shelf.
              </h2>
            </Reveal>
            <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
              {others.map((b) => (
                <li key={b.slug} className="min-w-0">
                  <Link
                    data-bk-hover
                    href={`/prototypes/lamp/books/${b.slug}`}
                    className="group block"
                  >
                    <Book3D book={b} tones={bookTones} font="var(--lp-sans)" />
                    <span className="mt-3 block truncate px-[18px] font-semibold">
                      {b.title}
                    </span>
                    <span className="block px-[18px] text-sm text-[var(--lp-muted)] tabular-nums">
                      {b.price}
                    </span>
                  </Link>
                </li>
              ))}
              {course && (
                <li className="min-w-0">
                  <Link
                    href={`/prototypes/lamp/courses/${course.slug}`}
                    className="flex h-full flex-col justify-end rounded-[24px] bg-[var(--lp-card)] p-6 shadow-[inset_0_0_0_1px_var(--lp-line)] transition-shadow duration-200 hover:shadow-[inset_0_0_0_1px_rgba(245,181,68,0.45)]"
                  >
                    <span className="text-sm text-[var(--lp-muted)]">
                      The course for {course.exam}
                    </span>
                    <span className="mt-1 text-xl font-semibold">
                      {course.name}
                    </span>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm text-[var(--lp-amber)]">
                      See the course
                      <IconArrowRight aria-hidden size={15} stroke={2} />
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </section>
      </main>
    </LampShell>
  )
}
