import {
  IconArrowRight,
  IconArrowUpRight,
  IconMapPin,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

import { timings } from "@/lib/brand"

import { Book3D } from "../_book"
import {
  campus,
  classes,
  compact,
  courses,
  examGuides,
  faculty,
  faqs,
  fee,
  included,
  joining,
  links,
  offer,
  phone,
  place,
  proof,
  reviews,
  rupees,
  selections,
  shelf,
  tel,
  timetable,
  whatsapp,
  workshops,
} from "../_data"
import { EnquiryForm } from "../_enquiry"
import { ExamGuide } from "../_exam-guide"
import { Folder } from "../_folder"
import { CountUp, PlayInPlace } from "../_fx"
import { bookTones, container, external, folderTones } from "../_kit/shared"
import { Reveal } from "../_reveal"
import { BatchFinder } from "../_blocks/batch-finder"
import { base } from "./_theme"

export default async function MeridianHome() {
  const { books, folders, samples } = await shelf()

  const batches = timetable.map((t) => ({
    id: t.id,
    name: t.name,
    exam: t.exam,
    when: t.when,
    days: t.days,
    price: fee(t.price),
    href: `${base}${t.href}`,
    start: t.start,
  }))
  const noTiming = courses
    .filter((c) => !c.when && c.price)
    .map((c) => ({
      exam: c.exam,
      name: c.name,
      price: rupees(c.price!),
      href: `${base}/courses/${c.slug}`,
    }))

  return (
    <main id="top">
      {/* Hero */}
      <section data-mr-hero aria-label="Introduction">
        <div data-mr-sun aria-hidden />
        <div
          className={`${container} relative grid items-center gap-12 pt-14 pb-24 md:pt-20 lg:grid-cols-12`}
        >
          <div className="lg:col-span-6">
            <h1 data-rise data-k-h1 className="max-w-[13ch]">
              Coaching for Assam&apos;s <span data-mr-mark>biggest exams.</span>
            </h1>
            <p
              data-rise
              style={{ animationDelay: "0.08s" }}
              className="mt-6 max-w-[42ch] text-lg text-[#DCE9FF]"
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
                  stroke={2.25}
                  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="#programme"
                data-k-press
                data-k-outline
                className="inline-flex h-12 items-center px-6"
              >
                See every batch
              </a>
            </div>
          </div>
          <div
            data-rise
            style={{ animationDelay: "0.22s" }}
            className="lg:col-span-6"
          >
            <div data-k-card className="p-6 sm:p-8">
              <BatchFinder
                batches={batches}
                noTiming={noTiming}
                exams={[...courses.map((c) => c.exam), "Not sure yet"]}
                times={[...timings]}
                askHref={whatsapp}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section
        aria-label="ICT in numbers"
        className={`${container} relative z-10 -mt-10`}
      >
        <dl
          data-k-card
          className="grid grid-cols-2 gap-y-8 p-7 sm:p-9 lg:grid-cols-4"
        >
          {proof.map((p) => (
            <div
              key={p.label}
              className="flex flex-col px-2 lg:px-6 lg:first:pl-0"
            >
              <dd
                data-k-display
                className="order-1 text-[clamp(2rem,3.6vw,3rem)] leading-none font-bold text-[#3660AF] tabular-nums"
              >
                <CountUp display={p.display} />
              </dd>
              <dt className="order-2 mt-2 max-w-[24ch] text-sm text-[var(--k-muted)]">
                {p.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Results */}
      <section
        id="results"
        aria-labelledby="results-h"
        className={`${container} scroll-mt-20 py-24`}
      >
        <Reveal>
          <h2 id="results-h" data-k-h2 className="max-w-[16ch]">
            On the APSC CCE 2022 list.
          </h2>
          <a
            href={links.apscResultPdf}
            {...external}
            data-k-link
            className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline decoration-[var(--k-line-hi)] underline-offset-4"
          >
            Result of 17 January 2024
            <IconArrowUpRight aria-hidden size={15} stroke={2} />
          </a>
        </Reveal>
        <ul className="mt-10 grid gap-5 lg:grid-cols-2">
          {selections.map((s, i) => (
            <li key={s.name}>
              <Reveal delay={i * 0.06} className="h-full">
                <figure data-k-card className="flex h-full gap-6 p-7 sm:p-8">
                  <span data-mr-medal>
                    <span
                      data-k-display
                      className="text-4xl font-bold tabular-nums"
                    >
                      {s.serial}
                    </span>
                  </span>
                  <span className="grid gap-3">
                    <blockquote className="leading-relaxed text-pretty">
                      &ldquo;{s.quote}&rdquo;
                    </blockquote>
                    <figcaption>
                      <span className="block font-bold">{s.name}</span>
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
      </section>

      {/* Programme */}
      <section
        id="programme"
        aria-labelledby="programme-h"
        className={`${container} scroll-mt-20 pb-24`}
      >
        <Reveal>
          <h2 id="programme-h" data-k-h2 className="max-w-[16ch]">
            Every batch, by start time.
          </h2>
          <p className="mt-4 max-w-[50ch] text-[var(--k-muted)]">
            Times are read off ICT&apos;s own posters. One fee covers classes,
            tests, notes and the app.
          </p>
        </Reveal>
        <ol data-k-card className="mt-10 overflow-hidden">
          {timetable.map((t, i) => (
            <li
              key={t.id}
              className={i ? "border-t border-[var(--k-line)]" : ""}
            >
              <Link
                href={`${base}${t.href}`}
                className="group grid items-center gap-x-6 gap-y-1 px-6 py-5 transition-colors duration-150 hover:bg-[var(--k-hover)] sm:px-8 md:grid-cols-[1.3fr_1fr_1.2fr_7rem_2rem]"
              >
                <span>
                  <span data-k-display className="block text-xl font-semibold">
                    {t.name}
                  </span>
                  <span className="block text-sm text-[var(--k-muted)]">
                    {t.exam}
                  </span>
                </span>
                <span data-bf-fact>{t.when}</span>
                <span className="text-sm text-[var(--k-muted)]">
                  {t.days ?? t.note ?? "Days on the batch page"}
                </span>
                <span
                  data-k-display
                  className="text-xl font-bold tabular-nums md:text-right"
                >
                  {fee(t.price)}
                </span>
                <IconArrowRight
                  aria-hidden
                  size={20}
                  stroke={2}
                  className="hidden text-[#3660AF] transition-transform duration-200 ease-out group-hover:translate-x-1 md:block"
                />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Exams */}
      <section aria-labelledby="exams-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="exams-h" data-k-h2 className="max-w-[18ch]">
            Know the exam before you pick a batch.
          </h2>
        </Reveal>
        <div className="mt-10">
          <ExamGuide guides={examGuides} />
        </div>
      </section>

      {/* Faculty */}
      <section aria-labelledby="faculty-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="faculty-h" data-k-h2 className="max-w-[16ch]">
            The faculty.
          </h2>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
          {faculty.map((f, i) => (
            <li key={f.slug}>
              <Reveal delay={(i % 5) * 0.05}>
                <a
                  href={`https://www.youtube.com/watch?v=${f.lecture}`}
                  {...external}
                  className="group block text-center"
                >
                  <span
                    data-mr-ring
                    className="mx-auto block w-[168px] transition-transform duration-500 ease-out group-hover:-translate-y-1"
                  >
                    <span
                      data-k-photo
                      className="relative block aspect-square overflow-hidden rounded-full bg-white"
                    >
                      <Image
                        src={f.portrait}
                        alt={`${f.name}, ${f.teaches}`}
                        fill
                        sizes="168px"
                        className="object-cover object-top"
                      />
                    </span>
                  </span>
                  <span
                    data-k-display
                    className="mt-5 block text-lg font-semibold"
                  >
                    {f.name}
                  </span>
                  <span className="block text-sm text-[var(--k-muted)]">
                    {f.teaches}
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Watch */}
      <section aria-labelledby="watch-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="watch-h" data-k-h2 className="max-w-[18ch]">
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
                className="group relative block aspect-video w-full overflow-hidden rounded-[var(--k-inner)] bg-[#000820]"
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
                    className="grid size-14 place-items-center rounded-full transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
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
                className={`mt-3 font-semibold ${i === 0 ? "text-xl" : "text-base"}`}
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
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {reviews.slice(0, 4).map((r) => (
            <li key={r.id}>
              <PlayInPlace
                id={r.id}
                title={`${r.name}, ${r.batch}`}
                data-k-photo
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[var(--k-inner)] bg-[#000820] text-left"
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
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,8,32,0.92))]"
                />
                <span
                  data-k-btn
                  className="absolute top-3 right-3 grid size-10 place-items-center rounded-full transition-transform duration-200 ease-out group-hover:scale-105"
                >
                  <IconPlayerPlayFilled
                    aria-hidden
                    size={15}
                    className="translate-x-px"
                  />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="block font-semibold">{r.name}</span>
                  <span className="block text-sm text-[#DCE9FF]">
                    {r.exam}, {r.batch}
                  </span>
                </span>
              </PlayInPlace>
            </li>
          ))}
        </ul>
      </section>

      {/* Library */}
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
            <p className="mt-3 text-sm font-semibold text-[#2B6C83]">
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
                  <Book3D book={b} tones={bookTones} font="var(--mr-sans)" />
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
                      className="block text-lg font-semibold"
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
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {included.map((x) => (
            <li key={x.text} data-k-tile className="p-4 text-sm font-medium">
              {x.text}
            </li>
          ))}
        </ul>
      </section>

      {/* Centre */}
      <section aria-labelledby="centre-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="centre-h" data-k-h2 className="max-w-[18ch]">
            The classroom on DC Bungalow Road.
          </h2>
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {campus.slice(0, 4).map((c) => (
            <li key={c.src}>
              <figure>
                <span
                  data-k-photo
                  className="relative block aspect-[4/3] overflow-hidden rounded-[var(--k-inner)]"
                >
                  <Image
                    src={c.src}
                    alt={c.alt}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                  />
                </span>
                <figcaption className="mt-2 text-sm text-[var(--k-muted)]">
                  {c.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <div
          data-k-card
          className="mt-8 flex flex-wrap items-center justify-between gap-5 p-6 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <span
              data-k-btn
              className="grid size-12 shrink-0 place-items-center"
            >
              <IconMapPin aria-hidden size={22} stroke={1.75} />
            </span>
            <address className="not-italic">
              <span data-k-display className="block text-xl font-semibold">
                {place.street}, {place.city}
              </span>
              <span className="text-sm text-[var(--k-muted)]">
                {place.region} {place.pin}. Ask for {place.spoken}.
              </span>
            </address>
          </div>
          <a
            href={place.maps}
            {...external}
            data-k-press
            data-k-outline
            className="inline-flex h-12 items-center gap-2 px-6"
          >
            Get directions
            <IconArrowUpRight aria-hidden size={16} stroke={2} />
          </a>
        </div>
      </section>

      {/* Questions */}
      <section aria-labelledby="faq-h" className={`${container} pb-24`}>
        <h2 id="faq-h" data-k-h2>
          Questions.
        </h2>
        <dl className="mt-10 grid gap-x-14 gap-y-9 md:grid-cols-2">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt data-k-display className="text-lg font-semibold">
                {f.q}
              </dt>
              <dd className="mt-2 text-[var(--k-muted)]">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Enquire */}
      <section aria-labelledby="join-h" className={`${container} pb-24`}>
        <div data-mr-hero className="rounded-[var(--k-radius)] p-8 sm:p-12">
          <div className="relative grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="join-h" data-k-h2 className="max-w-[12ch]">
                Sit in on a class, free.
              </h2>
              <ol className="mt-8 grid gap-4">
                {joining.map((j) => (
                  <li key={j.verb} className="border-t border-white/25 pt-3">
                    <p data-k-display className="text-lg font-semibold">
                      {j.verb}
                    </p>
                    <p className="mt-1 text-sm text-[#DCE9FF]">{j.body}</p>
                  </li>
                ))}
              </ol>
              <a
                href={tel}
                data-k-press
                data-k-outline
                className="mt-8 inline-flex h-12 items-center px-6 tabular-nums"
              >
                Call {phone}
              </a>
            </div>
            <div className="lg:col-span-7">
              <div data-k-card className="p-6 sm:p-8">
                <h3 data-k-display className="text-xl font-semibold">
                  Not sure which batch? Tell us your exam and your hours.
                </h3>
                <div className="mt-6">
                  <EnquiryForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
