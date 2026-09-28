import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandYoutube,
  IconPhone,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { Onest } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { Book3D, bookCss, type BookTones } from "../_book"
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
  whatsapp,
  workshops,
} from "../_data"
import { CountUp, PlayInPlace, Tilt } from "../_fx"
import { Reveal } from "../_reveal"
import { PrototypeSwitcher } from "../_switcher"
import {
  Carousel,
  Dock,
  ExamHub,
  ParallaxLayer,
  ParallaxScene,
  type ExamPack,
} from "./_client"

/**
 * Prototype 9: Mist. Light, airy, glass over a slow aurora drawn from the
 * logo's green, blue and amber. The aurora shifts with the exam you pick.
 * Colour: restrained light. Ink for actions, ICT blue only for small links.
 */

const sans = Onest({ subsets: ["latin"], variable: "--ms-sans" })

export const metadata: Metadata = { title: "Mist" }

const tokens = {
  "--ms-bg": "#F2F5F4",
  "--ms-ink": "#0D1B1E",
  "--ms-muted": "#4E5D63",
  "--ms-line": "rgba(13,27,30,0.12)",
  "--ms-accent": "#1B6FC0",
  "--ms-ease": "cubic-bezier(0.23, 1, 0.32, 1)",
  "--bk-shadow": "rgba(13,27,30,0.3)",
} as CSSProperties

const bookTones: BookTones = {
  primary: { bg: "#1B6FC0", ink: "#FFFFFF", spine: "#155798" },
  highlight: { bg: "#FBD27A", ink: "#0D1B1E", spine: "#DDB05A" },
  muted: { bg: "#FFFFFF", ink: "#0D1B1E", spine: "#DCE3E1" },
}

const css = `
@property --a1 { syntax: "<color>"; inherits: true; initial-value: #A9CDF2; }
@property --a2 { syntax: "<color>"; inherits: true; initial-value: #A3E2B8; }
@property --a3 { syntax: "<color>"; inherits: true; initial-value: #FFE0A8; }
[data-ms] { --a1: #A9CDF2; --a2: #A3E2B8; --a3: #FFE0A8; transition: --a1 1.2s ease, --a2 1.2s ease, --a3 1.2s ease; interpolate-size: allow-keywords; }
[data-ms][data-exam="1"] { --a1: #FFD69B; --a2: #A9CDF2; --a3: #F6BBA6; }
[data-ms][data-exam="2"] { --a1: #A3E2B8; --a2: #D2EAA2; --a3: #A9CDF2; }
[data-ms] ::selection { background: var(--ms-ink); color: #fff; }
[data-ms] :focus-visible { outline: 2px solid var(--ms-accent); outline-offset: 3px; }
[data-ms] h1, [data-ms] h2, [data-ms] h3 { text-wrap: balance; }
[data-ms] p { text-wrap: pretty; }

[data-aurora] { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
[data-aurora] span { position: absolute; width: 70vmax; height: 70vmax; border-radius: 50%; opacity: 0.75; will-change: transform; }
[data-aurora] span:nth-child(1) { left: -20vmax; top: -30vmax; background: radial-gradient(closest-side, var(--a1), transparent); animation: ms-drift-a 38s ease-in-out infinite alternate; }
[data-aurora] span:nth-child(2) { right: -25vmax; top: -10vmax; background: radial-gradient(closest-side, var(--a2), transparent); animation: ms-drift-b 44s ease-in-out infinite alternate; }
[data-aurora] span:nth-child(3) { left: 20vmax; bottom: -40vmax; background: radial-gradient(closest-side, var(--a3), transparent); animation: ms-drift-a 52s ease-in-out infinite alternate-reverse; }
@keyframes ms-drift-a { to { transform: translate(12vmax, 8vmax) scale(1.1); } }
@keyframes ms-drift-b { to { transform: translate(-10vmax, 14vmax) scale(0.92); } }

[data-ms] [data-glass] { background: rgba(255,255,255,0.56); -webkit-backdrop-filter: blur(22px) saturate(160%); backdrop-filter: blur(22px) saturate(160%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(255,255,255,0.55), 0 24px 60px -34px rgba(13,27,30,0.35); }
@media (prefers-reduced-transparency: reduce) { [data-ms] [data-glass] { background: rgba(255,255,255,0.95); -webkit-backdrop-filter: none; backdrop-filter: none; } }

[data-ms] [data-press] { transition: transform 0.16s var(--ms-ease), background-color 0.2s ease; }
[data-ms] [data-press]:active { transform: scale(0.97); }
@media (hover: hover) { [data-ms] [data-primary]:hover { background-color: #1D3238; } [data-ms] [data-quiet]:hover { color: var(--ms-ink); } }
@keyframes ms-rise { from { opacity: 0; transform: translateY(16px); filter: blur(8px); } to { opacity: 1; transform: none; filter: none; } }
[data-ms] [data-rise] { animation: ms-rise 1s var(--ms-ease) both; }

[data-ms] details::details-content { block-size: 0; overflow: hidden; transition: block-size 0.3s var(--ms-ease), content-visibility 0.3s allow-discrete; }
[data-ms] details[open]::details-content { block-size: auto; }
[data-ms] summary::-webkit-details-marker { display: none; }
[data-ms] details [data-plus] { transition: transform 0.25s var(--ms-ease); }
[data-ms] details[open] [data-plus] { transform: rotate(45deg); }
@media (prefers-reduced-motion: reduce) { [data-aurora] span { animation: none; } }
`

const external = { target: "_blank", rel: "noreferrer noopener" } as const
const container = "mx-auto w-full max-w-[1200px] px-5 md:px-8"
const h2 =
  "text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.04em]"

function PrimaryCta({ small = false }: { small?: boolean }) {
  return (
    <a
      data-press
      data-primary
      href={whatsapp}
      {...external}
      className={`group inline-flex items-center gap-2 rounded-full bg-[var(--ms-ink)] font-medium text-white ${
        small ? "h-11 px-4 text-sm" : "h-12 px-6"
      }`}
    >
      {offer.cta}
      {!small && (
        <IconArrowRight
          aria-hidden
          size={18}
          stroke={2}
          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        />
      )}
    </a>
  )
}

export default async function Mist() {
  const { books, folders, samples } = await shelf()
  const lecture = classes[0]!
  const packs: ExamPack[] = courses.map((c) => ({
    exam: c.exam,
    full: c.full,
    course: {
      name: c.name,
      covers: c.covers,
      duration: c.duration,
      when: c.when,
      days: c.days,
      price: c.price ? rupees(c.price) : null,
      mrp: c.mrp ? rupees(c.mrp) : null,
      cover: c.cover,
      href: c.href,
    },
    teachers: c.faculty.map((f) => ({
      name: f.name,
      teaches: f.teaches,
      portrait: f.portrait,
    })),
    books: books.filter((b) => b.exam === c.exam),
    folders: folders.filter((f) => f.exam === c.exam || !f.exam),
    workshop: workshops.find((w) => w.href === c.freeHref) ?? null,
  }))
  const [lead, ...others] = faculty

  return (
    <div
      data-ms
      data-exam="0"
      style={tokens}
      className={`${sans.variable} relative isolate min-h-[100dvh] bg-[var(--ms-bg)] font-[family-name:var(--ms-sans)] text-[var(--ms-ink)] antialiased`}
    >
      <style>{css + bookCss}</style>
      <div data-aurora aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <header className="sticky top-4 z-40 px-4">
        <div className="mx-auto flex max-w-[1200px] items-start justify-between gap-4">
          <a
            href="#top"
            data-glass
            className="flex h-14 items-center rounded-[20px] px-4"
          >
            <Image
              src="/brand/ict-logo-tight.png"
              alt="Impact Career Tutorials"
              width={96}
              height={52}
              className="h-8 w-auto"
            />
          </a>
          <Dock cta={<PrimaryCta small />} />
          <div className="md:hidden">
            <PrimaryCta small />
          </div>
          <a
            href={tel}
            data-glass
            aria-label={`Call ${phone}`}
            className="hidden h-14 items-center gap-2 rounded-[20px] px-4 text-sm font-medium tabular-nums lg:flex"
          >
            <IconPhone aria-hidden size={18} stroke={1.75} />
            {phone}
          </a>
        </div>
      </header>

      <main id="top" className="relative z-[1]">
        {/* Hero: centred promise over a parallax scene. */}
        <section aria-label="Introduction" className="pt-16 md:pt-24">
          <div className={`${container} text-center`}>
            <h1
              data-rise
              className="mx-auto max-w-[24ch] text-[clamp(2.4rem,4.8vw,4.1rem)] leading-[0.98] font-semibold tracking-[-0.045em]"
            >
              Assam&apos;s exams, in the classroom and on your phone.
            </h1>
            <p
              data-rise
              style={{ animationDelay: "0.1s" }}
              className="mx-auto mt-6 max-w-[50ch] text-lg text-[var(--ms-muted)]"
            >
              Live batches on {place.spoken}, recorded on the ICT app, with
              ICT&apos;s books and free notes.
            </p>
            <div
              data-rise
              style={{ animationDelay: "0.2s" }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              <PrimaryCta />
              <a
                data-press
                data-glass
                href="#exam"
                className="inline-flex h-12 items-center rounded-full px-6 font-medium"
              >
                Find your exam
              </a>
            </div>
          </div>

          <ParallaxScene
            className={`${container} relative mt-14 pb-10 md:mt-20`}
          >
            <ParallaxLayer
              depth={0.35}
              className="relative mx-auto max-w-[760px]"
            >
              <div data-glass className="rounded-[30px] p-2.5">
                <PlayInPlace
                  id={lecture.id}
                  title={lecture.title}
                  className="group relative block aspect-video w-full overflow-hidden rounded-[22px] bg-black"
                >
                  <Image
                    src={lecture.image}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 740px, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-16 place-items-center rounded-full bg-white/90 text-[var(--ms-ink)] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] backdrop-blur transition-transform duration-200 ease-out group-hover:scale-105">
                      <IconPlayerPlayFilled
                        aria-hidden
                        size={22}
                        className="translate-x-px"
                      />
                    </span>
                  </span>
                </PlayInPlace>
                <p className="flex justify-between gap-4 px-3 pt-3 pb-1 text-sm">
                  <span className="truncate font-medium">{lecture.title}</span>
                  <span className="shrink-0 text-[var(--ms-muted)] tabular-nums">
                    {compact(lecture.views)} views
                  </span>
                </p>
              </div>
            </ParallaxLayer>

            <ParallaxLayer
              depth={0.9}
              className="absolute top-10 left-8 hidden w-[200px] -rotate-6 lg:block xl:left-0"
            >
              <div data-glass className="rounded-[26px] p-2">
                <span className="relative block aspect-[3/4] overflow-hidden rounded-[20px]">
                  <Image
                    src={campus[3].src}
                    alt={campus[3].alt}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </span>
                <p className="px-2 pt-2 pb-1 text-xs font-medium">
                  The room on {place.spoken}
                </p>
              </div>
            </ParallaxLayer>

            <ParallaxLayer
              depth={1.2}
              className="absolute top-0 right-6 hidden w-[230px] rotate-3 lg:block xl:right-0"
            >
              <div
                data-glass
                className="flex items-center gap-3 rounded-[24px] p-4"
              >
                <Image
                  src="/brand/ict-app-icon.png"
                  alt=""
                  width={52}
                  height={52}
                  className="size-13 rounded-[16px]"
                />
                <p className="text-sm">
                  <span className="block font-semibold">
                    Recorded on the app
                  </span>
                  <span className="text-[var(--ms-muted)] tabular-nums">
                    {proof[1].display} installs
                  </span>
                </p>
              </div>
            </ParallaxLayer>

            {books[0] && (
              <ParallaxLayer
                depth={1.5}
                className="absolute right-10 bottom-0 hidden w-[150px] rotate-2 lg:block xl:right-4"
              >
                <Link
                  data-bk-hover
                  href={books[0].href}
                  aria-label={books[0].title}
                >
                  <Book3D
                    book={books[0]}
                    tones={bookTones}
                    font="var(--ms-sans)"
                  />
                </Link>
              </ParallaxLayer>
            )}
          </ParallaxScene>
        </section>

        {/* Proof */}
        <section aria-label="In numbers" className="py-12 md:py-16">
          <div className={container}>
            <div
              data-glass
              className="grid grid-cols-2 gap-y-8 rounded-[32px] p-8 md:grid-cols-4 md:p-10"
            >
              {proof.map((p) => (
                <a
                  key={p.label}
                  href={p.href}
                  {...external}
                  className="group px-2"
                >
                  <span className="block text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                    <CountUp display={p.display} />
                  </span>
                  <span className="mt-2 block max-w-[22ch] text-sm text-[var(--ms-muted)] transition-colors duration-150 group-hover:text-[var(--ms-ink)]">
                    {p.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Exam hub: course, teachers, books, free notes and workshop per exam. */}
        <section
          id="exam"
          aria-labelledby="exam-h"
          className="scroll-mt-28 py-16 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="exam-h" className={`${h2} max-w-[18ch]`}>
                Pick your exam. Everything for it is here.
              </h2>
              <p className="mt-4 max-w-[56ch] text-[var(--ms-muted)]">
                The course and its timing, the teachers, ICT&apos;s books, and
                the notes and workshop you can have free.
                {samples && " Book and note titles are samples for now."}
              </p>
            </Reveal>
            <div className="mt-10">
              <ExamHub packs={packs} tones={bookTones} />
            </div>
          </div>
        </section>

        {/* Teachers */}
        <section
          id="teachers"
          aria-labelledby="teachers-h"
          className="scroll-mt-28 py-16 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="teachers-h" className={`${h2} max-w-[16ch]`}>
                Five teachers you can watch first.
              </h2>
            </Reveal>
            <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2">
              {lead && (
                <li className="col-span-2 md:row-span-2">
                  <Tilt max={3} className="h-full">
                    <a
                      href={`https://www.youtube.com/watch?v=${lead.lecture}`}
                      {...external}
                      data-glass
                      className="group flex h-full flex-col rounded-[32px] p-3"
                    >
                      <span className="relative block min-h-[320px] flex-1 overflow-hidden rounded-[24px] bg-[#0E2A57]">
                        <Image
                          src={lead.portrait}
                          alt={`${lead.name}, ${lead.teaches}`}
                          fill
                          sizes="(min-width: 768px) 560px, 100vw"
                          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                      </span>
                      <span className="flex items-end justify-between gap-4 p-4">
                        <span>
                          <span className="block text-2xl font-semibold tracking-[-0.03em]">
                            {lead.name}
                          </span>
                          <span className="block text-[var(--ms-muted)]">
                            {lead.teaches}. {lead.note}
                          </span>
                        </span>
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--ms-ink)] text-white transition-transform duration-200 ease-out group-hover:scale-105">
                          <IconPlayerPlayFilled
                            aria-hidden
                            size={15}
                            className="translate-x-px"
                          />
                        </span>
                      </span>
                    </a>
                  </Tilt>
                </li>
              )}
              {others.map((f) => (
                <li key={f.slug}>
                  <Tilt max={5} className="h-full">
                    <a
                      href={`https://www.youtube.com/watch?v=${f.lecture}`}
                      {...external}
                      data-glass
                      className="group flex h-full flex-col rounded-[28px] p-2.5"
                    >
                      <span className="relative block aspect-[5/4] overflow-hidden rounded-[20px] bg-[#0E2A57]">
                        <Image
                          src={f.portrait}
                          alt={`${f.name}, ${f.teaches}`}
                          fill
                          sizes="(min-width: 768px) 270px, 50vw"
                          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      </span>
                      <span className="px-2 pt-3 pb-1">
                        <span className="block font-semibold">{f.name}</span>
                        <span className="block truncate text-sm text-[var(--ms-muted)]">
                          {f.teaches}
                        </span>
                      </span>
                    </a>
                  </Tilt>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Lectures carousel */}
        <section
          id="watch"
          aria-labelledby="watch-h"
          className="scroll-mt-28 py-16 md:py-24"
        >
          <div className={container}>
            <Carousel
              title={
                <h2 id="watch-h" className={`${h2} max-w-[16ch]`}>
                  Watch a class tonight, free.
                </h2>
              }
            >
              {classes.slice(1).map((c) => (
                <li
                  key={c.id}
                  className="w-[78vw] max-w-[340px] shrink-0 snap-start"
                >
                  <a
                    href={c.href}
                    {...external}
                    data-glass
                    className="group block rounded-[26px] p-2"
                  >
                    <span className="relative block aspect-video overflow-hidden rounded-[20px]">
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        sizes="340px"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    </span>
                    <span className="block px-2 pt-3 font-medium">
                      {c.title}
                    </span>
                    <span className="block px-2 pb-2 text-sm text-[var(--ms-muted)] tabular-nums">
                      {c.by}, {compact(c.views)} views
                    </span>
                  </a>
                </li>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Results and officers */}
        <section
          id="results"
          aria-labelledby="results-h"
          className="scroll-mt-28 py-16 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="results-h" className={`${h2} max-w-[20ch]`}>
                Two officers on the APSC CCE 2022 list prepared here.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {selections.map((s) => (
                <figure
                  key={s.name}
                  data-glass
                  className="flex flex-col rounded-[32px] p-8 md:p-10"
                >
                  <blockquote className="text-xl leading-relaxed">
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-auto flex items-center justify-between gap-4 pt-8">
                    <span>
                      <span className="block font-semibold">{s.name}</span>
                      <span className="text-sm text-[var(--ms-muted)]">
                        {s.post}
                      </span>
                    </span>
                    <span className="rounded-2xl bg-[var(--ms-ink)] px-4 py-2 text-right text-white">
                      <span className="block text-xs text-white/65">
                        Serial
                      </span>
                      <span className="block text-2xl font-semibold tabular-nums">
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
              data-quiet
              className="mt-5 inline-flex items-center gap-1 text-sm text-[var(--ms-muted)] underline decoration-[var(--ms-line)] underline-offset-4"
            >
              APSC result, 17 January 2024
              <IconArrowUpRight aria-hidden size={15} stroke={1.75} />
            </a>
            <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {officers.map((o) => (
                <li key={o.id}>
                  <a
                    href={o.href}
                    {...external}
                    data-glass
                    className="group block h-full rounded-[22px] p-2"
                  >
                    <span className="relative block aspect-video overflow-hidden rounded-[16px]">
                      <Image
                        src={o.image}
                        alt=""
                        fill
                        sizes="240px"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    </span>
                    <span className="block px-2 pt-2 text-sm font-semibold">
                      {o.name}
                    </span>
                    <span className="block px-2 pb-1 text-xs text-[var(--ms-muted)]">
                      {o.role}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-[var(--ms-muted)]">
              Serving officers who came to talk to the batch.
            </p>
          </div>
        </section>

        {/* Questions */}
        <section
          id="questions"
          aria-labelledby="faq-h"
          className="scroll-mt-28 py-16 md:py-24"
        >
          <div className={`${container} grid gap-10 lg:grid-cols-12`}>
            <h2 id="faq-h" className={`${h2} lg:col-span-4`}>
              Questions, answered.
            </h2>
            <div
              data-glass
              className="rounded-[32px] px-6 py-2 md:px-8 lg:col-span-8"
            >
              {faqs.map((f, i) => (
                <details
                  key={f.q}
                  className={i ? "border-t border-[var(--ms-line)]" : undefined}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-semibold">
                    {f.q}
                    <IconPlus
                      data-plus
                      aria-hidden
                      size={19}
                      stroke={1.75}
                      className="shrink-0"
                    />
                  </summary>
                  <p className="max-w-[62ch] pb-5 text-[var(--ms-muted)]">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Enquire */}
        <section aria-labelledby="join-h" className="py-16 md:py-24">
          <div className={container}>
            <div data-glass className="rounded-[40px] p-8 text-center md:p-16">
              <h2
                id="join-h"
                className="mx-auto max-w-[14ch] text-[clamp(2.4rem,5.4vw,4.4rem)] leading-[0.98] font-semibold tracking-[-0.045em]"
              >
                Start with a free workshop.
              </h2>
              <ol className="mx-auto mt-10 grid max-w-3xl gap-6 text-left md:grid-cols-3">
                {joining.map((j) => (
                  <li
                    key={j.verb}
                    className="border-t border-[var(--ms-line)] pt-4"
                  >
                    <p className="font-semibold">{j.verb}</p>
                    <p className="mt-1 text-sm text-[var(--ms-muted)]">
                      {j.body}
                    </p>
                  </li>
                ))}
              </ol>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <PrimaryCta />
                <a
                  data-press
                  href={tel}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white/70 px-6 font-medium tabular-nums shadow-[inset_0_0_0_1px_var(--ms-line)]"
                >
                  <IconPhone aria-hidden size={18} stroke={1.75} />
                  Call {phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-[1] pt-4 pb-28 text-sm text-[var(--ms-muted)]">
        <div
          className={`${container} flex flex-wrap items-center gap-x-8 gap-y-3`}
        >
          <address className="not-italic">
            {place.street}, {place.city} {place.pin}
          </address>
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
                className="grid size-11 place-items-center rounded-full transition-colors duration-150 hover:bg-white/60"
              >
                <Icon aria-hidden size={19} stroke={1.5} />
              </a>
            ))}
          </div>
          <p className="w-full">Prototype for review. Not the live site.</p>
        </div>
      </footer>

      <PrototypeSwitcher current="mist" />
    </div>
  )
}
