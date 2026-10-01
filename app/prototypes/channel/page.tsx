import { IconPhone, IconPlayerPlayFilled } from "@tabler/icons-react"
import type { Metadata } from "next"
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"

import {
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
  podcast,
  proof,
  rupees,
  selections,
  tel,
  thumb,
  whatsapp,
} from "../_data"
import { PrototypeSwitcher } from "../_switcher"
import { HomeMenu, HomePromos } from "../_kit/home-extras"
import { tokens as siteTokens } from "./_site"

/**
 * Prototype 2: Channel. The viewing room.
 *
 * Colour: committed dark. Ground #0B1020, one raised surface #121A2E for the
 * faculty band, hairlines at 10% of the text colour, text #F3F4F8, secondary
 * #A9B1C6 (tinted from the navy ground, never neutral grey). Gold #E8B04B is
 * the single accent and appears in exactly four roles: the primary CTA fill
 * (with #0B1020 text), the play glyph, view counts, and one underline (the
 * source link under the APSC results). Verified green #3DBB5B appears only on
 * the two APSC serials. The hero carries the page's one light source, a soft
 * radial from top-left; nothing else is lit.
 */

const display = Bricolage_Grotesque({
  axes: ["opsz", "wdth"],
  subsets: ["latin"],
  variable: "--ch-display",
})

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--ch-sans" })

export const metadata: Metadata = { title: "Channel" }

const tokens = {
  "--ch-bg": "#0B1020",
  "--ch-raised": "#121A2E",
  "--ch-line": "rgba(243,244,248,0.10)",
  "--ch-text": "#F3F4F8",
  "--ch-muted": "#A9B1C6",
  "--ch-gold": "#E8B04B",
  "--ch-gold-hi": "#F0BE63",
  "--ch-green": "#3DBB5B",
  "--ch-ease": "cubic-bezier(0.23, 1, 0.32, 1)",
} as CSSProperties

const css = `
[data-ch-root] { font-optical-sizing: auto; }
[data-ch-root] ::selection { background: var(--ch-gold); color: var(--ch-bg); }
[data-ch-root] :focus-visible { outline: 2px solid var(--ch-gold); outline-offset: 3px; }
[data-ch-root] a { text-underline-offset: 0.2em; text-decoration-thickness: 1px; }
@keyframes ch-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes ch-frame-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: none; } }
[data-ch-root] [data-rise] { animation: ch-rise 0.8s var(--ch-ease) both; }
[data-ch-root] [data-frame-in] { animation: ch-frame-in 1s var(--ch-ease) 80ms both; }
[data-ch-root] [data-frame] { opacity: 0.9; transition: transform 0.2s ease-out, opacity 0.2s ease-out; }
[data-ch-root] [data-play] { transition: transform 0.2s ease-out; }
[data-ch-root] a:hover [data-frame],
[data-ch-root] a:focus-visible [data-frame] { opacity: 1; transform: translateY(-2px); }
[data-ch-root] a:hover [data-play],
[data-ch-root] a:focus-visible [data-play] { transform: scale(1.06); }
[data-ch-root] [data-press] { transition: transform 0.15s var(--ch-ease), background-color 0.15s ease-out, border-color 0.15s ease-out, color 0.15s ease-out; }
[data-ch-root] [data-press]:active { transform: scale(0.98); }
[data-ch-root] [data-primary]:hover { background-color: var(--ch-gold-hi); }
[data-ch-root] [data-secondary]:hover { border-color: var(--ch-text); }
[data-ch-root] [data-quiet] { transition: color 0.15s ease-out; }
[data-ch-root] [data-quiet]:hover { color: var(--ch-text); }
[data-ch-root] [data-row] { transition: background-color 0.2s ease-out; }
[data-ch-root] [data-row]:hover { background-color: var(--ch-raised); }
@media (prefers-reduced-motion: reduce) {
  [data-ch-root] [data-rise], [data-ch-root] [data-frame-in] { animation: none; }
  [data-ch-root] a:hover [data-frame], [data-ch-root] a:hover [data-play] { transform: none; }
}
`

const views = (n: number) => `${compact(n)} views`
const callLabel = `Call ${phone}`
const external = { target: "_blank", rel: "noreferrer noopener" } as const

const container = "mx-auto w-full max-w-7xl px-5 md:px-8"
const h2 =
  "font-[family-name:var(--ch-display)] text-[2rem] leading-[1.05] font-semibold tracking-[-0.025em] text-balance md:text-[2.75rem]"
const primaryCta =
  "inline-flex h-12 items-center justify-center rounded-full bg-[var(--ch-gold)] px-6 font-medium text-[var(--ch-bg)]"
const secondaryCta =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--ch-line)] px-6 font-medium text-[var(--ch-text)]"

/**
 * A YouTube thumbnail in a 16/9 frame with a gold play disc. The thumbnail is
 * never cropped and never carries text; captions live outside this component.
 */
function Frame({
  src,
  alt,
  sizes,
  disc = 40,
  priority = false,
  radius = "rounded-xl",
}: {
  src: string
  alt: string
  sizes: string
  disc?: 40 | 64
  priority?: boolean
  radius?: string
}) {
  return (
    <div
      data-frame
      className={`relative aspect-video overflow-hidden bg-[var(--ch-raised)] ${radius}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
      <span className="pointer-events-none absolute inset-0 grid place-items-center">
        <span
          data-play
          className={`grid place-items-center rounded-full bg-[var(--ch-gold)] text-[var(--ch-bg)] ${
            disc === 64 ? "size-16" : "size-10"
          }`}
        >
          <IconPlayerPlayFilled
            aria-hidden
            size={disc === 64 ? 26 : 16}
            className="translate-x-px"
          />
        </span>
      </span>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_var(--ch-line),inset_0_1px_0_rgba(255,255,255,0.08)] ${radius}`}
      />
    </div>
  )
}

function Section({
  id,
  className = "",
  children,
}: {
  id: string
  className?: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`py-14 md:py-20 ${className}`}
    >
      {children}
    </section>
  )
}

export default function Channel() {
  const hero = classes[0]!
  const grid = classes.slice(1, 6)
  const episodes = podcast.episodes.slice(0, 3)

  return (
    <div
      data-ch-root
      style={tokens}
      className={`${display.variable} ${sans.variable} min-h-[100dvh] bg-[var(--ch-bg)] font-[family-name:var(--ch-sans)] text-[var(--ch-text)] antialiased`}
    >
      <style>{css}</style>

      <HomePromos slug="channel" tokens={siteTokens} />

      <header className="border-b border-[var(--ch-line)]">
        <div className={`${container} flex h-16 items-center gap-6`}>
          <Link
            href="/prototypes/channel"
            className="flex shrink-0 items-center gap-2.5 font-[family-name:var(--ch-display)] font-semibold tracking-[-0.01em]"
          >
            <Image
              src="/brand/ict-mark.png"
              alt=""
              width={32}
              height={32}
              className="size-8"
            />
            <span className="hidden sm:inline">Impact Career Tutorials</span>
            <span className="sm:hidden">ICT</span>
          </Link>
          <nav
            aria-label="Sections"
            className="hidden items-center gap-6 text-sm text-[var(--ch-muted)] md:flex"
          >
            <a data-quiet href="#lectures">
              Lectures
            </a>
            <a data-quiet href="#teachers">
              Teachers
            </a>
            <a data-quiet href="#courses">
              Courses
            </a>
            <a data-quiet href="#questions">
              Questions
            </a>
            <Link data-quiet href="/prototypes/channel/books">
              Books
            </Link>
            <Link data-quiet href="/prototypes/channel/notes">
              Free notes
            </Link>
            <Link data-quiet href="/prototypes/channel/contact">
              Contact
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <a
              data-quiet
              href={tel}
              className="hidden items-center gap-2 text-sm text-[var(--ch-muted)] tabular-nums lg:inline-flex"
            >
              <IconPhone aria-hidden size={18} stroke={1.75} />
              {callLabel}
            </a>
            <a
              data-press
              data-primary
              href={whatsapp}
              {...external}
              className="inline-flex h-11 items-center rounded-full bg-[var(--ch-gold)] px-4 text-sm font-medium text-[var(--ch-bg)] sm:px-5"
            >
              {offer.cta}
            </a>
          </div>
          <HomeMenu slug="channel" tokens={siteTokens} />
        </div>
      </header>

      <main>
        {/* 1. Hero: copy + player. Player first on mobile. */}
        <section
          aria-label="Watch a class"
          className="bg-[radial-gradient(80%_60%_at_20%_0%,#182446_0%,transparent_60%)]"
        >
          <div
            className={`${container} grid gap-10 pt-8 pb-16 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pt-16 lg:pb-24`}
          >
            <div className="order-last lg:order-first lg:col-span-5">
              <h1 className="font-[family-name:var(--ch-display)] text-[2.25rem] leading-[1.02] font-semibold tracking-[-0.025em] sm:text-[2.75rem] lg:text-[3rem]">
                <span data-rise className="block">
                  Watch the class
                </span>
                <span
                  data-rise
                  className="block"
                  style={{ animationDelay: "40ms" }}
                >
                  before you pay for it.
                </span>
              </h1>
              <p
                data-rise
                style={{ animationDelay: "120ms" }}
                className="mt-6 max-w-[38ch] text-lg leading-relaxed text-[var(--ch-muted)]"
              >
                Full lectures by the same teachers who take the batch, free on
                the ICT channel and app.
              </p>
              <div
                data-rise
                style={{ animationDelay: "200ms" }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <a
                  data-press
                  data-primary
                  href={whatsapp}
                  {...external}
                  className={primaryCta}
                >
                  {offer.cta}
                </a>
                <a
                  data-press
                  data-secondary
                  href={tel}
                  className={`${secondaryCta} tabular-nums`}
                >
                  <IconPhone aria-hidden size={18} stroke={1.75} />
                  {callLabel}
                </a>
              </div>
              <p
                data-rise
                style={{ animationDelay: "280ms" }}
                className="mt-5 text-sm text-[var(--ch-muted)]"
              >
                {offer.promise}
              </p>
            </div>

            <a
              data-frame-in
              href={hero.href}
              {...external}
              aria-label={`Watch ${hero.title} by ${hero.by} on YouTube`}
              className="order-first block overflow-hidden rounded-2xl bg-[var(--ch-raised)] shadow-[0_40px_90px_-40px_rgba(4,8,24,0.95)] lg:order-last lg:col-span-7"
            >
              <Frame
                src={hero.image}
                alt=""
                sizes="(min-width: 1024px) 720px, 100vw"
                disc={64}
                priority
                radius="rounded-t-2xl"
              />
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-[var(--ch-line)] px-5 py-4">
                <p className="text-base font-medium">
                  {hero.title}
                  <span className="ml-2 font-normal text-[var(--ch-muted)]">
                    {hero.by}
                  </span>
                </p>
                <p className="text-sm text-[var(--ch-gold)] tabular-nums">
                  {views(hero.views)}
                </p>
              </div>
            </a>
          </div>
        </section>

        {/* 2. Channel strip: four figures, hairlines, gold numerals. */}
        <section aria-label="The channel in numbers" className={container}>
          <ul className="grid grid-cols-2 border-y border-[var(--ch-line)] md:grid-cols-4">
            {proof.map((p, i) => (
              <li
                key={p.label}
                className={`border-[var(--ch-line)] ${i % 2 === 1 ? "border-l" : ""} ${
                  i >= 2 ? "border-t md:border-t-0" : ""
                } ${i === 2 ? "md:border-l" : ""}`}
              >
                <a
                  href={p.href}
                  {...external}
                  className="group block px-4 py-6 md:px-6 md:py-8"
                >
                  <span className="block font-[family-name:var(--ch-display)] text-[2.25rem] leading-none font-semibold tracking-[-0.025em] text-[var(--ch-gold)] tabular-nums md:text-[2.75rem]">
                    {p.display}
                  </span>
                  <span className="mt-3 block max-w-[22ch] text-sm leading-snug text-[var(--ch-muted)] group-hover:text-[var(--ch-text)]">
                    {p.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Lectures: one 2x2 tile and four 1x1. */}
        <Section id="lectures" className={container}>
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <h2 id="lectures-heading" className={`${h2} max-w-[18ch]`}>
              Full classes, free on the channel.
            </h2>
            <a
              data-quiet
              href={links.youtube}
              {...external}
              className="text-sm text-[var(--ch-muted)] underline decoration-[var(--ch-line)]"
            >
              All videos on YouTube
            </a>
          </div>
          <ul className="mt-10 grid gap-x-5 gap-y-8 md:grid-cols-4 md:grid-rows-2">
            {grid.map((c, i) => {
              const big = i === 0
              return (
                <li
                  key={c.id}
                  className={big ? "md:col-span-2 md:row-span-2" : ""}
                >
                  <a
                    href={c.href}
                    {...external}
                    className="group block"
                    aria-label={`Watch ${c.title} by ${c.by} on YouTube`}
                  >
                    <Frame
                      src={c.image}
                      alt=""
                      sizes={
                        big
                          ? "(min-width: 768px) 50vw, 100vw"
                          : "(min-width: 768px) 25vw, 100vw"
                      }
                      disc={big ? 64 : 40}
                    />
                    <div className="mt-3 flex items-baseline justify-between gap-4">
                      <p
                        className={`font-medium ${big ? "text-xl md:text-2xl" : "text-base"}`}
                      >
                        {c.title}
                        <span className="mt-0.5 block text-sm font-normal text-[var(--ch-muted)]">
                          {c.by}
                        </span>
                      </p>
                      <p className="shrink-0 text-sm text-[var(--ch-gold)] tabular-nums">
                        {views(c.views)}
                      </p>
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        </Section>

        {/* 4. Faculty on the raised surface; portraits keep their own backgrounds. */}
        <Section id="teachers" className="bg-[var(--ch-raised)]">
          <div className={container}>
            <h2 id="teachers-heading" className={`${h2} max-w-[22ch]`}>
              The people in the videos are the people in the room.
            </h2>
            <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
              {faculty.map((f) => (
                <li key={f.slug}>
                  <a
                    href={`https://www.youtube.com/watch?v=${f.lecture}`}
                    {...external}
                    className="group block max-w-[280px]"
                  >
                    <div
                      data-frame
                      className="relative aspect-[380/452] overflow-hidden rounded-xl"
                    >
                      <Image
                        src={f.portrait}
                        alt={`${f.name}, ${f.teaches}`}
                        fill
                        sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-4 font-[family-name:var(--ch-display)] text-lg leading-tight font-semibold tracking-[-0.01em]">
                      {f.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ch-muted)]">
                      {f.teaches}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ch-muted)]">
                      {f.note}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium">
                      <IconPlayerPlayFilled
                        aria-hidden
                        size={12}
                        className="text-[var(--ch-gold)]"
                      />
                      Watch a class
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* 5. Results: two-column panel, then the officers' strip. */}
        <Section id="results" className={container}>
          <h2 id="results-heading" className={`${h2} max-w-[22ch]`}>
            Two officers on the APSC CCE 2022 list prepared here.
          </h2>
          <div className="mt-10 grid rounded-2xl border border-[var(--ch-line)] lg:grid-cols-12">
            <ul className="divide-y divide-[var(--ch-line)] lg:col-span-5 lg:border-r lg:border-[var(--ch-line)]">
              {selections.map((s) => (
                <li key={s.serial} className="px-6 py-7 md:px-8">
                  <p className="font-[family-name:var(--ch-display)] text-[2rem] leading-none font-semibold tracking-[-0.025em] text-[var(--ch-green)] tabular-nums">
                    Serial {s.serial}
                  </p>
                  <p className="mt-4 text-xl font-medium">{s.name}</p>
                  <p className="mt-1 text-[var(--ch-muted)]">{s.post}</p>
                </li>
              ))}
            </ul>
            <ul className="divide-y divide-[var(--ch-line)] border-t border-[var(--ch-line)] lg:col-span-7 lg:border-t-0">
              {selections.map((s) => (
                <li key={s.serial} className="px-6 py-7 md:px-8">
                  <blockquote className="max-w-[52ch] text-lg leading-relaxed">
                    “{s.quote}”
                  </blockquote>
                  <p className="mt-3 text-sm text-[var(--ch-muted)]">
                    {s.name}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-sm text-[var(--ch-muted)]">
            APSC CCE 2022, result dated 17 January 2024,{" "}
            <a
              href={links.apscResultPdf}
              {...external}
              className="text-[var(--ch-text)] underline decoration-[var(--ch-gold)]"
            >
              checked against the official list
            </a>
            .
          </p>

          <h3 className="mt-16 font-[family-name:var(--ch-display)] text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance md:text-[1.75rem]">
            Serving officers who came to talk to the batch.
          </h3>
          <ul className="-mx-5 mt-6 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-5 pb-2 md:-mx-8 md:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
            {officers.map((o) => (
              <li
                key={o.id}
                className="w-[240px] shrink-0 snap-start lg:w-auto"
              >
                <a
                  href={o.href}
                  {...external}
                  className="block"
                  aria-label={`Watch ${o.name}, ${o.role}, on YouTube`}
                >
                  <Frame
                    src={o.image}
                    alt=""
                    sizes="(min-width: 1024px) 20vw, 240px"
                  />
                  <p className="mt-3 font-medium">{o.name}</p>
                  <p className="mt-0.5 text-sm text-[var(--ch-muted)]">
                    {o.role}
                  </p>
                  <p className="text-sm text-[var(--ch-muted)]">{o.detail}</p>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        {/* 6. Courses and fees: three hairline rows, then the included chips. */}
        <Section id="courses" className={container}>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 id="courses-heading" className={`${h2} lg:col-span-6`}>
              Three batches, one fee each.
            </h2>
            <p className="max-w-[48ch] text-[var(--ch-muted)] lg:col-span-6">
              One fee covers classes, tests, notes and the app. Scholarships are
              available through ICT&rsquo;s ASSIST test.
            </p>
          </div>
          <ul className="mt-10 border-t border-[var(--ch-line)]">
            {courses.map((c) => (
              <li
                key={c.slug}
                data-row
                className="-mx-3 grid gap-5 rounded-xl border-b border-[var(--ch-line)] px-3 py-7 md:grid-cols-[160px_1fr_auto] md:items-start md:gap-8"
              >
                {c.cover ? (
                  <div className="relative aspect-[4/3] w-40 overflow-hidden rounded-lg bg-[var(--ch-raised)] md:w-[160px]">
                    <Image
                      src={c.cover}
                      alt={`${c.name} course poster`}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] w-40 rounded-lg bg-[var(--ch-raised)]" />
                )}
                <div>
                  <p className="font-[family-name:var(--ch-display)] text-2xl leading-tight font-semibold tracking-[-0.02em]">
                    {c.name}
                    <span className="ml-3 font-[family-name:var(--ch-sans)] text-base font-normal text-[var(--ch-muted)]">
                      {c.exam}
                    </span>
                  </p>
                  <p className="mt-2 max-w-[52ch] text-[var(--ch-muted)]">
                    {c.covers}. {c.duration}.
                  </p>
                  <p className="mt-2 text-sm text-[var(--ch-muted)] tabular-nums">
                    {c.when ? c.when : "Timing on enquiry"}
                    {c.days ? ` · ${c.days}` : ""}
                    {c.note ? ` · ${c.note}` : ""}
                  </p>
                  <p className="mt-1.5 flex flex-wrap gap-x-2 text-sm text-[var(--ch-muted)]">
                    {c.faculty.map((f, i) => (
                      <span key={f.slug}>
                        {f.name}
                        {i < c.faculty.length - 1 ? "," : ""}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="flex items-end justify-between gap-6 md:flex-col md:items-end md:text-right">
                  {c.price !== null ? (
                    <p className="tabular-nums">
                      <span className="block font-[family-name:var(--ch-display)] text-[1.75rem] leading-none font-semibold tracking-[-0.02em]">
                        {rupees(c.price)}
                      </span>
                      {c.mrp !== null && c.mrp > c.price ? (
                        <s className="mt-1 block text-sm text-[var(--ch-muted)]">
                          {rupees(c.mrp)}
                        </s>
                      ) : null}
                    </p>
                  ) : (
                    <p className="text-[var(--ch-muted)]">Fee on enquiry</p>
                  )}
                  <Link
                    data-quiet
                    href={c.href}
                    className="text-sm text-[var(--ch-muted)] underline decoration-[var(--ch-line)]"
                  >
                    See the course
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm text-[var(--ch-muted)]">
            Every batch includes
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {included.map((item) => (
              <li
                key={item.text}
                className="rounded-full border border-[var(--ch-line)] px-3.5 py-1.5 text-sm"
              >
                {item.text}
              </li>
            ))}
          </ul>
        </Section>

        {/* 7. Podcast: the series at left, the top three episodes at right. */}
        <Section id="podcast" className={container}>
          <div className="grid gap-10 border-t border-[var(--ch-line)] pt-14 lg:grid-cols-12 lg:pt-20">
            <div className="lg:col-span-4">
              <h2 id="podcast-heading" className={h2}>
                {podcast.name}
              </h2>
              <p className="mt-3 text-[var(--ch-muted)]">{podcast.hosts}</p>
              <p className="mt-6 font-[family-name:var(--ch-display)] text-[2.25rem] leading-none font-semibold tracking-[-0.025em] text-[var(--ch-gold)] tabular-nums">
                {compact(podcast.seriesViews)}
                <span className="ml-2 font-[family-name:var(--ch-sans)] text-base font-normal tracking-normal text-[var(--ch-muted)]">
                  views across the series
                </span>
              </p>
              <p className="mt-6 max-w-[34ch] text-lg leading-relaxed">
                Axom Dhwani is the most watched thing on the channel.
              </p>
            </div>
            <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-3 lg:col-span-8">
              {episodes.map((e) => (
                <li key={e.id}>
                  <a
                    href={`https://www.youtube.com/watch?v=${e.id}`}
                    {...external}
                    className="block"
                    aria-label={`Watch ${e.title} on YouTube`}
                  >
                    <Frame
                      src={thumb(e.id)}
                      alt=""
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 100vw"
                    />
                    <p className="mt-3 font-medium">{e.title}</p>
                    <p className="mt-0.5 text-sm text-[var(--ch-muted)]">
                      {e.guest}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ch-gold)] tabular-nums">
                      {views(e.views)}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* 8. FAQ: plain list, no accordion. */}
        <Section id="questions" className={container}>
          <div className="grid gap-10 border-t border-[var(--ch-line)] pt-14 lg:grid-cols-12 lg:pt-20">
            <h2 id="questions-heading" className={`${h2} lg:col-span-4`}>
              Questions people ask before they call.
            </h2>
            <ul className="lg:col-span-8">
              {faqs.map((f) => (
                <li
                  key={f.q}
                  className="border-b border-[var(--ch-line)] py-6 first:border-t"
                >
                  <p className="text-lg font-medium">{f.q}</p>
                  <p className="mt-2 max-w-[66ch] leading-relaxed text-[var(--ch-muted)]">
                    {f.a}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* 9. Enquire: the gold-bordered panel. */}
        <Section id="enquire" className={container}>
          <div className="rounded-2xl border border-[var(--ch-gold)] px-6 py-10 md:px-12 md:py-14">
            <h2 id="enquire-heading" className={`${h2} max-w-[20ch]`}>
              Sit in on a class before you decide.
            </h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {joining.map((step) => (
                <li key={step.verb} className="max-w-[34ch]">
                  <p className="font-[family-name:var(--ch-display)] text-xl leading-tight font-semibold tracking-[-0.02em]">
                    {step.verb}
                  </p>
                  <p className="mt-2 text-[var(--ch-muted)]">{step.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                data-press
                data-primary
                href={whatsapp}
                {...external}
                className={primaryCta}
              >
                {offer.cta}
              </a>
              <a
                data-press
                data-secondary
                href={tel}
                className={`${secondaryCta} tabular-nums`}
              >
                <IconPhone aria-hidden size={18} stroke={1.75} />
                {callLabel}
              </a>
            </div>
          </div>
        </Section>
      </main>

      <footer className="border-t border-[var(--ch-line)]">
        <div
          className={`${container} grid gap-10 py-12 text-sm text-[var(--ch-muted)] md:grid-cols-12 md:py-16`}
        >
          <div className="md:col-span-5">
            <p className="flex items-center gap-2.5 font-[family-name:var(--ch-display)] text-base font-semibold text-[var(--ch-text)]">
              <Image
                src="/brand/ict-mark.png"
                alt=""
                width={28}
                height={28}
                className="size-7"
              />
              Impact Career Tutorials
            </p>
            <address className="mt-4 leading-relaxed not-italic">
              {place.street}
              <br />
              {place.city}, {place.region} {place.pin}
            </address>
            <a
              data-quiet
              href={place.maps}
              {...external}
              className="mt-2 inline-block underline decoration-[var(--ch-line)]"
            >
              Open in Google Maps
            </a>
          </div>
          <ul className="space-y-2 md:col-span-3">
            {contact.phones.map((p) => (
              <li key={p}>
                <a
                  data-quiet
                  href={`tel:${p}`}
                  className="tabular-nums underline decoration-[var(--ch-line)]"
                >
                  Call {p.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
                </a>
              </li>
            ))}
            <li>
              <a
                data-quiet
                href={`mailto:${contact.email}`}
                className="break-all underline decoration-[var(--ch-line)]"
              >
                {contact.email}
              </a>
            </li>
          </ul>
          <ul className="space-y-2 md:col-span-4">
            {[
              ["YouTube", links.youtube],
              ["Instagram", links.instagram],
              ["Facebook", links.facebook],
              ["ICT app on Google Play", links.play],
            ].map(([label, href]) => (
              <li key={href}>
                <a
                  data-quiet
                  href={href}
                  {...external}
                  className="underline decoration-[var(--ch-line)]"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <p className="md:col-span-12">
            Prototype for review. Not the live site.
          </p>
        </div>
      </footer>

      <PrototypeSwitcher current="channel" />
    </div>
  )
}
