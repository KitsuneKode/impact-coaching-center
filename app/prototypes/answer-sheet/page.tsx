import { IconPlayerPlayFilled } from "@tabler/icons-react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"

import {
  campus,
  classes,
  compact,
  contact,
  courses,
  faculty,
  faqs,
  included,
  joining,
  links,
  offer,
  officers,
  phone,
  place,
  proof,
  publishedStories,
  rupees,
  selections,
  tel,
  whatsapp,
} from "../_data"
import { PrototypeSwitcher } from "../_switcher"
import { HomeMenu, HomePromos } from "../_kit/home-extras"
import { tokens as siteTokens } from "./_site"

/*
 * Answer sheet. The page is an examination paper: paper white, one ink, ruled
 * hairlines instead of boxes, a monospace only where a real measurement sits.
 *
 * Colour strategy: restrained. Paper #FBFBF9, ink #1B1F27, muted #6A6F7A, and
 * one green #2FB04A (the logo's bars). Green is used exactly four ways: filled
 * OMR bubbles (including the checklist ticks and the bubble-fill hover), the
 * marker beside verified serials and question numbers, the 2px underline on the
 * secondary "Call" link, and ::selection at 30%. Green on paper measures 2.7:1,
 * so it is never used as text: the primary CTA is ink-filled with paper text,
 * and serials sit as ink numerals inside a green bubble (5.8:1) rather than as
 * green numerals. Faculty portraits keep their own dark-blue background on a
 * matching tile; that tile is the photograph's colour, not an accent.
 * The ruled background (a 1px hairline every 24px at 8% ink) appears on the
 * hero and FAQ only, because a real answer sheet is ruled. No amber, no navy.
 */

const sans = Geist({ subsets: ["latin"], variable: "--as-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--as-mono" })

export const metadata: Metadata = { title: "Answer sheet" }

const tokens = {
  "--paper": "#FBFBF9",
  "--ink": "#1B1F27",
  "--ink-hover": "#2E3442",
  "--muted": "#6A6F7A",
  "--green": "#2FB04A",
  "--rule": "rgba(27, 31, 39, 0.08)",
  "--line": "rgba(27, 31, 39, 0.14)",
  "--tile": "#0C1A30",
} as CSSProperties

/** OMR block: 5 options across, 8 questions down. One marked answer per row. */
const OMR_COLS = 5
const OMR_ROWS = 8
const OMR_OPTIONS = ["A", "B", "C", "D", "E"] as const
const OMR_FILLED = new Set([1, 8, 10, 17, 24, 26, 33, 35])

const warrior = classes.find((c) => c.id === "PcIFQy3R_HA")!
const ease = "ease-[cubic-bezier(0.23,1,0.32,1)]"
const pressable = `transition-[background-color,color,transform] duration-200 ${ease} active:scale-[0.98]`
const btnPrimary = `inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--ink)] px-6 font-medium text-[var(--paper)] hover:bg-[var(--ink-hover)] ${pressable}`
const btnSecondary = `inline-flex min-h-12 items-center justify-center px-2 font-medium text-[var(--ink)] underline decoration-[var(--green)] decoration-2 underline-offset-[6px] hover:text-[var(--ink-hover)] hover:decoration-3 ${pressable}`
const textLink = `inline-flex min-h-11 items-center underline decoration-1 decoration-[var(--line)] underline-offset-[5px] transition-[color,text-decoration-color,transform] duration-200 ${ease} hover:text-[var(--muted)] hover:decoration-[var(--muted)] active:scale-[0.98]`
const container = "mx-auto w-full max-w-6xl px-5 md:px-10"
const monoClass = "font-[family-name:var(--as-mono)] tabular-nums"
const h2Class =
  "text-3xl leading-[1.05] font-medium tracking-[-0.025em] text-balance md:text-[2.75rem]"

/** An empty bubble that fills green when its `group` parent is hovered. */
function HoverBubble({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border border-[var(--ink)] ${className}`}
    >
      <span
        className={`block size-full scale-[0.6] rounded-full bg-[var(--green)] opacity-0 transition-[transform,opacity] duration-150 ${ease} group-hover:scale-100 group-hover:opacity-100`}
      />
    </span>
  )
}

/** A filled bubble: the checklist tick and the marker beside verified serials. */
function FilledBubble({ size = 12 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full bg-[var(--green)]"
      style={{ width: size, height: size }}
    />
  )
}

/** A YouTube still in a 16/9 frame with a play disc; never text on the still. */
function VideoFrame({
  src,
  alt,
  sizes,
  disc = 40,
  priority = false,
}: {
  src: string
  alt: string
  sizes: string
  disc?: number
  priority?: boolean
}) {
  return (
    <span className="relative block aspect-video overflow-hidden rounded-lg bg-[var(--tile)]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover opacity-90 transition-[opacity,transform] duration-200 ${ease} group-hover:scale-[1.02] group-hover:opacity-100`}
      />
      <span
        aria-hidden
        className={`absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--paper)] text-[var(--ink)] transition-transform duration-200 ${ease} group-hover:scale-105`}
        style={{ width: disc, height: disc }}
      >
        <IconPlayerPlayFilled size={disc * 0.4} />
      </span>
    </span>
  )
}

function SectionHeading({
  id,
  children,
  aside,
}: {
  id?: string
  children: ReactNode
  aside?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-6 md:flex-row md:items-end md:justify-between md:gap-10">
      <h2 id={id} className={`${h2Class} max-w-[22ch] scroll-mt-24`}>
        {children}
      </h2>
      {aside ? (
        <p className="max-w-[40ch] text-base text-[var(--muted)]">{aside}</p>
      ) : null}
    </div>
  )
}

export default function AnswerSheet() {
  const mockHall = [campus[0], campus[1]] as const

  return (
    <div
      style={tokens}
      data-as=""
      className={`${sans.variable} ${mono.variable} min-h-[100dvh] bg-[var(--paper)] font-[family-name:var(--as-sans)] text-[var(--ink)] antialiased`}
    >
      <style>{`
        [data-as] ::selection { background: rgba(47, 176, 74, 0.3); color: var(--ink); }
        [data-as] :focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
        [data-ruled] {
          background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 23px, var(--rule) 23px, var(--rule) 24px);
          background-attachment: local;
        }
        @keyframes as-rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes as-fill {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: none; }
        }
        [data-rise] {
          animation: as-rise 640ms cubic-bezier(0.23, 1, 0.32, 1) both;
          animation-delay: calc(var(--d, 0) * 1ms);
        }
        [data-fill] {
          animation: as-fill 320ms cubic-bezier(0.23, 1, 0.32, 1) both;
          animation-delay: calc(560ms + var(--i, 0) * 40ms);
        }
        @media (prefers-reduced-motion: reduce) {
          [data-rise], [data-fill] { animation: none; }
        }
      `}</style>

      <HomePromos slug="answer-sheet" tokens={siteTokens} />

      <header className="border-b border-[var(--line)]">
        <div
          className={`${container} flex h-16 items-center justify-between gap-4`}
        >
          <Link
            href="/prototypes/answer-sheet"
            className="flex min-h-11 items-center rounded-sm"
            aria-label="Impact Career Tutorials, answer sheet prototype"
          >
            <Image
              src="/brand/ict-logo-tight.png"
              alt=""
              width={60}
              height={32}
              priority
              className="h-8 w-auto"
            />
          </Link>
          <nav aria-label="Sections" className="hidden gap-7 text-sm md:flex">
            {[
              ["#results", "Results"],
              ["#faculty", "Faculty"],
              ["#courses", "Courses"],
              ["#faq", "Questions"],
              ["/prototypes/answer-sheet/books", "Books"],
              ["/prototypes/answer-sheet/notes", "Free notes"],
              ["/prototypes/answer-sheet/contact", "Contact"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={`inline-flex min-h-11 items-center underline-offset-[6px] transition-transform duration-200 ${ease} hover:underline hover:decoration-1 active:scale-[0.98]`}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={tel}
              className={`${monoClass} hidden min-h-11 items-center text-sm underline-offset-[6px] hover:underline hover:decoration-1 lg:inline-flex`}
            >
              {phone}
            </a>
            <a
              href={whatsapp}
              rel="noreferrer noopener"
              target="_blank"
              className={`${btnPrimary} min-h-11 px-5 text-sm`}
            >
              {offer.cta}
            </a>
          </div>
          <HomeMenu slug="answer-sheet" tokens={siteTokens} />
        </div>
      </header>

      <main>
        {/* 1. Hero: ruled paper, copy left, OMR block right. */}
        <section
          aria-labelledby="hero-h"
          data-ruled=""
          className="border-b border-[var(--line)]"
        >
          <div
            className={`${container} grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:items-start lg:gap-8 lg:py-24`}
          >
            <div className="lg:col-span-7">
              <h1
                id="hero-h"
                data-rise=""
                className="max-w-[14ch] text-[2.75rem] leading-[0.98] font-medium tracking-[-0.025em] text-balance sm:text-6xl lg:text-[5rem]"
              >
                Sit the test before the test.
              </h1>
              <p
                data-rise=""
                className="mt-6 max-w-[36ch] text-lg leading-snug text-[var(--muted)] md:text-xl"
                style={{ "--d": 90 } as CSSProperties}
              >
                Twenty Prelims and twenty Mains mocks inside the APSC course,
                discussed in class and recorded on the app.
              </p>
              <div
                data-rise=""
                className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3"
                style={{ "--d": 180 } as CSSProperties}
              >
                <a
                  href={whatsapp}
                  rel="noreferrer noopener"
                  target="_blank"
                  className={btnPrimary}
                >
                  {offer.cta}
                </a>
                <a href={tel} className={btnSecondary}>
                  Call <span className={`${monoClass} ml-1.5`}>{phone}</span>
                </a>
              </div>
            </div>

            <div className="w-[60%] max-w-[300px] lg:col-span-5 lg:w-full lg:max-w-none lg:justify-self-end lg:pl-6">
              <div className="max-w-[320px] lg:ml-auto">
                <div
                  aria-hidden
                  className={`${monoClass} grid grid-cols-[1.5rem_repeat(5,minmax(0,1fr))] gap-y-3 text-xs text-[var(--muted)]`}
                >
                  <span />
                  {OMR_OPTIONS.map((o) => (
                    <span key={o} className="text-center">
                      {o}
                    </span>
                  ))}
                  {Array.from({ length: OMR_ROWS }, (_, r) => (
                    <div
                      key={r}
                      className="col-span-full grid grid-cols-subgrid items-center"
                    >
                      <span>{r + 1}</span>
                      {Array.from({ length: OMR_COLS }, (_, c) => {
                        const idx = r * OMR_COLS + c
                        const filled = OMR_FILLED.has(idx)
                        return (
                          <span key={c} className="flex justify-center">
                            <span className="relative block size-[18px] rounded-full border border-[var(--ink)]">
                              {filled ? (
                                <span
                                  data-fill=""
                                  className="absolute -inset-px rounded-full bg-[var(--green)]"
                                  style={{ "--i": r } as CSSProperties}
                                />
                              ) : null}
                            </span>
                          </span>
                        )
                      })}
                    </div>
                  ))}
                </div>
                <p
                  className={`${monoClass} mt-5 border-t border-[var(--line)] pt-3 text-xs leading-relaxed text-[var(--muted)]`}
                >
                  <a
                    href={warrior.href}
                    rel="noreferrer noopener"
                    target="_blank"
                    className={`${textLink} min-h-0 text-[var(--ink)]`}
                  >
                    {warrior.title}
                  </a>
                  <br />
                  {warrior.by}, {compact(warrior.views)} views
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Proof: four instruction lines on one ruled row. */}
        <section
          aria-label="Figures you can check"
          className="border-b border-[var(--line)]"
        >
          <ul className={`${container} grid grid-cols-2 lg:grid-cols-4`}>
            {proof.map((p, i) => (
              <li
                key={p.label}
                className={`border-[var(--line)] ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
              >
                <a
                  href={p.href}
                  rel="noreferrer noopener"
                  target="_blank"
                  className={`group flex h-full flex-col gap-2 py-6 pr-4 transition-transform duration-200 md:py-8 md:pr-6 ${ease} active:scale-[0.98] ${i % 2 === 0 ? "pl-0" : "pl-4 md:pl-6"} ${i === 2 ? "lg:pl-6" : ""}`}
                >
                  <span
                    className={`${monoClass} text-3xl leading-none tracking-[-0.02em] md:text-4xl`}
                  >
                    {p.display}
                  </span>
                  <span
                    className={`text-sm leading-snug text-[var(--muted)] underline-offset-[5px] transition-colors duration-200 ${ease} group-hover:text-[var(--ink)] group-hover:underline group-hover:decoration-1`}
                  >
                    {p.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Results as an answer key, then officers as a numbered list. */}
        <section
          aria-labelledby="results-h"
          className={`${container} py-16 md:py-24`}
        >
          <SectionHeading
            id="results"
            aside="APSC CCE 2022, result dated 17 January 2024. Both officers prepared at ICT."
          >
            <span id="results-h">Answer key.</span>
          </SectionHeading>

          <table className="mt-10 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--line)] text-sm text-[var(--muted)]">
                <th scope="col" className="py-3 pr-4 font-normal">
                  Serial
                </th>
                <th scope="col" className="py-3 pr-4 font-normal">
                  Name
                </th>
                <th scope="col" className="py-3 pr-4 font-normal">
                  Post
                </th>
                <th
                  scope="col"
                  className="hidden py-3 font-normal md:table-cell"
                >
                  Examination
                </th>
              </tr>
            </thead>
            <tbody>
              {selections.map((s) => (
                <tr
                  key={s.serial}
                  className="border-b border-[var(--line)] align-top"
                >
                  <td className="py-5 pr-4">
                    <span
                      className={`${monoClass} inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-[var(--green)] px-2 text-base font-medium text-[var(--ink)]`}
                    >
                      {s.serial}
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-lg font-medium md:text-xl">
                    {s.name}
                  </td>
                  <td className="py-5 pr-4 text-base">{s.post}</td>
                  <td className="hidden py-5 text-base text-[var(--muted)] md:table-cell">
                    APSC CCE 2022
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-12">
            {selections.map((s) => (
              <blockquote
                key={s.name}
                className="border-l border-[var(--line)] pl-5 text-base leading-relaxed text-[var(--muted)]"
              >
                <p className="text-[var(--ink)]">“{s.quote}”</p>
                <footer className="mt-3 text-sm">
                  {s.name}, {s.post}
                </footer>
              </blockquote>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-1 border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)]">
            <p>
              Serials 46 and 31 checked against the{" "}
              <a
                href={links.apscResultPdf}
                rel="noreferrer noopener"
                target="_blank"
                className={`${textLink} min-h-0 text-[var(--ink)]`}
              >
                official APSC result list
              </a>
              .
            </p>
            {publishedStories.map((story) => (
              <p key={story.id}>
                <a
                  href={`https://www.youtube.com/watch?v=${story.id}`}
                  rel="noreferrer noopener"
                  target="_blank"
                  className={`${textLink} min-h-0 text-[var(--ink)]`}
                >
                  {story.name}
                </a>
                , {story.outcome}. {story.note}
              </p>
            ))}
          </div>

          <h3 className="mt-16 max-w-[26ch] text-2xl leading-tight font-medium tracking-[-0.02em] text-balance md:text-3xl">
            Serving officers who came to talk to the batch.
          </h3>
          <ol className="mt-6 border-t border-[var(--line)]">
            {officers.map((o, i) => (
              <li key={o.id} className="border-b border-[var(--line)]">
                <a
                  href={o.href}
                  rel="noreferrer noopener"
                  target="_blank"
                  className={`group grid grid-cols-[2rem_96px_minmax(0,1fr)] items-center gap-x-4 py-4 transition-transform duration-200 sm:grid-cols-[2.5rem_96px_minmax(0,1fr)_auto_18px] sm:gap-x-6 ${ease} active:scale-[0.98]`}
                >
                  <span className={`${monoClass} text-sm text-[var(--muted)]`}>
                    {i + 1}.
                  </span>
                  <span className="w-24">
                    <VideoFrame src={o.image} alt="" sizes="96px" disc={28} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-base font-medium md:text-lg">
                      {o.name}
                    </span>
                    <span className="text-sm text-[var(--muted)]">
                      {o.role}. {o.detail}
                    </span>
                    <span
                      className={`${monoClass} text-xs text-[var(--muted)] sm:hidden`}
                    >
                      {compact(o.views)} views
                    </span>
                  </span>
                  <span
                    className={`${monoClass} hidden text-sm text-[var(--muted)] sm:block`}
                  >
                    {compact(o.views)} views
                  </span>
                  <span className="hidden sm:block">
                    <HoverBubble />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>

        {/* 4. Faculty as an invigilator roster: rows, not cards. */}
        <section
          aria-labelledby="faculty-h"
          className={`${container} pb-16 md:pb-24`}
        >
          <SectionHeading
            id="faculty"
            aside="Every portrait links to a full lecture by that teacher on the ICT channel."
          >
            <span id="faculty-h">Who takes the class.</span>
          </SectionHeading>
          <ul className="mt-10 border-t border-[var(--line)]">
            {faculty.map((f) => (
              <li
                key={f.slug}
                className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-5 gap-y-3 border-b border-[var(--line)] py-5 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:gap-x-8"
              >
                <span className="relative block size-[72px] overflow-hidden rounded-lg bg-[var(--tile)]">
                  <Image
                    src={f.portrait}
                    alt={`${f.name}, ${f.teaches}`}
                    fill
                    sizes="72px"
                    className="object-cover object-top"
                  />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-lg font-medium md:text-xl">
                    {f.name}
                  </span>
                  <span className="text-sm text-[var(--muted)]">
                    {f.teaches}. {f.note}
                  </span>
                </span>
                <a
                  href={`https://www.youtube.com/watch?v=${f.lecture}`}
                  rel="noreferrer noopener"
                  target="_blank"
                  className={`${textLink} col-start-2 text-sm sm:col-start-3`}
                >
                  Watch a class
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* 5. Courses as a paper table: three columns, then the checklist. */}
        <section
          aria-labelledby="courses-h"
          className={`${container} pb-16 md:pb-24`}
        >
          <SectionHeading
            id="courses"
            aside="One fee per course. Prices are read from the same store that takes the payment."
          >
            <span id="courses-h">Courses and fees.</span>
          </SectionHeading>

          <div className="mt-10 grid gap-y-12 md:grid-cols-3 md:gap-y-0">
            {courses.map((c, i) => (
              <article
                key={c.slug}
                className={`group flex flex-col border-[var(--line)] ${i > 0 ? "md:border-l md:pl-8" : ""} ${i < courses.length - 1 ? "md:pr-8" : ""}`}
              >
                {c.cover ? (
                  <Link
                    href={c.href}
                    aria-label={`${c.name}, course page`}
                    className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-[var(--tile)]"
                  >
                    <Image
                      src={c.cover}
                      alt={`${c.name} poster`}
                      fill
                      sizes="(min-width: 768px) 30vw, 100vw"
                      className={`object-cover transition-transform duration-300 ${ease} group-hover:scale-[1.02]`}
                    />
                  </Link>
                ) : null}
                <div className="mt-6 flex items-start justify-between gap-4">
                  <h3 className="text-2xl leading-tight font-medium tracking-[-0.02em]">
                    {c.name}
                  </h3>
                  <HoverBubble className="mt-2" />
                </div>
                <p className="mt-1 text-base text-[var(--muted)]">
                  {c.exam}. {c.full}.
                </p>
                <dl className="mt-6 flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
                  <div className="flex justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted)]">Covers</dt>
                    <dd className="text-right">{c.covers}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted)]">Duration</dt>
                    <dd className="text-right">{c.duration}</dd>
                  </div>
                  {c.when ? (
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-[var(--muted)]">Timing</dt>
                      <dd className={`${monoClass} text-right`}>
                        {c.when}
                        {c.days ? (
                          <span className="block font-[family-name:var(--as-sans)] text-[var(--muted)]">
                            {c.days}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  ) : null}
                  {c.note ? (
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-[var(--muted)]">Batch</dt>
                      <dd className="text-right">{c.note}</dd>
                    </div>
                  ) : null}
                </dl>
                <p className="mt-6 flex flex-wrap items-baseline gap-x-3">
                  {c.price !== null ? (
                    <span
                      className={`${monoClass} text-3xl tracking-[-0.02em]`}
                    >
                      {rupees(c.price)}
                    </span>
                  ) : (
                    <span className="text-base text-[var(--muted)]">
                      Fee on enquiry
                    </span>
                  )}
                  {c.mrp !== null && c.price !== null && c.mrp > c.price ? (
                    <s className={`${monoClass} text-base text-[var(--muted)]`}>
                      {rupees(c.mrp)}
                    </s>
                  ) : null}
                </p>
                <p className="mt-auto pt-6">
                  <Link href={c.href} className={`${textLink} text-sm`}>
                    See the course
                  </Link>
                </p>
              </article>
            ))}
          </div>

          <h3 className="mt-16 text-2xl leading-tight font-medium tracking-[-0.02em] md:text-3xl">
            What the APSC batch includes.
          </h3>
          <ul className="mt-6 grid border-t border-[var(--line)] sm:grid-cols-2 sm:gap-x-10">
            {included.map((item) => (
              <li
                key={item.text}
                className="flex items-center gap-4 border-b border-[var(--line)] py-3.5 text-base"
              >
                <FilledBubble />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 6. Mock hall: two tall frames beside a paragraph and the discussion. */}
        <section
          aria-labelledby="hall-h"
          className={`${container} pb-16 md:pb-24`}
        >
          <SectionHeading>
            <span id="hall-h">A hall, a paper, a clock.</span>
          </SectionHeading>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
            <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:col-span-7">
              {mockHall.map((c) => (
                <li key={c.src} className="flex flex-col gap-3">
                  <span className="relative block aspect-[9/16] overflow-hidden rounded-lg bg-[var(--tile)]">
                    <Image
                      src={c.src}
                      alt={c.alt}
                      fill
                      sizes="(min-width: 1024px) 28vw, 45vw"
                      className="object-cover"
                    />
                  </span>
                  <p className="text-sm leading-snug text-[var(--muted)]">
                    {c.caption}.{" "}
                    <a
                      href={`https://www.youtube.com/watch?v=${c.video}`}
                      rel="noreferrer noopener"
                      target="_blank"
                      className={`${textLink} min-h-0 text-[var(--ink)]`}
                    >
                      Watch the video
                    </a>
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-8 lg:col-span-5 lg:pl-6">
              <p className="max-w-[44ch] text-lg leading-relaxed">
                Warrior mock tests are written on paper in the classroom on{" "}
                {place.spoken}, then discussed with the batch. The complete APSC
                course carries twenty Prelims and twenty Mains mocks, and every
                class, discussions included, is recorded on the ICT app.
              </p>
              <a
                href={warrior.href}
                rel="noreferrer noopener"
                target="_blank"
                className={`group block rounded-lg transition-transform duration-200 ${ease} active:scale-[0.98]`}
              >
                <VideoFrame
                  src={warrior.image}
                  alt=""
                  sizes="(min-width: 1024px) 36vw, 100vw"
                  disc={56}
                />
                <span className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-base font-medium">{warrior.title}</span>
                  <span className={`${monoClass} text-sm text-[var(--muted)]`}>
                    {compact(warrior.views)} views
                  </span>
                </span>
                <span className="block text-sm text-[var(--muted)]">
                  {warrior.by}
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* 7. FAQ as the question paper, on ruled paper, two columns on desktop. */}
        <section
          aria-labelledby="faq-h"
          data-ruled=""
          className="border-y border-[var(--line)]"
        >
          <div className={`${container} py-16 md:py-24`}>
            <h2 id="faq-h" className={`${h2Class} max-w-[22ch] scroll-mt-24`}>
              <span id="faq">Questions candidates ask.</span>
            </h2>
            <dl className="mt-10 grid gap-x-12 md:grid-cols-2">
              {faqs.map((f, i) => (
                <div
                  key={f.q}
                  className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3 border-t border-[var(--line)] py-6"
                >
                  <dt className="col-span-2 grid grid-cols-subgrid">
                    <span className="flex items-baseline gap-2 pt-1">
                      <FilledBubble size={8} />
                      <span className={`${monoClass} text-sm`}>Q{i + 1}.</span>
                    </span>
                    <span className="text-lg leading-snug font-medium">
                      {f.q}
                    </span>
                  </dt>
                  <dd className="col-start-2 mt-2 max-w-[60ch] text-base leading-relaxed text-[var(--muted)]">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 8. Enquire as the candidate details box. */}
        <section
          aria-labelledby="enquire-h"
          className={`${container} py-16 md:py-24`}
        >
          <div className="rounded-2xl border border-[var(--ink)] p-6 md:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <h2 id="enquire-h" className={`${h2Class} max-w-[16ch]`}>
                  Candidate details.
                </h2>
                <p className="mt-4 max-w-[36ch] text-base text-[var(--muted)]">
                  {offer.promise}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <a
                    href={whatsapp}
                    rel="noreferrer noopener"
                    target="_blank"
                    className={btnPrimary}
                  >
                    {offer.cta}
                  </a>
                  <a href={tel} className={btnSecondary}>
                    Call <span className={`${monoClass} ml-1.5`}>{phone}</span>
                  </a>
                </div>
              </div>
              <ol className="border-t border-[var(--line)] lg:col-span-7 lg:border-t-0 lg:border-l lg:pl-10">
                {joining.map((step, i) => (
                  <li
                    key={step.verb}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-b border-[var(--line)] py-5 lg:first:pt-0"
                  >
                    <span
                      className={`${monoClass} pt-1 text-sm text-[var(--muted)]`}
                    >
                      {i + 1}.
                    </span>
                    <div>
                      <p className="text-lg font-medium">{step.verb}</p>
                      <p className="mt-1 max-w-[52ch] text-base leading-relaxed text-[var(--muted)]">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)]">
        <div
          className={`${container} grid gap-10 py-12 text-sm text-[var(--muted)] md:grid-cols-3 md:py-16`}
        >
          <div className="flex flex-col gap-3">
            <Image
              src="/brand/ict-logo-tight.png"
              alt="Impact Career Tutorials"
              width={60}
              height={32}
              className="h-8 w-auto"
            />
            <address className="leading-relaxed not-italic">
              {place.street}
              <br />
              {place.city}, {place.region} {place.pin}
            </address>
            <a
              href={place.maps}
              rel="noreferrer noopener"
              target="_blank"
              className={`${textLink} self-start text-[var(--ink)]`}
            >
              Open in Google Maps
            </a>
          </div>
          <ul className="flex flex-col gap-1">
            {contact.phones.map((p) => (
              <li key={p}>
                <a
                  href={`tel:${p}`}
                  className={`${textLink} ${monoClass} text-[var(--ink)]`}
                >
                  {`+91 ${p.slice(-10, -5)} ${p.slice(-5)}`}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${contact.email}`}
                className={`${textLink} break-all text-[var(--ink)]`}
              >
                {contact.email}
              </a>
            </li>
          </ul>
          <ul className="flex flex-col gap-1">
            {[
              ["YouTube", links.youtube],
              ["Instagram", links.instagram],
              ["Facebook", links.facebook],
              ["ICT app on Google Play", links.play],
            ].map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  rel="noreferrer noopener"
                  target="_blank"
                  className={`${textLink} text-[var(--ink)]`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className={`${container} pb-24 text-sm text-[var(--muted)]`}>
          Prototype for review. Not the live site.
        </p>
      </footer>

      <PrototypeSwitcher current="answer-sheet" />
    </div>
  )
}
