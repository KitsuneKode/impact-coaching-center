import {
  IconBook,
  IconBuildingStore,
  IconTruckDelivery,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Book3D } from "../../_book"
import { shelf } from "../../_data"
import { Reveal } from "../../_reveal"
import { base, bookTones, container, PageHead } from "../_shared"

export const metadata: Metadata = { title: "Books" }

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

export default async function Books() {
  const { books, samples } = await shelf()
  const exams = Array.from(new Set(books.map((b) => b.exam)))

  return (
    <main>
      <PageHead
        trail={[{ label: "Books" }]}
        title="ICT's books, for the exams it teaches."
        lede={
          samples
            ? "Sample titles for now. ICT's own books replace them before launch."
            : undefined
        }
      >
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {promises.map(({ Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span
                data-lv-btn
                className="grid size-10 shrink-0 place-items-center rounded-lg"
              >
                <Icon aria-hidden size={18} stroke={2} />
              </span>
              <span className="pt-2 text-sm font-semibold">{text}</span>
            </li>
          ))}
        </ul>
      </PageHead>

      <div data-dark className="bg-[var(--lv-navy)] py-16 text-white md:py-20">
        <div className={container}>
          {exams.map((exam, n) => (
            <section key={exam} aria-label={exam} className={n ? "mt-16" : ""}>
              <Reveal>
                <h2 data-lv-h2 className="text-white">
                  {exam}
                </h2>
              </Reveal>
              <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4">
                {books
                  .filter((b) => b.exam === exam)
                  .map((b) => (
                    <li key={b.slug} className="min-w-0">
                      <Link
                        data-bk-hover
                        href={`${base}/books/${b.slug}`}
                        className="group block"
                      >
                        <Book3D
                          book={b}
                          tones={bookTones}
                          font="var(--lv-sans)"
                        />
                        <span className="mt-4 block px-[18px] font-semibold">
                          {b.title}
                        </span>
                        <span className="block px-[18px] text-sm text-[var(--lv-on-navy)]">
                          {b.subtitle}
                        </span>
                        <span
                          data-lv-display
                          className="mt-1 block px-[18px] text-xl text-[var(--lv-orange)] tabular-nums"
                        >
                          {b.price}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
