import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandYoutube,
  IconMapPin,
  IconPhone,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { Host_Grotesk } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { Book3D, bookCss, type BookTones } from "../_book"
import { Folder, folderCss, type FolderTones } from "../_folder"
import {
  campus,
  classes,
  compact,
  contact,
  courses,
  faculty,
  faqs,
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
import { CountUp, PlayInPlace } from "../_fx"
import { Reveal } from "../_reveal"
import { PrototypeSwitcher } from "../_switcher"
import { FacultyPicker, FaqSearch, HourPicker, ModeToggle } from "./_client"

/**
 * Prototype 6: Tiles. A light, product-page bento where the tiles work.
 * Colour: restrained light. Cool grey ground, white tiles, ink text, one
 * ICT blue for actions and state. One ink tile carries the verified results.
 */

const sans = Host_Grotesk({ subsets: ["latin"], variable: "--tl-sans" })

export const metadata: Metadata = { title: "Tiles" }

const tokens = {
  "--tl-bg": "#F2F3F5",
  "--tl-surface": "#FFFFFF",
  "--tl-sunk": "#E8EAEE",
  "--tl-ink": "#0A1020",
  "--tl-muted": "#596171",
  "--tl-line": "rgba(10,16,32,0.07)",
  "--tl-line-hi": "rgba(10,16,32,0.14)",
  "--tl-blue": "#1E63CF",
  "--tl-blue-hi": "#1753B3",
  "--tl-blue-soft": "#E6EEFB",
  "--tl-ease": "cubic-bezier(0.23, 1, 0.32, 1)",
} as CSSProperties

const bookTones: BookTones = {
  primary: { bg: "#1E63CF", ink: "#FFFFFF", spine: "#164C9F" },
  highlight: { bg: "#F5C04A", ink: "#0A1020", spine: "#D39F2C" },
  muted: { bg: "#FFFFFF", ink: "#0A1020", spine: "#DADDE3" },
}

const folderTones: FolderTones = {
  back: "#1753B3",
  front: "#2A6FDB",
  paper: "#FFFFFF",
  ink: "#FFFFFF",
  muted: "#D6E4FA",
}

const css = `
[data-tl] ::selection { background: var(--tl-blue); color: #fff; }
[data-tl] :focus-visible { outline: 2px solid var(--tl-blue); outline-offset: 3px; }
[data-tl] h1, [data-tl] h2, [data-tl] h3 { text-wrap: balance; }
[data-tl] p { text-wrap: pretty; }
[data-tl] [data-press] { transition: transform 0.16s var(--tl-ease), background-color 0.2s ease, box-shadow 0.2s ease; }
[data-tl] [data-press]:active { transform: scale(0.97); }
[data-tl] [data-tile] { transition: transform 0.35s var(--tl-ease), box-shadow 0.35s var(--tl-ease); }
@media (hover: hover) {
  [data-tl] [data-primary]:hover { background-color: var(--tl-blue-hi); }
  [data-tl] [data-ghost]:hover { background-color: var(--tl-sunk); }
  [data-tl] [data-tile]:hover { transform: translateY(-2px); box-shadow: 0 0 0 1px var(--tl-line), 0 24px 48px -24px rgba(10,16,32,0.18); }
}

@keyframes tl-deal { from { opacity: 0; transform: translate(0, 60px) rotate(0deg); } }
@keyframes tl-rise { from { opacity: 0; transform: translateY(14px); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
[data-tl] [data-rise] { animation: tl-rise 0.8s var(--tl-ease) both; }
[data-deck] { position: relative; aspect-ratio: 5 / 4; }
[data-card] { position: absolute; left: 50%; top: 50%; width: 78%; aspect-ratio: 4 / 3; margin: -29.25% 0 0 -39%;
  border-radius: 18px; overflow: hidden; background: #fff;
  box-shadow: 0 0 0 1px rgba(10,16,32,0.06), 0 30px 60px -24px rgba(10,16,32,0.35);
  transition: transform 0.6s var(--tl-ease); animation: tl-deal 0.9s var(--tl-ease) both; }
[data-card="0"] { transform: translate(-16%, -6%) rotate(-8deg); animation-delay: 0.25s; }
[data-card="1"] { transform: translate(16%, -2%) rotate(7deg); animation-delay: 0.35s; }
[data-card="2"] { transform: translate(0, 8%) rotate(-1deg); animation-delay: 0.45s; z-index: 1; }
@media (hover: hover) {
  [data-deck]:hover [data-card="0"] { transform: translate(-30%, -12%) rotate(-12deg); }
  [data-deck]:hover [data-card="1"] { transform: translate(30%, -8%) rotate(11deg); }
  [data-deck]:hover [data-card="2"] { transform: translate(0, 12%) rotate(0deg); }
  [data-deck] [data-card]:hover { z-index: 2; }
}

[data-short] img { transition: transform 0.5s var(--tl-ease); }
[data-short]:hover img { transform: scale(1.04); }
@media (prefers-reduced-motion: reduce) { [data-card] { animation: none; transition: none; } }
`

const external = { target: "_blank", rel: "noreferrer noopener" } as const
const container = "mx-auto w-full max-w-[1240px] px-4 md:px-8"
const tile =
  "rounded-[28px] bg-[var(--tl-surface)] shadow-[0_0_0_1px_var(--tl-line)]"
const h2 =
  "text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.04em]"
const primary =
  "inline-flex h-12 items-center gap-2 rounded-full bg-[var(--tl-blue)] px-6 font-medium text-white"

/** Name each printed batch by the part of the day it falls in. */
function daySlots() {
  const part = (h: number) =>
    h < 11 ? "Morning" : h < 14 ? "Noon" : h < 17.5 ? "Afternoon" : "Evening"
  return timetable.map((t) => ({
    label: part(t.start),
    start: t.start,
    end: t.end,
    when: t.when,
    name: t.name,
    exam: t.exam,
    days: t.days,
    note: t.note,
    price: t.price ? rupees(t.price) : "Free",
    href: t.href,
  }))
}

export default async function Tiles() {
  const { books, folders, samples } = await shelf()
  const lecture = classes[0]!
  const subscribers = proof[0]!
  const installs = proof[1]!

  return (
    <div
      data-tl
      style={tokens}
      className={`${sans.variable} min-h-[100dvh] bg-[var(--tl-bg)] font-[family-name:var(--tl-sans)] text-[var(--tl-ink)] antialiased`}
    >
      <style>{css + bookCss + folderCss}</style>

      {/* A floating pill nav. */}
      <header className="sticky top-3 z-40 px-3 pt-3">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-6 rounded-full bg-[rgba(255,255,255,0.8)] pr-2 pl-3 shadow-[0_0_0_1px_var(--tl-line),0_8px_30px_-12px_rgba(10,16,32,0.18)] backdrop-blur-xl">
          <a href="#top" className="flex items-center gap-2.5 font-semibold">
            <Image
              src="/brand/ict-mark.png"
              alt=""
              width={32}
              height={32}
              className="size-8"
            />
            <span className="hidden sm:inline">Impact Career Tutorials</span>
            <span className="sm:hidden">ICT</span>
          </a>
          <nav
            aria-label="Sections"
            className="mx-auto hidden items-center gap-1 text-sm text-[var(--tl-muted)] lg:flex"
          >
            {[
              ["#batches", "Batches"],
              ["#books", "Books and notes"],
              ["#teachers", "Teachers"],
              ["#questions", "Questions"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-3 py-2 transition-colors duration-150 hover:bg-[var(--tl-sunk)] hover:text-[var(--tl-ink)]"
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            data-press
            data-primary
            href={whatsapp}
            {...external}
            className="ml-auto inline-flex h-10 items-center rounded-full bg-[var(--tl-blue)] px-4 text-sm font-medium text-white lg:ml-0"
          >
            {offer.cta}
          </a>
        </div>
      </header>

      <main id="top">
        {/* Hero: copy left, a deck of the three batch posters right. */}
        <section aria-label="Introduction">
          <div
            className={`${container} grid items-center gap-12 pt-14 pb-20 md:pt-20 lg:grid-cols-12 lg:pb-28`}
          >
            <div className="lg:col-span-7">
              <h1
                data-rise
                className="text-[clamp(2.6rem,4.6vw,3.6rem)] leading-[0.98] font-semibold tracking-[-0.045em]"
              >
                Assam&apos;s exams, planned around your day.
              </h1>
              <p
                data-rise
                style={{ animationDelay: "0.1s" }}
                className="mt-6 max-w-[46ch] text-lg text-[var(--tl-muted)]"
              >
                Morning, noon and evening batches for APSC, ADRE, Assam Police
                and banking. Books and free notes too.
              </p>
              <div
                data-rise
                style={{ animationDelay: "0.2s" }}
                className="mt-9 flex flex-wrap gap-3"
              >
                <a
                  data-press
                  data-primary
                  href={whatsapp}
                  {...external}
                  className={primary}
                >
                  {offer.cta}
                  <IconArrowRight aria-hidden size={18} stroke={2} />
                </a>
                <a
                  data-press
                  data-ghost
                  href="#books"
                  className="inline-flex h-12 items-center rounded-full bg-[var(--tl-surface)] px-6 font-medium shadow-[0_0_0_1px_var(--tl-line-hi)]"
                >
                  See the books
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div data-deck className="mx-auto max-w-[560px]">
                {courses.map(
                  (c, i) =>
                    c.cover && (
                      <Link
                        key={c.slug}
                        data-card={i}
                        href={c.href}
                        aria-label={`${c.name}, ${c.exam}`}
                      >
                        <Image
                          src={c.cover}
                          alt=""
                          fill
                          priority
                          sizes="(min-width: 1024px) 440px, 78vw"
                          className="object-cover"
                        />
                      </Link>
                    )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* The bento. Each tile is a small working tool, not a picture of one. */}
        <section
          id="batches"
          aria-labelledby="bento-h"
          className="pb-20 md:pb-28"
        >
          <div className={container}>
            <Reveal>
              <h2 id="bento-h" className={`${h2} max-w-[16ch]`}>
                A batch, at a glance.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-4">
              <Reveal className="md:col-span-2 md:row-span-2">
                <div data-tile className={`${tile} h-full p-7 md:p-8`}>
                  <h3 className="mb-6 text-xl font-semibold tracking-[-0.02em]">
                    Which hour can you keep?
                  </h3>
                  <HourPicker slots={daySlots()} />
                </div>
              </Reveal>

              <Reveal className="md:col-span-2" delay={0.05}>
                <div data-tile className={`${tile} p-2`}>
                  <PlayInPlace
                    id={lecture.id}
                    title={lecture.title}
                    className="group relative block aspect-video w-full overflow-hidden rounded-[20px] bg-[var(--tl-ink)]"
                  >
                    <Image
                      src={lecture.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 600px, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid size-14 place-items-center rounded-full bg-white/95 text-[var(--tl-ink)] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)] transition-transform duration-200 ease-out group-hover:scale-105">
                        <IconPlayerPlayFilled
                          aria-hidden
                          size={20}
                          className="translate-x-px"
                        />
                      </span>
                    </span>
                  </PlayInPlace>
                  <div className="flex items-baseline justify-between gap-4 px-4 pt-3 pb-2 text-sm">
                    <p className="truncate">
                      <span className="font-medium">{lecture.title}</span>
                      <span className="text-[var(--tl-muted)]">
                        {" "}
                        by {lecture.by}
                      </span>
                    </p>
                    <p className="shrink-0 text-[var(--tl-muted)] tabular-nums">
                      {compact(lecture.views)} views
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <a
                  data-tile
                  href={subscribers.href}
                  {...external}
                  className={`${tile} flex h-full flex-col justify-between gap-8 p-7`}
                >
                  <IconBrandYoutube
                    aria-hidden
                    size={28}
                    stroke={1.5}
                    className="text-[var(--tl-muted)]"
                  />
                  <span>
                    <span className="block text-5xl font-semibold tracking-[-0.04em]">
                      <CountUp display={subscribers.display} />
                    </span>
                    <span className="mt-1 block text-sm text-[var(--tl-muted)]">
                      subscribers watch ICT&apos;s free classes
                    </span>
                  </span>
                </a>
              </Reveal>

              <Reveal delay={0.15}>
                <div
                  data-tile
                  className="flex h-full flex-col justify-between gap-8 rounded-[28px] bg-[var(--tl-blue-soft)] p-7"
                >
                  <p className="text-sm font-medium text-[var(--tl-blue)]">
                    In the APSC course
                  </p>
                  <p>
                    <span className="block text-5xl font-semibold tracking-[-0.04em] text-[var(--tl-blue)] tabular-nums">
                      20+20
                    </span>
                    <span className="mt-1 block text-sm text-[#2B4A7E]">
                      Prelims and Mains mock tests
                    </span>
                  </p>
                </div>
              </Reveal>

              <Reveal className="md:col-span-2" delay={0.05}>
                <div data-tile className={`${tile} h-full p-7`}>
                  <ModeToggle
                    photo={{
                      src: campus[3].src,
                      alt: campus[3].alt,
                    }}
                    installs={installs.display}
                    playHref={links.play}
                  />
                </div>
              </Reveal>

              <Reveal className="md:col-span-2" delay={0.1}>
                <div
                  data-tile
                  className="flex h-full flex-col rounded-[28px] bg-[var(--tl-ink)] p-7 text-white md:p-8"
                >
                  <h3 className="max-w-[22ch] text-2xl font-semibold tracking-[-0.03em]">
                    Two officers on the APSC CCE 2022 list prepared at ICT.
                  </h3>
                  <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                    {selections.map((s) => (
                      <li key={s.name}>
                        <p className="text-5xl font-semibold tracking-[-0.04em] text-[#8DB6F2] tabular-nums">
                          {s.serial}
                        </p>
                        <p className="mt-2 font-medium">{s.name}</p>
                        <p className="text-sm text-[#A9B3C7]">{s.post}</p>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={links.apscResultPdf}
                    {...external}
                    className="mt-auto inline-flex items-center gap-1 pt-8 text-sm text-[#A9B3C7] underline decoration-white/25 underline-offset-4 transition-colors duration-150 hover:text-white"
                  >
                    Serials from the result of 17 January 2024
                    <IconArrowUpRight aria-hidden size={15} stroke={1.75} />
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Books and free material. */}
        <section
          id="books"
          aria-labelledby="books-h"
          className="pb-20 md:pb-28"
        >
          <div className={container}>
            <Reveal>
              <h2 id="books-h" className={`${h2} max-w-[18ch]`}>
                ICT&apos;s books, and notes you can read free.
              </h2>
              {samples && (
                <p className="mt-4 text-sm text-[var(--tl-muted)]">
                  Sample titles for now. ICT&apos;s own books and notes replace
                  them before launch.
                </p>
              )}
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-12">
              <Reveal className="md:col-span-12">
                <div
                  className={`${tile} overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F7F9_100%)] px-4 pt-10 md:px-10 md:pt-14`}
                >
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-10 pb-8 md:grid-cols-4 md:gap-x-8 md:pb-0">
                    {books.map((b) => (
                      <li key={b.slug} className="min-w-0">
                        <Link
                          data-bk-hover
                          href={b.href}
                          className="group block"
                        >
                          <Book3D
                            book={b}
                            tones={bookTones}
                            font="var(--tl-sans)"
                          />
                          <span className="block px-[18px] pt-3 md:hidden">
                            <span className="block truncate font-semibold">
                              {b.title}
                            </span>
                            <span className="block text-sm text-[var(--tl-muted)] tabular-nums">
                              {b.price}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {/* The shelf itself. */}
                  <div
                    aria-hidden
                    className="-mx-4 hidden h-3 bg-[linear-gradient(180deg,#E3E6EB,#EEF0F3)] shadow-[0_-1px_0_rgba(10,16,32,0.08)] md:-mx-10 md:block"
                  />
                  <ul className="hidden grid-cols-4 gap-x-8 py-6 md:grid">
                    {books.map((b) => (
                      <li key={b.slug} className="min-w-0 px-[18px]">
                        <Link
                          href={b.href}
                          className="font-semibold hover:text-[var(--tl-blue)]"
                        >
                          {b.title}
                        </Link>
                        <p className="truncate text-sm text-[var(--tl-muted)]">
                          {b.exam}, {b.pages} pages
                        </p>
                        <p className="mt-2 font-semibold tabular-nums">
                          {b.price}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal className="md:col-span-7">
                <div className={`${tile} h-full p-3`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-4 pb-2">
                    <h3 className="text-xl font-semibold tracking-[-0.02em]">
                      Free study material
                    </h3>
                    <Link
                      href="/resources"
                      className="text-sm font-medium text-[var(--tl-blue)]"
                    >
                      See all
                    </Link>
                  </div>
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-4 px-4 pt-3 pb-2 sm:grid-cols-3">
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
                  <p className="px-4 pt-2 pb-3 text-sm text-[var(--tl-muted)]">
                    Log in once with your mobile number to open any of them.
                  </p>
                </div>
              </Reveal>

              <Reveal className="md:col-span-5" delay={0.08}>
                <div className={`${tile} h-full p-7`}>
                  <h3 className="text-xl font-semibold tracking-[-0.02em]">
                    Free workshops on the app
                  </h3>
                  <p className="mt-2 text-sm text-[var(--tl-muted)]">
                    Join one before you pick a batch.
                  </p>
                  <div className="mt-6 grid gap-4">
                    {workshops.map((w) => (
                      <Link
                        key={w.name}
                        href={w.href}
                        className="group flex items-center gap-4"
                      >
                        {w.cover && (
                          <span className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-2xl shadow-[0_0_0_1px_var(--tl-line)]">
                            <Image
                              src={w.cover}
                              alt={`${w.name} poster`}
                              fill
                              sizes="128px"
                              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                          </span>
                        )}
                        <span>
                          <span className="block font-semibold group-hover:text-[var(--tl-blue)]">
                            {w.name}
                          </span>
                          <span className="block text-sm text-[var(--tl-muted)]">
                            {w.subtitle}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Teachers: a list that drives one portrait. */}
        <section
          id="teachers"
          aria-labelledby="teachers-h"
          className="pb-20 md:pb-28"
        >
          <div className={container}>
            <div className={`${tile} p-6 md:p-12`}>
              <h2 id="teachers-h" className={`${h2} mb-8 max-w-[14ch]`}>
                Meet the five teachers.
              </h2>
              <FacultyPicker
                people={faculty.map((f) => ({
                  slug: f.slug,
                  name: f.name,
                  teaches: f.teaches,
                  note: f.note,
                  portrait: f.portrait,
                  href: `https://www.youtube.com/watch?v=${f.lecture}`,
                }))}
              />
            </div>
          </div>
        </section>

        {/* Courses side by side, as a comparison. */}
        <section aria-labelledby="compare-h" className="pb-20 md:pb-28">
          <div className={container}>
            <Reveal>
              <h2 id="compare-h" className={`${h2} max-w-[18ch]`}>
                Three courses, compared.
              </h2>
            </Reveal>
            <Reveal className="mt-10">
              <div className={`${tile} [scrollbar-width:thin] overflow-x-auto`}>
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th scope="col" className="w-[18%] p-6">
                        <span className="sr-only">Detail</span>
                      </th>
                      {courses.map((c) => (
                        <th
                          key={c.slug}
                          scope="col"
                          className="p-6 align-bottom font-normal"
                        >
                          {c.cover && (
                            <span className="relative mb-4 block aspect-[4/3] w-full max-w-[220px] overflow-hidden rounded-2xl shadow-[0_0_0_1px_var(--tl-line)]">
                              <Image
                                src={c.cover}
                                alt=""
                                fill
                                sizes="220px"
                                className="object-cover"
                              />
                            </span>
                          )}
                          <span className="block text-xl font-semibold tracking-[-0.02em]">
                            {c.name}
                          </span>
                          <span className="block text-sm text-[var(--tl-muted)]">
                            {c.exam}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-[15px]">
                    {[
                      {
                        label: "Fee",
                        cell: (c: (typeof courses)[number]) =>
                          c.price ? (
                            <span className="tabular-nums">
                              <span className="text-lg font-semibold">
                                {rupees(c.price)}
                              </span>
                              {c.mrp && (
                                <s className="ml-2 text-sm text-[var(--tl-muted)]">
                                  {rupees(c.mrp)}
                                </s>
                              )}
                            </span>
                          ) : null,
                      },
                      {
                        label: "Timing",
                        cell: (c: (typeof courses)[number]) => (
                          <span className="tabular-nums">
                            {c.when ?? "Ask at the centre"}
                            {c.days && (
                              <span className="block text-sm text-[var(--tl-muted)]">
                                {c.days}
                              </span>
                            )}
                          </span>
                        ),
                      },
                      {
                        label: "Covers",
                        cell: (c: (typeof courses)[number]) => c.covers,
                      },
                      {
                        label: "Duration",
                        cell: (c: (typeof courses)[number]) => c.duration,
                      },
                      {
                        label: "Teachers",
                        cell: (c: (typeof courses)[number]) => (
                          <span className="flex -space-x-2">
                            {c.faculty.map((f) => (
                              <Image
                                key={f.slug}
                                src={f.portrait}
                                alt={f.name}
                                title={f.name}
                                width={36}
                                height={36}
                                className="size-9 rounded-full object-cover object-top ring-2 ring-white"
                              />
                            ))}
                          </span>
                        ),
                      },
                    ].map((row) => (
                      <tr
                        key={row.label}
                        className="border-t border-[var(--tl-line)]"
                      >
                        <th
                          scope="row"
                          className="p-6 text-sm font-medium text-[var(--tl-muted)]"
                        >
                          {row.label}
                        </th>
                        {courses.map((c) => (
                          <td key={c.slug} className="p-6 align-top">
                            {row.cell(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="border-t border-[var(--tl-line)]">
                      <td className="p-6">
                        <span className="sr-only">Links</span>
                      </td>
                      {courses.map((c) => (
                        <td key={c.slug} className="p-6">
                          <Link
                            data-press
                            data-ghost
                            href={c.href}
                            className="inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-medium shadow-[0_0_0_1px_var(--tl-line-hi)]"
                          >
                            See {c.name}
                            <IconArrowRight aria-hidden size={16} stroke={2} />
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Students in their own words: the review shorts. */}
        <section aria-labelledby="voices-h" className="pb-20 md:pb-28">
          <div className={container}>
            <Reveal>
              <h2 id="voices-h" className={`${h2} max-w-[18ch]`}>
                Students, in their own words.
              </h2>
            </Reveal>
          </div>
          <ul className="mt-10 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-4 md:scroll-px-8 md:px-[max(2rem,calc((100vw-1240px)/2+2rem))]">
            {reviews.map((r) => (
              <li key={r.id} className="shrink-0 snap-start">
                <a
                  data-short
                  href={r.href}
                  {...external}
                  className="group block w-[168px] md:w-[200px]"
                >
                  <span className="relative block aspect-[9/16] overflow-hidden rounded-[22px] bg-[var(--tl-ink)] shadow-[0_0_0_1px_var(--tl-line)]">
                    <Image
                      src={r.image}
                      alt=""
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                    <span className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-white/90 text-[var(--tl-ink)]">
                      <IconPlayerPlayFilled
                        aria-hidden
                        size={14}
                        className="translate-x-px"
                      />
                    </span>
                  </span>
                  <span className="mt-3 block font-medium">{r.name}</span>
                  <span className="block text-sm text-[var(--tl-muted)]">
                    {r.batch}, {r.exam}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Questions with search, and the centre beside them. */}
        <section
          id="questions"
          aria-labelledby="faq-h"
          className="pb-20 md:pb-28"
        >
          <div className={`${container} grid gap-4 lg:grid-cols-12`}>
            <div className="lg:col-span-8">
              <h2 id="faq-h" className={`${h2} mb-8`}>
                Questions people ask.
              </h2>
              <FaqSearch faqs={faqs.map((f) => ({ q: f.q, a: f.a }))} />
            </div>
            <aside
              aria-label="Visit the centre"
              className={`${tile} self-start overflow-hidden lg:sticky lg:top-24 lg:col-span-4 lg:mt-[4.5rem]`}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={campus[1].src}
                  alt={campus[1].alt}
                  fill
                  sizes="(min-width: 1024px) 380px, 100vw"
                  className="object-cover object-[50%_40%]"
                />
              </div>
              <div className="p-6">
                <p className="font-semibold">Visit the centre</p>
                <address className="mt-2 text-sm text-[var(--tl-muted)] not-italic">
                  {place.street}, {place.city}, {place.region} {place.pin}
                </address>
                <div className="mt-5 grid gap-2">
                  <a
                    data-press
                    data-ghost
                    href={place.maps}
                    {...external}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium shadow-[0_0_0_1px_var(--tl-line-hi)]"
                  >
                    <IconMapPin aria-hidden size={17} stroke={1.75} />
                    Open in Google Maps
                  </a>
                  <a
                    data-press
                    data-ghost
                    href={tel}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium tabular-nums shadow-[0_0_0_1px_var(--tl-line-hi)]"
                  >
                    <IconPhone aria-hidden size={17} stroke={1.75} />
                    Call {phone}
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Enquire: the one blue field on the page. */}
        <section aria-labelledby="join-h" className="pb-8">
          <div className={container}>
            <div className="relative overflow-hidden rounded-[40px] bg-[var(--tl-blue)] px-6 py-14 text-white md:px-14 md:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.18),transparent)]"
              />
              <h2
                id="join-h"
                className="relative max-w-[14ch] text-[clamp(2.2rem,5vw,4rem)] leading-[1] font-semibold tracking-[-0.045em]"
              >
                Start with a free workshop.
              </h2>
              <ol className="relative mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
                {joining.map((j) => (
                  <li key={j.verb} className="border-t border-white/25 pt-4">
                    <p className="font-semibold">{j.verb}</p>
                    <p className="mt-1 text-sm text-[#D6E4FA]">{j.body}</p>
                  </li>
                ))}
              </ol>
              <div className="relative mt-10 flex flex-wrap gap-3">
                <a
                  data-press
                  href={whatsapp}
                  {...external}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-medium text-[var(--tl-ink)] hover:bg-[#EEF3FC]"
                >
                  {offer.cta}
                  <IconArrowRight aria-hidden size={18} stroke={2} />
                </a>
                <a
                  data-press
                  href={tel}
                  className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-medium tabular-nums shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)] hover:bg-white/10"
                >
                  <IconPhone aria-hidden size={18} stroke={1.75} />
                  Call {phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="pt-10 pb-28 text-sm text-[var(--tl-muted)]">
        <div
          className={`${container} flex flex-wrap items-center gap-x-8 gap-y-4`}
        >
          <p className="font-semibold text-[var(--tl-ink)]">
            Impact Career Tutorials
          </p>
          {contact.phones.map((p) => (
            <a
              key={p}
              href={`tel:${p}`}
              className="tabular-nums hover:text-[var(--tl-ink)]"
            >
              {p.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
            </a>
          ))}
          <a
            href={`mailto:${contact.email}`}
            className="hover:text-[var(--tl-ink)]"
          >
            {contact.email}
          </a>
          <div className="flex gap-1 md:ml-auto">
            {[
              { href: links.youtube, label: "YouTube", Icon: IconBrandYoutube },
              {
                href: links.instagram,
                label: "Instagram",
                Icon: IconBrandInstagram,
              },
              {
                href: links.facebook,
                label: "Facebook",
                Icon: IconBrandFacebook,
              },
              {
                href: links.play,
                label: "Google Play",
                Icon: IconBrandGooglePlay,
              },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                {...external}
                aria-label={label}
                className="grid size-11 place-items-center rounded-full transition-colors duration-150 hover:bg-[var(--tl-sunk)] hover:text-[var(--tl-ink)]"
              >
                <Icon aria-hidden size={19} stroke={1.5} />
              </a>
            ))}
          </div>
          <p className="w-full">Prototype for review. Not the live site.</p>
        </div>
      </footer>

      <PrototypeSwitcher current="tiles" />
    </div>
  )
}
