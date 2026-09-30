import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandYoutube,
  IconCheck,
  IconMapPin,
  IconMicrophone2,
  IconPhone,
  IconPlayerPlayFilled,
  IconPlus,
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
  courses,
  examGuides,
  faculty,
  faqs,
  fees,
  included,
  joining,
  links,
  nextBatch,
  phone,
  place,
  podcast,
  proof,
  reviews,
  rupees,
  selections,
  shelf,
  tel,
  whatsapp,
  workshops,
} from "../_data"
import { CountUp, PlayInPlace } from "../_fx"
import { Folder } from "../_folder"
import { Reveal } from "../_reveal"
import {
  Announce,
  Configurator,
  CopyButton,
  FinishPicker,
  type Trim,
} from "./_client"
import {
  base,
  bookTones,
  container,
  batchDay,
  external,
  folderTones,
  JoinCta,
} from "./_shared"

/**
 * Prototype 13: Clearcoat. Deep automotive blues, wide display type, panels
 * that catch light under the pointer. The whole page repaints in one of
 * three finishes. Colour: one blue family per finish, one accent.
 */

export default async function Clearcoat() {
  const { books, folders, samples } = await shelf()
  const victor = courses.find((c) => c.name === nextBatch.name)
  const day = batchDay(nextBatch.startsOn)

  const trims: Trim[] = courses.map((c) => ({
    slug: c.slug,
    exam: c.exam,
    full: c.full,
    covers: c.covers,
    duration: c.duration,
    name: c.name,
    price: c.price ? rupees(c.price) : null,
    mrp: c.mrp ? rupees(c.mrp) : null,
    when: c.when,
    days: c.days,
    note: c.note,
    href: `${base}${c.href}`,
    faculty: c.faculty.map((f) => ({
      name: f.name,
      portrait: f.portrait,
      teaches: f.teaches,
    })),
  }))

  return (
    <main id="top" className="relative">
      {/* Hero */}
      <section
        aria-label="Introduction"
        className={`${container} grid items-center gap-10 pt-12 pb-10 md:pt-16 lg:grid-cols-12 lg:gap-14`}
      >
        <div className="lg:col-span-7">
          <p
            data-rise
            data-cc-wide
            className="text-[0.7rem] text-[var(--cc-muted)]"
          >
            North Lakhimpur, Assam
          </p>
          <h1
            data-rise
            style={{ animationDelay: "0.06s" }}
            data-cc-display
            className="mt-5 text-[clamp(1.6rem,2.9vw,2.6rem)] leading-[1.18] font-light tracking-[-0.025em]"
          >
            Coaching for Assam&apos;s biggest exams.
          </h1>
          <p
            data-rise
            style={{ animationDelay: "0.12s" }}
            className="mt-6 max-w-[44ch] text-lg text-[var(--cc-muted)]"
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
              href="#batches"
              data-cc-press
              data-cc-outline
              className="inline-flex h-12 items-center rounded-full px-6 font-semibold"
            >
              See batches
            </a>
          </div>
        </div>

        <div
          data-rise
          style={{ animationDelay: "0.24s" }}
          data-coat
          data-cc-panel
          className="overflow-hidden rounded-[28px] lg:col-span-5"
        >
          <div data-cc-photo className="relative aspect-[16/10]">
            <Image
              src={campus[0].src}
              alt={campus[0].alt}
              fill
              priority
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,26,0.05),rgba(5,8,26,0.7))]"
            />
          </div>
          <div className="p-3">
            <FinishPicker />
          </div>
        </div>
      </section>

      {/* Announcement bar */}
      <section aria-label="Announcement" className={`${container} pb-6`}>
        <Announce
          tag="New batch"
          action="See the batch"
          href={victor ? `${base}${victor.href}` : `${base}/courses`}
        >
          <strong className="font-medium">
            Day {day}: {nextBatch.name}.
          </strong>{" "}
          <span className="text-[var(--cc-muted)]">
            {nextBatch.exam}, {nextBatch.timing}, for {nextBatch.forWho}.
          </span>
        </Announce>
      </section>

      {/* Offer + books */}
      <section
        id="free"
        aria-labelledby="offer-h"
        className={`${container} grid gap-4 pt-6 pb-24 lg:grid-cols-12`}
      >
        <Reveal className="lg:col-span-7">
          <div
            data-coat
            data-cc-panel
            className="h-full rounded-[28px] p-6 sm:p-8"
          >
            <span
              data-cc-tag
              className="inline-block rounded-full px-3 py-1.5 text-[0.66rem]"
            >
              Free workshop
            </span>
            <h2 id="offer-h" data-cc-h2 className="mt-5 max-w-[20ch]">
              Start with a free workshop.
            </h2>
            <p className="mt-4 max-w-[50ch] text-[var(--cc-muted)]">
              Pay only when you pick a batch. Kouxal for APSC and ABHIGYAN for
              banking, SSC and Railway are both listed free on the ICT app.
            </p>

            {victor?.price && (
              <p className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span
                  data-cc-display
                  className="text-[clamp(2rem,4.4vw,3.2rem)] leading-none font-light tabular-nums"
                >
                  {rupees(victor.price)}
                </span>
                {victor.mrp && (
                  <s className="text-[var(--cc-muted)] tabular-nums">
                    {rupees(victor.mrp)}
                  </s>
                )}
                <span className="text-sm text-[var(--cc-muted)]">
                  for {nextBatch.name}
                </span>
              </p>
            )}

            <dl className="mt-6 flex flex-wrap gap-2">
              {[
                ["Batch day", String(day)],
                ["Batch time", nextBatch.timing],
                ["Built for", nextBatch.forWho],
              ].map(([k, v]) => (
                <div key={k} data-cc-tile className="rounded-2xl px-4 py-3">
                  <dt
                    data-cc-wide
                    className="text-[0.6rem] text-[var(--cc-muted)]"
                  >
                    {k}
                  </dt>
                  <dd
                    data-cc-display
                    className="mt-1.5 text-lg font-light tabular-nums"
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            <div
              data-cc-tile
              className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[var(--cc-edge-strong)] py-2 pr-2 pl-5"
            >
              <span>
                <span
                  data-cc-wide
                  className="block text-[0.6rem] text-[var(--cc-muted)]"
                >
                  WhatsApp
                </span>
                <span
                  data-cc-display
                  className="text-base font-light tabular-nums"
                >
                  {phone}
                </span>
              </span>
              <CopyButton text={phone} label="Copy number" done="Copied" />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <JoinCta />
              <a
                href="#batches"
                data-cc-press
                data-cc-outline
                className="inline-flex h-12 items-center rounded-full px-6 font-semibold"
              >
                Compare batches
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-5">
          <div
            data-coat
            data-cc-panel
            className="flex h-full flex-col overflow-hidden rounded-[28px]"
          >
            <div className="relative grid min-h-[300px] flex-1 place-items-center bg-[radial-gradient(70%_80%_at_50%_0%,rgba(var(--cc-glow),0.28),transparent)] px-8 pt-10 pb-6">
              <div className="grid w-full max-w-[300px] grid-cols-2 gap-5">
                {books.slice(0, 2).map((b) => (
                  <Link
                    key={b.slug}
                    data-bk-hover
                    href={`${base}/books/${b.slug}`}
                    aria-label={b.title}
                    className="block"
                  >
                    <Book3D book={b} tones={bookTones} font="var(--cc-sans)" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="p-6 sm:p-7">
              <span
                data-cc-tag
                className="inline-block rounded-full px-3 py-1.5 text-[0.66rem]"
              >
                Books
              </span>
              <h3 className="mt-4 text-xl font-medium tracking-[-0.015em]">
                ICT&apos;s own books
              </h3>
              <p className="mt-2 text-[var(--cc-muted)]">
                Written for the exams ICT teaches.
                {samples ? " Sample titles until ICT adds its own." : ""}
              </p>
              <Link
                href={`${base}/books`}
                data-cc-press
                data-cc-btn
                className="group mt-5 inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold"
              >
                Open the shelf
                <IconArrowRight
                  aria-hidden
                  size={18}
                  stroke={2}
                  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Batches */}
      <section
        id="batches"
        aria-labelledby="batches-h"
        className={`${container} pb-24`}
      >
        <Reveal>
          <h2 id="batches-h" data-cc-h2 className="max-w-[20ch]">
            Pick a batch. Keep the hour.
          </h2>
        </Reveal>
        <div className="mt-10">
          <Configurator trims={trims} />
        </div>

        <Reveal className="mt-4">
          <div
            data-coat
            data-cc-panel
            className="grid gap-8 rounded-[28px] p-6 sm:p-8 lg:grid-cols-12"
          >
            <div className="lg:col-span-4">
              <h3 className="text-xl font-medium tracking-[-0.015em]">
                What one fee covers
              </h3>
              <p className="mt-2 text-[var(--cc-muted)]">{fees.note}</p>
              <p className="mt-2 text-[var(--cc-muted)]">{fees.scholarship}</p>
            </div>
            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:col-span-8">
              {included.map((x) => (
                <li key={x.text} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    data-cc-btn
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full"
                  >
                    <IconCheck size={14} stroke={2.5} />
                  </span>
                  <span>{x.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* How the exams work */}
      <section
        id="exams"
        aria-labelledby="exams-h"
        className={`${container} pb-24`}
      >
        <Reveal>
          <h2 id="exams-h" data-cc-h2 className="max-w-[22ch]">
            Know the exam before you pick a batch.
          </h2>
          <p className="mt-4 max-w-[56ch] text-[var(--cc-muted)]">
            How each exam is set, taken from the conducting body&apos;s own
            papers. Download the official syllabus and past papers from here.
          </p>
        </Reveal>
        <div className="mt-10">
          <ExamGuide guides={examGuides} />
        </div>
      </section>

      {/* Watch before you join */}
      <section aria-labelledby="watch-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="watch-h" data-cc-h2 className="max-w-[22ch]">
            Watch a real class before you join.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          {classes.slice(0, 4).map((c, i) => (
            <Reveal
              key={c.id}
              delay={i * 0.05}
              className={
                i === 0 ? "lg:col-span-7 lg:row-span-3" : "lg:col-span-5"
              }
            >
              <div
                data-coat
                data-cc-panel
                className={`flex h-full gap-4 overflow-hidden rounded-[28px] p-3 ${i === 0 ? "flex-col" : "items-center"}`}
              >
                <PlayInPlace
                  id={c.id}
                  title={c.title}
                  data-cc-photo
                  className={`group relative block shrink-0 overflow-hidden rounded-[20px] bg-black ${i === 0 ? "aspect-video w-full" : "aspect-video w-36 sm:w-44"}`}
                >
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes={
                      i === 0 ? "(min-width: 1024px) 700px, 100vw" : "180px"
                    }
                    className="object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span
                      data-cc-btn
                      className="grid size-12 place-items-center rounded-full transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
                    >
                      <IconPlayerPlayFilled
                        aria-hidden
                        size={18}
                        className="translate-x-px"
                      />
                    </span>
                  </span>
                </PlayInPlace>
                <div className={i === 0 ? "px-2 pb-2" : "min-w-0 pr-3"}>
                  <p
                    className={`font-medium tracking-[-0.01em] ${i === 0 ? "text-xl" : "line-clamp-2"}`}
                  >
                    {c.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--cc-muted)]">
                    {c.by},{" "}
                    <span className="tabular-nums">{compact(c.views)}</span>{" "}
                    views
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Free material */}
      <section aria-labelledby="notes-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="notes-h" data-cc-h2 className="max-w-[22ch]">
            Notes, workshops and classes you can open today.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div
              data-coat
              data-cc-panel
              className="h-full rounded-[28px] p-6 sm:p-8"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-xl font-medium tracking-[-0.015em]">
                  Free study material
                </h3>
                <Link
                  href={`${base}/notes`}
                  className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[var(--cc-muted)] transition-colors hover:text-[var(--cc-ink)]"
                >
                  Open the library
                  <IconArrowUpRight aria-hidden size={15} stroke={1.5} />
                </Link>
              </div>
              {samples && (
                <p className="mt-1 text-sm text-[var(--cc-muted)]">
                  Sample titles until ICT adds its own.
                </p>
              )}
              <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3">
                {folders.map((f) => (
                  <li key={f.id}>
                    <Link
                      data-fd-hover
                      href={`${base}/notes#${f.id}`}
                      aria-label={`${f.name}, ${f.items.length} files`}
                      className="block rounded-[14px]"
                    >
                      <Folder folder={f} tones={folderTones} />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-[var(--cc-muted)]">
                Log in once with your mobile number to read any of them.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 lg:col-span-5">
            <Reveal delay={0.06}>
              <div
                data-coat
                data-cc-panel
                className="rounded-[28px] p-6 sm:p-7"
              >
                <h3 className="text-lg font-medium">Free workshops</h3>
                <ul className="mt-5 grid gap-4">
                  {workshops.map((w) => (
                    <li key={w.name}>
                      <Link
                        href={`${base}${w.href}`}
                        className="group flex items-center gap-4"
                      >
                        {w.cover && (
                          <span
                            data-cc-photo
                            className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-2xl"
                          >
                            <Image
                              src={w.cover}
                              alt={`${w.name} poster`}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block font-medium transition-colors group-hover:text-[var(--cc-a1)]">
                            {w.name}
                          </span>
                          <span className="line-clamp-2 text-sm text-[var(--cc-muted)]">
                            {w.subtitle}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <a
                href={links.youtube}
                {...external}
                data-coat
                data-cc-panel
                className="group flex items-center justify-between gap-4 rounded-[28px] p-6 sm:p-7"
              >
                <span>
                  <span
                    data-cc-display
                    className="block text-3xl font-light tabular-nums"
                  >
                    {proof[2].display}
                  </span>
                  <span className="text-sm text-[var(--cc-muted)]">
                    hours of class on the app
                  </span>
                </span>
                <IconBrandYoutube
                  aria-hidden
                  size={30}
                  stroke={1.5}
                  className="transition-transform duration-300 ease-out group-hover:scale-110"
                />
              </a>
            </Reveal>
            <Reveal delay={0.14}>
              <a
                href={`https://www.youtube.com/watch?v=${podcast.episodes[0].id}`}
                {...external}
                data-coat
                data-cc-panel
                className="group flex items-center justify-between gap-4 rounded-[28px] p-6 sm:p-7"
              >
                <span>
                  <span className="block font-medium">
                    {podcast.name}, the podcast
                  </span>
                  <span className="text-sm text-[var(--cc-muted)] tabular-nums">
                    {podcast.seriesViews.toLocaleString("en-IN")} views
                  </span>
                </span>
                <IconMicrophone2
                  aria-hidden
                  size={28}
                  stroke={1.5}
                  className="transition-transform duration-300 ease-out group-hover:scale-110"
                />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Teachers: a snap row */}
      <section id="teachers" aria-labelledby="teachers-h" className="pb-24">
        <div className={container}>
          <Reveal>
            <h2 id="teachers-h" data-cc-h2 className="max-w-[20ch]">
              The people in front of the class.
            </h2>
          </Reveal>
        </div>
        <ul
          data-cc-snap
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-[max(2rem,calc((100vw-1240px)/2+2rem))]"
        >
          {faculty.map((f) => (
            <li
              key={f.slug}
              className="w-[250px] shrink-0 snap-start scroll-ml-5 sm:w-[270px]"
            >
              <article
                data-coat
                data-cc-panel
                data-cc-lift
                className="flex h-full flex-col overflow-hidden rounded-[28px]"
              >
                <div data-cc-photo className="relative aspect-[4/5]">
                  <Image
                    src={f.portrait}
                    alt={`${f.name}, ${f.teaches}`}
                    fill
                    sizes="270px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-medium tracking-[-0.01em]">
                    {f.name}
                  </h3>
                  <p className="text-sm text-[var(--cc-muted)]">{f.teaches}</p>
                  <p className="mt-3 text-sm text-[var(--cc-muted)]">
                    {f.note}
                  </p>
                  <a
                    href={`https://www.youtube.com/watch?v=${f.lecture}`}
                    {...external}
                    data-cc-press
                    data-cc-outline
                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 self-start rounded-full px-5 text-sm font-medium"
                  >
                    <IconPlayerPlayFilled aria-hidden size={13} />
                    Watch a class
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {/* Results */}
      <section
        id="results"
        aria-labelledby="results-h"
        className={`${container} pb-24`}
      >
        <Reveal>
          <h2 id="results-h" data-cc-h2 className="max-w-[22ch]">
            Two officers on the APSC CCE 2022 list studied here.
          </h2>
          <a
            href={links.apscResultPdf}
            {...external}
            className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm text-[var(--cc-muted)] underline decoration-white/25 underline-offset-4 hover:text-[var(--cc-ink)]"
          >
            Result of 17 January 2024
            <IconArrowUpRight aria-hidden size={15} stroke={1.5} />
          </a>
        </Reveal>

        <Reveal className="mt-10">
          <dl
            data-coat
            data-cc-panel
            className="grid grid-cols-2 gap-y-8 rounded-[28px] p-6 sm:p-8 lg:grid-cols-4"
          >
            {proof.map((p) => (
              <div
                key={p.label}
                className="flex flex-col lg:px-4 lg:first:pl-0"
              >
                <dt className="order-2 mt-2 max-w-[22ch] text-sm text-[var(--cc-muted)]">
                  {p.label}
                </dt>
                <dd
                  data-cc-display
                  className="order-1 text-[clamp(1.6rem,3vw,2.4rem)] leading-none font-light tabular-nums"
                >
                  <CountUp display={p.display} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <ul className="mt-4 grid gap-4">
          {selections.map((s, i) => (
            <li key={s.name}>
              <Reveal delay={i * 0.05}>
                <figure
                  data-coat
                  data-cc-panel
                  className="grid items-center gap-5 rounded-[28px] p-6 sm:p-8 md:grid-cols-[auto_1fr_auto]"
                >
                  <span
                    data-cc-display
                    className="text-[clamp(2.4rem,5vw,4rem)] leading-none font-light text-[var(--cc-a1)] tabular-nums"
                  >
                    {s.serial}
                  </span>
                  <blockquote className="max-w-[60ch] leading-relaxed text-pretty">
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                  <figcaption className="md:text-right">
                    <span className="block font-medium">{s.name}</span>
                    <span className="text-sm text-[var(--cc-muted)]">
                      {s.post}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="mt-14">
          <h3 className="text-xl font-medium tracking-[-0.015em]">
            Students on their batch
          </h3>
        </Reveal>
        <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {reviews.slice(0, 4).map((r) => (
            <li key={r.id}>
              <PlayInPlace
                id={r.id}
                title={`${r.name}, ${r.batch}`}
                data-cc-photo
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-black text-left"
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
                  data-cc-btn
                  className="absolute top-3 right-3 grid size-10 place-items-center rounded-full transition-transform duration-200 ease-out group-hover:scale-105"
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

      {/* The centre */}
      <section aria-labelledby="centre-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="centre-h" data-cc-h2 className="max-w-[22ch]">
            The classroom on DC Bungalow Road.
          </h2>
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-6">
          {campus.slice(0, 4).map((c, i) => (
            <li
              key={c.src}
              className={
                i === 0
                  ? "col-span-2 md:col-span-4"
                  : i === 3
                    ? "col-span-2 md:col-span-3"
                    : "md:col-span-2"
              }
            >
              <figure>
                <span
                  data-cc-photo
                  className={`relative block overflow-hidden rounded-[20px] ${i === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}
                >
                  <Image
                    src={c.src}
                    alt={c.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </span>
                <figcaption className="mt-2 px-1 text-sm text-[var(--cc-muted)]">
                  {c.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <Reveal className="mt-8">
          <div
            data-coat
            data-cc-panel
            className="flex flex-wrap items-center justify-between gap-5 rounded-[28px] p-6 sm:p-7"
          >
            <div className="flex items-start gap-4">
              <span
                data-cc-tile
                className="grid size-12 shrink-0 place-items-center rounded-2xl"
              >
                <IconMapPin aria-hidden size={22} stroke={1.5} />
              </span>
              <address className="not-italic">
                <span className="block font-medium">
                  {place.street}, {place.city}
                </span>
                <span className="text-sm text-[var(--cc-muted)]">
                  {place.region} {place.pin}. Ask for {place.spoken}.
                </span>
              </address>
            </div>
            <a
              href={place.maps}
              {...external}
              data-cc-press
              data-cc-outline
              className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold"
            >
              Get directions
              <IconArrowUpRight aria-hidden size={16} stroke={1.75} />
            </a>
          </div>
        </Reveal>
      </section>

      {/* Questions */}
      <section
        aria-labelledby="faq-h"
        className={`${container} grid gap-8 pb-24 lg:grid-cols-12`}
      >
        <div className="lg:col-span-4">
          <h2 id="faq-h" data-cc-h2>
            Questions.
          </h2>
          <p className="mt-4 max-w-[30ch] text-[var(--cc-muted)]">
            Something not answered here? Send it on WhatsApp.
          </p>
          <a
            href={whatsapp}
            {...external}
            data-cc-press
            data-cc-outline
            className="mt-5 inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold"
          >
            Ask on WhatsApp
            <IconArrowUpRight aria-hidden size={16} stroke={1.75} />
          </a>
        </div>
        <div
          data-coat
          data-cc-panel
          className="rounded-[28px] px-6 py-2 sm:px-8 lg:col-span-8"
        >
          {faqs.map((f, i) => (
            <details
              key={f.q}
              data-cc-faq
              className={`${i ? "border-t border-white/10" : ""}`}
            >
              <summary className="flex min-h-16 items-center justify-between gap-4 py-4">
                <span className="font-medium">{f.q}</span>
                <IconPlus
                  data-plus
                  aria-hidden
                  size={20}
                  stroke={1.5}
                  className="shrink-0 text-[var(--cc-muted)]"
                />
              </summary>
              <p className="max-w-[62ch] pb-5 text-[var(--cc-muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Enquire */}
      <section aria-labelledby="join-h" className={`${container} pb-20`}>
        <div
          data-coat
          data-cc-panel
          className="grid gap-10 rounded-[36px] p-7 sm:p-12 lg:grid-cols-12"
        >
          <div className="lg:col-span-5">
            <h2
              id="join-h"
              data-cc-display
              className="text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.1] font-light tracking-[-0.025em]"
            >
              Sit in on a class, free.
            </h2>
            <ol className="mt-8 grid gap-5">
              {joining.map((j) => (
                <li key={j.verb} className="border-t border-white/15 pt-4">
                  <p className="font-medium">{j.verb}</p>
                  <p className="mt-1 text-sm text-[var(--cc-muted)]">
                    {j.body}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={tel}
                data-cc-press
                data-cc-outline
                className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold tabular-nums"
              >
                <IconPhone aria-hidden size={18} stroke={1.5} />
                Call {phone}
              </a>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div data-cc-tile className="rounded-[24px] p-6 sm:p-8">
              <h3 className="text-xl font-medium tracking-[-0.015em]">
                Not sure which batch? Tell us your exam and your hours.
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
