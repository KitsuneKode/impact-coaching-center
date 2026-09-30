import { IconArrowUpRight, IconPlayerPlayFilled } from "@tabler/icons-react"
import Image from "next/image"

import {
  compact,
  links,
  officers,
  podcast,
  proof,
  reviews,
  selections,
} from "../_data"
import { CountUp, PlayInPlace } from "../_fx"
import { Reveal } from "../_reveal"
import { container, external, type KitProps } from "./shared"
import { PageHead } from "./head"

export function KitResults({ base }: KitProps) {
  return (
    <main>
      <PageHead
        base={base}
        trail={[{ label: "Results" }]}
        title="Two officers on the APSC CCE 2022 list studied here."
        lede="In their words, and on the record. Every number links to the page where you can check it."
      >
        <a
          href={links.apscResultPdf}
          {...external}
          className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm text-[var(--k-muted)] underline decoration-white/25 underline-offset-4 hover:text-[var(--k-ink)]"
        >
          Result of 17 January 2024
          <IconArrowUpRight aria-hidden size={15} stroke={1.5} />
        </a>
      </PageHead>

      <section className={`${container} pb-16`}>
        <dl
          data-k-card
          className="grid grid-cols-2 gap-y-8 rounded-[var(--k-radius)] p-6 sm:p-8 lg:grid-cols-4"
        >
          {proof.map((p) => (
            <a
              key={p.label}
              href={p.href}
              {...external}
              className="flex flex-col lg:px-4 lg:first:pl-0"
            >
              <dd
                data-k-display
                className="order-1 text-[clamp(1.6rem,3vw,2.4rem)] leading-none font-light tabular-nums"
              >
                <CountUp display={p.display} />
              </dd>
              <dt className="order-2 mt-2 max-w-[22ch] text-sm text-[var(--k-muted)]">
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
                  data-k-card
                  className="grid items-center gap-5 rounded-[var(--k-radius)] p-6 sm:p-8 md:grid-cols-[auto_1fr_auto]"
                >
                  <span
                    data-k-display
                    className="text-[clamp(2.4rem,5vw,4rem)] leading-none font-light text-[var(--k-accent)] tabular-nums"
                  >
                    {s.serial}
                  </span>
                  <blockquote className="max-w-[60ch] leading-relaxed text-pretty">
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                  <figcaption className="md:text-right">
                    <span className="block font-medium">{s.name}</span>
                    <span className="text-sm text-[var(--k-muted)]">
                      {s.post}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="stu-h" className={`${container} pb-20`}>
        <Reveal>
          <h2 id="stu-h" data-k-h2 className="max-w-[20ch]">
            Students on their batch.
          </h2>
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {reviews.map((r) => (
            <li key={r.id}>
              <PlayInPlace
                id={r.id}
                title={`${r.name}, ${r.batch}`}
                data-k-photo
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[var(--k-inner)] bg-black text-left"
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
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(5,8,26,0.9))]"
                />
                <span
                  data-k-btn
                  className="absolute top-3 right-3 grid size-10 place-items-center rounded-[var(--k-pill)] transition-transform duration-200 ease-out group-hover:scale-105"
                >
                  <IconPlayerPlayFilled
                    aria-hidden
                    size={15}
                    className="translate-x-px"
                  />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="block font-medium">{r.name}</span>
                  <span className="block text-sm text-white/75">
                    {r.exam}, {r.batch}
                  </span>
                </span>
              </PlayInPlace>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="off-h" className={`${container} pb-20`}>
        <Reveal>
          <h2 id="off-h" data-k-h2 className="max-w-[22ch]">
            Serving officers who came to talk to ICT students.
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {officers.map((o) => (
            <li key={o.id}>
              <div data-k-card className="h-full rounded-[var(--k-radius)] p-3">
                <PlayInPlace
                  id={o.id}
                  title={o.name}
                  data-k-photo
                  className="group relative block aspect-video w-full overflow-hidden rounded-[var(--k-inner)] bg-black"
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
                      data-k-btn
                      className="grid size-12 place-items-center rounded-[var(--k-pill)] transition-transform duration-200 ease-out group-hover:scale-105"
                    >
                      <IconPlayerPlayFilled
                        aria-hidden
                        size={18}
                        className="translate-x-px"
                      />
                    </span>
                  </span>
                </PlayInPlace>
                <div className="px-3 pt-4 pb-3">
                  <p className="font-medium">{o.name}</p>
                  <p className="text-sm text-[var(--k-muted)]">
                    {o.role}, {o.detail}
                  </p>
                  <p className="mt-1 text-sm text-[var(--k-muted)] tabular-nums">
                    {compact(o.views)} views
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-[var(--k-muted)]">
          More conversations on {podcast.name}, the podcast.
        </p>
      </section>
    </main>
  )
}
