import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandYoutube,
  IconPhone,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { Funnel_Display, Funnel_Sans } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { Book3D, bookCss, type BookTones } from "../_book"
import { Folder, folderCss, type FolderTones } from "../_folder"
import {
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
  podcast,
  proof,
  rupees,
  selections,
  shelf,
  tel,
  whatsapp,
  workshops,
} from "../_data"
import { Magnetic, ScrollWords, Tilt } from "../_fx"
import { Reveal } from "../_reveal"
import { PrototypeSwitcher } from "../_switcher"
import { HomeMenu, HomePromos } from "../_kit/home-extras"
import { tokens as siteTokens } from "./_site"
import { LectureGrid } from "./_client"

/**
 * Prototype 8: Stage. The teachers are the show.
 * Colour: committed dark. Charcoal ground with a warm-grey muted, vermilion
 * as the one accent (CTAs, play discs, the lit words). Portraits sit in
 * greyscale until they are the one in focus.
 */

const display = Funnel_Display({ subsets: ["latin"], variable: "--st-display" })
const sans = Funnel_Sans({ subsets: ["latin"], variable: "--st-sans" })

export const metadata: Metadata = { title: "Stage" }

const tokens = {
  "--st-bg": "#0D0D0F",
  "--st-raised": "#17171B",
  "--st-line": "rgba(242,240,236,0.09)",
  "--st-line-hi": "rgba(242,240,236,0.18)",
  "--st-text": "#F2F0EC",
  "--st-muted": "#A3A09A",
  "--st-red": "#F0592F",
  "--st-red-hi": "#FF6A3D",
  "--st-ease": "cubic-bezier(0.23, 1, 0.32, 1)",
  "--bk-shadow": "rgba(0,0,0,0.7)",
} as CSSProperties

const bookTones: BookTones = {
  primary: { bg: "#F0592F", ink: "#140A06", spine: "#C4431F" },
  highlight: { bg: "#F2F0EC", ink: "#0D0D0F", spine: "#C9C5BD" },
  muted: { bg: "#232329", ink: "#F2F0EC", spine: "#17171B" },
}

const folderTones: FolderTones = {
  back: "#26262C",
  front: "#34343C",
  paper: "#F2F0EC",
  ink: "#F2F0EC",
  muted: "#A3A09A",
}

const css = `
[data-st] ::selection { background: var(--st-red); color: var(--st-bg); }
[data-st] :focus-visible { outline: 2px solid var(--st-red); outline-offset: 3px; }
[data-st] h1, [data-st] h2, [data-st] h3 { font-family: var(--st-display); text-wrap: balance; }
[data-st] p { text-wrap: pretty; }
[data-st] [data-strong] { color: var(--st-red); }
[data-st] [data-press] { transition: transform 0.16s var(--st-ease), background-color 0.2s ease, box-shadow 0.2s ease; }
[data-st] [data-press]:active { transform: scale(0.97); }
@media (hover: hover) {
  [data-st] [data-primary]:hover { background-color: var(--st-red-hi); box-shadow: 0 12px 40px -10px rgba(240,89,47,0.6); }
  [data-st] [data-ghost]:hover { background-color: rgba(242,240,236,0.06); }
  [data-st] [data-quiet]:hover { color: var(--st-text); }
}
[data-st] [data-quiet] { transition: color 0.15s ease; }

@keyframes st-rise { from { opacity: 0; transform: translateY(16px); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes st-strip { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
[data-st] [data-rise] { animation: st-rise 0.9s var(--st-ease) both; }

/* The teacher accordion. The first strip is open until another is pointed at. */
[data-acc] { display: flex; gap: 8px; height: min(560px, 68dvh); }
[data-strip] { position: relative; flex: 1 1 0; min-width: 0; overflow: hidden; border-radius: 22px; background: #0E1E3A;
  transition: flex-grow 0.7s var(--st-ease); animation: st-strip 0.9s var(--st-ease) both; }
[data-strip] img { filter: grayscale(1) contrast(1.08) brightness(0.8); transition: filter 0.6s var(--st-ease), transform 0.8s var(--st-ease); }
[data-strip] [data-cap] { opacity: 0; transform: translateY(8px); transition: opacity 0.3s ease, transform 0.4s var(--st-ease); }
[data-acc]:not(:hover):not(:focus-within) [data-strip]:first-child,
[data-strip]:hover, [data-strip]:focus-within { flex-grow: 5; }
[data-acc]:not(:hover):not(:focus-within) [data-strip]:first-child img,
[data-strip]:hover img, [data-strip]:focus-within img { filter: none; transform: scale(1.02); }
[data-acc]:not(:hover):not(:focus-within) [data-strip]:first-child [data-cap],
[data-strip]:hover [data-cap], [data-strip]:focus-within [data-cap] { opacity: 1; transform: none; transition-delay: 0.15s; }

/* A pool of light on the stage floor under the books. */
[data-floor] { background: radial-gradient(60% 55% at 50% 100%, rgba(240,89,47,0.16), transparent 70%), radial-gradient(40% 30% at 50% 100%, rgba(242,240,236,0.08), transparent 70%); }

[data-ep] [data-ep-thumb] { opacity: 0; transform: translateY(-50%) scale(0.92) rotate(-3deg); transition: opacity 0.25s ease, transform 0.4s var(--st-ease); }
@media (hover: hover) { [data-ep]:hover [data-ep-thumb] { opacity: 1; transform: translateY(-50%) scale(1) rotate(-3deg); } }
[data-ep] [data-ep-title] { transition: transform 0.35s var(--st-ease), color 0.2s ease; }
[data-ep]:hover [data-ep-title] { transform: translateX(8px); color: var(--st-text); }

@keyframes st-marquee { to { transform: translateX(-50%); } }
[data-st-marquee] { -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); }
[data-st-track] { animation: st-marquee 50s linear infinite; }
[data-st-marquee]:hover [data-st-track], [data-st-marquee]:focus-within [data-st-track] { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  [data-strip], [data-st-track] { animation: none; }
  [data-strip] { transition: none; }
  [data-st-marquee] { overflow-x: auto; }
}
`

const external = { target: "_blank", rel: "noreferrer noopener" } as const
const container = "mx-auto w-full max-w-[1280px] px-5 md:px-8"
const h2 =
  "text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[0.98] font-semibold tracking-[-0.035em]"

function PrimaryCta() {
  return (
    <Magnetic>
      <a
        data-press
        data-primary
        href={whatsapp}
        {...external}
        className="group inline-flex h-12 items-center gap-2 rounded-full bg-[var(--st-red)] px-6 font-semibold text-[var(--st-bg)]"
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

export default async function Stage() {
  const { books, folders, samples } = await shelf()
  const [first, ...rest] = courses
  const numberParts = [
    { text: `${proof[0].display} people`, strong: true },
    { text: "subscribe to ICT's free classes on YouTube. The app has" },
    { text: `${proof[1].display} installs`, strong: true },
    { text: "and" },
    { text: `${proof[2].display} hours`, strong: true },
    { text: "of recorded class." },
    { text: "Two officers", strong: true },
    { text: "on the APSC CCE 2022 list prepared here." },
  ]
  const sources = [
    "YouTube channel",
    "Play Store listing",
    "Recorded classes",
    "APSC result",
  ]

  return (
    <div
      data-st
      style={tokens}
      className={`${display.variable} ${sans.variable} min-h-[100dvh] bg-[var(--st-bg)] font-[family-name:var(--st-sans)] text-[var(--st-text)] antialiased`}
    >
      <style>{css + bookCss + folderCss}</style>

      <HomePromos slug="stage" tokens={siteTokens} bar={false} />

      <header className="absolute inset-x-0 top-0 z-40">
        <div className={`${container} flex h-[72px] items-center gap-8`}>
          <a href="#top" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-[10px] bg-[var(--st-text)]">
              <Image
                src="/brand/ict-mark.png"
                alt=""
                width={28}
                height={28}
                className="size-7"
              />
            </span>
            <span className="hidden font-[family-name:var(--st-display)] font-semibold sm:inline">
              Impact Career Tutorials
            </span>
          </a>
          <nav
            aria-label="Sections"
            className="ml-auto hidden items-center gap-7 text-sm text-[var(--st-muted)] md:flex"
          >
            <a data-quiet href="#lectures">
              Watch
            </a>
            <a data-quiet href="#books">
              Books and notes
            </a>
            <a data-quiet href="#courses">
              Courses
            </a>
            <a data-quiet href="#podcast">
              Podcast
            </a>
            <Link data-quiet href="/prototypes/stage/notes">
              Free notes
            </Link>
            <Link data-quiet href="/prototypes/stage/contact">
              Contact
            </Link>
          </nav>
          <a
            data-press
            data-primary
            href={whatsapp}
            {...external}
            className="ml-auto inline-flex h-10 items-center rounded-full bg-[var(--st-red)] px-4 text-sm font-semibold whitespace-nowrap text-[var(--st-bg)] md:ml-0"
          >
            {offer.cta}
          </a>
          <HomeMenu slug="stage" tokens={siteTokens} />
        </div>
      </header>

      <main id="top">
        {/* Hero: the promise left, the five teachers as an accordion right. */}
        <section
          aria-label="Introduction"
          className="pt-28 pb-16 md:pt-32 md:pb-24"
        >
          <div
            className={`${container} grid items-center gap-12 lg:grid-cols-12`}
          >
            <div className="lg:col-span-5">
              <h1
                data-rise
                className="text-[clamp(2.4rem,3.9vw,3.5rem)] leading-[0.98] font-semibold tracking-[-0.04em]"
              >
                Meet the teachers before you pay.
              </h1>
              <p
                data-rise
                style={{ animationDelay: "0.1s" }}
                className="mt-6 max-w-[44ch] text-lg text-[var(--st-muted)]"
              >
                APSC, ADRE, Assam Police and banking in North Lakhimpur. Watch
                them teach free, then sit in on a class.
              </p>
              <div
                data-rise
                style={{ animationDelay: "0.2s" }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <PrimaryCta />
                <a
                  data-press
                  data-ghost
                  href="#lectures"
                  className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-medium shadow-[inset_0_0_0_1px_var(--st-line-hi)]"
                >
                  <IconPlayerPlayFilled aria-hidden size={15} />
                  Watch a class
                </a>
              </div>
            </div>
            <div className="lg:col-span-7">
              <ul data-acc aria-label="Teachers">
                {faculty.map((f, i) => (
                  <li
                    key={f.slug}
                    data-strip
                    style={{ animationDelay: `${0.15 + i * 0.07}s` }}
                  >
                    <a
                      href={`https://www.youtube.com/watch?v=${f.lecture}`}
                      {...external}
                      className="absolute inset-0"
                    >
                      <Image
                        src={f.portrait}
                        alt={`${f.name}, ${f.teaches}`}
                        fill
                        priority={i === 0}
                        loading={i === 0 ? undefined : "eager"}
                        sizes="(min-width: 1024px) 420px, 60vw"
                        className="object-cover object-top"
                      />
                      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(13,13,15,0.92),transparent)]" />
                      <span
                        data-cap
                        className="absolute inset-x-0 bottom-0 p-5 whitespace-nowrap md:p-6"
                      >
                        <span className="block font-[family-name:var(--st-display)] text-2xl font-semibold tracking-[-0.02em]">
                          {f.name}
                        </span>
                        <span className="block text-sm text-[var(--st-muted)]">
                          {f.teaches}
                        </span>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--st-red)]">
                          <IconPlayerPlayFilled aria-hidden size={13} />
                          Watch a class
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* The numbers as one sentence that lights up word by word. */}
        <section aria-label="In numbers" className="py-16 md:py-28">
          <div className={container}>
            <ScrollWords
              parts={numberParts}
              className="max-w-[26ch] font-[family-name:var(--st-display)] text-[clamp(1.9rem,4.2vw,3.6rem)] leading-[1.12] font-semibold tracking-[-0.03em]"
            />
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--st-muted)]">
              <span>Sources</span>
              {proof.map((p, i) => (
                <a
                  key={p.label}
                  data-quiet
                  href={p.href}
                  {...external}
                  className="inline-flex items-center gap-1 underline decoration-[var(--st-line-hi)] underline-offset-4"
                >
                  {sources[i]}
                  <IconArrowUpRight aria-hidden size={14} stroke={1.75} />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Lectures: press one and it opens in place. */}
        <section
          id="lectures"
          aria-labelledby="lec-h"
          className="py-16 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="lec-h" className={`${h2} mb-12 max-w-[16ch]`}>
                Watch a full class, right here.
              </h2>
            </Reveal>
            <LectureGrid
              items={classes.slice(0, 5).map((c) => ({
                id: c.id,
                title: c.title,
                by: c.by,
                views: compact(c.views),
                image: c.image,
              }))}
            />
          </div>
        </section>

        {/* Books on a lit stage, free notes as a rail beneath. */}
        <section
          id="books"
          aria-labelledby="books-h"
          className="py-16 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="books-h" className={`${h2} max-w-[18ch]`}>
                ICT&apos;s books. And notes you read free.
              </h2>
              {samples && (
                <p className="mt-4 text-sm text-[var(--st-muted)]">
                  Sample titles for now. ICT&apos;s own books and notes replace
                  them before launch.
                </p>
              )}
            </Reveal>
            <div
              data-floor
              className="mt-10 rounded-[32px] px-2 pt-12 pb-6 md:px-10"
            >
              <ul className="grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-4 md:gap-x-10">
                {books.map((b, i) => (
                  <li key={b.slug} className="min-w-0">
                    <Reveal delay={i * 0.07}>
                      <Link data-bk-hover href={b.href} className="group block">
                        <Book3D
                          book={b}
                          tones={bookTones}
                          font="var(--st-display)"
                        />
                        <span className="mt-4 flex items-baseline justify-between gap-3 px-[18px]">
                          <span className="truncate font-medium">
                            {b.title}
                          </span>
                          <span className="shrink-0 text-sm text-[var(--st-muted)] tabular-nums">
                            {b.price}
                          </span>
                        </span>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-16 flex items-baseline justify-between gap-4">
              <h3 className="text-2xl font-semibold tracking-[-0.02em]">
                Free study material
              </h3>
              <Link
                href="/resources"
                data-quiet
                className="text-sm text-[var(--st-muted)]"
              >
                Log in once to read them all
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
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
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {workshops.map((w) => (
                <Link
                  key={w.name}
                  href={w.href}
                  className="group flex items-center gap-4 rounded-[22px] bg-[var(--st-raised)] p-3 shadow-[inset_0_0_0_1px_var(--st-line)] transition-shadow duration-200 hover:shadow-[inset_0_0_0_1px_var(--st-line-hi)]"
                >
                  {w.cover && (
                    <span className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-[14px]">
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
                    <span className="block font-medium">
                      {w.name}, a free workshop on the app
                    </span>
                    <span className="block truncate text-sm text-[var(--st-muted)]">
                      {w.subtitle}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Courses: the APSC flagship large, the other two stacked. */}
        <section
          id="courses"
          aria-labelledby="courses-h"
          className="py-16 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="courses-h" className={`${h2} mb-12 max-w-[16ch]`}>
                Three courses. One fee each.
              </h2>
            </Reveal>
            <div className="grid gap-4 lg:grid-cols-12">
              {first && (
                <Link
                  href={first.href}
                  className="group flex flex-col rounded-[28px] bg-[var(--st-raised)] p-3 shadow-[inset_0_0_0_1px_var(--st-line)] lg:col-span-7"
                >
                  {first.cover && (
                    <Tilt max={4}>
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-[20px]">
                        <Image
                          src={first.cover}
                          alt={`${first.name} poster`}
                          fill
                          sizes="(min-width: 1024px) 700px, 100vw"
                          className="object-cover"
                        />
                      </span>
                    </Tilt>
                  )}
                  <span className="flex flex-wrap items-end justify-between gap-4 p-5 pt-6">
                    <span>
                      <span className="block text-sm text-[var(--st-muted)]">
                        {first.full}
                      </span>
                      <span className="block font-[family-name:var(--st-display)] text-3xl font-semibold tracking-[-0.03em]">
                        {first.name}
                      </span>
                      <span className="block text-sm text-[var(--st-muted)] tabular-nums">
                        {first.when}, {first.days}
                      </span>
                    </span>
                    {first.price && (
                      <span className="text-right tabular-nums">
                        <span className="block text-3xl font-semibold">
                          {rupees(first.price)}
                        </span>
                        {first.mrp && (
                          <s className="text-sm text-[var(--st-muted)]">
                            {rupees(first.mrp)}
                          </s>
                        )}
                      </span>
                    )}
                  </span>
                </Link>
              )}
              <div className="grid gap-4 lg:col-span-5">
                {rest.map((c) => (
                  <Link
                    key={c.slug}
                    href={c.href}
                    className="group grid grid-cols-[1fr_1.1fr] items-center gap-4 rounded-[28px] bg-[var(--st-raised)] p-3 shadow-[inset_0_0_0_1px_var(--st-line)]"
                  >
                    {c.cover && (
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-[20px]">
                        <Image
                          src={c.cover}
                          alt={`${c.name} poster`}
                          fill
                          sizes="260px"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                      </span>
                    )}
                    <span className="py-2 pr-3">
                      <span className="block text-sm text-[var(--st-muted)]">
                        {c.exam}
                      </span>
                      <span className="block font-[family-name:var(--st-display)] text-2xl font-semibold tracking-[-0.02em]">
                        {c.name}
                      </span>
                      <span className="mt-1 block text-sm text-[var(--st-muted)] tabular-nums">
                        {c.when ?? c.duration}
                      </span>
                      {c.price && (
                        <span className="mt-4 block text-xl font-semibold tabular-nums">
                          {rupees(c.price)}
                        </span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Podcast: episode list with a thumbnail that appears on hover. */}
        <section
          id="podcast"
          aria-labelledby="pod-h"
          className="py-16 md:py-24"
        >
          <div className={`${container} grid gap-12 lg:grid-cols-12`}>
            <div className="lg:col-span-4">
              <h2 id="pod-h" className={h2}>
                {podcast.name}
              </h2>
              <p className="mt-5 text-[var(--st-muted)]">
                ICT&apos;s podcast, hosted by {podcast.hosts}. The most watched
                thing on the channel.
              </p>
              <p className="mt-8 font-[family-name:var(--st-display)] text-5xl font-semibold tracking-[-0.03em] text-[var(--st-red)] tabular-nums">
                {podcast.seriesViews.toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-[var(--st-muted)]">
                views across the series
              </p>
            </div>
            <ul className="border-t border-[var(--st-line)] lg:col-span-8">
              {podcast.episodes.map((e) => (
                <li key={e.id} className="border-b border-[var(--st-line)]">
                  <a
                    data-ep
                    href={`https://www.youtube.com/watch?v=${e.id}`}
                    {...external}
                    className="relative grid grid-cols-[1fr_auto] items-center gap-6 py-5"
                  >
                    <span>
                      <span
                        data-ep-title
                        className="block font-[family-name:var(--st-display)] text-xl font-semibold tracking-[-0.015em] text-[#DCD9D3] md:text-2xl"
                      >
                        {e.title}
                      </span>
                      <span className="block text-sm text-[var(--st-muted)]">
                        {e.guest}
                      </span>
                    </span>
                    <span className="text-sm text-[var(--st-muted)] tabular-nums">
                      {compact(e.views)}
                    </span>
                    <span
                      data-ep-thumb
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 right-24 z-10 hidden aspect-video w-56 overflow-hidden rounded-[14px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] md:block"
                    >
                      <Image
                        src={`/yt/${e.id}.jpg`}
                        alt=""
                        fill
                        sizes="224px"
                        className="object-cover"
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Results, then the officers as the page's one marquee. */}
        <section aria-labelledby="results-h" className="py-16 md:py-24">
          <div className={container}>
            <Reveal>
              <h2 id="results-h" className={`${h2} max-w-[20ch]`}>
                Two names on the APSC CCE 2022 list prepared here.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
              {selections.map((s) => (
                <figure
                  key={s.name}
                  className="border-t border-[var(--st-line-hi)] pt-6"
                >
                  <blockquote className="font-[family-name:var(--st-display)] text-2xl leading-snug font-medium tracking-[-0.015em]">
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-baseline gap-4">
                    <span className="font-[family-name:var(--st-display)] text-4xl font-semibold text-[var(--st-red)] tabular-nums">
                      {s.serial}
                    </span>
                    <span>
                      <span className="block font-medium">{s.name}</span>
                      <span className="text-sm text-[var(--st-muted)]">
                        {s.post}
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
              className="mt-8 inline-flex items-center gap-1 text-sm text-[var(--st-muted)] underline decoration-[var(--st-line-hi)] underline-offset-4"
            >
              Serials as printed in the result of 17 January 2024
              <IconArrowUpRight aria-hidden size={15} stroke={1.75} />
            </a>
          </div>
          <div className="mt-20">
            <p className={`${container} mb-6 text-[var(--st-muted)]`}>
              Serving officers who came to talk to the batch
            </p>
            <div data-st-marquee className="overflow-hidden">
              <ul data-st-track className="flex w-max gap-4 px-4">
                {[...officers, ...officers].map((o, i) => {
                  const copy = i >= officers.length
                  return (
                    <li key={`${o.id}-${i}`} aria-hidden={copy || undefined}>
                      <a
                        href={o.href}
                        {...external}
                        tabIndex={copy ? -1 : undefined}
                        className="group flex w-[380px] items-center gap-4 rounded-[20px] bg-[var(--st-raised)] p-2 pr-5 shadow-[inset_0_0_0_1px_var(--st-line)]"
                      >
                        <span className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-[14px]">
                          <Image
                            src={o.image}
                            alt=""
                            fill
                            sizes="144px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {o.name}
                          </span>
                          <span className="block truncate text-sm text-[var(--st-muted)]">
                            {o.role}
                          </span>
                          <span className="block truncate text-sm text-[var(--st-muted)]">
                            {o.detail}
                          </span>
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* Questions as a two-column list, no accordion. */}
        <section aria-labelledby="faq-h" className="py-16 md:py-24">
          <div className={container}>
            <h2 id="faq-h" className={`${h2} mb-12`}>
              Questions.
            </h2>
            <dl className="grid gap-x-16 gap-y-10 md:grid-cols-2">
              {faqs.map((f) => (
                <div key={f.q}>
                  <dt className="font-[family-name:var(--st-display)] text-xl font-semibold tracking-[-0.01em]">
                    {f.q}
                  </dt>
                  <dd className="mt-2 text-[var(--st-muted)]">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Enquire */}
        <section aria-labelledby="join-h" className="py-20 md:py-32">
          <div className={`${container} text-center`}>
            <h2
              id="join-h"
              className="mx-auto max-w-[12ch] text-[clamp(3rem,8vw,6rem)] leading-[0.92] font-semibold tracking-[-0.045em]"
            >
              Sit in on a class.
            </h2>
            <ol className="mx-auto mt-12 grid max-w-4xl gap-6 text-left md:grid-cols-3">
              {joining.map((j) => (
                <li
                  key={j.verb}
                  className="border-t border-[var(--st-line-hi)] pt-4"
                >
                  <p className="font-semibold">{j.verb}</p>
                  <p className="mt-1 text-sm text-[var(--st-muted)]">
                    {j.body}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <PrimaryCta />
              <a
                data-press
                data-ghost
                href={tel}
                className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-medium tabular-nums shadow-[inset_0_0_0_1px_var(--st-line-hi)]"
              >
                <IconPhone aria-hidden size={18} stroke={1.75} />
                Call {phone}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--st-line)] pt-10 pb-28 text-sm text-[var(--st-muted)]">
        <div className={`${container} grid gap-6 md:grid-cols-12`}>
          <address className="not-italic md:col-span-5">
            <span className="block font-medium text-[var(--st-text)]">
              Impact Career Tutorials
            </span>
            {place.street}, {place.city}, {place.region} {place.pin}
            <a
              data-quiet
              href={place.maps}
              {...external}
              className="mt-1 block underline underline-offset-4"
            >
              Open in Google Maps
            </a>
          </address>
          <div className="grid gap-1 md:col-span-4">
            {contact.phones.map((p) => (
              <a key={p} data-quiet href={`tel:${p}`} className="tabular-nums">
                {p.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
              </a>
            ))}
            <a data-quiet href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </div>
          <div className="flex gap-1 md:col-span-3 md:justify-end">
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
                data-ghost
                className="grid size-11 place-items-center rounded-full"
              >
                <Icon aria-hidden size={19} stroke={1.5} />
              </a>
            ))}
          </div>
          <p className="md:col-span-12">
            Prototype for review. Not the live site.
          </p>
        </div>
      </footer>

      <PrototypeSwitcher current="stage" />
    </div>
  )
}
