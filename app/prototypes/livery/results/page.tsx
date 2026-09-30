import { IconArrowUpRight, IconPlayerPlayFilled } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"

import {
  compact,
  links,
  officers,
  podcast,
  proof,
  reviews,
  selections,
} from "../../_data"
import { CountUp, PlayInPlace } from "../../_fx"
import { Reveal } from "../../_reveal"
import { container, external, PageHead } from "../_shared"

export const metadata: Metadata = { title: "Results" }

export default function Results() {
  return (
    <main>
      <PageHead
        trail={[{ label: "Results" }]}
        title="Two officers on the APSC CCE 2022 list studied here."
        lede="In their words, and on the record. Every number links to the page where you can check it."
      >
        <a
          href={links.apscResultPdf}
          {...external}
          className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline decoration-[var(--lv-line)] underline-offset-4 hover:decoration-[var(--lv-ink)]"
        >
          Result of 17 January 2024
          <IconArrowUpRight aria-hidden size={15} stroke={2} />
        </a>
      </PageHead>

      <section className={`${container} pb-16`}>
        <dl className="grid grid-cols-2 gap-y-8 border-t-[3px] border-[var(--lv-navy)] pt-8 lg:grid-cols-4">
          {proof.map((p) => (
            <a
              key={p.label}
              href={p.href}
              {...external}
              className="flex flex-col pr-4"
            >
              <dd
                data-lv-display
                className="order-1 text-[clamp(2.6rem,5vw,4.2rem)] tabular-nums"
              >
                <CountUp display={p.display} />
              </dd>
              <dt className="order-2 mt-2 max-w-[24ch] text-sm text-[var(--lv-muted)]">
                {p.label}
              </dt>
            </a>
          ))}
        </dl>
      </section>

      <section aria-labelledby="sel-h" className={`${container} pb-20`}>
        <h2 id="sel-h" className="sr-only">
          Selected officers
        </h2>
        <ul className="grid gap-4">
          {selections.map((s, i) => (
            <li key={s.name}>
              <Reveal delay={i * 0.05}>
                <figure
                  data-lv-card
                  className="grid overflow-hidden rounded-[14px] md:grid-cols-[minmax(150px,220px)_1fr]"
                >
                  <span className="grid place-items-center bg-[var(--lv-orange)] px-6 py-6 text-[var(--lv-navy)]">
                    <span
                      data-lv-display
                      className="text-[5.5rem] leading-[0.85] tabular-nums"
                    >
                      <span className="align-top text-4xl">P</span>
                      {s.serial}
                    </span>
                  </span>
                  <span className="grid gap-4 p-6 md:p-8">
                    <blockquote className="max-w-[62ch] text-lg leading-snug text-pretty">
                      &ldquo;{s.quote}&rdquo;
                    </blockquote>
                    <figcaption>
                      <span data-lv-display className="block text-2xl">
                        {s.name}
                      </span>
                      <span className="text-sm text-[var(--lv-muted)]">
                        {s.post}
                      </span>
                    </figcaption>
                  </span>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="stu-h"
        className="bg-[var(--lv-sky)] py-20 md:py-24"
      >
        <div className={container}>
          <Reveal>
            <h2 id="stu-h" data-lv-h2>
              Students on their batch.
            </h2>
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {reviews.map((r) => (
              <li key={r.id}>
                <PlayInPlace
                  id={r.id}
                  title={`${r.name}, ${r.batch}`}
                  data-lv-photo
                  className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[14px] bg-[var(--lv-navy)] text-left"
                >
                  <Image
                    src={r.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(11,31,58,0.92))]"
                  />
                  <span
                    data-lv-btn
                    className="absolute top-3 right-3 grid size-10 place-items-center rounded-lg transition-transform duration-200 ease-out group-hover:scale-105"
                  >
                    <IconPlayerPlayFilled
                      aria-hidden
                      size={15}
                      className="translate-x-px"
                    />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <span data-lv-display className="block text-2xl">
                      {r.name}
                    </span>
                    <span className="block text-sm text-[var(--lv-on-navy)]">
                      {r.exam}, {r.batch}
                    </span>
                  </span>
                </PlayInPlace>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="off-h" className={`${container} py-20`}>
        <Reveal>
          <h2 id="off-h" data-lv-h2 className="max-w-[20ch]">
            Serving officers who came to talk to ICT students.
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {officers.map((o) => (
            <li key={o.id}>
              <div data-lv-card className="h-full rounded-[14px] p-3">
                <PlayInPlace
                  id={o.id}
                  title={o.name}
                  data-lv-photo
                  className="group relative block aspect-video w-full overflow-hidden rounded-[10px] bg-[var(--lv-navy)]"
                >
                  <Image
                    src={o.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 380px, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span
                      data-lv-btn
                      className="grid size-12 place-items-center rounded-lg transition-transform duration-200 ease-out group-hover:scale-105"
                    >
                      <IconPlayerPlayFilled
                        aria-hidden
                        size={18}
                        className="translate-x-px"
                      />
                    </span>
                  </span>
                </PlayInPlace>
                <div className="px-2 pt-4 pb-2">
                  <p data-lv-display className="text-2xl">
                    {o.name}
                  </p>
                  <p className="text-sm text-[var(--lv-muted)]">
                    {o.role}, {o.detail}
                  </p>
                  <p className="mt-1 text-sm text-[var(--lv-muted)] tabular-nums">
                    {compact(o.views)} views
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-[var(--lv-muted)]">
          More conversations on {podcast.name}, the podcast.
        </p>
      </section>
    </main>
  )
}
