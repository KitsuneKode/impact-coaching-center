import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandYoutube,
  IconCheck,
  IconMapPin,
  IconMicrophone2,
  IconPhone,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

import { Book3D } from "../_book"
import { EnquiryForm } from "../_enquiry"
import { ExamGuide } from "../_exam-guide"
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
  nextBatch,
  offer,
  phone,
  place,
  podcast,
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
import { CountUp, PlayInPlace } from "../_fx"
import { Folder } from "../_folder"
import { Reveal } from "../_reveal"
import { Tower, type TowerRow } from "./_client"

import {
  bookTones,
  container,
  batchDay,
  external,
  folderTones,
  JoinCta,
} from "./_shared"

export default async function Livery() {
  const { books, folders, samples } = await shelf()
  const day = batchDay(nextBatch.startsOn)
  const victor = timetable.find((t) => t.name === nextBatch.name)
  const rows: TowerRow[] = timetable.map((t) => ({
    id: t.id,
    name: t.name,
    exam: t.exam,
    when: t.when,
    days: t.days,
    note: t.note,
    price: fee(t.price),
    href: t.href,
  }))
  const strip = [
    "APSC",
    "ADRE",
    "Assam Police",
    "Banking",
    "SSC",
    "Railway NTPC",
    "Warrior mocks",
    "Axom Dhwani",
  ]

  return (
    <>
      {/* Hero */}
      <section
        id="top"
        aria-label="Introduction"
        className="relative overflow-hidden bg-[var(--lv-sky)]"
      >
        <div aria-hidden data-lv-hero-stripe className="hidden md:block" />

        <div
          className={`${container} relative grid items-center gap-12 pt-10 pb-16 md:pt-14 md:pb-24 lg:grid-cols-12`}
        >
          <div className="lg:col-span-7">
            <h1
              data-rise
              data-lv-display
              className="text-[clamp(2.7rem,6.4vw,5.8rem)] leading-[0.9]"
            >
              Coaching for Assam&apos;s biggest exams.
            </h1>
            <p
              data-rise
              style={{ animationDelay: "0.1s" }}
              className="mt-6 max-w-[42ch] text-lg font-medium text-[var(--lv-on-sky)]"
            >
              Batches in North Lakhimpur, ICT&apos;s own books, free notes, and
              every class on the app.
            </p>
            <div
              data-rise
              style={{ animationDelay: "0.18s" }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <JoinCta />
              <a
                href="#grid"
                data-lv-press
                data-lv-btn-line
                className="inline-flex h-12 items-center rounded-lg px-6 font-bold"
              >
                See batches
              </a>
            </div>
          </div>

          {victor && (
            <div className="lg:col-span-5">
              <Link
                data-rise
                style={{ animationDelay: "0.26s" }}
                href={victor.href}
                className="group mx-auto block max-w-[400px] rotate-[-2deg] transition-transform duration-500 ease-out hover:rotate-0 motion-reduce:transition-none"
              >
                <span
                  data-lv-board
                  className="block overflow-hidden rounded-[14px]"
                >
                  <span aria-hidden data-lv-checker className="block h-6" />
                  <span className="block p-6">
                    <span className="flex items-end justify-between gap-4">
                      <span>
                        <span className="text-sm font-semibold text-[var(--lv-on-navy)]">
                          Newest batch, day
                        </span>
                        <span
                          data-lv-display
                          className="block text-[7rem] leading-[0.82] text-[var(--lv-orange)] tabular-nums"
                        >
                          <CountUp display={String(day)} />
                        </span>
                      </span>
                      <span className="pb-2 text-right">
                        <span data-lv-display className="block text-3xl">
                          {victor.name}
                        </span>
                        <span className="mt-1 block text-sm text-[var(--lv-on-navy)]">
                          {victor.exam}
                        </span>
                      </span>
                    </span>
                    <span className="mt-6 flex items-end justify-between gap-3 border-t border-white/15 pt-4">
                      <span data-lv-display className="text-2xl tabular-nums">
                        {victor.when}
                      </span>
                      <span
                        data-lv-display
                        className="text-2xl text-[var(--lv-orange)] tabular-nums"
                      >
                        {rupees(victor.price)}
                      </span>
                    </span>
                  </span>
                </span>
              </Link>
            </div>
          )}
        </div>
        <span aria-hidden data-lv-stripe />
      </section>

      {/* The one marquee */}
      <div
        aria-hidden
        className="overflow-hidden bg-[var(--lv-navy)] py-4 text-white"
      >
        <ul
          data-lv-track
          data-lv-display
          className="flex w-max items-center gap-8 text-3xl"
        >
          {[...strip, ...strip].map((w, i) => (
            <li key={`${w}-${i}`} className="flex items-center gap-8">
              {w}
              <span className="text-[var(--lv-orange)]">/</span>
            </li>
          ))}
        </ul>
      </div>

      <main>
        {/* Timing tower */}
        <section
          id="grid"
          aria-labelledby="grid-h"
          className={`${container} py-20 md:py-28`}
        >
          <Reveal>
            <h2 id="grid-h" data-lv-h2 className="max-w-[16ch]">
              Every batch, by start time.
            </h2>
            <p className="mt-4 max-w-[52ch] text-[var(--lv-muted)]">
              Times are read off ICT&apos;s own posters. One fee covers classes,
              tests, notes and the app.
            </p>
          </Reveal>
          <div className="mt-10">
            <Tower rows={rows} />
          </div>

          <Reveal className="mt-10">
            <h3 data-lv-display className="text-3xl">
              What one fee covers
            </h3>
            <p className="mt-2 max-w-[60ch] text-[var(--lv-muted)]">
              {fees.note} {fees.scholarship}
            </p>
            <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              {included.map((x) => (
                <li key={x.text} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    data-lv-btn
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md"
                  >
                    <IconCheck size={15} stroke={3} />
                  </span>
                  <span className="font-medium">{x.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* How the exams work */}
        <section
          id="exams"
          aria-labelledby="exams-h"
          className={`${container} pb-20 md:pb-28`}
        >
          <Reveal>
            <h2 id="exams-h" data-lv-h2 className="max-w-[18ch]">
              Know the exam before you pick a batch.
            </h2>
            <p className="mt-4 max-w-[56ch] text-[var(--lv-muted)]">
              How each exam is set, taken from the conducting body&apos;s own
              papers. Download the official syllabus and past papers from here.
            </p>
          </Reveal>
          <div className="mt-10">
            <ExamGuide guides={examGuides} />
          </div>
        </section>

        {/* Free first */}
        <section
          id="free"
          aria-labelledby="free-h"
          className="bg-[var(--lv-sky)] py-20 md:py-28"
        >
          <div className={container}>
            <Reveal>
              <h2 id="free-h" data-lv-h2 className="max-w-[18ch]">
                Start free. Pay when you pick a batch.
              </h2>
              {samples && (
                <p className="mt-4 text-sm font-medium text-[var(--lv-on-sky)]">
                  Sample titles until ICT adds its own.
                </p>
              )}
            </Reveal>
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
              {folders.map((f) => (
                <li key={f.id}>
                  <Link
                    data-fd-hover
                    href={f.href}
                    aria-label={`${f.name}, ${f.items.length} files`}
                    className="block rounded-[14px]"
                  >
                    <Folder folder={f} tones={folderTones} />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm font-medium text-[var(--lv-on-sky)]">
              Log in once with your mobile number to read any of them.
            </p>

            <div className="mt-12 grid gap-4 lg:grid-cols-12">
              {workshops.map((w) => (
                <Reveal key={w.name} className="lg:col-span-4">
                  <Link
                    href={w.href}
                    data-lv-card
                    className="group flex h-full items-center gap-5 rounded-[14px] p-4"
                  >
                    {w.cover && (
                      <span
                        data-lv-photo
                        className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-lg"
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
                      <span data-lv-display className="block text-2xl">
                        {w.name}
                      </span>
                      <span className="mt-1 line-clamp-2 text-sm text-[var(--lv-muted)]">
                        {w.subtitle}
                      </span>
                    </span>
                  </Link>
                </Reveal>
              ))}
              <Reveal delay={0.08} className="lg:col-span-2">
                <a
                  href={links.youtube}
                  {...external}
                  data-lv-press
                  data-lv-btn
                  className="flex h-full flex-col justify-between gap-3 rounded-[14px] p-5"
                >
                  <IconBrandYoutube aria-hidden size={28} stroke={1.75} />
                  <span>
                    <span
                      data-lv-display
                      className="block text-5xl tabular-nums"
                    >
                      {proof[2].display}
                    </span>
                    <span className="text-sm font-semibold">
                      hours of class on the app
                    </span>
                  </span>
                </a>
              </Reveal>
              <Reveal delay={0.12} className="lg:col-span-2">
                <a
                  href={`https://www.youtube.com/watch?v=${podcast.episodes[0].id}`}
                  {...external}
                  data-lv-press
                  data-lv-btn-navy
                  className="flex h-full flex-col justify-between gap-3 rounded-[14px] p-5"
                >
                  <IconMicrophone2 aria-hidden size={28} stroke={1.75} />
                  <span>
                    <span data-lv-display className="block text-2xl">
                      {podcast.name}
                    </span>
                    <span className="text-sm text-[var(--lv-on-navy)] tabular-nums">
                      {podcast.seriesViews.toLocaleString("en-IN")} views
                    </span>
                  </span>
                </a>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Watch first */}
        <section
          aria-labelledby="watch-h"
          className={`${container} pt-20 md:pt-28`}
        >
          <Reveal>
            <h2 id="watch-h" data-lv-h2 className="max-w-[18ch]">
              Watch a real class before you join.
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {classes.slice(0, 3).map((c, i) => (
              <li key={c.id} className={i === 0 ? "lg:col-span-2" : ""}>
                <PlayInPlace
                  id={c.id}
                  title={c.title}
                  data-lv-photo
                  className="group relative block aspect-video w-full overflow-hidden rounded-[14px] bg-[var(--lv-navy)]"
                >
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes={
                      i === 0
                        ? "(min-width: 1024px) 620px, 100vw"
                        : "(min-width: 1024px) 300px, 50vw"
                    }
                    className="object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span
                      data-lv-btn
                      className="grid size-14 place-items-center rounded-lg transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
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
                  data-lv-display
                  className={`mt-3 ${i === 0 ? "text-3xl" : "text-xl"}`}
                >
                  {c.title}
                </p>
                <p className="text-sm text-[var(--lv-muted)]">
                  {c.by},{" "}
                  <span className="tabular-nums">{compact(c.views)}</span> views
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Books */}
        <section
          id="books"
          aria-labelledby="books-h"
          className={`${container} py-20 md:py-28`}
        >
          <div
            data-dark
            className="rounded-[28px] bg-[var(--lv-navy)] px-5 py-12 text-white md:px-12 md:py-16"
          >
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 id="books-h" data-lv-h2 className="max-w-[14ch]">
                  ICT&apos;s books, for the exams it teaches.
                </h2>
                {samples && (
                  <p className="mt-3 text-sm text-[var(--lv-on-navy)]">
                    Sample titles for now. ICT&apos;s own books replace them
                    before launch.
                  </p>
                )}
              </div>
              <Link
                href="/books"
                data-lv-press
                data-lv-btn
                className="inline-flex h-12 items-center gap-2 rounded-lg px-6 font-bold"
              >
                All books
                <IconArrowRight aria-hidden size={18} stroke={2.25} />
              </Link>
            </div>
            <ul className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-8">
              {books.map((b) => (
                <li key={b.slug} className="min-w-0">
                  <Link data-bk-hover href={b.href} className="group block">
                    <Book3D book={b} tones={bookTones} font="var(--lv-sans)" />
                    <span className="mt-4 block px-[18px] font-semibold">
                      {b.title}
                    </span>
                    <span className="block px-[18px] text-sm text-[var(--lv-on-navy)] tabular-nums">
                      {b.price}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Teachers */}
        <section
          id="teachers"
          aria-labelledby="teachers-h"
          className="bg-[var(--lv-sky)] py-20 md:py-28"
        >
          <div className={container}>
            <Reveal>
              <h2 id="teachers-h" data-lv-h2 className="max-w-[16ch]">
                The line-up in front of the class.
              </h2>
            </Reveal>
            <ul data-lv-strips className="mt-10">
              {faculty.map((f, i) => (
                <li key={f.slug} data-lv-strip>
                  <Image
                    src={f.portrait}
                    alt={`${f.name}, ${f.teaches}`}
                    fill
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="object-cover object-top"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(11,31,58,0.92))]"
                  />
                  <span
                    data-lv-display
                    className="absolute top-4 left-4 text-4xl text-[var(--lv-orange)] tabular-nums"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 data-name data-lv-display className="text-3xl">
                      {f.name}
                    </h3>
                    <p className="text-sm text-[var(--lv-on-navy)]">
                      {f.teaches}
                    </p>
                    <div data-more className="mt-3 max-w-[34ch]">
                      <p className="text-sm">{f.note}</p>
                      <a
                        href={`https://www.youtube.com/watch?v=${f.lecture}`}
                        {...external}
                        data-lv-press
                        data-lv-btn
                        className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-bold"
                      >
                        <IconPlayerPlayFilled aria-hidden size={13} />
                        Watch a class
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Results */}
        <section
          aria-labelledby="results-h"
          className={`${container} py-20 md:py-28`}
        >
          <Reveal>
            <h2 id="results-h" data-lv-h2 className="max-w-[18ch]">
              On the APSC CCE 2022 list.
            </h2>
            <a
              href={links.apscResultPdf}
              {...external}
              className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline decoration-[var(--lv-line)] underline-offset-4 hover:decoration-[var(--lv-ink)]"
            >
              Result of 17 January 2024
              <IconArrowUpRight aria-hidden size={15} stroke={2} />
            </a>
          </Reveal>

          <ul className="mt-10 grid gap-4">
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

          <Reveal className="mt-14">
            <h3 data-lv-display className="text-3xl">
              Students on their batch
            </h3>
          </Reveal>
          <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {reviews.slice(0, 4).map((r) => (
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

          <dl className="mt-10 grid grid-cols-2 gap-y-8 border-t-[3px] border-[var(--lv-navy)] pt-8 lg:grid-cols-4">
            {proof.map((p) => (
              <div key={p.label} className="flex flex-col pr-4">
                <dd
                  data-lv-display
                  className="text-[clamp(2.6rem,5vw,4.2rem)] tabular-nums"
                >
                  <CountUp display={p.display} />
                </dd>
                <dt className="order-2 mt-2 max-w-[24ch] text-sm text-[var(--lv-muted)]">
                  {p.label}
                </dt>
              </div>
            ))}
          </dl>
        </section>

        {/* The centre */}
        <section aria-labelledby="centre-h" className="pb-20 md:pb-28">
          <div className={container}>
            <Reveal>
              <h2 id="centre-h" data-lv-h2 className="max-w-[18ch]">
                The classroom on DC Bungalow Road.
              </h2>
            </Reveal>
            <ul className="mt-10 grid gap-3 md:grid-cols-3">
              {campus.slice(0, 3).map((c, i) => (
                <li key={c.src} className={i === 1 ? "md:translate-y-10" : ""}>
                  <figure>
                    <span
                      data-lv-photo
                      className="relative block aspect-[4/3] overflow-hidden rounded-[14px]"
                    >
                      <Image
                        src={c.src}
                        alt={c.alt}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover"
                      />
                    </span>
                    <figcaption className="mt-2 text-sm text-[var(--lv-muted)]">
                      {c.caption}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            <div
              data-lv-card
              className="mt-16 flex flex-wrap items-center justify-between gap-5 rounded-[14px] p-6 md:mt-20"
            >
              <div className="flex items-start gap-4">
                <span
                  data-lv-btn
                  className="grid size-12 shrink-0 place-items-center rounded-lg"
                >
                  <IconMapPin aria-hidden size={22} stroke={1.75} />
                </span>
                <address className="not-italic">
                  <span data-lv-display className="block text-2xl">
                    {place.street}, {place.city}
                  </span>
                  <span className="text-sm text-[var(--lv-muted)]">
                    {place.region} {place.pin}. Ask for {place.spoken}.
                  </span>
                </address>
              </div>
              <a
                href={place.maps}
                {...external}
                data-lv-press
                data-lv-btn-line
                className="inline-flex h-12 items-center gap-2 rounded-lg px-6 font-bold"
              >
                Get directions
                <IconArrowUpRight aria-hidden size={16} stroke={2} />
              </a>
            </div>
          </div>
        </section>

        {/* Questions */}
        <section
          aria-labelledby="faq-h"
          className={`${container} pt-6 pb-20 md:pb-28`}
        >
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h2 id="faq-h" data-lv-h2>
              Questions.
            </h2>
            <a
              href={whatsapp}
              {...external}
              data-lv-press
              data-lv-btn-line
              className="inline-flex h-12 items-center gap-2 rounded-lg px-6 font-bold"
            >
              Ask on WhatsApp
              <IconArrowUpRight aria-hidden size={16} stroke={2} />
            </a>
          </div>
          <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt data-lv-display className="text-2xl">
                  {f.q}
                </dt>
                <dd className="mt-2 text-[var(--lv-muted)]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Enquire */}
        <section
          aria-labelledby="join-h"
          className="bg-[var(--lv-orange)] text-[var(--lv-navy)]"
        >
          <span aria-hidden data-lv-checker className="block h-6" />
          <div
            className={`${container} grid gap-12 py-16 md:py-24 lg:grid-cols-12`}
          >
            <div className="lg:col-span-7">
              <h2
                id="join-h"
                data-lv-display
                className="text-[clamp(3rem,7vw,6rem)] leading-[0.88]"
              >
                Sit in on a class, free.
              </h2>
              <ol className="mt-9 grid gap-5 sm:max-w-[520px]">
                {joining.map((j) => (
                  <li
                    key={j.verb}
                    className="border-t-[3px] border-[var(--lv-navy)] pt-3"
                  >
                    <p data-lv-display className="text-2xl">
                      {j.verb}
                    </p>
                    <p className="mt-1 text-sm font-medium">{j.body}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={whatsapp}
                  {...external}
                  data-lv-press
                  data-lv-btn-navy
                  className="inline-flex h-12 items-center gap-2 rounded-lg px-6 font-bold whitespace-nowrap"
                >
                  {offer.cta}
                  <IconArrowRight aria-hidden size={18} stroke={2.25} />
                </a>
                <a
                  href={tel}
                  data-lv-press
                  data-lv-btn-line
                  className="inline-flex h-12 items-center gap-2 rounded-lg px-6 font-bold tabular-nums"
                >
                  <IconPhone aria-hidden size={18} stroke={2} />
                  Call {phone}
                </a>
              </div>
            </div>
            <div className="self-start lg:col-span-5">
              <div
                data-lv-card
                className="rounded-[14px] p-6 text-[var(--lv-ink)] sm:p-8"
              >
                <h3 data-lv-display className="text-3xl">
                  Not sure which batch? Tell us your exam and hours.
                </h3>
                <div className="mt-6">
                  <EnquiryForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
