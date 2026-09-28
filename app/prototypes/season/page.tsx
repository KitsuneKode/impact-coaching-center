import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandYoutube,
  IconPhone,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { Red_Hat_Display, Red_Hat_Mono } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { CALENDAR_EXAMS, type CalendarExam } from "@/lib/calendar"
import { exams } from "@/lib/exams"

import { bookCss, type BookTones } from "../_book"
import {
  contact,
  courses,
  faculty,
  links,
  offer,
  phone,
  place,
  rupees,
  selections,
  shelf,
  tel,
  timetable,
  whatsapp,
} from "../_data"
import { Folder, folderCss, type FolderTones } from "../_folder"
import { Reveal } from "../_reveal"
import { PrototypeSwitcher } from "../_switcher"
import { Almanac, ExamKit, SeasonChart, SeasonRoot, type Kit } from "./_client"
import { season } from "./_dates"

/**
 * Prototype 11: Season. The page is set to whichever exam is next.
 * Colour: restrained light. Cool mist ground, white paper, near-black ink;
 * one deep teal carries the CTA, today's line, the live dot and links.
 * A darker teal holds the free material, the one filled panel on the page.
 */

const sans = Red_Hat_Display({ subsets: ["latin"], variable: "--ss-sans" })
const mono = Red_Hat_Mono({ subsets: ["latin"], variable: "--ss-mono" })

export const metadata: Metadata = { title: "Season" }

const tokens = {
  "--ss-bg": "#EDF1F0",
  "--ss-paper": "#FFFFFF",
  "--ss-well": "#E3E9E8",
  "--ss-ink": "#0C1719",
  "--ss-ink-hi": "#1E2C2F",
  "--ss-muted": "#536467",
  "--ss-line": "rgba(12,23,25,0.10)",
  "--ss-teal": "#0A6B63",
  "--ss-teal-deep": "#0C3B38",
  "--ss-shadow":
    "0 0 0 1px rgba(12,23,25,0.06), 0 1px 2px rgba(12,40,38,0.06), 0 18px 40px -24px rgba(12,40,38,0.22)",
  "--ss-ease": "cubic-bezier(0.23, 1, 0.32, 1)",
} as CSSProperties

const css = `
[data-ss] ::selection { background: var(--ss-teal); color: #fff; }
[data-ss] :focus-visible { outline: 2px solid var(--ss-teal); outline-offset: 3px; }
[data-ss] a { text-underline-offset: 0.22em; }
[data-ss] [data-press] { transition: transform 0.16s var(--ss-ease), background-color 0.2s ease, color 0.2s ease; }
[data-ss] [data-press]:active { transform: scale(0.97); }

@keyframes ss-rise { from { opacity: 0; transform: translateY(12px); filter: blur(6px); } }
[data-ss] [data-rise] { animation: ss-rise 0.8s var(--ss-ease) both; }
@keyframes ss-swap { from { opacity: 0; transform: translateY(6px); filter: blur(4px); } }
[data-ss-swap] { animation: ss-swap 0.35s var(--ss-ease) both; }

[data-ss-card] { box-shadow: 0 0 0 1px rgba(12,23,25,0.06), 0 2px 4px rgba(12,40,38,0.05), 0 40px 80px -40px rgba(12,40,38,0.35); }
/* The almanac's torn-off top edge. */
[data-ss-perf] { position: absolute; inset-inline: 22px; top: 12px; height: 8px;
  background: radial-gradient(circle at 4px 4px, var(--ss-bg) 3px, transparent 3.5px) 0 0 / 16px 8px repeat-x; }
@keyframes ss-live { 50% { box-shadow: 0 0 0 7px rgba(10,107,99,0); } }
[data-ss-live] { width: 8px; height: 8px; border-radius: 99px; background: var(--ss-teal); box-shadow: 0 0 0 0 rgba(10,107,99,0.35); animation: ss-live 2s ease-in-out infinite; }

[data-ss-mark] { background: var(--ss-ink); opacity: 0.28; outline-offset: 4px; transition: opacity 0.2s ease, transform 0.2s var(--ss-ease); cursor: default; }
[data-ss-mark][data-kind="exam"], [data-ss-mark][data-kind="interview"] { box-shadow: 0 0 0 3px var(--ss-paper), 0 0 0 4.5px currentColor; }
[data-ss-row="on"] [data-ss-mark] { background: var(--ss-teal); opacity: 1; color: var(--ss-teal); }
[data-ss-row="on"] { background: linear-gradient(90deg, rgba(10,107,99,0.06), transparent 70%); }
[data-ss-tip] { opacity: 0; translate: -50% 4px; pointer-events: none; transition: opacity 0.15s ease, translate 0.2s var(--ss-ease); }
[data-ss-mark]:hover [data-ss-tip], [data-ss-mark]:focus-visible [data-ss-tip] { opacity: 1; translate: -50% 0; }
[data-ss-mark]:hover { opacity: 1; }

[data-ss-grid] { background-image: linear-gradient(to right, rgba(12,23,25,0.05) 1px, transparent 1px); background-size: calc(100% / 12) 100%;
  -webkit-mask-image: linear-gradient(to bottom, #000, transparent 85%); mask-image: linear-gradient(to bottom, #000, transparent 85%); }

@media (prefers-reduced-motion: reduce) { [data-ss-live] { animation: none; } }
`

const bookTones: BookTones = {
  primary: { bg: "#0A6B63", ink: "#F2FBF9", spine: "#07524C" },
  highlight: { bg: "#F4F6F6", ink: "#0C1719", spine: "#C9D2D1" },
  muted: { bg: "#17292B", ink: "#EDF1F0", spine: "#0E1D1F" },
}

/** Folders on the dark teal panel: pale card stock. */
const folderTones: FolderTones = {
  back: "#9FC7C1",
  front: "#DCEFEB",
  paper: "#FFFFFF",
  ink: "#0C1719",
  muted: "#3F5F5B",
}

const container = "mx-auto w-full max-w-[1240px] px-5 md:px-8"
const external = { target: "_blank", rel: "noreferrer noopener" } as const

/** Which of ICT's free folders and books belong to each exam. */
const FOLDERS: Record<CalendarExam, string[]> = {
  apsc: ["mock-apsc", "study-apsc", "current-affairs"],
  adre: ["mock-adre", "study-adre", "current-affairs"],
  "assam-police-si": ["mock-adre", "study-adre", "current-affairs"],
  banking: ["study-banking", "current-affairs"],
}
const bookFor = (exam: CalendarExam, label: string) =>
  exam === "apsc"
    ? /APSC/i.test(label)
    : exam === "banking"
      ? /bank|ssc|rail/i.test(label)
      : /ADRE|police/i.test(label)

export default async function Season() {
  const { books, folders, samples } = await shelf()
  const { today, dates } = season()
  const tabs = exams.map((e) => ({ slug: e.slug, short: e.short.en }))

  const kits: Kit[] = exams.map((e) => {
    const track = courses.find((c) => c.slug === e.track)
    return {
      slug: e.slug,
      short: e.short.en,
      name: e.name.en,
      body: e.body.en,
      summary: e.summary.en,
      stages: e.stages.map((s) => ({ name: s.name.en, facts: s.facts?.en })),
      source: { label: e.sources[0]!.label.en, href: e.sources[0]!.href },
      folders: FOLDERS[e.slug].map((id) => folders.find((f) => f.id === id)!),
      books: books.filter((b) => bookFor(e.slug, `${b.exam} ${b.title}`)),
      course: track
        ? {
            name: track.name,
            cover: track.cover,
            when: track.when,
            days: track.days,
            price: track.price ? rupees(track.price) : null,
            mrp: track.mrp ? rupees(track.mrp) : null,
            href: track.href,
          }
        : null,
    }
  })

  /* Open on the exam whose next date comes first. */
  const soonest =
    [...dates]
      .filter((d) => (d.ends ?? d.starts) >= today)
      .sort((a, b) => a.starts.localeCompare(b.starts))[0]?.exam ??
    CALENDAR_EXAMS[0]

  return (
    <div
      data-ss
      style={tokens}
      className={`${sans.variable} ${mono.variable} min-h-[100dvh] bg-[var(--ss-bg)] font-[family-name:var(--ss-sans)] text-[var(--ss-ink)] antialiased`}
    >
      <style>{css + bookCss + folderCss}</style>

      <header className="sticky top-0 z-40 border-b border-[var(--ss-line)] bg-[rgba(237,241,240,0.8)] backdrop-blur-xl">
        <div className={`${container} flex h-16 items-center gap-8`}>
          <Link href="/prototypes/season" className="flex items-center gap-3">
            <Image
              src="/brand/ict-mark.png"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-lg bg-white"
            />
            <span className="hidden font-semibold tracking-[-0.02em] sm:block">
              Impact Career Tutorials
            </span>
          </Link>
          <nav
            aria-label="Sections"
            className="hidden items-center gap-7 text-sm text-[var(--ss-muted)] md:flex"
          >
            {[
              ["#season", "Dates"],
              ["#kit", "Free mocks and books"],
              ["#batches", "Batches"],
              ["#results", "Results"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="transition-colors hover:text-[var(--ss-ink)]"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-5">
            <a
              href={tel}
              className="hidden text-sm text-[var(--ss-muted)] tabular-nums transition-colors hover:text-[var(--ss-ink)] lg:inline"
            >
              {phone}
            </a>
            <a
              data-press
              href={whatsapp}
              {...external}
              className="inline-flex h-10 items-center rounded-full bg-[var(--ss-teal)] px-4 text-sm font-semibold whitespace-nowrap text-white hover:bg-[#095C55]"
            >
              {offer.cta}
            </a>
          </div>
        </div>
      </header>

      <SeasonRoot initial={soonest}>
        <main>
          {/* Hero: the promise on the left, the almanac on the right. */}
          <section
            aria-label="Introduction"
            className="relative overflow-hidden"
          >
            <div data-ss-grid aria-hidden className="absolute inset-0" />
            <div
              className={`${container} relative grid items-center gap-12 pt-14 pb-16 md:pt-20 lg:grid-cols-[1fr_minmax(0,34rem)] lg:gap-16 lg:pb-24`}
            >
              <div>
                <h1
                  data-rise
                  className="max-w-[16ch] text-[clamp(2.6rem,6vw,4.9rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance"
                >
                  The next exam date, and what to do before it.
                </h1>
                <p
                  data-rise
                  style={{ animationDelay: "0.1s" }}
                  className="mt-6 max-w-[46ch] text-lg text-pretty text-[var(--ss-muted)]"
                >
                  Notified dates for APSC, ADRE, Assam Police and bank exams,
                  with the free mocks, books and batch for each.
                </p>
                <div
                  data-rise
                  style={{ animationDelay: "0.18s" }}
                  className="mt-9 flex flex-wrap gap-3"
                >
                  <a
                    data-press
                    href={whatsapp}
                    {...external}
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-[var(--ss-teal)] px-6 font-semibold text-white hover:bg-[#095C55]"
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
                    data-press
                    href={tel}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--ss-paper)] px-5 font-semibold tabular-nums shadow-[var(--ss-shadow)] hover:bg-white/70"
                  >
                    <IconPhone aria-hidden size={18} stroke={1.75} />
                    Call {phone}
                  </a>
                </div>
              </div>

              <div
                data-rise
                style={{ animationDelay: "0.12s" }}
                className="min-w-0"
              >
                <Almanac tabs={tabs} dates={dates} today={today} />
                <p className="mt-3 px-2 text-xs text-[var(--ss-muted)]">
                  Sample dates, to show the design. The live page reads the
                  calendar ICT keeps, each date linked to its notice.
                </p>
              </div>
            </div>
          </section>

          {/* The year: every exam on one chart. */}
          <section
            id="season"
            aria-labelledby="season-h"
            className="scroll-mt-20 border-t border-[var(--ss-line)] bg-[var(--ss-paper)] py-20 md:py-24"
          >
            <div className={container}>
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <h2
                  id="season-h"
                  className="max-w-[22ch] text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance"
                >
                  The next twelve months, every exam on one line.
                </h2>
                <p className="max-w-[40ch] text-[var(--ss-muted)]">
                  Rings are exam days, dots are notices and results, bars are
                  application windows. Pick a row to set the page to it.
                </p>
              </div>
              <Reveal className="mt-12">
                <SeasonChart tabs={tabs} dates={dates} today={today} />
              </Reveal>
            </div>
          </section>

          {/* The kit for the chosen exam. */}
          <section
            id="kit"
            aria-label="Free material, books and batch"
            className="scroll-mt-20 py-20 md:py-28"
          >
            <div className={container}>
              <ExamKit
                kits={kits}
                tabs={tabs}
                bookTones={bookTones}
                folderTones={folderTones}
                samples={samples}
              />
            </div>
          </section>

          {/* All six folders, whatever the exam. */}
          <section
            aria-labelledby="folders-h"
            className="bg-[var(--ss-teal-deep)] py-20 text-white md:py-24"
          >
            <div className={container}>
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <h2
                  id="folders-h"
                  className="max-w-[18ch] text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance"
                >
                  Six folders, free for everyone.
                </h2>
                <Link
                  data-press
                  href="/resources"
                  className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-white px-5 text-sm font-semibold text-[var(--ss-ink)] hover:bg-white/85 md:self-end"
                >
                  Open the free material
                  <IconArrowRight aria-hidden size={16} stroke={2} />
                </Link>
              </div>
              <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
                {folders.map((f, i) => (
                  <li key={f.id}>
                    <Reveal delay={i * 0.05}>
                      <Link
                        data-fd-hover
                        href="/resources"
                        aria-label={`${f.name}, ${f.items.length} files`}
                        className="block rounded-[14px]"
                      >
                        <Folder folder={f} tones={folderTones} />
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
              {samples ? (
                <p className="mt-8 text-sm text-white/60">
                  The files inside are samples until ICT uploads its own.
                </p>
              ) : null}
            </div>
          </section>

          {/* Batches as a printed timetable. */}
          <section
            id="batches"
            aria-labelledby="batches-h"
            className="scroll-mt-20 py-20 md:py-28"
          >
            <div className={`${container} grid gap-10 lg:grid-cols-12`}>
              <div className="lg:col-span-4">
                <h2
                  id="batches-h"
                  className="text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance"
                >
                  Pick the hour you can study.
                </h2>
                <p className="mt-4 max-w-[36ch] text-[var(--ss-muted)]">
                  Every batch is taught on {place.spoken} and recorded to the
                  ICT app the same day.
                </p>
              </div>
              <ol className="rounded-[24px] bg-[var(--ss-paper)] shadow-[var(--ss-shadow)] lg:col-span-8">
                {timetable.map((row) => (
                  <li
                    key={row.id}
                    className="border-t border-[var(--ss-line)] first:border-t-0"
                  >
                    <Link
                      href={row.href}
                      className="group grid grid-cols-[7.5rem_1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--ss-bg)]/60 md:grid-cols-[9rem_1fr_auto] md:px-7"
                    >
                      <span className="font-[family-name:var(--ss-mono)] text-sm font-semibold tabular-nums">
                        {row.when}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {row.name}
                        </span>
                        <span className="block truncate text-sm text-[var(--ss-muted)]">
                          {row.exam}
                          {row.days ? `, ${row.days}` : ""}
                        </span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {rupees(row.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Results and the teachers behind them. */}
          <section
            id="results"
            aria-labelledby="results-h"
            className="scroll-mt-20 border-t border-[var(--ss-line)] bg-[var(--ss-paper)] py-20 md:py-28"
          >
            <div className={container}>
              <h2
                id="results-h"
                className="max-w-[24ch] text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance"
              >
                Two officers on the APSC CCE 2022 list prepared here.
              </h2>
              <div className="mt-12 grid gap-4 md:grid-cols-2">
                {selections.map((s) => (
                  <figure
                    key={s.name}
                    className="flex flex-col rounded-[24px] bg-[var(--ss-bg)] p-7"
                  >
                    <blockquote className="text-lg leading-snug text-pretty">
                      &ldquo;{s.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-auto flex items-end justify-between gap-4 pt-8">
                      <span>
                        <span className="block font-semibold">{s.name}</span>
                        <span className="block text-sm text-[var(--ss-muted)]">
                          {s.post}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-xs text-[var(--ss-muted)]">
                          Serial
                        </span>
                        <span className="font-[family-name:var(--ss-mono)] text-3xl font-semibold text-[var(--ss-teal)] tabular-nums">
                          {s.serial}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <a
                href={links.apscResultPdf}
                {...external}
                className="mt-5 inline-flex items-center gap-1 text-sm text-[var(--ss-muted)] underline decoration-[var(--ss-line)] hover:text-[var(--ss-ink)]"
              >
                APSC&apos;s own result, 17 January 2024
                <IconArrowUpRight aria-hidden size={14} stroke={1.75} />
              </a>

              <ul className="mt-16 flex snap-x [scrollbar-width:none] gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible">
                {faculty.map((f) => (
                  <li
                    key={f.slug}
                    className="w-44 shrink-0 snap-start md:w-auto"
                  >
                    <div className="relative aspect-[38/42] overflow-hidden rounded-2xl bg-[#14285A]">
                      <Image
                        src={f.portrait}
                        alt={f.name}
                        fill
                        sizes="(min-width: 768px) 220px, 176px"
                        className="object-cover object-top"
                      />
                    </div>
                    <p className="mt-3 font-semibold">{f.called}</p>
                    <p className="text-sm text-[var(--ss-muted)]">
                      {f.teaches}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Enquire */}
          <section aria-labelledby="enquire-h" className="py-20 md:py-28">
            <div className={container}>
              <div className="grid gap-8 rounded-[32px] bg-[var(--ss-ink)] p-8 text-white md:p-14 lg:grid-cols-[1.2fr_1fr] lg:items-end">
                <div>
                  <h2
                    id="enquire-h"
                    className="text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance"
                  >
                    Sit in a class before the next date.
                  </h2>
                  <p className="mt-4 max-w-[44ch] text-white/70">
                    {offer.promise}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <a
                    data-press
                    href={whatsapp}
                    {...external}
                    className="inline-flex h-12 items-center rounded-full bg-white px-6 font-semibold text-[var(--ss-ink)] hover:bg-white/85"
                  >
                    {offer.cta}
                  </a>
                  <a
                    data-press
                    href={tel}
                    className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-semibold tabular-nums shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] hover:bg-white/10"
                  >
                    <IconPhone aria-hidden size={18} stroke={1.75} />
                    Call {phone}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>
      </SeasonRoot>

      <footer className="border-t border-[var(--ss-line)] pt-12 pb-28 text-sm text-[var(--ss-muted)]">
        <div className={`${container} grid gap-8 md:grid-cols-12`}>
          <div className="md:col-span-5">
            <p className="font-semibold text-[var(--ss-ink)]">
              Impact Career Tutorials
            </p>
            <address className="mt-3 not-italic">
              {place.street}, {place.city}, {place.region} {place.pin}
            </address>
            <a
              href={place.maps}
              {...external}
              className="mt-2 inline-block underline"
            >
              Open in Google Maps
            </a>
          </div>
          <div className="grid gap-1 md:col-span-4">
            {contact.phones.map((p) => (
              <a
                key={p}
                href={`tel:${p}`}
                className="tabular-nums hover:text-[var(--ss-ink)]"
              >
                {p.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
              </a>
            ))}
            <a
              href={`mailto:${contact.email}`}
              className="hover:text-[var(--ss-ink)]"
            >
              {contact.email}
            </a>
          </div>
          <div className="flex gap-2 md:col-span-3 md:justify-end">
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
                data-press
                className="grid size-11 place-items-center rounded-full bg-[var(--ss-paper)] shadow-[var(--ss-shadow)] hover:text-[var(--ss-ink)]"
              >
                <Icon aria-hidden size={18} stroke={1.75} />
              </a>
            ))}
          </div>
          <p className="md:col-span-12">
            Prototype for review. Not the live site.
          </p>
        </div>
      </footer>

      <PrototypeSwitcher current="season" />
    </div>
  )
}
