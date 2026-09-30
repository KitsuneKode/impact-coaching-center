import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

import { tracks } from "@/lib/brand"

import { Book3D } from "../_book"
import {
  campus,
  classes,
  compact,
  examGuides,
  faculty,
  faqs,
  fee,
  fees,
  included,
  joining,
  links,
  offer,
  phone,
  proof,
  reviews,
  selections,
  shelf,
  tel,
  timetable,
  whatsapp,
  workshops,
} from "../_data"
import { EnquiryForm } from "../_enquiry"
import { Folder } from "../_folder"
import { CountUp, PlayInPlace } from "../_fx"
import { bookTones, container, external, folderTones } from "../_kit/shared"
import { Reveal } from "../_reveal"
import { RouteExplorer, type Route } from "../_blocks/route-explorer"
import { base, routeColour } from "./_theme"

/** Short names for the map; the full names stay on the exams page. */
const stationName: Record<string, string> = {
  "Written paper for Class XII level posts (Paper III)": "Class XII paper",
  "Written paper for graduate level posts (Paper IV)": "Graduate paper",
  "Skill test, for posts that need one": "Skill test",
  "Medical, then the height and chest check": "Medical check",
  "What they have in common": "What they share",
}

export default async function AtlasHome() {
  const { books, folders, samples } = await shelf()

  const routes: Route[] = examGuides.map((g) => {
    const track = tracks.find((t) => t.slug === g.track)!
    return {
      slug: g.slug,
      short: g.short,
      name: g.name,
      colour: routeColour[g.slug] ?? "#0C2A30",
      summary: g.summary,
      stations: g.stages.map((s) => ({
        name: stationName[s.name] ?? s.name,
        facts: s.facts,
      })),
      batches: timetable
        .filter((t) => t.exam === track.exam)
        .map((t) => ({
          id: t.id,
          name: t.name,
          when: t.when,
          days: t.days,
          price: fee(t.price),
          href: `${base}${t.href}`,
        })),
      teachers: track.faculty.map((s) => {
        const f = faculty.find((x) => x.slug === s)!
        return { name: f.name, portrait: f.portrait, teaches: f.teaches }
      }),
      guideHref: `${base}/exams`,
    }
  })

  return (
    <main id="top">
      {/* Hero */}
      <section
        aria-label="Introduction"
        className={`${container} grid items-center gap-12 pt-12 pb-16 md:pt-16 lg:grid-cols-12`}
      >
        <div className="lg:col-span-7">
          <h1 data-rise data-k-h1 className="max-w-[16ch]">
            Coaching for Assam&apos;s biggest exams.
          </h1>
          <p
            data-rise
            style={{ animationDelay: "0.08s" }}
            className="mt-6 max-w-[44ch] text-lg text-[var(--k-muted)]"
          >
            Batches in North Lakhimpur, ICT&apos;s own books, free notes, and
            every class on the app.
          </p>
          <div
            data-rise
            style={{ animationDelay: "0.16s" }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href={whatsapp}
              {...external}
              data-k-press
              data-k-btn
              className="group inline-flex h-12 items-center gap-2 px-6 whitespace-nowrap"
            >
              {offer.cta}
              <IconArrowRight
                aria-hidden
                size={18}
                stroke={2}
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              />
            </a>
            <a
              href="#routes"
              data-k-press
              data-k-outline
              className="inline-flex h-12 items-center px-6 font-semibold"
            >
              Choose your route
            </a>
          </div>
        </div>
        <div
          data-rise
          style={{ animationDelay: "0.22s" }}
          className="lg:col-span-5"
        >
          <figure data-at-frame>
            <span
              data-k-photo
              className="relative block aspect-[4/3] overflow-hidden rounded-[var(--k-inner)]"
            >
              <Image
                src={campus[0].src}
                alt={campus[0].alt}
                fill
                priority
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-cover"
              />
            </span>
            <figcaption data-at-mono className="mt-3">
              {campus[0].caption}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Routes */}
      <section
        id="routes"
        aria-labelledby="routes-h"
        className={`${container} scroll-mt-20 pb-24`}
      >
        <Reveal>
          <h2 id="routes-h" data-k-h2 className="max-w-[20ch]">
            Pick the exam. See the road to it.
          </h2>
          <p className="mt-4 max-w-[56ch] text-[var(--k-muted)]">
            Every line starts at a free workshop and stops at that exam&apos;s
            real stages. Press a line to open it.
          </p>
        </Reveal>
        <div className="mt-10">
          <RouteExplorer routes={routes} hub={offer.short} />
        </div>
      </section>

      {/* What a fee covers */}
      <section
        aria-labelledby="fee-h"
        className={`${container} grid gap-8 pb-24 lg:grid-cols-12`}
      >
        <Reveal className="lg:col-span-4">
          <h2 id="fee-h" data-k-h2 className="max-w-[12ch]">
            What one fee covers.
          </h2>
          <p className="mt-4 max-w-[34ch] text-[var(--k-muted)]">{fees.note}</p>
          <p className="mt-2 max-w-[34ch] text-[var(--k-muted)]">
            {fees.scholarship}
          </p>
        </Reveal>
        <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
          {included.map((x, i) => (
            <li key={x.text}>
              <Reveal delay={(i % 4) * 0.04} className="h-full">
                <div data-k-tile className="flex h-full items-start gap-3 p-4">
                  <span
                    data-k-btn
                    aria-hidden
                    className="mt-0.5 grid size-6 shrink-0 place-items-center"
                  >
                    <IconCheck size={14} stroke={3} />
                  </span>
                  <span className="font-medium">{x.text}</span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Free material and books */}
      <section
        id="free"
        aria-labelledby="free-h"
        className={`${container} scroll-mt-20 pb-24`}
      >
        <Reveal>
          <h2 id="free-h" data-k-h2 className="max-w-[20ch]">
            Start free. Pay when you pick a batch.
          </h2>
          {samples && (
            <p data-at-mono className="mt-3">
              Sample titles until ICT adds its own
            </p>
          )}
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {folders.map((f) => (
            <li key={f.id}>
              <Link
                data-fd-hover
                href={`${base}/notes#${f.id}`}
                aria-label={`${f.name}, ${f.items.length} files`}
                className="block"
              >
                <Folder folder={f} tones={folderTones} />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:col-span-7">
            {books.slice(0, 4).map((b) => (
              <li key={b.slug} className="min-w-0">
                <Link
                  data-bk-hover
                  href={`${base}/books/${b.slug}`}
                  className="group block"
                >
                  <Book3D book={b} tones={bookTones} font="var(--at-sans)" />
                  <span className="mt-4 block px-[18px] font-semibold">
                    {b.title}
                  </span>
                  <span className="block px-[18px] text-sm text-[var(--k-muted)] tabular-nums">
                    {b.price}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="grid content-start gap-4 lg:col-span-5">
            {workshops.map((w) => (
              <li key={w.name}>
                <Link
                  href={`${base}${w.href}`}
                  data-k-card
                  className="flex items-center gap-4 p-3 pr-5"
                >
                  {w.cover && (
                    <span
                      data-k-photo
                      className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-[var(--k-inner)]"
                    >
                      <Image
                        src={w.cover}
                        alt={`${w.name} poster`}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span
                      data-k-display
                      className="block text-lg font-extrabold"
                    >
                      {w.name}
                    </span>
                    <span className="line-clamp-2 text-sm text-[var(--k-muted)]">
                      {w.subtitle}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Teachers, tagged by route */}
      <section aria-labelledby="teachers-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="teachers-h" data-k-h2 className="max-w-[18ch]">
            The people who walk each route with you.
          </h2>
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {faculty.map((f, i) => {
            const on = tracks.filter((t) =>
              (t.faculty as readonly string[]).includes(f.slug)
            )
            return (
              <li key={f.slug}>
                <Reveal delay={(i % 5) * 0.04} className="h-full">
                  <a
                    href={`https://www.youtube.com/watch?v=${f.lecture}`}
                    {...external}
                    data-k-card
                    data-k-lift
                    className="flex h-full flex-col overflow-hidden"
                  >
                    <span data-k-photo className="relative block aspect-[4/5]">
                      <Image
                        src={f.portrait}
                        alt={`${f.name}, ${f.teaches}`}
                        fill
                        sizes="(min-width: 1024px) 230px, 45vw"
                        className="object-cover object-top"
                      />
                    </span>
                    <span className="flex flex-1 flex-col p-4">
                      <span data-k-display className="text-lg font-extrabold">
                        {f.name}
                      </span>
                      <span className="text-sm text-[var(--k-muted)]">
                        {f.teaches}
                      </span>
                      <span className="mt-3 flex flex-wrap gap-1.5">
                        {on.map((t) => (
                          <span
                            key={t.slug}
                            data-at-mono
                            className="inline-flex items-center gap-1.5"
                          >
                            <span
                              data-rm-swatch
                              style={{
                                ["--route" as string]:
                                  routeColour[t.slug] ?? "#0C2A30",
                              }}
                            />
                            {t.exam.split(",")[0]}
                          </span>
                        ))}
                      </span>
                    </span>
                  </a>
                </Reveal>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Watch first */}
      <section aria-labelledby="watch-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="watch-h" data-k-h2 className="max-w-[20ch]">
            Watch a real class before you join.
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-5 lg:grid-cols-12">
          {classes.slice(0, 3).map((c, i) => (
            <li
              key={c.id}
              className={i === 0 ? "lg:col-span-6" : "lg:col-span-3"}
            >
              <PlayInPlace
                id={c.id}
                title={c.title}
                data-k-photo
                className="group relative block aspect-video w-full overflow-hidden rounded-[var(--k-inner)] bg-[var(--k-ink)]"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes={i === 0 ? "(min-width: 1024px) 560px, 100vw" : "300px"}
                  className="object-cover"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span
                    data-k-btn
                    className="grid size-14 place-items-center transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
                  >
                    <IconPlayerPlayFilled
                      aria-hidden
                      size={20}
                      className="translate-x-px"
                    />
                  </span>
                </span>
              </PlayInPlace>
              <p
                data-k-display
                className={`mt-3 font-extrabold ${i === 0 ? "text-xl" : "text-base"}`}
              >
                {c.title}
              </p>
              <p className="text-sm text-[var(--k-muted)]">
                {c.by}, <span className="tabular-nums">{compact(c.views)}</span>{" "}
                views
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Results */}
      <section aria-labelledby="results-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="results-h" data-k-h2 className="max-w-[20ch]">
            On the APSC CCE 2022 list.
          </h2>
          <a
            href={links.apscResultPdf}
            {...external}
            data-k-link
            className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm underline underline-offset-4"
          >
            Result of 17 January 2024
            <IconArrowUpRight aria-hidden size={15} stroke={2} />
          </a>
        </Reveal>
        <ul className="mt-10 grid gap-4 lg:grid-cols-2">
          {selections.map((s, i) => (
            <li key={s.name}>
              <Reveal delay={i * 0.05} className="h-full">
                <figure data-k-card className="flex h-full gap-5 p-6 sm:p-7">
                  <span
                    data-k-display
                    className="text-5xl leading-none font-extrabold tabular-nums"
                    style={{ color: "var(--k-accent)" }}
                  >
                    {s.serial}
                  </span>
                  <span className="grid gap-3">
                    <blockquote className="leading-relaxed text-pretty">
                      &ldquo;{s.quote}&rdquo;
                    </blockquote>
                    <figcaption>
                      <span className="block font-semibold">{s.name}</span>
                      <span className="text-sm text-[var(--k-muted)]">
                        {s.post}
                      </span>
                    </figcaption>
                  </span>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
        <dl className="mt-10 grid grid-cols-2 gap-y-8 border-t border-[var(--k-line-hi)] pt-8 lg:grid-cols-4">
          {proof.map((p) => (
            <div key={p.label} className="flex flex-col pr-4">
              <dd
                data-k-display
                className="order-1 text-[clamp(2.2rem,4.4vw,3.4rem)] leading-none font-extrabold tabular-nums"
              >
                <CountUp display={p.display} />
              </dd>
              <dt
                data-at-mono
                className="order-2 mt-3 max-w-[26ch] !normal-case"
              >
                {p.label}
              </dt>
            </div>
          ))}
        </dl>
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {reviews.slice(0, 4).map((r) => (
            <li key={r.id}>
              <PlayInPlace
                id={r.id}
                title={`${r.name}, ${r.batch}`}
                data-k-photo
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[var(--k-inner)] bg-[var(--k-ink)] text-left"
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
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(12,42,48,0.92))]"
                />
                <span
                  data-k-btn
                  className="absolute top-3 right-3 grid size-10 place-items-center transition-transform duration-200 ease-out group-hover:scale-105"
                >
                  <IconPlayerPlayFilled
                    aria-hidden
                    size={15}
                    className="translate-x-px"
                  />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="block font-semibold">{r.name}</span>
                  <span className="block text-sm text-white/80">
                    {r.exam}, {r.batch}
                  </span>
                </span>
              </PlayInPlace>
            </li>
          ))}
        </ul>
      </section>

      {/* Questions */}
      <section aria-labelledby="faq-h" className={`${container} pb-24`}>
        <h2 id="faq-h" data-k-h2>
          Questions.
        </h2>
        <dl className="mt-10 grid gap-x-12 gap-y-9 md:grid-cols-2">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt data-k-display className="text-lg font-extrabold">
                {f.q}
              </dt>
              <dd className="mt-2 text-[var(--k-muted)]">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Enquire */}
      <section aria-labelledby="join-h" className={`${container} pb-20`}>
        <div data-k-card className="grid gap-10 p-7 sm:p-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="join-h" data-k-h2 className="max-w-[12ch]">
              Sit in on a class, free.
            </h2>
            <ol className="mt-6 grid gap-4">
              {joining.map((j) => (
                <li
                  key={j.verb}
                  className="border-t border-[var(--k-line-hi)] pt-3"
                >
                  <p className="font-semibold">{j.verb}</p>
                  <p className="mt-1 text-sm text-[var(--k-muted)]">{j.body}</p>
                </li>
              ))}
            </ol>
            <a
              href={tel}
              data-k-press
              data-k-outline
              className="mt-6 inline-flex h-12 items-center px-6 font-semibold tabular-nums"
            >
              Call {phone}
            </a>
          </div>
          <div className="lg:col-span-7">
            <div data-k-tile className="p-6 sm:p-8">
              <h3 data-k-display className="text-xl font-extrabold">
                Not sure which route? Tell us your exam and your hours.
              </h3>
              <div className="mt-6">
                <EnquiryForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
