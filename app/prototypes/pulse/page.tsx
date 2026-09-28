import {
  IconArrowRight,
  IconArrowUpRight,
  IconAsterisk,
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandYoutube,
  IconMicrophone2,
  IconPhone,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { Figtree, Unbounded } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { Book3D, bookCss, type BookTones } from "../_book"
import { Folder, folderCss, type FolderTones } from "../_folder"
import {
  contact,
  courses,
  faculty,
  faqs,
  joining,
  links,
  nextBatch,
  offer,
  phone,
  place,
  podcast,
  proof,
  rupees,
  selections,
  shelf,
  tel,
  timetable,
  whatsapp,
  workshops,
} from "../_data"
import { Magnetic, Tilt } from "../_fx"
import { Reveal } from "../_reveal"
import { PrototypeSwitcher } from "../_switcher"
import { WordRoll } from "./_client"

/**
 * Prototype 10: Pulse. ICT's own blue as three colour fields on a cool
 * paper page, wide confident type, batches as tickets.
 * Colour: committed. Blue carries about a third of the page; amber (the
 * logo's nib) is the one highlight and only ever sits on blue or ink.
 */

const display = Unbounded({ subsets: ["latin"], variable: "--pu-display" })
const sans = Figtree({ subsets: ["latin"], variable: "--pu-sans" })

export const metadata: Metadata = { title: "Pulse" }

const tokens = {
  "--pu-blue": "#1F5FD1",
  "--pu-blue-deep": "#17479E",
  "--pu-paper": "#F5F7FB",
  "--pu-card": "#FFFFFF",
  "--pu-ink": "#0B1633",
  "--pu-muted": "#51607C",
  "--pu-on-blue": "#D5E2FA",
  "--pu-line": "rgba(11,22,51,0.1)",
  "--pu-amber": "#FFC24A",
  "--pu-ease": "cubic-bezier(0.23, 1, 0.32, 1)",
  "--bk-shadow": "rgba(8,24,70,0.55)",
} as CSSProperties

const bookTones: BookTones = {
  primary: { bg: "#FFC24A", ink: "#0B1633", spine: "#D9A032" },
  highlight: { bg: "#FFFFFF", ink: "#0B1633", spine: "#D4DCEB" },
  muted: { bg: "#0B1633", ink: "#F5F7FB", spine: "#060D22" },
}

const folderTones: FolderTones = {
  back: "#17479E",
  front: "#1F5FD1",
  paper: "#FFFFFF",
  ink: "#FFFFFF",
  muted: "#D5E2FA",
}

const css = `
[data-pu] ::selection { background: var(--pu-amber); color: var(--pu-ink); }
[data-pu] :focus-visible { outline: 2px solid var(--pu-amber); outline-offset: 3px; }
[data-pu] h1, [data-pu] h2, [data-pu] h3 { font-family: var(--pu-display); text-wrap: balance; }
[data-pu] p { text-wrap: pretty; }
[data-pu] [data-press] { transition: transform 0.16s var(--pu-ease), background-color 0.2s ease, box-shadow 0.2s ease; }
[data-pu] [data-press]:active { transform: scale(0.97); }
@media (hover: hover) {
  [data-pu] [data-amber]:hover { background-color: #FFD06E; box-shadow: 0 12px 30px -10px rgba(255,194,74,0.7); }
  [data-pu] [data-blue]:hover { background-color: var(--pu-blue-deep); }
}
@keyframes pu-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes pu-ticket { from { opacity: 0; transform: translateY(30px) rotate(4deg); } to { opacity: 1; transform: rotate(-3deg); } }
[data-pu] [data-rise] { animation: pu-rise 0.9s var(--pu-ease) both; }
[data-pu] [data-hero-ticket] { transform: rotate(-3deg); animation: pu-ticket 1s var(--pu-ease) 0.3s both; }

/* Tickets: two notches where the stub tears off. */
[data-ticket] { --cut: 30%; -webkit-mask: radial-gradient(circle 14px at var(--cut) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 14px at var(--cut) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
  mask: radial-gradient(circle 14px at var(--cut) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 14px at var(--cut) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat; }
[data-ticket] [data-perf] { position: absolute; top: 18px; bottom: 18px; left: var(--cut); border-left: 2px dashed currentColor; opacity: 0.25; }
@media (max-width: 767px) { [data-ticket] { --cut: 0%; -webkit-mask: none; mask: none; } [data-ticket] [data-perf] { display: none; } }
[data-ticket-wrap] { filter: drop-shadow(0 18px 30px rgba(11,22,51,0.14)); transition: transform 0.35s var(--pu-ease), filter 0.35s var(--pu-ease); }
@media (hover: hover) { [data-ticket-wrap]:hover { transform: translateY(-4px); filter: drop-shadow(0 26px 40px rgba(11,22,51,0.2)); } }

@keyframes pu-marquee { to { transform: translateX(-50%); } }
[data-pu-track] { animation: pu-marquee 40s linear infinite; }

/* Flip cards for teachers. */
[data-flip] { perspective: 1000px; }
[data-flip-inner] { position: relative; transform-style: preserve-3d; transition: transform 0.7s var(--pu-ease); }
[data-flip-face] { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
[data-flip-back] { position: absolute; inset: 0; transform: rotateY(180deg); }
@media (hover: hover) { [data-flip]:hover [data-flip-inner] { transform: rotateY(180deg); } }
[data-flip]:focus-within [data-flip-inner] { transform: rotateY(180deg); }

@media (prefers-reduced-motion: reduce) {
  [data-pu-track] { animation: none; }
  [data-flip-inner] { transition: none; }
  [data-pu] [data-hero-ticket] { animation: none; }
}
`

const external = { target: "_blank", rel: "noreferrer noopener" } as const
const container = "mx-auto w-full max-w-[1240px] px-5 md:px-8"
const h2 =
  "text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.05] font-semibold tracking-[-0.03em]"

function PrimaryCta() {
  return (
    <Magnetic>
      <a
        data-press
        data-amber
        href={whatsapp}
        {...external}
        className="group inline-flex h-12 items-center gap-2 rounded-full bg-[var(--pu-amber)] px-6 font-semibold text-[var(--pu-ink)]"
      >
        {offer.cta}
        <IconArrowRight
          aria-hidden
          size={18}
          stroke={2}
          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        />
      </a>
    </Magnetic>
  )
}

export default async function Pulse() {
  const { books, folders, samples } = await shelf()
  const victor = timetable.find((t) => t.name === nextBatch.name)
  const strip = [
    "APSC",
    "ADRE",
    "Assam Police",
    "Banking",
    "SSC",
    "Railway NTPC",
    "Warrior mocks",
    "Brahmastra",
    "Astra Series",
    "Axom Dhwani",
  ]

  return (
    <div
      data-pu
      style={tokens}
      className={`${display.variable} ${sans.variable} min-h-[100dvh] bg-[var(--pu-paper)] font-[family-name:var(--pu-sans)] text-[var(--pu-ink)] antialiased`}
    >
      <style>{css + bookCss + folderCss}</style>

      {/* Hero field */}
      <section
        aria-label="Introduction"
        className="relative overflow-hidden bg-[var(--pu-blue)] text-white"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/2 -right-1/4 size-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.14),transparent)]"
        />
        <header
          className={`${container} relative flex h-[76px] items-center gap-8`}
        >
          <a href="#top" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white">
              <Image
                src="/brand/ict-mark.png"
                alt=""
                width={30}
                height={30}
                className="size-[30px]"
              />
            </span>
            <span className="hidden font-[family-name:var(--pu-display)] text-sm font-semibold sm:inline">
              Impact Career Tutorials
            </span>
          </a>
          <nav
            aria-label="Sections"
            className="ml-auto hidden items-center gap-7 text-sm text-[var(--pu-on-blue)] md:flex"
          >
            {[
              ["#free", "Free first"],
              ["#books", "Books"],
              ["#batches", "Batches"],
              ["#teachers", "Teachers"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="transition-colors duration-150 hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            href={tel}
            className="ml-auto text-sm font-medium whitespace-nowrap tabular-nums md:ml-0"
          >
            {phone}
          </a>
        </header>

        <div
          id="top"
          className={`${container} relative grid items-center gap-14 pt-10 pb-20 md:pt-16 lg:grid-cols-12 lg:pb-28`}
        >
          <div className="lg:col-span-7">
            <h1
              data-rise
              className="text-[clamp(2.1rem,4.6vw,3.9rem)] leading-[1.04] font-semibold tracking-[-0.04em]"
            >
              Coaching for
              <br />
              <WordRoll
                words={[
                  "APSC.",
                  "ADRE.",
                  "Assam Police.",
                  "banking.",
                  "SSC.",
                  "Railway.",
                ]}
              />
            </h1>
            <p
              data-rise
              style={{ animationDelay: "0.1s" }}
              className="mt-7 max-w-[46ch] text-lg text-[var(--pu-on-blue)]"
            >
              Morning, noon and evening batches in North Lakhimpur, ICT&apos;s
              own books and free notes, and every class on the app.
            </p>
            <div
              data-rise
              style={{ animationDelay: "0.2s" }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <PrimaryCta />
              <a
                data-press
                href="#free"
                className="inline-flex h-12 items-center rounded-full px-6 font-semibold shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45)] hover:bg-white/10"
              >
                What&apos;s free
              </a>
            </div>
          </div>
          {victor && (
            <div className="lg:col-span-5">
              <Link
                data-hero-ticket
                href={victor.href}
                className="mx-auto block max-w-[420px]"
              >
                <span data-ticket-wrap className="block">
                  <span
                    data-ticket
                    style={{ "--cut": "34%" } as CSSProperties}
                    className="relative grid grid-cols-[34%_1fr] rounded-[22px] bg-white text-[var(--pu-ink)]"
                  >
                    <span data-perf aria-hidden />
                    <span className="flex flex-col justify-between p-5">
                      <span className="text-xs font-semibold text-[var(--pu-muted)]">
                        Started
                      </span>
                      <span className="font-[family-name:var(--pu-display)] text-2xl leading-none font-semibold">
                        14
                        <span className="block text-sm">Sept</span>
                      </span>
                    </span>
                    <span className="p-5 pl-6">
                      <span className="block text-xs font-semibold text-[var(--pu-muted)]">
                        The newest batch
                      </span>
                      <span className="mt-1 block font-[family-name:var(--pu-display)] text-xl font-semibold">
                        {victor.name}
                      </span>
                      <span className="block text-sm text-[var(--pu-muted)]">
                        {victor.exam}
                      </span>
                      <span className="mt-4 flex items-end justify-between gap-3">
                        <span className="font-[family-name:var(--pu-display)] text-lg font-semibold whitespace-nowrap tabular-nums">
                          {victor.when}
                        </span>
                        <span className="font-semibold tabular-nums">
                          {rupees(victor.price)}
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* The one marquee: exams and ICT's own programmes. */}
      <div
        aria-hidden
        className="overflow-hidden bg-[var(--pu-ink)] py-5 text-white"
      >
        <ul
          data-pu-track
          className="flex w-max items-center gap-8 font-[family-name:var(--pu-display)] text-lg font-semibold"
        >
          {[...strip, ...strip].map((w, i) => (
            <li key={`${w}-${i}`} className="flex items-center gap-8">
              {w}
              <IconAsterisk
                size={18}
                stroke={2}
                className="text-[var(--pu-amber)]"
              />
            </li>
          ))}
        </ul>
      </div>

      <main>
        {/* Free first */}
        <section id="free" aria-labelledby="free-h" className="py-20 md:py-28">
          <div className={container}>
            <Reveal>
              <h2 id="free-h" className={`${h2} max-w-[18ch]`}>
                Start free. Pay only when you pick a batch.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              <Reveal className="md:col-span-2 md:row-span-2">
                <div className="h-full rounded-[28px] bg-[var(--pu-card)] p-7 shadow-[0_0_0_1px_var(--pu-line)] md:p-9">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-[-0.02em]">
                      Free study material
                    </h3>
                    <Link
                      href="/resources"
                      className="text-sm font-semibold text-[var(--pu-blue)]"
                    >
                      Open the library
                    </Link>
                  </div>
                  {samples && (
                    <p className="mt-2 text-sm text-[var(--pu-muted)]">
                      Sample titles until ICT adds its own.
                    </p>
                  )}
                  <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
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
                  <p className="mt-6 text-sm text-[var(--pu-muted)]">
                    Log in once with your mobile number to read any of them.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.06}>
                <div className="h-full rounded-[28px] bg-[var(--pu-ink)] p-7 text-white">
                  <h3 className="text-lg font-semibold">Free workshops</h3>
                  <ul className="mt-5 grid gap-4">
                    {workshops.map((w) => (
                      <li key={w.name}>
                        <Link
                          href={w.href}
                          className="group flex items-center gap-4"
                        >
                          {w.cover && (
                            <span className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-xl">
                              <Image
                                src={w.cover}
                                alt={`${w.name} poster`}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="block font-semibold group-hover:text-[var(--pu-amber)]">
                              {w.name}
                            </span>
                            <span className="line-clamp-2 text-sm text-[#AEB9D3]">
                              {w.subtitle}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="grid h-full gap-4">
                  <a
                    href={links.youtube}
                    {...external}
                    className="group flex items-center justify-between gap-4 rounded-[28px] bg-[var(--pu-blue)] p-7 text-white"
                  >
                    <span>
                      <span className="block font-[family-name:var(--pu-display)] text-3xl font-semibold tabular-nums">
                        {proof[2].display}
                      </span>
                      <span className="text-sm text-[var(--pu-on-blue)]">
                        hours of class on YouTube
                      </span>
                    </span>
                    <IconBrandYoutube
                      aria-hidden
                      size={30}
                      stroke={1.5}
                      className="transition-transform duration-300 ease-out group-hover:scale-110"
                    />
                  </a>
                  <a
                    href={`https://www.youtube.com/watch?v=${podcast.episodes[0].id}`}
                    {...external}
                    className="group flex items-center justify-between gap-4 rounded-[28px] bg-[var(--pu-card)] p-7 shadow-[0_0_0_1px_var(--pu-line)]"
                  >
                    <span>
                      <span className="block font-semibold">
                        {podcast.name}, the podcast
                      </span>
                      <span className="text-sm text-[var(--pu-muted)] tabular-nums">
                        {podcast.seriesViews.toLocaleString("en-IN")} views
                      </span>
                    </span>
                    <IconMicrophone2
                      aria-hidden
                      size={28}
                      stroke={1.5}
                      className="text-[var(--pu-blue)] transition-transform duration-300 ease-out group-hover:scale-110"
                    />
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Books on the second blue field */}
        <section
          id="books"
          aria-labelledby="books-h"
          className="pb-20 md:pb-28"
        >
          <div className={container}>
            <div className="overflow-hidden rounded-[40px] bg-[var(--pu-blue)] px-5 py-12 text-white md:px-12 md:py-16">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <h2 id="books-h" className={`${h2} max-w-[16ch]`}>
                    ICT&apos;s books, for the exams it teaches.
                  </h2>
                  {samples && (
                    <p className="mt-3 text-sm text-[var(--pu-on-blue)]">
                      Sample titles for now. ICT&apos;s own books replace them
                      before launch.
                    </p>
                  )}
                </div>
                <Link
                  href="/books"
                  className="inline-flex items-center gap-1.5 font-semibold"
                >
                  All books
                  <IconArrowRight aria-hidden size={18} stroke={2} />
                </Link>
              </div>
              <ul className="mt-12 grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-4 md:gap-x-8">
                {books.map((b) => (
                  <li key={b.slug} className="min-w-0">
                    <Link data-bk-hover href={b.href} className="group block">
                      <Book3D
                        book={b}
                        tones={bookTones}
                        font="var(--pu-display)"
                      />
                      <span className="mt-4 block px-[18px] font-semibold">
                        {b.title}
                      </span>
                      <span className="flex items-center justify-between gap-2 px-[18px] text-sm text-[var(--pu-on-blue)]">
                        <span className="tabular-nums">{b.price}</span>
                        <span className="inline-flex items-center gap-1 text-[var(--pu-amber)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          Sample pages
                          <IconArrowRight aria-hidden size={14} stroke={2} />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Batches as tickets */}
        <section
          id="batches"
          aria-labelledby="batches-h"
          className="pb-20 md:pb-28"
        >
          <div className={container}>
            <Reveal>
              <h2 id="batches-h" className={`${h2} max-w-[18ch]`}>
                Pick a batch. Keep the hour.
              </h2>
            </Reveal>
            <ul className="mt-12 grid gap-5">
              {courses.map((c, i) => (
                <li key={c.slug}>
                  <Reveal delay={i * 0.06}>
                    <Link
                      href={c.href}
                      data-ticket-wrap
                      className="group block"
                    >
                      <span
                        data-ticket
                        className="relative grid rounded-[26px] bg-[var(--pu-card)] md:grid-cols-[30%_1fr]"
                      >
                        <span data-perf aria-hidden />
                        <span className="flex items-center gap-5 p-6 md:flex-col md:items-start md:justify-between md:p-8">
                          <span className="font-[family-name:var(--pu-display)] text-2xl leading-tight font-semibold tabular-nums md:text-3xl">
                            {c.when ?? c.duration}
                          </span>
                          <span className="text-sm text-[var(--pu-muted)]">
                            {c.when
                              ? (c.days ?? c.duration)
                              : "Ask for the timing"}
                          </span>
                        </span>
                        <span className="grid items-center gap-6 border-t border-dashed border-[var(--pu-line)] p-6 md:grid-cols-[auto_1fr_auto] md:border-t-0 md:p-8">
                          {c.cover && (
                            <span className="relative hidden aspect-[4/3] w-36 overflow-hidden rounded-2xl md:block">
                              <Image
                                src={c.cover}
                                alt=""
                                fill
                                sizes="144px"
                                className="object-cover"
                              />
                            </span>
                          )}
                          <span>
                            <span className="block text-sm text-[var(--pu-muted)]">
                              {c.full}
                            </span>
                            <span className="block font-[family-name:var(--pu-display)] text-2xl font-semibold tracking-[-0.02em]">
                              {c.name}
                            </span>
                            <span className="mt-1 block text-[var(--pu-muted)]">
                              {c.covers}
                            </span>
                          </span>
                          {c.price && (
                            <span className="flex items-center gap-4 md:flex-col md:items-end">
                              <span className="tabular-nums">
                                <span className="block font-[family-name:var(--pu-display)] text-2xl font-semibold">
                                  {rupees(c.price)}
                                </span>
                                {c.mrp && (
                                  <s className="text-sm text-[var(--pu-muted)]">
                                    {rupees(c.mrp)}
                                  </s>
                                )}
                              </span>
                              <span className="grid size-11 place-items-center rounded-full bg-[var(--pu-blue)] text-white transition-transform duration-300 ease-out group-hover:translate-x-1">
                                <IconArrowRight
                                  aria-hidden
                                  size={18}
                                  stroke={2}
                                />
                              </span>
                            </span>
                          )}
                        </span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Teachers: flip a card for their note and a class to watch. */}
        <section
          id="teachers"
          aria-labelledby="teachers-h"
          className="pb-20 md:pb-28"
        >
          <div className={container}>
            <Reveal>
              <h2 id="teachers-h" className={`${h2} max-w-[18ch]`}>
                Turn a card over to meet a teacher.
              </h2>
            </Reveal>
            <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5">
              {faculty.map((f) => (
                <li key={f.slug} data-flip>
                  <div data-flip-inner>
                    <div
                      data-flip-face
                      className="overflow-hidden rounded-[24px] bg-[var(--pu-blue)]"
                    >
                      <span className="relative block aspect-[4/5]">
                        <Image
                          src={f.portrait}
                          alt={`${f.name}, ${f.teaches}`}
                          fill
                          sizes="(min-width: 768px) 230px, 50vw"
                          className="object-cover object-top"
                        />
                      </span>
                      <span className="block bg-[var(--pu-card)] p-4">
                        <span className="block font-semibold">{f.name}</span>
                        <span className="block truncate text-sm text-[var(--pu-muted)]">
                          {f.teaches}
                        </span>
                      </span>
                    </div>
                    <div
                      data-flip-face
                      data-flip-back
                      className="flex flex-col rounded-[24px] bg-[var(--pu-ink)] p-5 text-white"
                    >
                      <span className="text-sm text-[#AEB9D3]">{f.called}</span>
                      <span className="mt-1 font-[family-name:var(--pu-display)] text-lg leading-tight font-semibold">
                        {f.name}
                      </span>
                      <span className="mt-3 text-sm text-[#D5DCEB]">
                        {f.note}
                      </span>
                      <a
                        href={`https://www.youtube.com/watch?v=${f.lecture}`}
                        {...external}
                        className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--pu-amber)] text-sm font-semibold text-[var(--pu-ink)]"
                      >
                        <IconPlayerPlayFilled aria-hidden size={14} />
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
        <section aria-labelledby="results-h" className="pb-20 md:pb-28">
          <div className={`${container} grid gap-4 lg:grid-cols-12`}>
            <div className="rounded-[28px] bg-[var(--pu-ink)] p-8 text-white md:p-10 lg:col-span-4">
              <h2
                id="results-h"
                className="text-2xl leading-tight font-semibold tracking-[-0.02em]"
              >
                On the APSC CCE 2022 list, prepared at ICT.
              </h2>
              <a
                href={links.apscResultPdf}
                {...external}
                className="mt-6 inline-flex items-center gap-1 text-sm text-[#AEB9D3] underline decoration-white/25 underline-offset-4 hover:text-white"
              >
                Result of 17 January 2024
                <IconArrowUpRight aria-hidden size={15} stroke={1.75} />
              </a>
            </div>
            {selections.map((s) => (
              <Tilt key={s.name} max={3} className="lg:col-span-4">
                <figure className="flex h-full flex-col rounded-[28px] bg-[var(--pu-card)] p-8 shadow-[0_0_0_1px_var(--pu-line)] md:p-10">
                  <span className="font-[family-name:var(--pu-display)] text-6xl font-semibold text-[var(--pu-blue)] tabular-nums">
                    {s.serial}
                  </span>
                  <blockquote className="mt-6 leading-relaxed">
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-auto pt-6">
                    <span className="block font-semibold">{s.name}</span>
                    <span className="text-sm text-[var(--pu-muted)]">
                      {s.post}
                    </span>
                  </figcaption>
                </figure>
              </Tilt>
            ))}
          </div>
        </section>

        {/* Questions */}
        <section aria-labelledby="faq-h" className="pb-20 md:pb-28">
          <div className={container}>
            <h2 id="faq-h" className={`${h2} mb-10`}>
              Questions.
            </h2>
            <dl className="grid gap-4 md:grid-cols-2">
              {faqs.map((f) => (
                <div
                  key={f.q}
                  className="rounded-[22px] bg-[var(--pu-card)] p-6 shadow-[0_0_0_1px_var(--pu-line)]"
                >
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="mt-2 text-[var(--pu-muted)]">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Enquire: the third blue field */}
        <section
          aria-labelledby="join-h"
          className="bg-[var(--pu-blue)] py-20 text-white md:py-28"
        >
          <div className={`${container} grid gap-12 lg:grid-cols-12`}>
            <div className="lg:col-span-7">
              <h2
                id="join-h"
                className="text-[clamp(2.2rem,5vw,4.2rem)] leading-[1] font-semibold tracking-[-0.04em]"
              >
                Your first class is free.
              </h2>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <PrimaryCta />
                <a
                  data-press
                  href={tel}
                  className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold tabular-nums shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45)] hover:bg-white/10"
                >
                  <IconPhone aria-hidden size={18} stroke={1.75} />
                  Call {phone}
                </a>
              </div>
            </div>
            <ol className="grid gap-6 lg:col-span-5">
              {joining.map((j) => (
                <li key={j.verb} className="border-t border-white/25 pt-4">
                  <p className="font-semibold">{j.verb}</p>
                  <p className="mt-1 text-sm text-[var(--pu-on-blue)]">
                    {j.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="pt-10 pb-28 text-sm text-[var(--pu-muted)]">
        <div
          className={`${container} flex flex-wrap items-center gap-x-8 gap-y-3`}
        >
          <address className="not-italic">
            {place.street}, {place.city}, {place.region} {place.pin}
          </address>
          {contact.phones.map((p) => (
            <a
              key={p}
              href={`tel:${p}`}
              className="tabular-nums hover:text-[var(--pu-ink)]"
            >
              {p.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
            </a>
          ))}
          <a
            href={`mailto:${contact.email}`}
            className="hover:text-[var(--pu-ink)]"
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
                className="grid size-11 place-items-center rounded-full transition-colors duration-150 hover:bg-white hover:text-[var(--pu-ink)]"
              >
                <Icon aria-hidden size={19} stroke={1.5} />
              </a>
            ))}
          </div>
          <p className="w-full">Prototype for review. Not the live site.</p>
        </div>
      </footer>

      <PrototypeSwitcher current="pulse" />
    </div>
  )
}
