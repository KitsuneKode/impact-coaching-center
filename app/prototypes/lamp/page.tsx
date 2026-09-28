import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandGooglePlay,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { Book3D } from "../_book"
import { Folder } from "../_folder"
import {
  classes,
  compact,
  courses,
  faculty,
  faqs,
  joining,
  links,
  phone,
  proof,
  rupees,
  selections,
  shelf,
  tel,
  timetable,
  workshops,
} from "../_data"
import { CountUp, PlayInPlace, ScrollTilt, SpotlightGroup } from "../_fx"
import { Reveal } from "../_reveal"
import {
  bookTones,
  CallCta,
  card,
  container,
  external,
  folderTones,
  h2,
  LampShell,
  NotesCta,
  Play,
  PrimaryCta,
} from "./_chrome"
import { CourseTabs } from "./_client"

export const metadata: Metadata = { title: "Lamp" }

export default async function Lamp() {
  const { books, folders, samples } = await shelf()
  const feature = classes[0]!
  const reel = classes.slice(1)
  const tabs = courses.map((c) => ({
    slug: c.slug,
    label: c.exam,
    name: c.name,
    full: c.full,
    covers: c.covers,
    duration: c.duration,
    when: c.when,
    days: c.days,
    price: c.price ? rupees(c.price) : null,
    mrp: c.mrp ? rupees(c.mrp) : null,
    cover: c.cover,
    href: `/prototypes/lamp/courses/${c.slug}`,
    faculty: c.faculty.map((f) => ({ name: f.name, portrait: f.portrait })),
  }))

  return (
    <LampShell>
      <main id="top">
        {/* Hero: the lamp, the promise, then the class itself tipping into view. */}
        <section aria-label="Introduction" className="relative overflow-hidden">
          <div data-lp-dots aria-hidden />
          <div data-lamp="hero" aria-hidden>
            <div data-lamp-on>
              <div data-lamp-glow />
              <div data-lamp-cone />
              <div data-lamp-bar />
            </div>
          </div>
          <div className={`${container} relative pt-40 text-center md:pt-44`}>
            <h1
              data-rise
              className="mx-auto max-w-[24ch] text-[clamp(2.4rem,5.4vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-balance [font-stretch:112%]"
            >
              Assam&apos;s exams, with teachers you can watch first.
            </h1>
            <p
              data-rise
              style={{ animationDelay: "0.12s" }}
              className="mx-auto mt-6 max-w-[54ch] text-lg text-pretty text-[var(--lp-muted)]"
            >
              APSC, ADRE, Assam Police and banking batches in North Lakhimpur,
              with ICT&apos;s own books and free notes.
            </p>
            <div
              data-rise
              style={{ animationDelay: "0.22s" }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              <PrimaryCta />
              <NotesCta />
            </div>
          </div>

          <ScrollTilt
            className={`${container} mt-16 max-w-[1040px] pb-6 md:mt-20`}
          >
            <div className="rounded-[26px] bg-[var(--lp-card)] p-2 shadow-[0_0_0_1px_var(--lp-line-hi),0_40px_120px_-40px_rgba(245,181,68,0.35)] md:p-3">
              <PlayInPlace
                id={feature.id}
                title={feature.title}
                className="group relative block aspect-video w-full overflow-hidden rounded-[18px] bg-black"
              >
                <Image
                  src={feature.image}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1200px) 1140px, 100vw"
                  className="object-cover"
                />
                <span className="absolute inset-0 grid place-items-center bg-[rgba(7,9,14,0.18)]">
                  <Play size="lg" />
                </span>
              </PlayInPlace>
            </div>
            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-2 text-sm">
              <p>
                <span className="font-medium">{feature.title}</span>
                <span className="text-[var(--lp-muted)]"> by {feature.by}</span>
              </p>
              <p className="text-[var(--lp-muted)] tabular-nums">
                {compact(feature.views)} views on YouTube
              </p>
            </div>
          </ScrollTilt>
        </section>

        {/* Proof: four figures, each links to where it can be checked. */}
        <section aria-label="In numbers" className="py-16 md:py-24">
          <div
            className={`${container} grid grid-cols-2 gap-y-10 md:grid-cols-4`}
          >
            {proof.map((p, i) => (
              <a
                key={p.label}
                href={p.href}
                {...external}
                className={`group px-1 md:px-6 ${i % 2 ? "border-l border-[var(--lp-line)] pl-5 md:pl-6" : ""} ${i > 0 ? "md:border-l md:border-[var(--lp-line)]" : ""}`}
              >
                <span className="block text-4xl font-semibold tracking-[-0.03em] [font-stretch:112%] transition-colors duration-200 group-hover:text-[var(--lp-amber)] md:text-5xl">
                  <CountUp display={p.display} />
                </span>
                <span className="mt-2 block max-w-[22ch] text-sm text-[var(--lp-muted)]">
                  {p.label}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* What a batch includes: a spotlight bento, five cells for five facts. */}
        <section
          id="inside"
          aria-labelledby="inside-h"
          className="py-16 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="inside-h" className={`${h2} max-w-[18ch]`}>
                One fee. Classes, tests, notes and the app.
              </h2>
            </Reveal>
            <SpotlightGroup className="mt-12">
              <div
                data-lp-bento
                className="grid gap-4 md:grid-cols-6 md:grid-rows-[auto_auto_auto]"
              >
                {/* App */}
                <div
                  data-spot
                  className={`${card} flex flex-col p-7 md:col-span-4 md:row-span-2 md:p-9`}
                >
                  <div className="relative z-[1] flex items-start justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.03em] [font-stretch:112%] md:text-3xl">
                        Every class, recorded on the ICT app.
                      </h3>
                      <p className="mt-3 max-w-[44ch] text-[var(--lp-muted)]">
                        Miss a class and it is on your phone the same day, with
                        the notes and tests.
                      </p>
                    </div>
                    <Image
                      src="/brand/ict-app-icon.png"
                      alt=""
                      width={64}
                      height={64}
                      className="hidden size-16 rounded-2xl shadow-[0_0_0_1px_var(--lp-line-hi),0_16px_40px_-12px_rgba(245,181,68,0.4)] sm:block"
                    />
                  </div>
                  <ul className="relative z-[1] mt-8 grid gap-2">
                    {classes.slice(1, 5).map((c) => (
                      <li key={c.id}>
                        <a
                          href={c.href}
                          {...external}
                          className="group flex items-center gap-4 rounded-2xl p-2 pr-4 transition-colors duration-200 hover:bg-[rgba(226,232,242,0.04)]"
                        >
                          <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-[10px]">
                            <Image
                              src={c.image}
                              alt=""
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              {c.title}
                            </span>
                            <span className="block text-sm text-[var(--lp-muted)]">
                              {c.by}
                            </span>
                          </span>
                          <span className="text-sm text-[var(--lp-muted)] tabular-nums">
                            {compact(c.views)}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={links.play}
                    {...external}
                    data-quiet
                    className="relative z-[1] mt-auto inline-flex items-center gap-2 pt-8 text-sm text-[var(--lp-muted)]"
                  >
                    <IconBrandGooglePlay aria-hidden size={18} stroke={1.75} />
                    Get the ICT app on Google Play
                    <IconArrowUpRight aria-hidden size={16} stroke={1.75} />
                  </a>
                </div>

                {/* Mock tests */}
                <div
                  data-spot
                  className={`${card} relative min-h-[240px] p-7 md:col-span-2`}
                >
                  <Image
                    src="/campus/mock-invigilator.jpg"
                    alt="A full hall of students writing a mock test at ICT"
                    fill
                    sizes="(min-width: 768px) 380px, 100vw"
                    className="object-cover object-[50%_30%] opacity-40 grayscale"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--lp-card)_20%,transparent)]" />
                  <div className="relative z-[1] flex h-full flex-col justify-end">
                    <p className="text-5xl font-semibold tracking-[-0.03em] [font-stretch:112%] tabular-nums">
                      20<span className="text-[var(--lp-amber)]">+</span>20
                    </p>
                    <p className="mt-2 text-[var(--lp-muted)]">
                      Prelims and Mains mock tests, discussed in class.
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div data-spot className={`${card} p-7 md:col-span-2`}>
                  <h3 className="relative z-[1] font-semibold">
                    Pick an hour you can keep.
                  </h3>
                  <ul className="relative z-[1] mt-5 grid gap-3 text-sm">
                    {timetable.map((t) => (
                      <li key={t.id} className="flex items-baseline gap-3">
                        <span className="w-24 shrink-0 font-medium tabular-nums">
                          {t.when}
                        </span>
                        <span className="text-[var(--lp-muted)]">
                          {t.name}
                          {t.note?.startsWith("Batch started 14") && (
                            <span className="block text-[var(--lp-amber)]">
                              {t.note}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Library and hostel */}
                <div
                  data-spot
                  className={`${card} grid grid-cols-[1fr_auto] md:col-span-3`}
                >
                  <div className="relative z-[1] p-7">
                    <h3 className="font-semibold">
                      A library with WiFi, and hostel rooms.
                    </h3>
                    <p className="mt-2 text-sm text-[var(--lp-muted)]">
                      Open to enrolled students. Ask about hostel availability
                      when you enquire.
                    </p>
                  </div>
                  <div className="relative w-32 sm:w-44">
                    <Image
                      src="/campus/students-writing.jpg"
                      alt="Students writing at desks in the ICT classroom"
                      fill
                      sizes="176px"
                      className="object-cover grayscale-[0.4]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--lp-card),transparent_60%)]" />
                  </div>
                </div>

                {/* Mentorship */}
                <div
                  data-spot
                  className={`${card} flex flex-col justify-between gap-6 p-7 md:col-span-3`}
                >
                  <div className="relative z-[1]">
                    <h3 className="font-semibold">
                      Mentorship until selection.
                    </h3>
                    <p className="mt-2 text-sm text-[var(--lp-muted)]">
                      Faculty with five years and more of experience.
                    </p>
                  </div>
                  <ul className="relative z-[1] flex -space-x-3">
                    {faculty.map((f) => (
                      <li key={f.slug} className="group/av relative">
                        <Image
                          src={f.portrait}
                          alt={f.name}
                          width={48}
                          height={48}
                          className="size-12 rounded-full object-cover object-top ring-2 ring-[var(--lp-card)] transition-transform duration-200 ease-out group-hover/av:-translate-y-1"
                        />
                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 scale-95 rounded-lg bg-[var(--lp-text)] px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[var(--lp-bg)] opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover/av:translate-y-0 group-hover/av:scale-100 group-hover/av:opacity-100">
                          {f.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SpotlightGroup>
          </div>
        </section>

        {/* Teachers: focus cards. Hover one and the rest step back. */}
        <section
          id="teachers"
          aria-labelledby="teachers-h"
          className="py-16 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="teachers-h" className={`${h2} max-w-[20ch]`}>
                Five teachers. Watch any of them before you join.
              </h2>
            </Reveal>
          </div>
          <ul
            data-lp-faces
            className={`${container} mt-12 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible`}
          >
            {faculty.map((f, i) => (
              <li
                key={f.slug}
                data-lp-face
                className="w-[62vw] max-w-[260px] shrink-0 snap-start md:w-auto md:max-w-none"
              >
                <Reveal delay={i * 0.06}>
                  <a
                    href={`https://www.youtube.com/watch?v=${f.lecture}`}
                    {...external}
                    className="group block"
                  >
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-[#0B1A33] shadow-[inset_0_0_0_1px_var(--lp-line)]">
                      <Image
                        src={f.portrait}
                        alt={`${f.name}, ${f.teaches}`}
                        fill
                        sizes="(min-width: 768px) 230px, 62vw"
                        className="object-cover object-top"
                      />
                    </span>
                    <span className="mt-4 block font-semibold">{f.name}</span>
                    <span className="block text-sm text-[var(--lp-muted)]">
                      {f.teaches}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--lp-amber)]">
                      <IconPlayerPlayFilled aria-hidden size={14} />
                      Watch a class
                    </span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* Lectures: the page's one marquee. Pauses under the pointer. */}
        <section aria-labelledby="reel-h" className="py-16 md:py-24">
          <div className={container}>
            <Reveal>
              <h2 id="reel-h" className={`${h2} max-w-[22ch]`}>
                150+ hours of class, free on the channel.
              </h2>
            </Reveal>
          </div>
          <div data-lp-marquee className="mt-12 overflow-hidden">
            <ul data-lp-track className="flex w-max gap-5 px-5">
              {[...reel, ...reel].map((c, i) => {
                const copy = i >= reel.length
                return (
                  <li key={`${c.id}-${i}`} aria-hidden={copy || undefined}>
                    <a
                      data-lp-thumb-link
                      href={c.href}
                      {...external}
                      tabIndex={copy ? -1 : undefined}
                      className="group block w-[280px] md:w-[320px]"
                    >
                      <span
                        data-lp-thumb
                        className="relative block aspect-video overflow-hidden rounded-2xl shadow-[0_0_0_1px_var(--lp-line)]"
                      >
                        <Image
                          src={c.image}
                          alt=""
                          fill
                          sizes="320px"
                          className="object-cover"
                        />
                        <span className="absolute inset-0 grid place-items-center bg-[rgba(7,9,14,0.2)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <Play />
                        </span>
                      </span>
                      <span className="mt-3 block truncate font-medium">
                        {c.title}
                      </span>
                      <span className="block text-sm text-[var(--lp-muted)] tabular-nums">
                        {c.by}, {compact(c.views)} views
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* Courses: one tab bar, three tracks. */}
        <section
          id="courses"
          aria-labelledby="courses-h"
          className="py-16 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="courses-h" className={`${h2} mb-10 max-w-[18ch]`}>
                Three tracks, one fee each.
              </h2>
              <CourseTabs courses={tabs} />
            </Reveal>
          </div>
        </section>

        {/* Books and free material: the shop and the free shelf, side by side in weight. */}
        <section
          id="books"
          aria-labelledby="shelf-h"
          className="py-16 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="shelf-h" className={`${h2} max-w-[20ch]`}>
                Books to buy, and notes you can read free.
              </h2>
              {samples && (
                <p className="mt-4 text-sm text-[var(--lp-muted)]">
                  Sample titles for now. ICT&apos;s own books and notes replace
                  them before launch.
                </p>
              )}
            </Reveal>
            {books.length > 0 && (
              <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-8">
                {books.map((b, i) => (
                  <li key={b.slug} className="min-w-0">
                    <Reveal delay={i * 0.06}>
                      <Link
                        data-bk-hover
                        href={`/prototypes/lamp/books/${b.slug}`}
                        className="group block"
                      >
                        <Book3D
                          book={b}
                          tones={bookTones}
                          font="var(--lp-sans)"
                        />
                        <span className="mt-4 block px-[18px] font-semibold">
                          {b.title}
                        </span>
                        <span className="block truncate px-[18px] text-sm text-[var(--lp-muted)]">
                          {b.exam}, {b.pages} pages
                        </span>
                        <span className="mt-3 flex items-center justify-between px-[18px]">
                          <span className="font-semibold tabular-nums">
                            {b.price}
                          </span>
                          <span className="hidden items-center gap-1 text-sm text-[var(--lp-amber)] opacity-80 transition-opacity duration-200 group-hover:opacity-100 sm:inline-flex">
                            Read sample
                            <IconArrowRight
                              aria-hidden
                              size={15}
                              stroke={2}
                              className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                            />
                          </span>
                        </span>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-16 grid gap-4 md:grid-cols-12">
              <div className={`${card} p-2 md:col-span-7`}>
                <div className="flex items-baseline justify-between gap-4 px-5 pt-5 pb-3">
                  <h3 className="font-semibold">Free study material</h3>
                  <p className="text-sm text-[var(--lp-muted)]">
                    Log in once with your mobile number
                  </p>
                </div>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-4 px-3 pt-2 pb-3 sm:grid-cols-3">
                  {folders.map((f) => (
                    <li key={f.id}>
                      <Link
                        data-fd-hover
                        href={`/prototypes/lamp/notes#${f.id}`}
                        aria-label={`${f.name}, ${f.items.length} files`}
                        className="block rounded-[14px]"
                      >
                        <Folder folder={f} tones={folderTones} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${card} flex flex-col p-7 md:col-span-5`}>
                <h3 className="font-semibold">Free workshops on the ICT app</h3>
                <p className="mt-2 text-sm text-[var(--lp-muted)]">
                  Listed free on the app. Join one before you choose a batch.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {workshops.map((w) => (
                    <Link
                      key={w.name}
                      href={`/prototypes/lamp/courses/${w.href.split("/").pop()}`}
                      className="group block"
                    >
                      {w.cover && (
                        <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_0_0_1px_var(--lp-line)]">
                          <Image
                            src={w.cover}
                            alt={`${w.name} poster`}
                            fill
                            sizes="220px"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        </span>
                      )}
                      <span className="mt-3 block font-medium">{w.name}</span>
                      <span className="block text-sm text-[var(--lp-muted)]">
                        {w.subtitle}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results: the two verified officers. */}
        <section aria-labelledby="results-h" className="py-16 md:py-24">
          <div className={container}>
            <Reveal>
              <h2 id="results-h" className={`${h2} max-w-[22ch]`}>
                Two officers on the APSC CCE 2022 list prepared here.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {selections.map((s, i) => (
                <Reveal key={s.name} delay={i * 0.08}>
                  <figure
                    data-lp-beam
                    className="flex h-full flex-col rounded-[28px] bg-[var(--lp-card)] p-8 shadow-[inset_0_0_0_1px_var(--lp-line)] md:p-10"
                  >
                    <div className="flex items-baseline justify-between gap-6">
                      <p className="text-6xl font-semibold tracking-[-0.03em] text-[var(--lp-amber)] [font-stretch:112%] tabular-nums md:text-7xl">
                        {s.serial}
                      </p>
                      <p className="text-right text-sm text-[var(--lp-muted)]">
                        Serial on the
                        <br />
                        official list
                      </p>
                    </div>
                    <blockquote className="mt-8 text-lg leading-relaxed text-pretty">
                      &ldquo;{s.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-auto pt-8">
                      <span className="block font-semibold">{s.name}</span>
                      <span className="text-sm text-[var(--lp-muted)]">
                        {s.post}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
            <a
              href={links.apscResultPdf}
              {...external}
              data-quiet
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-[var(--lp-muted)] underline decoration-[var(--lp-line-hi)]"
            >
              Checked against the APSC result dated 17 January 2024
              <IconArrowUpRight aria-hidden size={15} stroke={1.75} />
            </a>
          </div>
        </section>

        {/* Questions */}
        <section
          id="questions"
          aria-labelledby="faq-h"
          className="py-16 md:py-24"
        >
          <div className={`${container} grid gap-10 md:grid-cols-12`}>
            <div className="md:col-span-4">
              <h2 id="faq-h" className={h2}>
                Questions, answered.
              </h2>
              <p className="mt-4 text-[var(--lp-muted)]">
                Anything else,{" "}
                <a href={tel} className="text-[var(--lp-text)] underline">
                  call {phone}
                </a>
                .
              </p>
            </div>
            <div className="md:col-span-8">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group border-b border-[var(--lp-line)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium">
                    {f.q}
                    <IconPlus
                      data-plus
                      aria-hidden
                      size={20}
                      stroke={1.75}
                      className="shrink-0 text-[var(--lp-muted)]"
                    />
                  </summary>
                  <p className="max-w-[62ch] pb-6 text-[var(--lp-muted)]">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Enquire: the lamp comes back on. */}
        <section
          aria-labelledby="join-h"
          className="relative overflow-hidden pt-16 pb-24 md:pb-32"
        >
          <div data-lamp="end" aria-hidden>
            <div data-lamp-on>
              <div data-lamp-glow />
              <div data-lamp-cone />
              <div data-lamp-bar />
            </div>
          </div>
          <div className={`${container} relative pt-32 text-center`}>
            <h2
              id="join-h"
              className={`${h2} mx-auto max-w-[16ch] md:text-6xl`}
            >
              Sit in on a class before you pay.
            </h2>
            <ol className="mx-auto mt-20 grid max-w-4xl gap-8 text-left md:grid-cols-3">
              {joining.map((j) => (
                <li
                  key={j.verb}
                  className="border-t border-[var(--lp-line-hi)] pt-5"
                >
                  <p className="font-semibold">{j.verb}</p>
                  <p className="mt-2 text-sm text-[var(--lp-muted)]">
                    {j.body}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <PrimaryCta />
              <CallCta />
            </div>
          </div>
        </section>
      </main>
    </LampShell>
  )
}
