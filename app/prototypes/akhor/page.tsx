import {
  IconArrowRight,
  IconArrowUpRight,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { tracks as brandTracks } from "@/lib/brand"

import { Book3D } from "../_book"
import {
  classes,
  compact,
  courses,
  faculty,
  faqs,
  joining,
  links,
  offer,
  place,
  proof,
  publishedStories,
  rupees,
  selections,
  shelf,
  thumb,
  whatsapp,
  workshops,
} from "../_data"
import { EnquiryForm } from "../_enquiry"
import { Folder } from "../_folder"
import { PlayInPlace } from "../_fx"
import { bookTones, container, external, folderTones } from "../_kit/shared"
import { Reveal } from "../_reveal"
import { as } from "../sandhya/_as"
import { SilkField, TwoTongues } from "./_client"
import { base } from "./_theme"

const tint: Record<string, string> = {
  apsc: "#C99A45",
  adre: "#8C9BE3",
  banking: "#1E2347",
}

/** An English heading with its Assamese line beneath it. */
function Heading({
  id,
  en,
  asLine,
  children,
}: {
  id: string
  en: string
  asLine: string
  children?: ReactNode
}) {
  return (
    <Reveal>
      <h2 id={id} data-k-h2 className="max-w-[20ch]">
        {en}
      </h2>
      <p lang="as" data-ak-as className="mt-3 max-w-[46ch] text-lg">
        {asLine}
      </p>
      {children}
    </Reveal>
  )
}

export default async function AkhorHome() {
  const { books, folders, samples } = await shelf()
  const story = publishedStories[0]

  const trackCards = courses.map((c) => {
    const t = as.tracks[c.slug]!
    const bt = brandTracks.find((b) => b.slug === c.slug)!
    return {
      slug: c.slug,
      tint: tint[c.slug] ?? "#C99A45",
      exam: { en: c.exam, as: t.exam },
      full: { en: c.full, as: t.full },
      covers: { en: bt.covers, as: t.covers },
      duration: { en: bt.duration, as: t.duration },
      price: c.price ? `${c.name}, ${rupees(c.price)}` : c.name,
      href: `${base}${c.href}`,
    }
  })
  const steps = joining.map((j, i) => ({
    verb: { en: j.verb, as: as.joining[i]!.verb },
    body: { en: j.body, as: as.joining[i]!.body },
  }))

  return (
    <main id="top">
      {/* Hero */}
      <section
        data-ak-hero
        aria-label="Introduction"
        className="pt-20 pb-24 text-center md:pt-28"
      >
        <div data-ak-field aria-hidden>
          <SilkField />
        </div>
        <div className={container}>
          <div data-rise data-ak-phul aria-hidden>
            <b />
            <i />
            <i />
            <i />
            <i />
            <i />
            <b />
          </div>
          <p data-rise style={{ animationDelay: "0.04s" }} className="mt-6">
            <span data-ak-pill>
              {place.city}, {place.region}
            </span>
          </p>
          <h1
            data-rise
            data-k-h1
            style={{ animationDelay: "0.08s" }}
            className="mx-auto mt-7 max-w-[16ch]"
          >
            Assam&apos;s exams, taught in <span data-ak-it>Assamese</span> and
            English.
          </h1>
          <p
            data-rise
            lang="as"
            data-ak-as
            style={{ animationDelay: "0.14s" }}
            className="mx-auto mt-6 max-w-[34ch] text-xl text-[#2B3056]"
          >
            {as.heroClaim}
          </p>
          <p
            data-rise
            style={{ animationDelay: "0.18s" }}
            className="mx-auto mt-2 max-w-[46ch] text-[var(--k-muted)]"
          >
            APSC, ADRE, Assam Police and Banking batches, with every class on
            the ICT app.
          </p>
          <div
            data-rise
            style={{ animationDelay: "0.24s" }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href={whatsapp}
              {...external}
              data-k-press
              data-k-btn
              className="group inline-flex h-12 items-center gap-2 px-7 whitespace-nowrap"
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
              href="#free"
              data-k-press
              data-k-outline
              className="inline-flex h-12 items-center px-6"
            >
              Free notes
            </a>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section aria-label="ICT in numbers" className={`${container} pb-28`}>
        <ul className="grid grid-cols-2 border-y border-[var(--k-line)] lg:grid-cols-4">
          {proof.map((p, i) => (
            <li
              key={p.label}
              className={
                i
                  ? "border-[var(--k-line)] max-lg:odd:border-t max-lg:even:border-l lg:border-l"
                  : ""
              }
            >
              <a
                href={p.href}
                {...external}
                className="group flex h-full flex-col justify-between gap-10 p-6 transition-colors duration-200 hover:bg-white/70 sm:p-8"
              >
                <span data-ak-mono>{p.label}</span>
                <span
                  data-k-display
                  className="text-[clamp(2.6rem,5vw,4.2rem)] leading-none font-light tracking-[-0.03em]"
                >
                  {p.display}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Tracks, in either language */}
      <section aria-labelledby="tracks-h" className={`${container} pb-28`}>
        <Heading
          id="tracks-h"
          en="Three tracks, one classroom."
          asLine={as.coursesClaim}
        />
        <div className="mt-10">
          <TwoTongues tracks={trackCards} steps={steps} />
        </div>
      </section>

      {/* Results */}
      <section aria-labelledby="merit-h" className={`${container} pb-28`}>
        <Heading
          id="merit-h"
          en="Two officers on the APSC CCE 2022 list prepared here."
          asLine={as.resultsClaim}
        >
          <a
            href={links.apscResultPdf}
            {...external}
            data-k-link
            className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[var(--k-accent-deep)] underline underline-offset-4"
          >
            The result of 17 January 2024
            <IconArrowUpRight aria-hidden size={15} stroke={2} />
          </a>
        </Heading>
        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          {story && (
            <figure className="lg:col-span-7">
              <PlayInPlace
                id={story.id}
                title={`${story.name}, ${story.outcome}`}
                className="group relative block aspect-video w-full overflow-hidden rounded-[var(--k-radius)] bg-[#1E2347]"
              >
                <Image
                  src={thumb(story.id)}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 700px, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                <span className="absolute inset-0 grid place-items-center bg-[rgba(30,35,71,0.2)]">
                  <span className="grid size-16 place-items-center rounded-full bg-white/90 text-[#1E2347] shadow-lg backdrop-blur transition-transform duration-200 ease-out group-active:scale-95">
                    <IconPlayerPlayFilled
                      aria-hidden
                      size={22}
                      className="translate-x-px"
                    />
                  </span>
                </span>
              </PlayInPlace>
              <figcaption className="mt-3 text-sm text-[var(--k-muted)]">
                {story.name}, {story.outcome}. {story.note}
              </figcaption>
            </figure>
          )}
          <div className="grid gap-4 lg:col-span-5">
            {selections.map((s) => (
              <figure
                key={s.name}
                data-k-card
                className="flex flex-col gap-5 p-7"
              >
                <blockquote
                  data-k-display
                  className="text-xl leading-snug italic"
                >
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-auto flex items-end justify-between gap-4">
                  <span>
                    <span className="block font-semibold">{s.name}</span>
                    <span className="text-sm text-[var(--k-muted)]">
                      {s.post}
                    </span>
                  </span>
                  <span data-ak-mono className="text-right">
                    {as.serial}
                    <span className="block text-base text-[var(--k-ink)] tabular-nums">
                      {s.serial}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty */}
      <section aria-labelledby="faculty-h" className={`${container} pb-28`}>
        <Heading
          id="faculty-h"
          en="The teachers you will study with."
          asLine={as.teachersClaim}
        />
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {faculty.map((f) => (
            <li key={f.slug}>
              <a
                href={`https://www.youtube.com/watch?v=${f.lecture}`}
                {...external}
                data-ak-person-link
                className="block"
              >
                <span data-ak-person className="relative block aspect-[4/5]">
                  <Image
                    src={f.portrait}
                    alt={`${f.name}, ${f.teaches}`}
                    fill
                    sizes="(min-width: 1024px) 230px, 45vw"
                    className="object-cover object-top"
                  />
                </span>
                <span className="mt-4 block font-semibold">{f.name}</span>
                <span className="block text-sm text-[var(--k-muted)]">
                  {f.teaches}
                </span>
                <span lang="as" data-ak-as className="block text-sm">
                  {as.teaches[f.slug]}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Watch */}
      <section aria-labelledby="watch-h" className={`${container} pb-28`}>
        <Heading
          id="watch-h"
          en="Watch a full class before you decide."
          asLine={as.classesClaim}
        />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {classes.slice(0, 3).map((c) => (
            <li key={c.id}>
              <PlayInPlace
                id={c.id}
                title={c.title}
                className="group relative block aspect-video w-full overflow-hidden rounded-[var(--k-inner)] bg-[#1E2347]"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-12 place-items-center rounded-full bg-white/90 text-[#1E2347] backdrop-blur transition-transform duration-200 ease-out group-active:scale-95">
                    <IconPlayerPlayFilled
                      aria-hidden
                      size={18}
                      className="translate-x-px"
                    />
                  </span>
                </span>
              </PlayInPlace>
              <p className="mt-3 font-semibold">{c.title}</p>
              <p className="text-sm text-[var(--k-muted)]">
                {c.by}, <span className="tabular-nums">{compact(c.views)}</span>{" "}
                views
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Free */}
      <section
        id="free"
        aria-labelledby="free-h"
        className={`${container} scroll-mt-24 pb-28`}
      >
        <Heading id="free-h" en="Free study material." asLine={as.freeClaim}>
          {samples && (
            <p className="mt-3 text-sm text-[var(--k-muted)]">
              Sample titles until ICT adds its own.
            </p>
          )}
        </Heading>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {folders.map((f) => (
            <li key={f.id}>
              <Link
                data-fd-hover
                href={`${base}/notes#${f.id}`}
                aria-label={`${f.name}, ${f.items.length} files`}
                className="block"
              >
                <Folder folder={f} tones={folderTones} />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          {books.length > 0 && (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 lg:col-span-8">
              {books.slice(0, 4).map((b) => (
                <li key={b.slug} className="min-w-0">
                  <Link
                    data-bk-hover
                    href={`${base}/books/${b.slug}`}
                    className="group block"
                  >
                    <Book3D book={b} tones={bookTones} font="var(--ak-sans)" />
                    <span className="mt-4 block px-[18px] font-semibold">
                      {b.title}
                    </span>
                    <span className="block px-[18px] text-sm text-[var(--k-accent-deep)] tabular-nums">
                      {b.price}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <ul
            className={`grid content-start gap-4 ${books.length > 0 ? "lg:col-span-4" : "sm:grid-cols-2 lg:col-span-12"}`}
          >
            {workshops.map((w) => (
              <li key={w.name}>
                <Link
                  href={`${base}${w.href}`}
                  data-k-card
                  className="flex items-center gap-4 p-4"
                >
                  {w.cover && (
                    <span className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-[var(--k-inner)]">
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
                    <span className="block text-lg font-semibold">
                      {w.name}
                    </span>
                    <span className="line-clamp-2 text-sm text-[var(--k-muted)]">
                      {w.subtitle}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Questions */}
      <section
        aria-labelledby="faq-h"
        className={`${container} grid gap-10 pb-28 lg:grid-cols-12`}
      >
        <div className="lg:col-span-4">
          <Heading
            id="faq-h"
            en="Frequently asked questions."
            asLine={as.faqClaim}
          />
        </div>
        <div className="lg:col-span-8">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              data-k-faq
              className={i ? "border-t border-[var(--k-line)]" : ""}
            >
              <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-4 py-4">
                <span className="text-lg font-medium">{f.q}</span>
                <IconPlus
                  data-plus
                  aria-hidden
                  size={20}
                  stroke={1.5}
                  className="shrink-0"
                />
              </summary>
              <p className="max-w-[62ch] pb-5 text-[var(--k-muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Enquiry */}
      <section aria-labelledby="ask-h" className={`${container} pb-24`}>
        <div data-k-card className="grid gap-10 p-7 sm:p-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Heading
              id="ask-h"
              en="Sit in on a class before you pay."
              asLine={as.enquireClaim}
            />
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </main>
  )
}
