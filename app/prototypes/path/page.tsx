import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconBrandYoutube,
  IconPhone,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { Schibsted_Grotesk } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { bookCss, type BookTones } from "../_book"
import { folderCss, type FolderTones } from "../_folder"
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
  officers,
  phone,
  place,
  proof,
  rupees,
  selections,
  shelf,
  tel,
  timetable,
  whatsapp,
  workshops,
} from "../_data"
import { CountUp, PlayInPlace, StickyStack } from "../_fx"
import { Reveal } from "../_reveal"
import { PrototypeSwitcher } from "../_switcher"
import { PathStory, ShelfByExam, TeacherRows } from "./_client"

/**
 * Prototype 7: Path. A year at ICT, told in the order it happens.
 * Colour: committed light. Sage-grey ground, forest ink and one forest
 * surface, lime as the single signal (only ever with forest ink on it).
 */

const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--pt-sans",
})

export const metadata: Metadata = { title: "Path" }

const tokens = {
  "--pt-bg": "#E9EDE6",
  "--pt-paper": "#F6F8F3",
  "--pt-ink": "#10261C",
  "--pt-muted": "#4A5B51",
  "--pt-line": "rgba(16,38,28,0.13)",
  "--pt-forest": "#123D2C",
  "--pt-forest-hi": "#18513B",
  "--pt-lime": "#CDEB6B",
  "--pt-on-forest": "#B9CCBF",
  "--pt-ease": "cubic-bezier(0.23, 1, 0.32, 1)",
  "--bk-shadow": "rgba(16,38,28,0.35)",
} as CSSProperties

const bookTones: BookTones = {
  primary: { bg: "#123D2C", ink: "#E9EDE6", spine: "#0B2A1E" },
  highlight: { bg: "#CDEB6B", ink: "#10261C", spine: "#A8C74C" },
  muted: { bg: "#F6F8F3", ink: "#10261C", spine: "#D3DAD0" },
}

const folderTones: FolderTones = {
  back: "#0B2A1E",
  front: "#123D2C",
  paper: "#F6F8F3",
  ink: "#E9EDE6",
  muted: "#B9CCBF",
}

const css = `
[data-pt] { interpolate-size: allow-keywords; }
[data-pt] ::selection { background: var(--pt-lime); color: var(--pt-ink); }
[data-pt] :focus-visible { outline: 2px solid var(--pt-forest); outline-offset: 3px; }
[data-pt] h1, [data-pt] h2 { text-wrap: balance; }
[data-pt] p { text-wrap: pretty; }
[data-pt] [data-press] { transition: transform 0.16s var(--pt-ease), background-color 0.2s ease; }
[data-pt] [data-press]:active { transform: scale(0.97); }
@media (hover: hover) {
  [data-pt] [data-primary]:hover { background-color: var(--pt-forest-hi); }
  [data-pt] [data-quiet]:hover { color: var(--pt-ink); }
}
@keyframes pt-rise { from { opacity: 0; transform: translateY(16px); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes pt-card { from { opacity: 0; transform: translate(-12px, 24px) rotate(-4deg); } }
[data-pt] [data-rise] { animation: pt-rise 0.9s var(--pt-ease) both; }
[data-pt] [data-float-card] { animation: pt-card 1s var(--pt-ease) 0.45s both; }

[data-pt] details::details-content { block-size: 0; overflow: hidden; transition: block-size 0.3s var(--pt-ease), content-visibility 0.3s allow-discrete; }
[data-pt] details[open]::details-content { block-size: auto; }
[data-pt] summary::-webkit-details-marker { display: none; }
[data-pt] details [data-plus] { transition: transform 0.25s var(--pt-ease); }
[data-pt] details[open] [data-plus] { transform: rotate(45deg); }
[data-pt] [data-thumb] img { transition: transform 0.5s var(--pt-ease); }
[data-pt] [data-thumb]:hover img { transform: scale(1.04); }
`

const external = { target: "_blank", rel: "noreferrer noopener" } as const
const container = "mx-auto w-full max-w-[1240px] px-5 md:px-8"
const h2 =
  "text-[clamp(2.1rem,4.4vw,3.6rem)] leading-[1.0] font-semibold tracking-[-0.04em]"
const frame = "overflow-hidden rounded-[28px] bg-[var(--pt-paper)]"

function PrimaryCta({ onForest = false }: { onForest?: boolean }) {
  return (
    <a
      data-press
      data-primary={onForest ? undefined : true}
      href={whatsapp}
      {...external}
      className={`group inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold ${
        onForest
          ? "bg-[var(--pt-lime)] text-[var(--pt-ink)] hover:bg-[#D9F285]"
          : "bg-[var(--pt-forest)] text-[var(--pt-paper)]"
      }`}
    >
      {offer.cta}
      <IconArrowRight
        aria-hidden
        size={18}
        stroke={2}
        className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
      />
    </a>
  )
}

export default async function Path() {
  const { books, resources, folders, samples } = await shelf()
  const exams = courses.map((c) => c.exam)
  const warrior = classes.find((c) => c.id === "PcIFQy3R_HA")!
  const recorded = classes[1]!

  const steps = [
    {
      verb: joining[0].verb,
      body: joining[0].body,
      visual: (
        <div
          key="step-1"
          className="rounded-[28px] bg-[var(--pt-forest)] p-8 text-[var(--pt-paper)] md:p-12"
        >
          <p className="text-[var(--pt-on-forest)]">WhatsApp or call</p>
          <p className="mt-2 text-[clamp(2rem,4.4vw,3.6rem)] leading-none font-semibold tracking-[-0.03em] text-[var(--pt-lime)] tabular-nums">
            {phone}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              data-press
              href={whatsapp}
              {...external}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--pt-lime)] px-5 font-semibold text-[var(--pt-ink)]"
            >
              <IconBrandWhatsapp aria-hidden size={20} stroke={1.75} />
              Message on WhatsApp
            </a>
            <a
              data-press
              href={tel}
              className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-medium shadow-[inset_0_0_0_1px_rgba(246,248,243,0.3)] hover:bg-white/5"
            >
              <IconPhone aria-hidden size={18} stroke={1.75} />
              Call
            </a>
          </div>
        </div>
      ),
    },
    {
      verb: joining[1].verb,
      body: joining[1].body,
      visual: (
        <div key="step-2" className="grid grid-cols-2 gap-3">
          <div className={`${frame} relative aspect-[4/5]`}>
            <Image
              src={campus[3].src}
              alt={campus[3].alt}
              fill
              sizes="(min-width: 1024px) 340px, 50vw"
              className="object-cover"
            />
          </div>
          <div className={`${frame} relative mt-12 aspect-[4/5]`}>
            <Image
              src={campus[4].src}
              alt={campus[4].alt}
              fill
              sizes="(min-width: 1024px) 340px, 50vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      ),
    },
    {
      verb: joining[2].verb,
      body: joining[2].body,
      visual: (
        <div key="step-3" className={`${frame} p-3`}>
          <ul>
            {timetable.map((t) => (
              <li key={t.id}>
                <Link
                  href={t.href}
                  className="group grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 rounded-[20px] px-4 py-4 transition-colors duration-200 hover:bg-[var(--pt-bg)] md:grid-cols-[7.5rem_1fr_auto] md:gap-4 md:px-5 md:py-5"
                >
                  <span className="font-semibold tabular-nums md:text-lg">
                    {t.when}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">{t.name}</span>
                    <span className="block truncate text-sm text-[var(--pt-muted)]">
                      {t.exam}
                      {t.days ? `, ${t.days}` : ""}
                    </span>
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {t.price ? rupees(t.price) : "Free"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      verb: "Class, then the recording",
      body: "Every class is on the ICT app the same day, with notes and tests, so a missed day is not a lost one.",
      visual: (
        <div key="step-4" className={`${frame} p-2`}>
          <PlayInPlace
            id={recorded.id}
            title={recorded.title}
            className="group relative block aspect-video w-full overflow-hidden rounded-[20px] bg-[var(--pt-ink)]"
          >
            <Image
              src={recorded.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 680px, 100vw"
              className="object-cover"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-16 place-items-center rounded-full bg-[var(--pt-lime)] text-[var(--pt-ink)] transition-transform duration-200 ease-out group-hover:scale-105">
                <IconPlayerPlayFilled
                  aria-hidden
                  size={22}
                  className="translate-x-px"
                />
              </span>
            </span>
          </PlayInPlace>
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            <Image
              src="/brand/ict-app-icon.png"
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-xl"
            />
            <p className="text-sm">
              <span className="font-medium">{recorded.title}</span>
              <span className="block text-[var(--pt-muted)] tabular-nums">
                {recorded.by}, {compact(recorded.views)} views
              </span>
            </p>
          </div>
        </div>
      ),
    },
    {
      verb: "Mock tests, then the discussion",
      body: "Twenty Prelims and twenty Mains mocks in the APSC course. Raheef Aowal takes the Warrior mock discussions.",
      visual: (
        <div key="step-5" className="grid grid-cols-[1.1fr_1fr] gap-3">
          <div className={`${frame} relative aspect-[3/4]`}>
            <Image
              src={campus[1].src}
              alt={campus[1].alt}
              fill
              sizes="(min-width: 1024px) 360px, 55vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
          <a
            href={warrior.href}
            {...external}
            data-thumb
            className={`${frame} flex flex-col justify-between self-end p-3`}
          >
            <span className="relative block aspect-video overflow-hidden rounded-[18px]">
              <Image
                src={warrior.image}
                alt=""
                fill
                sizes="300px"
                className="object-cover"
              />
            </span>
            <span className="px-2 pt-4 pb-2">
              <span className="block font-medium">{warrior.title}</span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm text-[var(--pt-muted)]">
                Watch on YouTube
                <IconArrowUpRight aria-hidden size={15} stroke={1.75} />
              </span>
            </span>
          </a>
        </div>
      ),
    },
    {
      verb: "Mains, and the interview",
      body: "The APSC course covers Prelims, Mains and the Interview, with mentorship until selection. ARJUNA is ICT's mains mock series.",
      visual: (
        <div key="step-6" className={`${frame} relative aspect-[4/3]`}>
          <Image
            src="/courses/arjuna-mains-mock-test-series-2026.png"
            alt="ARJUNA mains mock test series poster"
            fill
            sizes="(min-width: 1024px) 680px, 100vw"
            className="object-cover"
          />
        </div>
      ),
    },
  ]

  return (
    <div
      data-pt
      style={tokens}
      className={`${sans.variable} min-h-[100dvh] bg-[var(--pt-bg)] font-[family-name:var(--pt-sans)] text-[var(--pt-ink)] antialiased`}
    >
      <style>{css + bookCss + folderCss}</style>

      <header className="sticky top-0 z-40 bg-[rgba(233,237,230,0.82)] backdrop-blur-xl">
        <div className={`${container} flex h-[68px] items-center gap-8`}>
          <a href="#top" className="flex items-center gap-3">
            <Image
              src="/brand/ict-logo-tight.png"
              alt="Impact Career Tutorials"
              width={96}
              height={52}
              className="h-9 w-auto"
            />
          </a>
          <nav
            aria-label="Sections"
            className="hidden items-center gap-7 text-sm text-[var(--pt-muted)] md:flex"
          >
            <a data-quiet href="#path">
              How it works
            </a>
            <a data-quiet href="#books">
              Books and notes
            </a>
            <a data-quiet href="#courses">
              Courses
            </a>
            <a data-quiet href="#teachers">
              Teachers
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-5">
            <a
              data-quiet
              href={tel}
              className="hidden text-sm text-[var(--pt-muted)] tabular-nums lg:inline"
            >
              {phone}
            </a>
            <a
              data-press
              data-primary
              href={whatsapp}
              {...external}
              className="inline-flex h-10 items-center rounded-full bg-[var(--pt-forest)] px-4 text-sm font-semibold text-[var(--pt-paper)]"
            >
              {offer.cta}
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section aria-label="Introduction">
          <div
            className={`${container} grid items-center gap-12 pt-10 pb-16 md:pt-16 lg:grid-cols-12 lg:pb-24`}
          >
            <div className="lg:col-span-7">
              <h1
                data-rise
                className="text-[clamp(2.5rem,4.4vw,3.5rem)] leading-[1] font-semibold tracking-[-0.045em]"
              >
                From your first free class to the exam hall.
              </h1>
              <p
                data-rise
                style={{ animationDelay: "0.1s" }}
                className="mt-6 max-w-[48ch] text-lg text-[var(--pt-muted)]"
              >
                How a year at ICT runs for APSC, ADRE, Assam Police and banking
                aspirants in North Lakhimpur.
              </p>
              <div
                data-rise
                style={{ animationDelay: "0.2s" }}
                className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3"
              >
                <PrimaryCta />
                <a
                  href="#books"
                  className="group inline-flex h-12 items-center gap-1.5 font-semibold"
                >
                  Read free notes
                  <IconArrowRight
                    aria-hidden
                    size={18}
                    stroke={2}
                    className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  />
                </a>
              </div>
            </div>
            <div className="relative lg:col-span-5">
              <div
                data-rise
                style={{ animationDelay: "0.15s" }}
                className={`${frame} relative ml-auto aspect-[4/5] max-w-[440px] shadow-[0_40px_80px_-40px_rgba(16,38,28,0.45)]`}
              >
                <Image
                  src={campus[3].src}
                  alt={campus[3].alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 440px, 100vw"
                  className="object-cover"
                />
              </div>
              <Link
                data-float-card
                href={
                  timetable.find((t) => t.name === "VICTOR 8.0")?.href ??
                  "/courses"
                }
                className="absolute -bottom-6 left-0 w-[260px] rounded-[22px] bg-[var(--pt-forest)] p-5 text-[var(--pt-paper)] shadow-[0_24px_48px_-20px_rgba(16,38,28,0.6)] transition-transform duration-300 ease-out hover:-translate-y-1 md:left-4"
              >
                <p className="text-sm text-[var(--pt-on-forest)]">
                  Started 14 September
                </p>
                <p className="mt-1 text-xl font-semibold">VICTOR 8.0</p>
                <p className="text-sm text-[var(--pt-on-forest)]">
                  ADRE and Assam Police
                </p>
                <p className="mt-4 text-2xl font-semibold text-[var(--pt-lime)] tabular-nums">
                  8 to 10 AM
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Proof */}
        <section aria-label="In numbers" className="py-14 md:py-20">
          <div className={`${container} grid grid-cols-2 gap-4 md:grid-cols-4`}>
            {proof.map((p) => (
              <a
                key={p.label}
                href={p.href}
                {...external}
                className="group rounded-[24px] bg-[var(--pt-paper)] p-6 transition-transform duration-300 ease-out hover:-translate-y-1"
              >
                <span className="block text-[clamp(2.2rem,4vw,3.4rem)] leading-none font-semibold tracking-[-0.04em]">
                  <CountUp display={p.display} />
                </span>
                <span className="mt-3 block text-sm text-[var(--pt-muted)]">
                  {p.label}
                </span>
                <span className="mt-5 block h-1 w-8 rounded-full bg-[var(--pt-lime)] transition-[width] duration-300 ease-out group-hover:w-14" />
              </a>
            ))}
          </div>
        </section>

        {/* The path, as a scroll story. */}
        <section id="path" aria-labelledby="path-h" className="py-16 md:py-24">
          <div className={container}>
            <Reveal>
              <h2 id="path-h" className={`${h2} max-w-[16ch]`}>
                How a year at ICT runs.
              </h2>
            </Reveal>
            <div className="mt-12 lg:mt-4">
              <PathStory steps={steps} />
            </div>
          </div>
        </section>

        {/* Books and free material, by exam. */}
        <section
          id="books"
          aria-labelledby="books-h"
          className="py-16 md:py-24"
        >
          <div className={container}>
            <div className="rounded-[36px] bg-[var(--pt-paper)] p-6 md:p-12">
              <Reveal>
                <h2 id="books-h" className={`${h2} max-w-[18ch]`}>
                  Books for your exam, and notes that cost nothing.
                </h2>
                {samples && (
                  <p className="mt-4 text-sm text-[var(--pt-muted)]">
                    Sample titles for now. ICT&apos;s own books and notes
                    replace them before launch.
                  </p>
                )}
              </Reveal>
              <div className="mt-10">
                <ShelfByExam
                  exams={exams}
                  shelf={{ books, resources, folders }}
                  tones={bookTones}
                  folderTones={folderTones}
                />
              </div>
              <div className="mt-12 grid gap-3 border-t border-[var(--pt-line)] pt-8 md:grid-cols-2">
                {workshops.map((w) => (
                  <Link
                    key={w.name}
                    href={w.href}
                    className="group flex items-center gap-5 rounded-[22px] p-2 transition-colors duration-200 hover:bg-[var(--pt-bg)]"
                  >
                    {w.cover && (
                      <span className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-[16px]">
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
                      <span className="block font-semibold">
                        {w.name}, free on the app
                      </span>
                      <span className="block text-sm text-[var(--pt-muted)]">
                        {w.subtitle}
                      </span>
                    </span>
                    <IconArrowRight
                      aria-hidden
                      size={18}
                      stroke={1.75}
                      className="ml-auto shrink-0 text-[var(--pt-muted)] transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Courses as a sticky stack. */}
        <section
          id="courses"
          aria-labelledby="courses-h"
          className="py-16 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="courses-h" className={`${h2} mb-12 max-w-[18ch]`}>
                Three courses. The fee is fixed when you join.
              </h2>
            </Reveal>
            <StickyStack top={96} step={24} gap="30vh">
              {courses.map((c) => (
                <article
                  key={c.slug}
                  className="grid gap-8 rounded-[36px] bg-[var(--pt-forest)] p-6 text-[var(--pt-paper)] shadow-[0_-20px_60px_-30px_rgba(16,38,28,0.6)] md:grid-cols-[1fr_1.1fr] md:p-10"
                >
                  <div className="flex flex-col">
                    <p className="text-[var(--pt-on-forest)]">{c.full}</p>
                    <h3 className="mt-2 text-[clamp(2.2rem,4vw,3.4rem)] leading-none font-semibold tracking-[-0.04em]">
                      {c.name}
                    </h3>
                    <dl className="mt-8 grid grid-cols-2 gap-5 text-sm">
                      <div className="col-span-2">
                        <dt className="text-[var(--pt-on-forest)]">Covers</dt>
                        <dd className="mt-1 text-base">{c.covers}</dd>
                      </div>
                      <div>
                        <dt className="text-[var(--pt-on-forest)]">Timing</dt>
                        <dd className="mt-1 text-base tabular-nums">
                          {c.when ?? "Ask at the centre"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[var(--pt-on-forest)]">Duration</dt>
                        <dd className="mt-1 text-base">{c.duration}</dd>
                      </div>
                    </dl>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-10">
                      {c.price && (
                        <p className="tabular-nums">
                          <span className="block text-4xl font-semibold tracking-[-0.03em] text-[var(--pt-lime)]">
                            {rupees(c.price)}
                          </span>
                          {c.mrp && (
                            <s className="text-sm text-[var(--pt-on-forest)]">
                              {rupees(c.mrp)}
                            </s>
                          )}
                        </p>
                      )}
                      <Link
                        data-press
                        href={c.href}
                        className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[var(--pt-paper)] px-5 text-sm font-semibold text-[var(--pt-ink)] hover:bg-white"
                      >
                        See {c.name}
                        <IconArrowRight aria-hidden size={16} stroke={2} />
                      </Link>
                    </div>
                  </div>
                  {c.cover && (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
                      <Image
                        src={c.cover}
                        alt={`${c.name} poster`}
                        fill
                        sizes="(min-width: 768px) 560px, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </article>
              ))}
            </StickyStack>
          </div>
        </section>

        {/* Teachers */}
        <section
          id="teachers"
          aria-labelledby="teachers-h"
          className="py-16 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="teachers-h" className={`${h2} mb-12 max-w-[16ch]`}>
                The people at the board.
              </h2>
            </Reveal>
            <TeacherRows
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
        </section>

        {/* Results and officers */}
        <section aria-labelledby="results-h" className="py-16 md:py-24">
          <div className={container}>
            <Reveal>
              <h2 id="results-h" className={`${h2} max-w-[20ch]`}>
                Where the path has led.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {selections.map((s, i) => (
                <Reveal key={s.name} delay={i * 0.08}>
                  <figure className="flex h-full flex-col rounded-[28px] bg-[var(--pt-paper)] p-8 md:p-10">
                    <p className="flex items-baseline gap-3">
                      <span className="text-6xl font-semibold tracking-[-0.04em] tabular-nums">
                        {s.serial}
                      </span>
                      <span className="text-sm text-[var(--pt-muted)]">
                        serial, APSC CCE 2022
                      </span>
                    </p>
                    <blockquote className="mt-8 text-lg leading-relaxed">
                      &ldquo;{s.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-auto pt-8">
                      <span className="block font-semibold">{s.name}</span>
                      <span className="text-sm text-[var(--pt-muted)]">
                        {s.post}, prepared at ICT
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
              className="mt-5 inline-flex items-center gap-1 text-sm text-[var(--pt-muted)] underline decoration-[var(--pt-line)] underline-offset-4"
            >
              The official result, dated 17 January 2024
              <IconArrowUpRight aria-hidden size={15} stroke={1.75} />
            </a>

            <h3 className="mt-20 text-2xl font-semibold tracking-[-0.02em]">
              Serving officers who came to talk to the batch
            </h3>
            <ul className="mt-6 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible">
              {officers.map((o) => (
                <li
                  key={o.id}
                  className="w-[70vw] max-w-[260px] shrink-0 snap-start md:w-auto"
                >
                  <a data-thumb href={o.href} {...external} className="block">
                    <span className="relative block aspect-video overflow-hidden rounded-[18px]">
                      <Image
                        src={o.image}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 240px, 70vw"
                        className="object-cover"
                      />
                    </span>
                    <span className="mt-3 block font-semibold">{o.name}</span>
                    <span className="block text-sm text-[var(--pt-muted)]">
                      {o.role}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Questions */}
        <section aria-labelledby="faq-h" className="py-16 md:py-24">
          <div className={`${container} grid gap-10 lg:grid-cols-12`}>
            <h2 id="faq-h" className={`${h2} lg:col-span-4`}>
              Before you ask.
            </h2>
            <div className="lg:col-span-8">
              {faqs.map((f) => (
                <details key={f.q} className="border-b border-[var(--pt-line)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold">
                    {f.q}
                    <IconPlus
                      data-plus
                      aria-hidden
                      size={20}
                      stroke={1.75}
                      className="shrink-0"
                    />
                  </summary>
                  <p className="max-w-[62ch] pb-6 text-[var(--pt-muted)]">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Enquire */}
        <section aria-labelledby="join-h" className="pt-8 pb-10">
          <div className={container}>
            <div className="grid gap-10 overflow-hidden rounded-[40px] bg-[var(--pt-forest)] p-8 text-[var(--pt-paper)] md:p-14 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h2
                  id="join-h"
                  className="text-[clamp(2.3rem,5vw,4.2rem)] leading-[0.98] font-semibold tracking-[-0.045em]"
                >
                  The first step is a free class.
                </h2>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <PrimaryCta onForest />
                  <a
                    data-press
                    href={tel}
                    className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-medium tabular-nums shadow-[inset_0_0_0_1px_rgba(246,248,243,0.3)] hover:bg-white/5"
                  >
                    <IconPhone aria-hidden size={18} stroke={1.75} />
                    Call {phone}
                  </a>
                </div>
              </div>
              <address className="text-[var(--pt-on-forest)] not-italic lg:col-span-5 lg:self-end lg:text-right">
                {place.street}
                <br />
                {place.city}, {place.region} {place.pin}
                <br />
                <a
                  href={place.maps}
                  {...external}
                  className="mt-2 inline-block text-[var(--pt-paper)] underline decoration-white/30 underline-offset-4"
                >
                  Open in Google Maps
                </a>
              </address>
            </div>
          </div>
        </section>
      </main>

      <footer className="pt-6 pb-28 text-sm text-[var(--pt-muted)]">
        <div
          className={`${container} flex flex-wrap items-center gap-x-8 gap-y-3`}
        >
          {contact.phones.map((p) => (
            <a key={p} data-quiet href={`tel:${p}`} className="tabular-nums">
              {p.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
            </a>
          ))}
          <a data-quiet href={`mailto:${contact.email}`}>
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
                data-quiet
                className="grid size-11 place-items-center rounded-full transition-colors duration-150 hover:bg-[var(--pt-paper)]"
              >
                <Icon aria-hidden size={19} stroke={1.5} />
              </a>
            ))}
          </div>
          <p className="w-full">Prototype for review. Not the live site.</p>
        </div>
      </footer>

      <PrototypeSwitcher current="path" />
    </div>
  )
}
