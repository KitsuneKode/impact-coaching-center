import {
  IconBook,
  IconBuildingStore,
  IconTruckDelivery,
} from "@tabler/icons-react"
import Link from "next/link"

import { Book3D } from "../_book"
import { shelf } from "../_data"
import { Reveal } from "../_reveal"
import { container, bookTones, type KitProps } from "./shared"
import { PageHead } from "./head"

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

export async function KitBooks({ base }: KitProps) {
  const { books, samples } = await shelf()
  const exams = Array.from(new Set(books.map((b) => b.exam)))

  return (
    <main>
      <PageHead
        base={base}
        trail={[{ label: "Books" }]}
        title="ICT's books, for the exams it teaches."
        lede={
          samples
            ? "Sample titles for now. ICT's own books replace them before launch."
            : undefined
        }
      >
        <ul className="mt-8 grid gap-3 text-[var(--k-muted)] sm:grid-cols-3">
          {promises.map(({ Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span
                data-k-tile
                className="grid size-10 shrink-0 place-items-center rounded-[var(--k-inner)] text-[var(--k-ink)]"
              >
                <Icon aria-hidden size={18} stroke={1.5} />
              </span>
              <span className="pt-2 text-sm">{text}</span>
            </li>
          ))}
        </ul>
      </PageHead>

      {exams.map((exam) => (
        <section key={exam} aria-label={exam} className={`${container} pb-20`}>
          <Reveal>
            <h2 className="text-xl font-medium tracking-[-0.015em]">{exam}</h2>
          </Reveal>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4">
            {books
              .filter((b) => b.exam === exam)
              .map((b) => (
                <li key={b.slug} className="min-w-0">
                  <Link
                    data-bk-hover
                    href={`${base}/books/${b.slug}`}
                    className="group block"
                  >
                    <Book3D book={b} tones={bookTones} font="var(--cc-sans)" />
                    <span className="mt-4 block px-[18px] font-medium">
                      {b.title}
                    </span>
                    <span className="block px-[18px] text-sm text-[var(--k-muted)]">
                      {b.subtitle}
                    </span>
                    <span className="mt-1 block px-[18px] text-sm tabular-nums">
                      {b.price}, {b.pages} pages
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
