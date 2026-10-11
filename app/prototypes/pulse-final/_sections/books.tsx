import { IconArrowRight } from "@tabler/icons-react"
import Link from "next/link"

import { Book3D } from "../../_book"
import type { Shelf } from "../../_data"
import { bookTones, container, h2 } from "../_theme"

/** ICT's books on the second blue field, as in Pulse. */
export function Books({
  books,
  samples,
}: {
  books: Shelf["books"]
  samples: Shelf["samples"]
}) {
  return (
    <section id="books" aria-labelledby="books-h" className="pb-20 md:pb-28">
      <div className={container}>
        <div className="overflow-hidden rounded-[40px] bg-[var(--pu-blue)] px-5 py-12 text-white md:px-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 id="books-h" className={`${h2} max-w-[16ch]`}>
                ICT&apos;s books, for the exams it teaches.
              </h2>
              {samples && (
                <p className="mt-3 text-sm text-[var(--pu-on-blue)]">
                  Sample titles for now. ICT&apos;s own books replace them
                  before launch.
                </p>
              )}
            </div>
            <Link
              href="/books"
              className="inline-flex items-center gap-1.5 font-semibold"
            >
              All books
              <IconArrowRight aria-hidden size={18} stroke={2} />
            </Link>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-4 md:gap-x-8">
            {books.map((b) => (
              <li key={b.slug} className="min-w-0">
                <Link data-bk-hover href={b.href} className="group block">
                  <Book3D book={b} tones={bookTones} font="var(--pu-display)" />
                  <span className="mt-4 block px-[18px] font-semibold">
                    {b.title}
                  </span>
                  <span className="flex items-center justify-between gap-2 px-[18px] text-sm text-[var(--pu-on-blue)]">
                    <span className="tabular-nums">{b.price}</span>
                    <span className="inline-flex items-center gap-1 text-[var(--pu-amber)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      Sample pages
                      <IconArrowRight aria-hidden size={14} stroke={2} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
