import {
  IconArrowUpRight,
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconBrandYoutube,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { Epilogue } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { formatPhone } from "@/lib/brand"

import {
  campus,
  compact,
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
  shelf,
  tel,
  whatsapp,
} from "../_data"
import { Book3D } from "../_book"
import { barCampaign, campaign } from "../_campaign"
import { EnquiryForm } from "../_enquiry"
import { FolderBrowser } from "../_folder-browser"
import { KitIsland } from "../_kit/island"
import { SitePromoLayer } from "../_kit/site-layer"
import { bookTones, folderTones } from "../_kit/shared"
import { PrototypeSwitcher } from "../_switcher"
import { HomeMenu } from "../_kit/home-extras"
import { islandTokens } from "./_island"

const sans = Epilogue({ subsets: ["latin"], variable: "--gm-sans" })

export const metadata: Metadata = { title: "Gamusa" }

/**
 * Colour: committed. The gamusa's two colours and nothing else. Cream is the
 * cloth, red is the woven border, and the red carries about 40% of the page:
 * the hero field, the enquire field, the border bands and the primary CTA.
 * Ink for type on cream; on red, type is cream and secondary text is tinted
 * from the red (#F5D6D2, 4.8:1), never grey. Hairlines are ink at 12%.
 * Contrast: cream on red 5.9:1, muted on cream 5.1:1, red on cream 5.9:1.
 */
const tokens = {
  "--gm-cream": "#F7F3EA",
  "--gm-red": "#B3261E",
  "--gm-ink": "#141414",
  "--gm-red-soft": "#F5D6D2",
  "--gm-muted": "#6B655C",
  "--gm-line": "rgba(20, 20, 20, 0.12)",
  "--gm-tile": "#0B1A3A",
  "--gm-ease": "cubic-bezier(0.23, 1, 0.32, 1)",
} as CSSProperties

const css = `
[data-gm] ::selection { background: var(--gm-red); color: var(--gm-cream); }
[data-gm] [data-red] ::selection { background: var(--gm-cream); color: var(--gm-red); }
[data-gm] :focus-visible { outline: 2px solid var(--gm-ink); outline-offset: 3px; border-radius: 2px; }
[data-gm] [data-red] :focus-visible { outline-color: var(--gm-cream); }
[data-gm] a { text-underline-offset: 0.2em; }
[data-press] {
  transition-property: transform, background-color, color, border-color, opacity;
  transition-duration: 200ms;
  transition-timing-function: var(--gm-ease);
}
[data-press]:active { transform: scale(0.98); }
[data-cta] { position: relative; isolation: isolate; overflow: hidden; background: var(--gm-cream); color: var(--gm-red); }
[data-cta]::before {
  content: ""; position: absolute; inset: 0; z-index: -1; background: var(--gm-ink);
  clip-path: inset(0 100% 0 0);
  transition: clip-path 220ms var(--gm-ease);
}
[data-cta]:hover { color: var(--gm-cream); }
[data-cta]:hover::before { clip-path: inset(0 0 0 0); }
[data-lift] { transition: transform 200ms var(--gm-ease); }
[data-lift]:hover { transform: translateY(-2px); }
[data-lift]:active { transform: scale(0.98); }
[data-play] { transition: transform 200ms var(--gm-ease); }
a:hover [data-play] { transform: scale(1.06); }
@keyframes gm-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
[data-rise] { animation: gm-rise 800ms var(--gm-ease) both; }
[data-strip] { scrollbar-width: none; }
[data-strip]::-webkit-scrollbar { display: none; }
@media (prefers-reduced-motion: reduce) {
  [data-rise] { animation: none; }
  [data-cta]::before, [data-press], [data-lift], [data-play] { transition: none; }
}
`

const wrap = "mx-auto w-full max-w-[1280px] px-5 md:px-8"
const h2 =
  "text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl lg:text-5xl"
const ctaBase =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold"
const youtube = (id: string) => `https://www.youtube.com/watch?v=${id}`
const external = { target: "_blank", rel: "noreferrer noopener" } as const

/**
 * The woven border of a gamusa as vector geometry: a row of small red
 * diamonds between two red threads, on cream. One SVG pattern, reused.
 */
function WovenBand({ id }: { id: string }) {
  const pid = `gm-weave-${id}`
  return (
    <svg aria-hidden="true" className="block h-3 w-full">
      <defs>
        <pattern id={pid} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M6 2 L10 6 L6 10 L2 6 Z" fill="var(--gm-red)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="var(--gm-cream)" />
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
      <rect width="100%" height="1" fill="var(--gm-red)" />
      <rect y="11" width="100%" height="1" fill="var(--gm-red)" />
    </svg>
  )
}

function PlayDisc({ size = "h-10 w-10" }: { size?: string }) {
  return (
    <span
      aria-hidden="true"
      data-play=""
      className={`grid ${size} place-items-center rounded-full bg-[var(--gm-cream)] text-[var(--gm-red)]`}
    >
      <IconPlayerPlayFilled className="h-4 w-4 translate-x-px" />
    </span>
  )
}

function TallPhoto({
  photo,
  priority,
  sizes,
  className = "",
}: {
  photo: (typeof campus)[number]
  priority?: boolean
  sizes: string
  className?: string
}) {
  return (
    <div
      data-rise=""
      className={`relative aspect-[9/16] overflow-hidden rounded-2xl bg-[var(--gm-ink)] ${className}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  )
}

const BASE = "/prototypes/gamusa"

export default async function Gamusa() {
  const secondPhone = formatPhone(contact.phones[1])
  const { books, folders, samples } = await shelf()

  return (
    <div
      style={tokens}
      data-gm=""
      className={`${sans.variable} min-h-[100dvh] bg-[var(--gm-cream)] font-[family-name:var(--gm-sans)] text-[var(--gm-ink)] antialiased`}
    >
      <style>{css}</style>

      <KitIsland theme="gamusa" tokens={islandTokens}>
        <SitePromoLayer
          base={BASE}
          bar={{ ...barCampaign(BASE), href: "#courses" }}
          campaign={campaign}
          parts={{ bar: true, modal: true, reel: true }}
        />
      </KitIsland>

      <WovenBand id="top" />

      {/* Red field: nav, hero copy and the photo pair that hangs over the fold. */}
      <header data-red="" className="bg-[var(--gm-red)] text-[var(--gm-cream)]">
        <div
          className={`${wrap} flex h-16 items-center justify-between gap-4 lg:h-[72px]`}
        >
          <Link
            href="/prototypes/gamusa"
            data-press=""
            className="flex min-h-11 items-center gap-3 rounded-lg font-semibold"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--gm-cream)]">
              <Image
                src="/brand/ict-mark.png"
                alt=""
                width={28}
                height={28}
                priority
              />
            </span>
            <span className="hidden sm:inline">Impact Career Tutorials</span>
          </Link>
          <nav
            aria-label="Sections"
            className="hidden items-center gap-7 text-sm font-medium md:flex"
          >
            <a href="#courses" className="py-3 hover:underline">
              Courses
            </a>
            <a href="#teachers" className="py-3 hover:underline">
              Teachers
            </a>
            <a href="#results" className="py-3 hover:underline">
              Results
            </a>
            <a href="#campus" className="py-3 hover:underline">
              Campus
            </a>
            <Link
              href="/prototypes/gamusa/books"
              className="py-3 hover:underline"
            >
              Books
            </Link>
            <Link
              href="/prototypes/gamusa/notes"
              className="py-3 hover:underline"
            >
              Free notes
            </Link>
            <Link
              href="/prototypes/gamusa/contact"
              className="py-3 hover:underline"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={tel}
              className="hidden min-h-11 items-center gap-2 px-3 text-sm font-medium tabular-nums hover:underline lg:inline-flex"
            >
              <IconPhone aria-hidden="true" className="h-4 w-4" stroke={1.75} />
              Call {phone}
            </a>
            <a
              href={whatsapp}
              {...external}
              data-press=""
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--gm-cream)] px-4 text-sm font-semibold hover:bg-[var(--gm-cream)] hover:text-[var(--gm-red)]"
            >
              {offer.cta}
            </a>
          </div>
          <HomeMenu slug="gamusa" tokens={islandTokens} />
        </div>
      </header>

      <main id="main">
        <div data-red="" className="bg-[var(--gm-red)] text-[var(--gm-cream)]">
          <section
            aria-labelledby="hero-title"
            className={`${wrap} grid gap-10 pt-8 pb-10 lg:grid-cols-12 lg:items-start lg:gap-8 lg:pt-14 lg:pb-28`}
          >
            <div className="lg:col-span-7 lg:pt-6">
              <h1
                id="hero-title"
                data-rise=""
                className="max-w-[14ch] text-[2.75rem] leading-[1.02] font-bold tracking-[-0.03em] text-balance sm:text-6xl lg:text-[4.5rem] xl:text-[4.75rem]"
              >
                Assam&rsquo;s exams, taught in Assam.
              </h1>
              <p
                data-rise=""
                className="mt-6 max-w-[36ch] text-lg leading-snug text-[var(--gm-red-soft)] [animation-delay:80ms] sm:text-xl"
              >
                APSC, ADRE, Assam Police and banking batches in North Lakhimpur,
                by teachers who sit the same syllabus with you.
              </p>
              <div
                data-rise=""
                className="mt-9 flex flex-col gap-3 [animation-delay:160ms] sm:flex-row"
              >
                <a
                  href={whatsapp}
                  {...external}
                  data-cta=""
                  data-press=""
                  className={ctaBase}
                >
                  <IconBrandWhatsapp
                    aria-hidden="true"
                    className="h-5 w-5"
                    stroke={1.75}
                  />
                  {offer.cta}
                </a>
                <a
                  href={tel}
                  data-press=""
                  className={`${ctaBase} border border-[var(--gm-cream)] tabular-nums hover:bg-[var(--gm-cream)] hover:text-[var(--gm-red)]`}
                >
                  <IconPhone
                    aria-hidden="true"
                    className="h-5 w-5"
                    stroke={1.75}
                  />
                  Call {phone}
                </a>
              </div>
            </div>

            {/* The pair hangs 48px apart and continues past the red field onto cream. */}
            <div className="relative z-10 -mb-16 grid grid-cols-2 gap-4 lg:col-span-5 lg:-mb-36 lg:gap-6">
              <TallPhoto
                photo={campus[0]}
                priority
                sizes="(min-width: 1024px) 260px, 45vw"
                className="[animation-delay:120ms]"
              />
              <TallPhoto
                photo={campus[3]}
                priority
                sizes="(min-width: 1024px) 260px, 45vw"
                className="mt-12 [animation-delay:200ms]"
              />
            </div>
          </section>

          <WovenBand id="fold" />
        </div>

        {/* Proof: four figures as one ruled row of ink on cream, left of the hanging photos. */}
        <section
          aria-label="Figures you can check"
          className={`${wrap} pt-24 pb-16 lg:grid lg:grid-cols-12 lg:gap-8 lg:pt-20 lg:pb-24`}
        >
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:col-span-7 lg:gap-x-8">
            {proof.map((p) => (
              <li
                key={p.label}
                className="border-b border-[var(--gm-line)] pb-5"
              >
                <a href={p.href} {...external} className="group block">
                  <span className="block text-5xl font-semibold tracking-[-0.03em] tabular-nums sm:text-6xl">
                    {p.display}
                  </span>
                  <span className="mt-3 block max-w-[22ch] text-sm leading-snug text-[var(--gm-muted)] group-hover:text-[var(--gm-ink)] group-hover:underline">
                    {p.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Results: two stamps with the serial as the largest type, then the officers who came to talk. */}
        <section
          id="results"
          aria-labelledby="results-title"
          className={`${wrap} pb-20 lg:pb-28`}
        >
          <h2 id="results-title" className={`${h2} max-w-[18ch]`}>
            Two officers who prepared at ICT.
          </h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:gap-8">
            {selections.map((s) => (
              <li
                key={s.serial}
                className="flex flex-col rounded-2xl border border-[var(--gm-red)] p-6 sm:p-8"
              >
                <p className="text-[4.5rem] leading-none font-bold tracking-[-0.03em] text-[var(--gm-red)] tabular-nums sm:text-[6rem]">
                  <span className="text-2xl font-semibold tracking-normal text-[var(--gm-ink)] sm:text-3xl">
                    No.{" "}
                  </span>
                  {s.serial}
                </p>
                <p className="mt-6 text-2xl font-semibold tracking-[-0.02em]">
                  {s.name}
                </p>
                <p className="text-[var(--gm-muted)]">{s.post}</p>
                <blockquote className="mt-6 max-w-[44ch] border-t border-[var(--gm-line)] pt-5 text-lg leading-snug">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-[var(--gm-muted)]">
            APSC CCE 2022, result dated 17 January 2024, serials{" "}
            <a
              href={links.apscResultPdf}
              {...external}
              className="underline hover:text-[var(--gm-ink)]"
            >
              checked against the official list
            </a>
            .
          </p>

          <h3 className="mt-20 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
            Serving officers who came to speak to the batch.
          </h3>
          <p className="mt-2 max-w-[60ch] text-[var(--gm-muted)]">
            From ICT&rsquo;s Bijoyee Bartalaap sessions, recorded on the
            channel.
          </p>
          <ul
            data-strip=""
            className="-mx-5 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 md:-mx-8 md:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0"
          >
            {officers.map((o) => (
              <li
                key={o.id}
                className="w-[200px] shrink-0 snap-start lg:w-auto"
              >
                <a
                  href={o.href}
                  {...external}
                  data-lift=""
                  className="group block rounded-xl"
                >
                  <span className="relative block aspect-video overflow-hidden rounded-xl bg-[var(--gm-ink)]">
                    <Image
                      src={o.image}
                      alt={`${o.name}, ${o.role}, speaking to ICT students`}
                      fill
                      sizes="(min-width: 1024px) 240px, 200px"
                      className="object-cover opacity-90 transition-opacity duration-200 group-hover:opacity-100"
                    />
                    <span className="absolute bottom-2 left-2">
                      <PlayDisc size="h-9 w-9" />
                    </span>
                  </span>
                  <span className="mt-3 block leading-tight font-semibold">
                    {o.name}
                  </span>
                  <span className="block text-sm text-[var(--gm-muted)]">
                    {o.role}
                  </span>
                  <span className="block text-sm text-[var(--gm-muted)] tabular-nums">
                    {compact(o.views)} views
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Faculty: five portraits in red-outlined frames on their own dark tile. */}
        <section
          id="teachers"
          aria-labelledby="teachers-title"
          className={`${wrap} pb-20 lg:pb-28`}
        >
          <div className="flex flex-col gap-4 border-t border-[var(--gm-line)] pt-10 lg:flex-row lg:items-end lg:justify-between">
            <h2 id="teachers-title" className={`${h2} max-w-[16ch]`}>
              Teachers you can watch before you meet.
            </h2>
            <p className="max-w-[40ch] text-[var(--gm-muted)]">
              Every portrait is cut from a lecture the teacher gave. The link
              under each one opens that class.
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
            {faculty.map((f) => (
              <li key={f.slug} className="max-w-[280px]">
                <div className="rounded-2xl border border-[var(--gm-red)] p-1.5">
                  <div className="relative aspect-[9/10] overflow-hidden rounded-[10px] bg-[var(--gm-tile)]">
                    <Image
                      src={f.portrait}
                      alt={`${f.name}, who teaches ${f.teaches.toLowerCase()} at ICT`}
                      fill
                      sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                <p className="mt-4 text-lg leading-tight font-semibold tracking-[-0.02em]">
                  {f.name}
                </p>
                <p className="mt-1 text-sm text-[var(--gm-muted)]">
                  {f.teaches}
                </p>
                <a
                  href={youtube(f.lecture)}
                  {...external}
                  data-press=""
                  className="mt-3 inline-flex min-h-11 items-center gap-1 font-medium text-[var(--gm-red)] underline hover:text-[var(--gm-ink)]"
                >
                  Watch a class
                  <IconArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4"
                    stroke={1.75}
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Courses: the three posters as a snap strip, then what a batch includes. */}
        <section
          id="courses"
          aria-labelledby="courses-title"
          className={`${wrap} pb-20 lg:pb-28`}
        >
          <div className="border-t border-[var(--gm-line)] pt-10">
            <h2 id="courses-title" className={`${h2} max-w-[18ch]`}>
              Three batches, one fee each.
            </h2>
            <p className="mt-4 max-w-[52ch] text-[var(--gm-muted)]">
              One fee covers classes, tests, notes and the app. Sit in on a
              class first; the fee is fixed only when you pick a batch.
            </p>
          </div>
          <ul
            data-strip=""
            className="-mx-5 mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-2 md:-mx-8 md:px-8 lg:gap-8"
          >
            {courses.map((c) => (
              <li
                key={c.slug}
                className="w-[280px] shrink-0 snap-start sm:w-[320px]"
              >
                <Link
                  href={c.href}
                  data-lift=""
                  className="group block rounded-2xl"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--gm-ink)]">
                    {c.cover ? (
                      <Image
                        src={c.cover}
                        alt={`${c.name} course poster`}
                        fill
                        sizes="320px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="mt-5 block text-2xl font-semibold tracking-[-0.02em] group-hover:underline">
                    {c.name}
                  </span>
                </Link>
                <p className="mt-1 font-medium">
                  {c.exam}
                  <span className="text-[var(--gm-muted)]">
                    {" "}
                    · {c.duration}
                  </span>
                </p>
                <p className="mt-1 text-sm text-[var(--gm-muted)]">
                  {c.covers}
                </p>
                {c.when ? (
                  <p className="mt-3 text-sm tabular-nums">
                    {c.when}
                    {c.days ? (
                      <span className="text-[var(--gm-muted)]">
                        {" "}
                        · {c.days}
                      </span>
                    ) : null}
                    {c.note ? (
                      <span className="block text-[var(--gm-muted)]">
                        {c.note}
                      </span>
                    ) : null}
                  </p>
                ) : null}
                {c.price !== null ? (
                  <p className="mt-4 border-t border-[var(--gm-line)] pt-3 text-2xl font-semibold tracking-[-0.02em] tabular-nums">
                    {rupees(c.price)}
                    {c.mrp !== null && c.mrp > c.price ? (
                      <s className="ml-2 text-base font-normal text-[var(--gm-muted)]">
                        {rupees(c.mrp)}
                      </s>
                    ) : null}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          <h3 className="mt-16 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
            What a batch includes
          </h3>
          <ul className="mt-5 grid sm:grid-cols-2 sm:gap-x-10">
            {included.map((item) => (
              <li
                key={item.text}
                className="flex items-baseline gap-3 border-t border-[var(--gm-line)] py-3.5"
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rotate-45 bg-[var(--gm-red)]"
                />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Books and free notes: the shared blocks, in the gamusa's colours. */}
        <KitIsland theme="gamusa" tokens={islandTokens}>
          <section
            id="books"
            aria-labelledby="books-title"
            className={`${wrap} py-20 md:py-28`}
          >
            <h2 id="books-title" className={`${h2} max-w-[18ch]`}>
              ICT&rsquo;s books, for the exams it teaches.
            </h2>
            {samples && (
              <p className="mt-3 text-sm text-[var(--gm-muted)]">
                Sample titles for now. ICT&rsquo;s own books replace them before
                launch.
              </p>
            )}
            <ul className="mt-12 grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4">
              {books.slice(0, 4).map((b) => (
                <li key={b.slug} className="min-w-0">
                  <Book3D book={b} tones={bookTones} font="var(--gm-sans)" />
                  <span className="mt-4 block px-[18px] font-semibold">
                    {b.title}
                  </span>
                  <span className="block px-[18px] text-sm text-[var(--gm-muted)]">
                    {b.subtitle}
                  </span>
                  <span className="mt-1 block px-[18px] text-sm tabular-nums">
                    {b.price}, {b.pages} pages
                  </span>
                </li>
              ))}
            </ul>
            <h3 className="mt-24 max-w-[20ch] text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
              Six folders of free notes.
            </h3>
            <div className="mt-8">
              <FolderBrowser
                folders={folders}
                tones={folderTones}
                readHref="/resources"
              />
            </div>
          </section>
        </KitIsland>

        <WovenBand id="joining" />

        {/* Joining: three steps on a red thread. */}
        <section
          aria-labelledby="joining-title"
          className={`${wrap} grid gap-10 py-20 lg:grid-cols-12 lg:py-28`}
        >
          <div className="lg:col-span-5">
            <h2 id="joining-title" className={`${h2} max-w-[14ch]`}>
              How joining works.
            </h2>
            <p className="mt-4 max-w-[40ch] text-[var(--gm-muted)]">
              {offer.promise}
            </p>
            <p className="mt-8 border-t border-[var(--gm-line)] pt-5 text-sm leading-relaxed text-[var(--gm-muted)]">
              <span className="font-semibold text-[var(--gm-ink)]">
                {nextBatch.name}
              </span>
              , the {nextBatch.exam} batch for {nextBatch.forWho}, runs{" "}
              <span className="font-medium text-[var(--gm-ink)] tabular-nums">
                {nextBatch.timing}
              </span>
              .
            </p>
          </div>
          <ol className="relative lg:col-span-6 lg:col-start-7">
            <span
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-[7px] w-px bg-[var(--gm-red)]"
            />
            {joining.map((step, i) => (
              <li
                key={step.verb}
                className={`relative pl-10 ${i < joining.length - 1 ? "pb-10" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 left-0 h-4 w-4 rounded-full border-[3px] border-[var(--gm-cream)] bg-[var(--gm-red)] shadow-[0_0_0_1px_var(--gm-red)]"
                />
                <p className="text-2xl font-semibold tracking-[-0.02em]">
                  {step.verb}
                </p>
                <p className="mt-2 max-w-[48ch] text-[var(--gm-muted)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Campus: six tall frames from ICT's own videos. */}
        <section
          id="campus"
          aria-labelledby="campus-title"
          className={`${wrap} pb-20 lg:pb-28`}
        >
          <div className="flex flex-col gap-4 border-t border-[var(--gm-line)] pt-10 lg:flex-row lg:items-end lg:justify-between">
            <h2 id="campus-title" className={`${h2} max-w-[16ch]`}>
              Inside the centre on DC Bungalow Road.
            </h2>
            <p className="max-w-[40ch] text-[var(--gm-muted)]">
              Stills from ICT&rsquo;s own videos of the classroom, the mock
              halls and the digital classroom.
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
            {campus.map((c) => (
              <li key={c.src}>
                <figure>
                  <TallPhoto
                    photo={c}
                    sizes="(min-width: 1024px) 400px, 50vw"
                  />
                  <figcaption className="mt-3 text-sm text-[var(--gm-muted)]">
                    {c.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ: a single ruled column. */}
        <section
          aria-labelledby="faq-title"
          className={`${wrap} pb-24 lg:pb-32`}
        >
          <div className="grid gap-10 border-t border-[var(--gm-line)] pt-10 lg:grid-cols-12">
            <h2 id="faq-title" className={`${h2} lg:col-span-4`}>
              Questions people ask first.
            </h2>
            <dl className="lg:col-span-7 lg:col-start-6">
              {faqs.map((f) => (
                <div
                  key={f.q}
                  className="border-b border-[var(--gm-line)] py-6 first:pt-0"
                >
                  <dt className="text-lg font-semibold tracking-[-0.01em]">
                    {f.q}
                  </dt>
                  <dd className="mt-2 max-w-[64ch] leading-relaxed text-[var(--gm-muted)] tabular-nums">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <KitIsland theme="gamusa" tokens={islandTokens}>
          <section
            id="ask"
            aria-labelledby="ask-title"
            className={`${wrap} pb-20 md:pb-28`}
          >
            <div className="mx-auto max-w-[44rem] rounded-2xl bg-white p-6 shadow-[0_0_0_1px_rgba(20,20,20,0.08)] sm:p-10">
              <h2 id="ask-title" className={`${h2} max-w-[18ch]`}>
                Tell us your exam and your hours.
              </h2>
              <div className="mt-8">
                <EnquiryForm />
              </div>
            </div>
          </section>
        </KitIsland>

        {/* Enquire: the red field again; the footer below continues the same field. */}
        <div
          id="enquire"
          data-red=""
          className="bg-[var(--gm-red)] text-[var(--gm-cream)]"
        >
          <WovenBand id="enquire" />
          <section
            aria-labelledby="enquire-title"
            className={`${wrap} pt-20 pb-16 lg:pt-28 lg:pb-24`}
          >
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <h2
                  id="enquire-title"
                  className="max-w-[12ch] text-[2.5rem] leading-[1.02] font-bold tracking-[-0.03em] text-balance sm:text-6xl lg:text-[4.5rem]"
                >
                  Come and sit in on a class.
                </h2>
                <p className="mt-6 max-w-[36ch] text-lg leading-snug text-[var(--gm-red-soft)] sm:text-xl">
                  {joining[1].body} {joining[0].body}
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={whatsapp}
                    {...external}
                    data-cta=""
                    data-press=""
                    className={ctaBase}
                  >
                    <IconBrandWhatsapp
                      aria-hidden="true"
                      className="h-5 w-5"
                      stroke={1.75}
                    />
                    {offer.cta}
                  </a>
                  <a
                    href={tel}
                    data-press=""
                    className={`${ctaBase} border border-[var(--gm-cream)] tabular-nums hover:bg-[var(--gm-cream)] hover:text-[var(--gm-red)]`}
                  >
                    <IconPhone
                      aria-hidden="true"
                      className="h-5 w-5"
                      stroke={1.75}
                    />
                    Call {phone}
                  </a>
                </div>
              </div>
              <address className="not-italic lg:col-span-4 lg:col-start-9">
                <p className="flex items-start gap-3">
                  <IconMapPin
                    aria-hidden="true"
                    className="mt-1 h-5 w-5 shrink-0"
                    stroke={1.75}
                  />
                  <a
                    href={place.maps}
                    {...external}
                    className="leading-snug hover:underline"
                  >
                    {place.street}
                    <br />
                    {place.city}, {place.region}{" "}
                    <span className="tabular-nums">{place.pin}</span>
                  </a>
                </p>
                <p className="mt-5 flex items-start gap-3 tabular-nums">
                  <IconPhone
                    aria-hidden="true"
                    className="mt-1 h-5 w-5 shrink-0"
                    stroke={1.75}
                  />
                  <span className="leading-snug">
                    <a href={tel} className="hover:underline">
                      {phone}
                    </a>
                    <br />
                    <a
                      href={`tel:${contact.phones[1]}`}
                      className="hover:underline"
                    >
                      {secondPhone}
                    </a>
                  </span>
                </p>
                <p className="mt-5 flex items-start gap-3">
                  <IconMail
                    aria-hidden="true"
                    className="mt-1 h-5 w-5 shrink-0"
                    stroke={1.75}
                  />
                  <a
                    href={`mailto:${contact.email}`}
                    className="leading-snug break-all hover:underline"
                  >
                    {contact.email}
                  </a>
                </p>
              </address>
            </div>
          </section>
        </div>
      </main>

      <footer data-red="" className="bg-[var(--gm-red)] text-[var(--gm-cream)]">
        <div className={`${wrap} pb-24`}>
          <div className="flex flex-col gap-6 border-t border-[rgba(247,243,234,0.35)] pt-8 md:flex-row md:items-center md:justify-between">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
              <li>
                <a
                  href={links.youtube}
                  {...external}
                  className="inline-flex min-h-11 items-center gap-1.5 hover:underline"
                >
                  <IconBrandYoutube
                    aria-hidden="true"
                    className="h-4 w-4"
                    stroke={1.75}
                  />
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href={links.instagram}
                  {...external}
                  className="inline-flex min-h-11 items-center gap-1.5 hover:underline"
                >
                  <IconBrandInstagram
                    aria-hidden="true"
                    className="h-4 w-4"
                    stroke={1.75}
                  />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={links.facebook}
                  {...external}
                  className="inline-flex min-h-11 items-center gap-1.5 hover:underline"
                >
                  <IconBrandFacebook
                    aria-hidden="true"
                    className="h-4 w-4"
                    stroke={1.75}
                  />
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={links.play}
                  {...external}
                  className="inline-flex min-h-11 items-center gap-1.5 hover:underline"
                >
                  <IconBrandGooglePlay
                    aria-hidden="true"
                    className="h-4 w-4"
                    stroke={1.75}
                  />
                  ICT app on Google Play
                </a>
              </li>
            </ul>
            <p className="text-sm text-[var(--gm-red-soft)]">
              Prototype for review. Not the live site.
            </p>
          </div>
        </div>
      </footer>

      <PrototypeSwitcher current="gamusa" />
    </div>
  )
}
