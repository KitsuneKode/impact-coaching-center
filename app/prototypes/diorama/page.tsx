import {
  IconArrowRight,
  IconArrowUpRight,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"

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
  rupees,
  selections,
  shelf,
  whatsapp,
  workshops,
} from "../_data"
import { EnquiryForm } from "../_enquiry"
import { Folder } from "../_folder"
import { PlayInPlace } from "../_fx"
import { bookTones, container, external, folderTones } from "../_kit/shared"
import { Reveal } from "../_reveal"
import {
  Books,
  Box,
  Classroom,
  Flag,
  Iso,
  islandBox,
  Library,
  MockHall,
  Phone,
  Pillars,
  Podium,
  pt,
  Shade,
  Vault,
} from "./_iso"
import { base } from "./_theme"

const MAT = 27
const VB = { x: -245, y: -132, w: 490, h: 400 }

const islands = [
  {
    x: 1.5,
    y: 1.5,
    Model: Classroom,
    label: "The classroom",
    href: "#centre",
    dot: "#FFFFFF",
  },
  {
    x: 15.5,
    y: 1.5,
    Model: Library,
    label: "Free notes",
    href: "#free",
    dot: "#C99065",
  },
  {
    x: 1.5,
    y: 15.5,
    Model: Phone,
    label: "Every class on the app",
    href: "#watch",
    dot: "#174A92",
  },
  {
    x: 15.5,
    y: 15.5,
    Model: Books,
    label: "ICT's books",
    href: "#free",
    dot: "#FEC396",
  },
]

const trackModel: Record<string, typeof Pillars> = {
  apsc: Pillars,
  adre: Flag,
  banking: Vault,
}

/** A single model on its plinth, sized to its own bounds. */
function Model({ children }: { children: ReactNode }) {
  return (
    <div data-dm-model aria-hidden>
      <Iso viewBox={islandBox(8, 11)}>
        <g>{children}</g>
      </Iso>
    </div>
  )
}

export default async function DioramaHome() {
  const { books, folders, samples } = await shelf()

  return (
    <main id="top">
      {/* Hero: the campus as four islands you can lift */}
      <section
        data-dm-hero
        aria-label="Introduction"
        className={`${container} grid items-center gap-12 pt-12 pb-24 md:pt-16 lg:grid-cols-12`}
      >
        <div className="lg:col-span-5">
          <p data-rise data-dm-mono className="text-[var(--k-muted)]">
            {place.city}, {place.region}
          </p>
          <h1
            data-rise
            data-k-h1
            style={{ animationDelay: "0.06s" }}
            className="mt-5 max-w-[14ch]"
          >
            Everything for Assam&apos;s exams, in one place.
          </h1>
          <p
            data-rise
            style={{ animationDelay: "0.12s" }}
            className="mt-6 max-w-[40ch] text-lg text-[var(--k-muted)]"
          >
            A classroom, a library, ICT&apos;s own books and every class on the
            app, for APSC, ADRE, Assam Police and Banking.
          </p>
          <div
            data-rise
            style={{ animationDelay: "0.18s" }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href={whatsapp}
              {...external}
              data-k-press
              data-k-btn
              className="group inline-flex h-12 items-center gap-2 px-6 whitespace-nowrap"
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
              href="#tracks"
              data-k-press
              data-k-outline
              className="inline-flex h-12 items-center px-6"
            >
              See the courses
            </a>
          </div>
        </div>

        <div data-dm-campus className="lg:col-span-7">
          <Iso viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}>
            <Box x={0} y={0} z={-1.4} w={MAT} d={MAT} h={1.4} tone="sky" />
            {islands.map((isl, i) => (
              <a
                key={isl.label}
                href={isl.href}
                data-dm-island={i}
                aria-label={isl.label}
              >
                <g
                  data-dm-drop
                  style={{ "--d": `${0.25 + i * 0.12}s` } as CSSProperties}
                >
                  <Shade x={isl.x} y={isl.y} w={10} d={10} />
                  <g data-dm-lift>
                    <isl.Model x={isl.x} y={isl.y} />
                  </g>
                </g>
              </a>
            ))}
          </Iso>
          {islands.map((isl, i) => {
            const below = i === islands.length - 1
            const [px, py] = below
              ? pt(isl.x + 10, isl.y + 10, 0)
              : pt(isl.x + 5, isl.y + 5, 10.5)
            return (
              <span
                key={isl.label}
                data-dm-tag={i}
                data-below={below || undefined}
                aria-hidden
                style={
                  {
                    left: `${((px - VB.x) / VB.w) * 100}%`,
                    top: `${((py - VB.y) / VB.h) * 100}%`,
                    "--dot": isl.dot,
                  } as CSSProperties
                }
              >
                <i />
                {isl.label}
              </span>
            )
          })}
        </div>
      </section>

      {/* Numbers */}
      <section aria-label="ICT in numbers" className={`${container} pb-24`}>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {proof.map((p) => (
            <li key={p.label}>
              <a
                href={p.href}
                {...external}
                data-k-card
                className="flex h-full flex-col gap-3 p-6"
              >
                <span className="text-[clamp(2.2rem,4vw,3.2rem)] leading-none font-semibold tracking-[-0.04em]">
                  {p.display}
                </span>
                <span className="text-sm text-[var(--k-muted)]">{p.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Tracks */}
      <section
        id="tracks"
        aria-labelledby="tracks-h"
        className={`${container} scroll-mt-24 pb-24`}
      >
        <Reveal>
          <h2 id="tracks-h" data-k-h2 className="max-w-[16ch]">
            Pick the exam. The course is built for it.
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {courses.map((c) => {
            const M = trackModel[c.slug] ?? Pillars
            const bt = brandTracks.find((b) => b.slug === c.slug)!
            return (
              <li key={c.slug}>
                <Link
                  href={`${base}${c.href}`}
                  data-k-card
                  className="flex h-full flex-col overflow-hidden"
                >
                  <div data-dm-stage className="px-10 pt-6 pb-2">
                    <Model>
                      <M />
                    </Model>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p data-dm-mono className="text-[var(--k-muted)]">
                      {bt.duration}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                      {c.exam}
                    </p>
                    <p className="text-sm text-[var(--k-muted)]">{c.full}</p>
                    <p className="mt-4 text-sm">{bt.covers}</p>
                    <p className="mt-auto flex items-center justify-between gap-4 pt-6 font-semibold">
                      <span>
                        {c.name}
                        {c.price ? `, ${rupees(c.price)}` : ""}
                      </span>
                      <IconArrowRight aria-hidden size={18} stroke={2} />
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      {/* The centre: real photographs beside the model */}
      <section
        id="centre"
        aria-labelledby="centre-h"
        className={`${container} scroll-mt-24 pb-24`}
      >
        <Reveal>
          <h2 id="centre-h" data-k-h2 className="max-w-[18ch]">
            The classroom on DC Bungalow Road.
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div
            data-k-card
            className="col-span-2 flex flex-col overflow-hidden md:row-span-2"
          >
            <div data-dm-stage className="flex-1 px-12 pt-8 pb-4">
              <Model>
                <MockHall />
              </Model>
            </div>
            <div className="p-6">
              <p className="text-xl font-semibold tracking-[-0.02em]">
                Warrior and Bijoy mock tests, sat in a full hall.
              </p>
              <a
                href={place.maps}
                {...external}
                className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-medium underline underline-offset-4"
              >
                {place.street}, {place.city}
                <IconArrowUpRight aria-hidden size={15} stroke={2} />
              </a>
            </div>
          </div>
          {campus.slice(0, 4).map((c) => (
            <figure key={c.src}>
              <span
                data-k-photo
                className="relative block aspect-[4/5] overflow-hidden rounded-[var(--k-radius)]"
              >
                <Image
                  src={c.src}
                  alt={c.alt}
                  fill
                  sizes="(min-width: 768px) 30vw, 50vw"
                  className="object-cover object-[50%_35%]"
                />
              </span>
              <figcaption className="mt-2 text-sm text-[var(--k-muted)]">
                {c.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Merit */}
      <section aria-labelledby="merit-h" className={`${container} pb-24`}>
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Model>
              <Podium />
            </Model>
          </div>
          <div className="lg:col-span-8">
            <Reveal>
              <h2 id="merit-h" data-k-h2 className="max-w-[18ch]">
                On the APSC CCE 2022 merit list.
              </h2>
              <a
                href={links.apscResultPdf}
                {...external}
                className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[var(--k-accent-deep)] underline underline-offset-4"
              >
                The result of 17 January 2024
                <IconArrowUpRight aria-hidden size={15} stroke={2} />
              </a>
            </Reveal>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {selections.map((s) => (
                <figure
                  key={s.name}
                  data-k-card
                  className="flex flex-col gap-5 p-6"
                >
                  <p className="flex items-baseline gap-2">
                    <span data-dm-mono className="text-[var(--k-muted)]">
                      Serial
                    </span>
                    <span className="text-4xl font-semibold tracking-[-0.04em] text-[#174A92]">
                      {s.serial}
                    </span>
                  </p>
                  <blockquote className="text-pretty">
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-auto">
                    <span className="block font-semibold">{s.name}</span>
                    <span className="text-sm text-[var(--k-muted)]">
                      {s.post}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Faculty */}
      <section aria-labelledby="faculty-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="faculty-h" data-k-h2>
            The faculty.
          </h2>
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {faculty.map((f) => (
            <li key={f.slug}>
              <a
                href={`https://www.youtube.com/watch?v=${f.lecture}`}
                {...external}
                data-k-card
                className="block overflow-hidden"
              >
                <span className="relative block aspect-[4/5] border-b-[1.25px] border-[#000624] bg-[#174A92]">
                  <Image
                    src={f.portrait}
                    alt={`${f.name}, ${f.teaches}`}
                    fill
                    sizes="(min-width: 1024px) 230px, 45vw"
                    className="object-cover object-top"
                  />
                </span>
                <span className="block p-4">
                  <span className="block font-semibold">{f.name}</span>
                  <span className="block text-sm text-[var(--k-muted)]">
                    {f.teaches}
                  </span>
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
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <h2 id="watch-h" data-k-h2 className="max-w-[16ch]">
              Every class, on the app the same day.
            </h2>
          </Reveal>
          <div className="hidden lg:col-span-3 lg:col-start-10 lg:block">
            <Model>
              <Phone />
            </Model>
          </div>
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {classes.slice(0, 3).map((c) => (
            <li key={c.id}>
              <PlayInPlace
                id={c.id}
                title={c.title}
                data-k-photo
                className="group relative block aspect-video w-full overflow-hidden rounded-[var(--k-radius)] bg-[#000624]"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-12 place-items-center rounded-[10px] bg-white text-[#000624] shadow-[0_0_0_1.25px_#000624,3px_3px_0_0_#000624] transition-transform duration-150 group-active:translate-x-[3px] group-active:translate-y-[3px]">
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
          <h2 id="free-h" data-k-h2 className="max-w-[18ch]">
            Free notes on the shelf. Books to take home.
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
                    <Book3D book={b} tones={bookTones} font="var(--dm-sans)" />
                    <span className="mt-4 block px-[18px] font-semibold">
                      {b.title}
                    </span>
                    <span className="block px-[18px] text-sm text-[var(--k-accent-deep)]">
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
                    <span
                      data-k-photo
                      className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-[var(--k-inner)]"
                    >
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
                  <span className="text-lg font-semibold tracking-[-0.01em]">
                    {f.q}
                  </span>
                  <IconPlus
                    data-plus
                    aria-hidden
                    size={20}
                    stroke={1.75}
                    className="shrink-0"
                  />
                </summary>
                <p className="max-w-[60ch] pb-5 text-[var(--k-muted)]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6">
          <div data-k-card className="p-7 sm:p-9">
            <h3 className="text-2xl font-semibold tracking-[-0.03em]">
              Not sure which batch?
            </h3>
            <ol className="mt-5 grid gap-3">
              {joining.map((j) => (
                <li key={j.verb} className="text-sm">
                  <span className="font-semibold">{j.verb}.</span>{" "}
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
