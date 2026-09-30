import {
  IconArrowRight,
  IconArrowUpRight,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { tracks as brandTracks } from "@/lib/brand"

import { Book3D } from "../_book"
import {
  campus,
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
  reviews,
  rupees,
  selections,
  shelf,
  whatsapp,
  workshops,
} from "../_data"
import { EnquiryForm } from "../_enquiry"
import { Folder } from "../_folder"
import { PlayInPlace, StickyStack } from "../_fx"
import { bookTones, container, external, folderTones } from "../_kit/shared"
import { Reveal } from "../_reveal"
import { base } from "./_theme"

/** Every photograph ICT has of itself: the classrooms, then the teachers. */
const photos = [
  ...campus.map((c) => ({ src: c.src, alt: c.alt })),
  ...faculty.map((f) => ({ src: f.portrait, alt: `${f.name}, ${f.teaches}` })),
]
const durations = [74, 58, 66, 54, 78]

const panel: Record<string, { field: string; ink: string; tilt: string }> = {
  apsc: { field: "#3E4FD8", ink: "#FFFFFF", tilt: "-2.5deg" },
  adre: { field: "#E8613C", ink: "#141416", tilt: "2deg" },
  banking: { field: "#D9B43B", ink: "#141416", tilt: "-1.5deg" },
}

export default async function RollcallHome() {
  const { books, folders, samples } = await shelf()

  return (
    <main id="top">
      {/* Hero: the photo wall */}
      <section data-rc-hero aria-label="Introduction">
        <div data-rc-wall aria-hidden>
          {durations.map((d, col) => {
            const set = [0, 1, 2, 3].map(
              (k) => photos[(col * 2 + k * 3) % photos.length]!
            )
            return (
              <div
                key={col}
                data-rc-col
                style={{ "--dur": `${d}s` } as CSSProperties}
              >
                {[...set, ...set].map((p, i) => (
                  <span key={i}>
                    <Image
                      src={p.src}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 20vw, 34vw"
                      priority={i < 2}
                    />
                  </span>
                ))}
              </div>
            )
          })}
        </div>
        <div
          className={`${container} flex min-h-[100svh] flex-col justify-end pt-36 pb-16 md:pb-20`}
        >
          <p data-rise data-rc-tag className="self-start text-[#F7F6F3]">
            {place.city}, {place.region}
          </p>
          <h1
            data-rise
            data-k-h1
            style={{ animationDelay: "0.06s" }}
            className="mt-6 max-w-[14ch]"
          >
            This is what preparing at ICT{" "}
            <span className="text-[#F7F6F3]/55">looks like.</span>
          </h1>
          <div
            data-rise
            style={{ animationDelay: "0.12s" }}
            className="mt-8 flex flex-wrap items-end justify-between gap-8"
          >
            <p className="max-w-[42ch] text-lg text-[#D8D7D2]">
              Every photo here is ours: mock tests in a full hall, guest
              officers, ordinary class days, and the teachers who take them.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsapp}
                {...external}
                data-k-press
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#F7F6F3] px-6 whitespace-nowrap text-[#141416]"
                data-rc-cta
              >
                {offer.cta}
                <IconArrowRight
                  aria-hidden
                  size={17}
                  stroke={2}
                  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="#watch"
                data-k-press
                className="inline-flex h-12 items-center rounded-full px-6 text-[#F7F6F3] shadow-[inset_0_0_0_1.5px_rgba(247,246,243,0.6)]"
                data-rc-cta
              >
                Watch a class
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section aria-label="ICT in numbers" className={`${container} py-20`}>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {proof.map((p) => (
            <li key={p.label}>
              <a href={p.href} {...external} className="block">
                <span className="block text-[clamp(2.8rem,5.5vw,4.6rem)] leading-none font-bold tracking-[-0.05em]">
                  {p.display}
                </span>
                <span
                  data-rc-mono
                  className="mt-3 block max-w-[26ch] text-[var(--k-muted)]"
                >
                  {p.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Tracks: one panel each, stacking */}
      <section aria-labelledby="tracks-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="tracks-h" data-k-h2 className="max-w-[14ch]">
            Three exams. <span data-rc-dim>One classroom.</span>
          </h2>
        </Reveal>
        <div className="mt-12">
          <StickyStack top={96} step={18} gap="30vh">
            {courses.map((c) => {
              const p = panel[c.slug] ?? panel.apsc!
              const bt = brandTracks.find((b) => b.slug === c.slug)!
              return (
                <Link
                  key={c.slug}
                  href={`${base}${c.href}`}
                  data-rc-panel
                  style={
                    {
                      "--rc-field": p.field,
                      "--tilt": p.tilt,
                      color: p.ink,
                    } as CSSProperties
                  }
                  className="grid min-h-[480px] items-center gap-10 p-8 sm:p-12 md:grid-cols-12"
                >
                  <div className="md:col-span-7">
                    <div className="flex flex-wrap gap-2">
                      <span data-rc-tag>{bt.duration}</span>
                      <span data-rc-tag>{c.name}</span>
                    </div>
                    <p className="mt-8 text-[clamp(2rem,3.8vw,3.5rem)] leading-[0.98] font-bold tracking-[-0.04em]">
                      {c.exam}. <span data-rc-dim>{bt.covers}.</span>
                    </p>
                    <p className="mt-6 max-w-[40ch] text-lg">
                      {c.full}.{" "}
                      {c.when
                        ? `${c.when}, ${c.days ?? "on the app too"}.`
                        : ""}
                    </p>
                    <p
                      data-rc-cta
                      className="mt-8 inline-flex items-center gap-3"
                    >
                      {c.price ? rupees(c.price) : "Ask for the fee"}
                      <span className="grid size-11 place-items-center rounded-full bg-[#141416] text-[#F7F6F3]">
                        <IconArrowRight aria-hidden size={18} stroke={2} />
                      </span>
                    </p>
                  </div>
                  {c.cover && (
                    <div className="md:col-span-5">
                      <span data-rc-poster>
                        <Image
                          src={c.cover}
                          alt={`${c.name} poster`}
                          fill
                          sizes="(min-width: 768px) 420px, 90vw"
                          className="object-cover"
                        />
                      </span>
                    </div>
                  )}
                </Link>
              )
            })}
          </StickyStack>
        </div>
      </section>

      {/* Faces */}
      <section aria-labelledby="faces-h" className="overflow-x-clip pb-24">
        <div className={`${container} text-center`}>
          <Reveal>
            <h2 id="faces-h" data-k-h2 className="mx-auto max-w-[16ch]">
              Students, in their own words.
            </h2>
          </Reveal>
        </div>
        <ul data-rc-fan className="mt-10">
          {reviews.slice(0, 5).map((r, n) => {
            const i = n - 2
            return (
              <li
                key={r.id}
                data-rc-card
                style={
                  {
                    "--i": i,
                    "--a": Math.abs(i),
                    "--z": 10 - Math.abs(i),
                  } as CSSProperties
                }
              >
                <a
                  href={r.href}
                  {...external}
                  aria-label={`${r.name}, ${r.exam} ${r.batch}, on YouTube`}
                  className="absolute inset-0 block"
                >
                  <Image
                    src={r.image}
                    alt=""
                    fill
                    sizes="230px"
                    className="object-cover"
                  />
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(20,20,22,0.92))]" />
                  <span className="absolute inset-x-0 bottom-0 p-4">
                    <span className="block text-lg leading-tight font-bold tracking-[-0.02em]">
                      {r.name}
                    </span>
                    <span data-rc-mono className="text-[#C9C8C2]">
                      {r.exam}, {r.batch}
                    </span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Merit */}
      <section aria-labelledby="merit-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="merit-h" data-k-h2 className="max-w-[16ch]">
            Two on the APSC merit list.{" "}
            <span data-rc-dim>Both prepared here.</span>
          </h2>
          <a
            href={links.apscResultPdf}
            {...external}
            data-rc-mono
            className="mt-5 inline-flex min-h-11 items-center gap-1 underline underline-offset-4"
          >
            APSC CCE 2022 result, 17 January 2024
            <IconArrowUpRight aria-hidden size={15} stroke={2} />
          </a>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {selections.map((s) => (
            <figure
              key={s.name}
              data-k-card
              className="flex flex-col gap-6 rounded-[var(--k-radius)] p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <span data-rc-tag>{s.post}</span>
                <span className="text-5xl font-bold tracking-[-0.05em]">
                  {s.serial}
                </span>
              </div>
              <blockquote className="text-2xl leading-snug font-semibold tracking-[-0.02em] text-pretty">
                &ldquo;{s.quote}&rdquo;
              </blockquote>
              <figcaption
                data-rc-mono
                className="mt-auto text-[var(--k-muted)]"
              >
                {s.name}, serial {s.serial}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Faculty */}
      <section aria-labelledby="faculty-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="faculty-h" data-k-h2>
            The teachers. <span data-rc-dim>Watch them first.</span>
          </h2>
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {faculty.map((f) => (
            <li key={f.slug}>
              <a
                href={`https://www.youtube.com/watch?v=${f.lecture}`}
                {...external}
                className="block"
              >
                <span
                  data-rc-face
                  className="relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-[#141416]"
                >
                  <Image
                    src={f.portrait}
                    alt={`${f.name}, ${f.teaches}`}
                    fill
                    sizes="(min-width: 1024px) 230px, 45vw"
                    className="object-cover object-top"
                  />
                </span>
                <span className="mt-3 block text-lg font-bold tracking-[-0.02em]">
                  {f.name}
                </span>
                <span data-rc-mono className="block text-[var(--k-muted)]">
                  {f.teaches}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Watch */}
      <section
        id="watch"
        aria-labelledby="watch-h"
        className={`${container} scroll-mt-24 pb-24`}
      >
        <Reveal>
          <h2 id="watch-h" data-k-h2 className="max-w-[16ch]">
            Full classes, free to watch.
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {classes.slice(0, 3).map((c) => (
            <li key={c.id}>
              <PlayInPlace
                id={c.id}
                title={c.title}
                className="group relative block aspect-video w-full overflow-hidden rounded-[22px] bg-[#141416]"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-14 place-items-center rounded-full bg-[#F7F6F3] text-[#141416] transition-transform duration-200 ease-out group-active:scale-95">
                    <IconPlayerPlayFilled
                      aria-hidden
                      size={20}
                      className="translate-x-px"
                    />
                  </span>
                </span>
              </PlayInPlace>
              <p className="mt-3 text-lg leading-snug font-bold tracking-[-0.02em]">
                {c.title}
              </p>
              <p data-rc-mono className="text-[var(--k-muted)]">
                {c.by}, {compact(c.views)} views
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Free */}
      <section
        id="free"
        aria-labelledby="free-h"
        className={`${container} scroll-mt-24 pb-24`}
      >
        <Reveal>
          <h2 id="free-h" data-k-h2 className="max-w-[16ch]">
            Free notes. <span data-rc-dim>No fee to start.</span>
          </h2>
          {samples && (
            <p className="mt-3 text-sm text-[var(--k-muted)]">
              Sample titles until ICT adds its own.
            </p>
          )}
        </Reveal>
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
                    <Book3D
                      book={b}
                      tones={bookTones}
                      font="var(--rc-display)"
                    />
                    <span className="mt-4 block px-[18px] font-bold">
                      {b.title}
                    </span>
                    <span data-rc-mono className="block px-[18px]">
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
                    <span className="block text-lg font-bold tracking-[-0.02em]">
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

      {/* Questions and enquiry */}
      <section
        aria-labelledby="faq-h"
        className={`${container} grid gap-10 pb-24 lg:grid-cols-12`}
      >
        <div className="lg:col-span-6">
          <h2 id="faq-h" data-k-h2>
            Questions.
          </h2>
          <div className="mt-8">
            {faqs.map((f, i) => (
              <details
                key={f.q}
                data-k-faq
                className={i ? "border-t border-[var(--k-line)]" : ""}
              >
                <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-4 py-4">
                  <span className="text-lg font-bold tracking-[-0.02em]">
                    {f.q}
                  </span>
                  <IconPlus
                    data-plus
                    aria-hidden
                    size={20}
                    stroke={2}
                    className="shrink-0"
                  />
                </summary>
                <p className="max-w-[60ch] pb-5 text-[var(--k-muted)]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6">
          <div data-k-card className="rounded-[var(--k-radius)] p-7 sm:p-9">
            <h3 className="text-2xl font-bold tracking-[-0.03em]">
              Not sure which batch?
            </h3>
            <ol className="mt-5 grid gap-3">
              {joining.map((j) => (
                <li key={j.verb} className="text-sm">
                  <span className="font-bold">{j.verb}.</span>{" "}
                  <span className="text-[var(--k-muted)]">{j.body}</span>
                </li>
              ))}
            </ol>
            <div className="mt-7">
              <EnquiryForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
