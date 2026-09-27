import type { Metadata } from "next"
import { Archivo } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconBrandYoutube,
  IconCheck,
  IconPhone,
  IconPlayerPlay,
} from "@tabler/icons-react"

import {
  campus,
  contact,
  courses,
  faculty,
  faqs,
  included,
  joining,
  links,
  nextBatch,
  offer,
  officers,
  phone,
  place,
  proof,
  rupees,
  selections,
  tel,
  timetable,
  whatsapp,
} from "../_data"
import { PrototypeSwitcher } from "../_switcher"

/**
 * Prototype 1, "Timetable": the departures board.
 *
 * Colour strategy: restrained. Warm off-white ground, one ink for type, one
 * dark object on the page (the board, framed at radius 16, never full bleed),
 * and amber used only on the board (the live row's flap and dot) and on
 * ::selection. Secondary text on the board is the board text at reduced alpha,
 * never grey. Rules are ink at 10 percent; no boxes, no cards.
 */

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--tt-sans",
})

export const metadata: Metadata = { title: "Timetable" }

const tokens = {
  "--ground": "#F4F3EE",
  "--ink": "#101828",
  "--ink-2": "#1D2939",
  "--board": "#101828",
  "--board-text": "#F4F3EE",
  "--board-dim": "rgba(244, 243, 238, 0.62)",
  "--board-rule": "rgba(244, 243, 238, 0.14)",
  "--tile": "#071733",
  "--amber": "#E9A23B",
  "--muted": "#5C6270",
  "--rule": "rgba(16, 24, 40, 0.10)",
  "--rule-2": "rgba(16, 24, 40, 0.22)",
} as CSSProperties

/* Scoped CSS: the one authored hero moment, the live pulse, and themed browser
 * surfaces. Everything settles with `both` fill so it reads without motion. */
const css = `
[data-tt] ::selection { background: var(--amber); color: var(--ink); }
[data-tt] a, [data-tt] button { text-underline-offset: 0.2em; }
[data-tt] :where(a, button):focus-visible { outline: 2px solid var(--amber); outline-offset: 3px; }
@keyframes tt-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes tt-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
[data-rise] { animation: tt-rise 640ms cubic-bezier(0.23, 1, 0.32, 1) both; animation-delay: var(--d, 0ms); }
[data-row] { animation: tt-rise 520ms cubic-bezier(0.23, 1, 0.32, 1) both; animation-delay: calc(360ms + var(--i, 0) * 60ms); }
[data-live] { animation: tt-pulse 2s ease-in-out infinite; }
`

const ease = "ease-[cubic-bezier(0.23,1,0.32,1)]"
const press = `${ease} transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98]`
const primary = `${press} inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-6 font-medium text-[var(--ground)] hover:bg-[var(--ink-2)]`
const secondary = `${press} inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--rule-2)] px-6 font-medium text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[rgba(16,24,40,0.05)]`
const display = "[font-stretch:112%] font-semibold tracking-[-0.02em]"
const boardNum = "[font-stretch:90%] font-medium tabular-nums"
const textLink = `${ease} underline decoration-[var(--rule-2)] transition-[color,text-decoration-color] duration-200 hover:decoration-[var(--ink)]`

/** "8 to 10 AM" -> 480, "12 to 2 PM" -> 720, so the board reads top to bottom
 * like a day. */
function startMinutes(when: string) {
  const match = /^(\d+)(?::(\d+))?/.exec(when)
  let hour = Number(match?.[1] ?? 0)
  const minute = Number(match?.[2] ?? 0)
  if (when.endsWith("PM") && hour !== 12) hour += 12
  return hour * 60 + minute
}

const board = [...timetable].sort(
  (a, b) => startMinutes(a.when) - startMinutes(b.when)
)

/** The row that departed most recently. `nextBatch` names it in lib/brand. */
const liveId = timetable.find((row) => row.name === nextBatch.name)?.id

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")

const external = { target: "_blank", rel: "noreferrer noopener" } as const

const social = [
  { label: "YouTube", href: links.youtube, Icon: IconBrandYoutube },
  { label: "Instagram", href: links.instagram, Icon: IconBrandInstagram },
  { label: "Facebook", href: links.facebook, Icon: IconBrandFacebook },
]

/** "+918638061175" -> "+91 86380 61175" for the second phone in the footer. */
const spaced = (p: string) => p.replace(/^(\+91)(\d{5})(\d{5})$/, "$1 $2 $3")

export default function TimetablePrototype() {
  return (
    <div
      style={tokens}
      data-tt=""
      className={`${archivo.variable} min-h-dvh bg-[var(--ground)] font-[family-name:var(--tt-sans)] text-[var(--ink)] antialiased`}
    >
      <style>{css}</style>

      <header className="border-b border-[var(--rule)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <Link
            href="/prototypes/timetable"
            className="flex h-11 items-center gap-3"
            aria-label="Impact Career Tutorials, timetable prototype"
          >
            <Image
              src="/brand/ict-logo-tight.png"
              alt=""
              width={60}
              height={32}
              priority
            />
            <span className={`hidden text-sm sm:inline ${display}`}>
              Impact Career Tutorials
            </span>
          </Link>
          <nav
            aria-label="Sections"
            className="hidden items-center gap-6 text-sm md:flex"
          >
            {[
              ["#board", "Timings"],
              ["#teachers", "Teachers"],
              ["#courses", "Courses"],
              ["#questions", "Questions"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={`${ease} flex h-11 items-center text-[var(--muted)] transition-colors duration-200 hover:text-[var(--ink)]`}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={tel}
              className={`${ease} hidden h-11 items-center px-3 text-sm tabular-nums transition-colors duration-200 hover:text-[var(--muted)] lg:flex`}
            >
              Call {phone}
            </a>
            <a
              href={whatsapp}
              {...external}
              className={`${primary} h-11 px-5 text-sm`}
            >
              {offer.cta}
            </a>
          </div>
        </div>
      </header>

      <main id="main">
        {/* 1. Hero: copy 5/12, board 7/12 */}
        <section
          aria-labelledby="hero-heading"
          className="mx-auto grid max-w-7xl gap-10 px-5 pt-10 pb-16 md:px-8 lg:grid-cols-12 lg:items-start lg:gap-10 lg:pt-16"
        >
          <div className="lg:col-span-5 lg:pt-6">
            <h1
              id="hero-heading"
              data-rise=""
              className={`${display} text-[2.75rem] leading-[0.98] text-balance sm:text-6xl lg:text-[3.5rem]`}
            >
              Pick the hour you can study.
            </h1>
            <p
              data-rise=""
              className="mt-6 max-w-[38ch] text-lg leading-snug text-[var(--muted)] md:text-xl"
              style={{ "--d": "90ms" } as CSSProperties}
            >
              Morning, day or evening batches on {place.spoken}, and the same
              class on the ICT app if you cannot come.
            </p>
            <div
              data-rise=""
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ "--d": "180ms" } as CSSProperties}
            >
              <a href={whatsapp} {...external} className={primary}>
                <IconBrandWhatsapp size={20} stroke={1.75} aria-hidden />
                {offer.cta}
              </a>
              <a href={tel} className={`${secondary} tabular-nums`}>
                <IconPhone size={20} stroke={1.75} aria-hidden />
                Call {phone}
              </a>
            </div>
            <p
              data-rise=""
              className="mt-5 text-sm text-[var(--muted)]"
              style={{ "--d": "260ms" } as CSSProperties}
            >
              {offer.promise}
            </p>
          </div>

          <div
            id="board"
            data-rise=""
            className="scroll-mt-20 lg:col-span-7"
            style={{ "--d": "240ms" } as CSSProperties}
          >
            <div className="rounded-2xl bg-[var(--board)] px-4 py-5 text-[var(--board-text)] sm:px-6">
              <div className="flex items-baseline justify-between gap-4 text-sm text-[var(--board-dim)]">
                <p>Batches with a printed hour, {place.spoken}</p>
                <p className="hidden sm:block">Fee, one time</p>
              </div>
              <div
                aria-hidden
                className="mt-4 hidden grid-cols-[6.5rem_minmax(0,1.1fr)_minmax(0,1fr)_5.5rem] gap-x-5 border-b border-[var(--board-rule)] pb-2 text-xs text-[var(--board-dim)] md:grid"
              >
                <span>Time</span>
                <span>Batch</span>
                <span>Days</span>
                <span className="text-right">Fee</span>
              </div>
              <ol className="divide-y divide-[var(--board-rule)]">
                {board.map((row, i) => {
                  const live = row.id === liveId
                  return (
                    <li
                      key={row.id}
                      data-row=""
                      className="relative"
                      style={{ "--i": i } as CSSProperties}
                    >
                      {live && (
                        <span
                          aria-hidden
                          className="absolute top-3 bottom-3 -left-4 w-1 rounded-r bg-[var(--amber)] sm:-left-6"
                        />
                      )}
                      <Link
                        href={row.href}
                        className={`${ease} -mx-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-lg px-2 py-4 transition-[background-color,transform] duration-200 hover:bg-[rgba(244,243,238,0.06)] active:scale-[0.98] md:mx-0 md:grid-cols-[6.5rem_minmax(0,1.1fr)_minmax(0,1fr)_5.5rem] md:items-baseline md:gap-x-5 md:px-0 md:hover:bg-transparent`}
                      >
                        <span
                          className={`${boardNum} text-2xl leading-none md:order-1`}
                        >
                          {row.when}
                        </span>
                        <span
                          className={`${boardNum} justify-self-end text-base leading-none md:order-4 md:text-right`}
                        >
                          {row.price > 0 ? rupees(row.price) : "Free"}
                        </span>
                        <span className="col-span-2 md:order-2 md:col-span-1">
                          <span className="font-medium">{row.name}</span>
                          <span className="text-[var(--board-dim)]">
                            {" "}
                            · {row.exam}
                          </span>
                        </span>
                        <span className="col-span-2 text-sm leading-snug md:order-3 md:col-span-1">
                          {row.days && (
                            <span className="block text-[var(--board-dim)]">
                              {row.days}
                            </span>
                          )}
                          {row.note &&
                            (live ? (
                              <span className="flex items-center gap-2 text-[var(--amber)]">
                                <span
                                  aria-hidden
                                  data-live=""
                                  className="size-2 shrink-0 rounded-full bg-[var(--amber)]"
                                />
                                {row.note}
                              </span>
                            ) : (
                              <span className="block text-[var(--board-dim)]">
                                {row.note}
                              </span>
                            ))}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Timings as printed on ICT&rsquo;s own batch posters. Each row
              opens the course.
            </p>
          </div>
        </section>

        {/* 2. Proof: one hairline-ruled row of four figures */}
        <section
          aria-label="Figures you can check"
          className="mx-auto max-w-7xl px-5 md:px-8"
        >
          <ul className="grid grid-cols-2 border-y border-[var(--rule)] md:grid-cols-4 md:divide-x md:divide-[var(--rule)]">
            {proof.map((p, i) => (
              <li
                key={p.label}
                className={`${i % 2 === 1 ? "border-l border-[var(--rule)] md:border-l-0" : ""} ${i > 1 ? "border-t border-[var(--rule)] md:border-t-0" : ""}`}
              >
                <a
                  href={p.href}
                  {...external}
                  className={`${ease} group block h-full px-4 py-7 transition-[background-color,transform] duration-200 hover:bg-[rgba(16,24,40,0.03)] active:scale-[0.98] md:px-6 md:py-9`}
                >
                  <span
                    className={`${display} block text-4xl tabular-nums md:text-5xl`}
                  >
                    {p.display}
                  </span>
                  <span className="mt-2 block max-w-[22ch] text-sm leading-snug text-[var(--muted)] group-hover:text-[var(--ink)]">
                    {p.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Faculty: filmstrip of portraits on dark tiles */}
        <section
          id="teachers"
          aria-labelledby="teachers-heading"
          className="mx-auto max-w-7xl scroll-mt-20 px-5 pt-20 pb-6 md:px-8 md:pt-28"
        >
          <h2
            id="teachers-heading"
            className={`${display} max-w-[22ch] text-3xl text-balance md:text-5xl`}
          >
            The teachers on the board, and where to watch them.
          </h2>
          <ul className="mt-10 -mr-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pr-5 pb-2 md:-mr-8 md:pr-8 lg:mr-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pr-0">
            {faculty.map((person) => (
              <li
                key={person.slug}
                className="w-[200px] shrink-0 snap-start sm:w-[220px] lg:w-auto"
              >
                <a
                  href={`https://www.youtube.com/watch?v=${person.lecture}`}
                  {...external}
                  className={`${ease} group block transition-transform duration-200 active:scale-[0.98]`}
                >
                  <span className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--tile)]">
                    <Image
                      src={person.portrait}
                      alt={`${person.name}, ${person.teaches}`}
                      fill
                      sizes="(min-width: 1024px) 20vw, 220px"
                      className={`${ease} object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]`}
                    />
                  </span>
                  <span className="mt-3 block font-medium">{person.name}</span>
                  <span className="block text-sm text-[var(--muted)]">
                    {person.teaches}
                  </span>
                  <span className="mt-2 flex items-center gap-1.5 text-sm underline decoration-[var(--rule-2)] group-hover:decoration-[var(--ink)]">
                    <IconPlayerPlay size={14} stroke={1.75} aria-hidden />
                    Watch a class
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Results: ledger rows, then the officers list */}
        <section
          aria-labelledby="results-heading"
          className="mx-auto max-w-7xl px-5 pt-20 md:px-8 md:pt-28"
        >
          <h2
            id="results-heading"
            className={`${display} max-w-[22ch] text-3xl text-balance md:text-5xl`}
          >
            Two officers on the APSC list who prepared here.
          </h2>
          <ol className="mt-10 border-t border-[var(--rule)]">
            {selections.map((s) => (
              <li
                key={s.serial}
                className="grid gap-x-8 gap-y-3 border-b border-[var(--rule)] py-8 md:grid-cols-12 md:items-start"
              >
                <p
                  className={`${boardNum} text-5xl leading-none md:col-span-2 md:text-6xl`}
                >
                  <span className="text-[var(--muted)]">No.</span> {s.serial}
                </p>
                <div className="md:col-span-3">
                  <p className="text-lg font-medium">{s.name}</p>
                  <p className="text-[var(--muted)]">{s.post}</p>
                </div>
                <blockquote className="max-w-[62ch] text-lg leading-snug md:col-span-7 md:text-xl">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-[var(--muted)]">
            APSC CCE 2022, result dated 17 January 2024,{" "}
            <a href={links.apscResultPdf} {...external} className={textLink}>
              checked against the official list
            </a>
            .
          </p>

          <div className="mt-16 grid gap-8 lg:grid-cols-12">
            <h3
              className={`${display} text-2xl text-balance lg:col-span-4 lg:text-3xl`}
            >
              Serving officers who came to speak to the batch.
            </h3>
            <ol className="border-t border-[var(--rule)] lg:col-span-8">
              {officers.map((o) => (
                <li key={o.id} className="border-b border-[var(--rule)]">
                  <a
                    href={o.href}
                    {...external}
                    className={`${ease} group -mx-2 flex items-center gap-4 rounded-lg px-2 py-3 transition-colors duration-200 hover:bg-[rgba(16,24,40,0.03)] active:scale-[0.98]`}
                  >
                    <span className="relative block w-24 shrink-0 overflow-hidden rounded-md bg-[var(--tile)]">
                      <Image
                        src={o.image}
                        alt=""
                        width={96}
                        height={54}
                        className="aspect-video object-cover"
                      />
                      <span className="absolute inset-0 grid place-items-center">
                        <span className="grid size-6 place-items-center rounded-full bg-[var(--ground)] text-[var(--ink)]">
                          <IconPlayerPlay
                            size={12}
                            stroke={1.75}
                            aria-hidden
                            className="translate-x-px"
                          />
                        </span>
                      </span>
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">
                      <span className="block font-medium">{o.name}</span>
                      <span className="block text-sm text-[var(--muted)]">
                        {o.role} · {o.detail}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 5. Courses: three poster columns, then the checklist */}
        <section
          id="courses"
          aria-labelledby="courses-heading"
          className="mx-auto max-w-7xl scroll-mt-20 px-5 pt-20 md:px-8 md:pt-28"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2
              id="courses-heading"
              className={`${display} max-w-[22ch] text-3xl text-balance md:text-5xl`}
            >
              Three tracks, one fee each.
            </h2>
            <p className="max-w-[40ch] text-[var(--muted)]">
              One fee per course, including tests, notes and the app.
            </p>
          </div>
          <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {courses.map((course) => (
              <li key={course.slug}>
                <Link
                  href={course.href}
                  className={`${ease} group block transition-transform duration-200 active:scale-[0.98]`}
                >
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--tile)]">
                    {course.cover && (
                      <Image
                        src={course.cover}
                        alt={`${course.name} course poster`}
                        fill
                        sizes="(min-width: 768px) 30vw, 100vw"
                        className={`${ease} object-cover transition-transform duration-300 group-hover:scale-[1.02]`}
                      />
                    )}
                  </span>
                  <span className="mt-5 flex items-baseline justify-between gap-4">
                    <span className={`${display} text-2xl`}>{course.name}</span>
                    <span className="text-sm text-[var(--muted)]">
                      {course.exam}
                    </span>
                  </span>
                  <span className="mt-2 block leading-snug text-[var(--muted)]">
                    {course.covers}
                  </span>
                </Link>
                <dl className="mt-4 divide-y divide-[var(--rule)] border-y border-[var(--rule)] text-sm">
                  <div className="flex justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted)]">Duration</dt>
                    <dd>{course.duration}</dd>
                  </div>
                  {course.when && (
                    <div className="flex justify-between gap-4 py-2.5">
                      <dt className="text-[var(--muted)]">Time</dt>
                      <dd className="tabular-nums">
                        {course.when}
                        {course.days ? `, ${course.days}` : ""}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted)]">Fee</dt>
                    <dd className="tabular-nums">
                      {course.price !== null && (
                        <span className="text-lg font-medium">
                          {rupees(course.price)}
                        </span>
                      )}
                      {course.mrp !== null &&
                        course.price !== null &&
                        course.mrp > course.price && (
                          <s className="ml-2 text-[var(--muted)]">
                            {rupees(course.mrp)}
                          </s>
                        )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted)]">Taught by</dt>
                    <dd className="flex items-center gap-1.5">
                      <span className="sr-only">
                        {course.faculty.map((f) => f.name).join(", ")}
                      </span>
                      {course.faculty.map((f) => (
                        <span
                          key={f.slug}
                          aria-hidden
                          className="grid size-8 place-items-center rounded-full border border-[var(--rule-2)] text-xs font-medium"
                        >
                          {initials(f.name)}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
                <Link
                  href={course.href}
                  className={`${textLink} mt-4 inline-flex h-11 items-center text-sm`}
                >
                  See {course.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-16 grid gap-8 lg:grid-cols-12">
            <h3
              className={`${display} text-2xl text-balance lg:col-span-4 lg:text-3xl`}
            >
              What a batch includes.
            </h3>
            <div className="lg:col-span-8">
              <ul className="grid border-t border-[var(--rule)] sm:grid-cols-2 sm:gap-x-8">
                {included.map((item) => (
                  <li
                    key={item.text}
                    className="flex items-start gap-3 border-b border-[var(--rule)] py-3 leading-snug"
                  >
                    <IconCheck
                      size={18}
                      stroke={1.75}
                      aria-hidden
                      className="mt-0.5 shrink-0 text-[var(--muted)]"
                    />
                    {item.text}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-[var(--muted)]">
                Scholarships through ICT&rsquo;s ASSIST test.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Campus: snap strip of tall frames */}
        <section aria-labelledby="campus-heading" className="pt-20 md:pt-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <h2
              id="campus-heading"
              className={`${display} max-w-[22ch] text-3xl text-balance md:text-5xl`}
            >
              The room on {place.spoken}.
            </h2>
            <p className="mt-3 max-w-[48ch] text-[var(--muted)]">
              Stills from ICT&rsquo;s own videos of the centre.
            </p>
          </div>
          <ul className="mt-10 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-5 pb-2 md:px-8 xl:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
            {campus.map((photo) => (
              <li
                key={photo.src}
                className="w-[200px] shrink-0 snap-start sm:w-[240px]"
              >
                <figure>
                  <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-[var(--tile)]">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-3 text-sm leading-snug text-[var(--muted)]">
                    {photo.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>

        {/* 7. FAQ: two-column definition list */}
        <section
          id="questions"
          aria-labelledby="questions-heading"
          className="mx-auto max-w-7xl scroll-mt-20 px-5 pt-20 md:px-8 md:pt-28"
        >
          <h2
            id="questions-heading"
            className={`${display} max-w-[22ch] text-3xl text-balance md:text-5xl`}
          >
            Questions people ask before they join.
          </h2>
          <dl className="mt-10 border-t border-[var(--rule)]">
            {faqs.map((f) => (
              <div
                key={f.q}
                className="grid gap-2 border-b border-[var(--rule)] py-6 md:grid-cols-12 md:gap-8"
              >
                <dt className="text-lg font-medium text-balance md:col-span-4">
                  {f.q}
                </dt>
                <dd className="max-w-[64ch] leading-relaxed text-[var(--muted)] md:col-span-8">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 8. Enquire: the board motif, light */}
        <section
          aria-labelledby="enquire-heading"
          className="mx-auto max-w-7xl px-5 pt-20 pb-20 md:px-8 md:pt-28"
        >
          <div className="rounded-2xl border border-[var(--rule-2)] px-5 py-8 sm:px-8 md:px-10 md:py-10">
            <h2
              id="enquire-heading"
              className={`${display} max-w-[20ch] text-3xl text-balance md:text-5xl`}
            >
              Three steps, none of them a payment.
            </h2>
            <ol className="mt-8 border-t border-[var(--rule)]">
              {joining.map((step) => (
                <li
                  key={step.verb}
                  className="grid gap-x-8 gap-y-1 border-b border-[var(--rule)] py-5 md:grid-cols-12 md:items-baseline"
                >
                  <p
                    className={`${boardNum} text-2xl leading-tight md:col-span-4 md:text-3xl`}
                  >
                    {step.verb}
                  </p>
                  <p className="max-w-[56ch] leading-snug text-[var(--muted)] md:col-span-8">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={whatsapp} {...external} className={primary}>
                <IconBrandWhatsapp size={20} stroke={1.75} aria-hidden />
                {offer.cta}
              </a>
              <a href={tel} className={`${secondary} tabular-nums`}>
                <IconPhone size={20} stroke={1.75} aria-hidden />
                Call {phone}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--rule)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 text-sm md:grid-cols-12 md:px-8">
          <div className="md:col-span-4">
            <Image
              src="/brand/ict-logo-tight.png"
              alt="Impact Career Tutorials"
              width={60}
              height={32}
            />
            <address className="mt-4 leading-relaxed not-italic">
              <a href={place.maps} {...external} className={textLink}>
                {place.street}, {place.city}, {place.region} {place.pin}
              </a>
            </address>
          </div>
          <ul className="space-y-1 leading-relaxed tabular-nums md:col-span-4">
            {contact.phones.map((p) => (
              <li key={p}>
                <a href={`tel:${p}`} className={textLink}>
                  {spaced(p)}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${contact.email}`} className={textLink}>
                {contact.email}
              </a>
            </li>
          </ul>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 md:col-span-4 md:justify-end">
            {social.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  {...external}
                  className={`${textLink} inline-flex h-11 items-center gap-1.5`}
                >
                  <Icon size={16} stroke={1.75} aria-hidden />
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={links.play}
                {...external}
                className={`${textLink} inline-flex h-11 items-center`}
              >
                ICT app on Google Play
              </a>
            </li>
          </ul>
        </div>
        <p className="mx-auto max-w-7xl px-5 pb-24 text-sm text-[var(--muted)] md:px-8">
          Prototype for review. Not the live site.
        </p>
      </footer>

      <PrototypeSwitcher current="timetable" />
    </div>
  )
}
