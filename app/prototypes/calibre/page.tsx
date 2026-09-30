import {
  IconArrowRight,
  IconArrowUpRight,
  IconMapPin,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

import { Book3D } from "../_book"
import {
  classes,
  compact,
  faculty,
  faqs,
  fee,
  fees,
  included,
  joining,
  links,
  offer,
  place,
  proof,
  reviews,
  selections,
  shelf,
  timetable,
  whatsapp,
  workshops,
} from "../_data"
import { EnquiryForm } from "../_enquiry"
import { Folder } from "../_folder"
import { PlayInPlace } from "../_fx"
import { bookTones, container, external, folderTones } from "../_kit/shared"
import { Reveal } from "../_reveal"
import { DialHero, SubDial } from "./_client"
import { base } from "./_theme"

const reach = [0.81, 0.64, 0.73, 0.52]

export default async function CalibreHome() {
  const { books, folders, samples } = await shelf()
  const batches = timetable.map((t) => ({
    id: t.id,
    name: t.name,
    exam: t.exam,
    when: t.when,
    days: t.days,
    note: t.note,
    price: fee(t.price),
    href: `${base}${t.href}`,
    start: t.start,
    end: t.end,
  }))

  return (
    <main id="top">
      {/* Hero: the dial is the timetable */}
      <section aria-label="Introduction" className={`${container} pb-24`}>
        <DialHero
          batches={batches}
          intro={
            <>
              <p data-rise data-cb-label>
                North Lakhimpur, Assam
              </p>
              <h1
                data-rise
                data-k-h1
                style={{ animationDelay: "0.06s" }}
                className="mt-6 max-w-[13ch]"
              >
                Study at the hour <span data-cb-gilt>that suits you.</span>
              </h1>
              <p
                data-rise
                style={{ animationDelay: "0.12s" }}
                className="mt-7 max-w-[40ch] text-lg text-[var(--k-muted)]"
              >
                APSC, ADRE, Assam Police and Banking batches, morning to night.
                Every class is on the ICT app too.
              </p>
              <div
                data-rise
                style={{ animationDelay: "0.18s" }}
                className="mt-10 flex flex-wrap items-center gap-3"
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
                  href="#watch"
                  data-k-press
                  data-k-outline
                  className="inline-flex h-12 items-center px-6"
                >
                  Watch a class
                </a>
              </div>
            </>
          }
        />
      </section>

      {/* Proof as sub-dials */}
      <section aria-labelledby="proof-h" className={`${container} pb-28`}>
        <Reveal>
          <h2 id="proof-h" data-k-h2 className="max-w-[18ch]">
            Numbers you can check.
          </h2>
        </Reveal>
        <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
          {proof.map((p, i) => (
            <li key={p.label}>
              <a
                href={p.href}
                {...external}
                aria-label={`${p.display} ${p.label}`}
                className="block rounded-[var(--k-radius)] outline-offset-8"
              >
                <SubDial
                  display={p.display}
                  label={p.label}
                  reach={reach[i]!}
                />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Merit list on brushed gold */}
      <section
        id="merit"
        aria-labelledby="merit-h"
        className={`${container} scroll-mt-24 pb-28`}
      >
        <Reveal>
          <h2 id="merit-h" data-k-h2 className="max-w-[16ch]">
            On the APSC CCE 2022 merit list.
          </h2>
          <a
            href={links.apscResultPdf}
            {...external}
            data-k-link
            className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm text-[var(--k-muted)] underline decoration-[var(--k-line-hi)] underline-offset-4"
          >
            The result of 17 January 2024
            <IconArrowUpRight aria-hidden size={15} stroke={1.75} />
          </a>
        </Reveal>
        <ul className="mt-12 grid gap-6 lg:grid-cols-2">
          {selections.map((s, i) => (
            <li key={s.name}>
              <Reveal delay={i * 0.08}>
                <figure
                  data-cb-plate
                  className="flex h-full flex-col gap-8 p-8 sm:p-10"
                >
                  <div className="flex items-end justify-between gap-6">
                    <span data-cb-serial>{s.serial}</span>
                    <span
                      data-cb-engrave
                      className="pb-2 text-right text-[0.7rem] font-medium tracking-[0.24em] uppercase"
                    >
                      Serial
                      <br />
                      APSC CCE 2022
                    </span>
                  </div>
                  <blockquote
                    data-cb-engrave
                    data-k-display
                    className="max-w-[40ch] text-[1.35rem] leading-snug italic"
                  >
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                  <figcaption data-cb-engrave className="mt-auto">
                    <span data-k-display className="block text-2xl">
                      {s.name}
                    </span>
                    <span className="text-sm tracking-[0.04em]">{s.post}</span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Faculty in bezels */}
      <section aria-labelledby="faculty-h" className={`${container} pb-28`}>
        <Reveal>
          <h2 id="faculty-h" data-k-h2>
            The faculty.
          </h2>
        </Reveal>
        <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-5">
          {faculty.map((f, i) => (
            <li key={f.slug}>
              <Reveal delay={i * 0.05}>
                <a
                  href={`https://www.youtube.com/watch?v=${f.lecture}`}
                  {...external}
                  data-cb-face-link
                  className="group block text-center"
                >
                  <span data-cb-bezel className="mx-auto max-w-[200px]">
                    <span>
                      <Image
                        src={f.portrait}
                        alt={`${f.name}, ${f.teaches}`}
                        width={220}
                        height={220}
                        className="size-full object-cover object-top grayscale-[0.2] transition-[filter] duration-500 group-hover:grayscale-0"
                      />
                    </span>
                  </span>
                  <span data-k-display className="mt-6 block text-2xl">
                    {f.name}
                  </span>
                  <span className="mt-1 block text-[0.7rem] tracking-[0.2em] text-[var(--k-muted)] uppercase">
                    {f.teaches}
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Watch */}
      <section
        id="watch"
        aria-labelledby="watch-h"
        className={`${container} scroll-mt-24 pb-28`}
      >
        <Reveal>
          <h2 id="watch-h" data-k-h2 className="max-w-[18ch]">
            Watch a full class before you pay.
          </h2>
        </Reveal>
        <ul className="mt-12 grid gap-6 lg:grid-cols-12">
          {classes.slice(0, 3).map((c, i) => (
            <li
              key={c.id}
              className={
                i === 0 ? "lg:col-span-6 lg:row-span-2" : "lg:col-span-6"
              }
            >
              <div
                className={
                  i === 0
                    ? "grid gap-4"
                    : "grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-5"
                }
              >
                <PlayInPlace
                  id={c.id}
                  title={c.title}
                  data-k-photo
                  className="group relative block aspect-video w-full overflow-hidden rounded-[var(--k-inner)] bg-[#000820]"
                >
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes={
                      i === 0 ? "(min-width: 1024px) 600px, 100vw" : "300px"
                    }
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-[rgba(0,8,32,0.28)]">
                    <span
                      data-k-btn
                      className="grid size-14 place-items-center rounded-full transition-transform duration-200 ease-out group-active:scale-95"
                    >
                      <IconPlayerPlayFilled
                        aria-hidden
                        size={20}
                        className="translate-x-px"
                      />
                    </span>
                  </span>
                </PlayInPlace>
                <div>
                  <p
                    data-k-display
                    className={i === 0 ? "text-3xl" : "text-xl leading-tight"}
                  >
                    {c.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--k-muted)]">
                    {c.by},{" "}
                    <span className="tabular-nums">{compact(c.views)}</span>{" "}
                    views
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {reviews.slice(0, 4).map((r) => (
            <li key={r.id}>
              <PlayInPlace
                id={r.id}
                title={`${r.name}, ${r.batch}`}
                data-k-photo
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[var(--k-inner)] bg-[#000820] text-left"
              >
                <Image
                  src={r.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,8,32,0.94))]"
                />
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span data-k-display className="block text-xl leading-tight">
                    {r.name}
                  </span>
                  <span className="block text-sm text-[var(--k-muted)]">
                    {r.exam}, {r.batch}
                  </span>
                </span>
              </PlayInPlace>
            </li>
          ))}
        </ul>
      </section>

      {/* Free first */}
      <section
        id="free"
        aria-labelledby="free-h"
        className={`${container} scroll-mt-24 pb-28`}
      >
        <Reveal>
          <p data-cb-label>Free notes and books</p>
          <h2 id="free-h" data-k-h2 className="mt-5 max-w-[20ch]">
            Start free. Pay when you pick a batch.
          </h2>
          {samples && (
            <p className="mt-4 text-sm text-[var(--k-muted)]">
              Sample titles until ICT adds its own.
            </p>
          )}
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
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
        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          {books.length > 0 && (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:col-span-7">
              {books.slice(0, 4).map((b) => (
                <li key={b.slug} className="min-w-0">
                  <Link
                    data-bk-hover
                    href={`${base}/books/${b.slug}`}
                    className="group block"
                  >
                    <Book3D book={b} tones={bookTones} font="var(--cb-sans)" />
                    <span
                      data-k-display
                      className="mt-4 block px-[18px] text-xl leading-tight"
                    >
                      {b.title}
                    </span>
                    <span className="block px-[18px] text-sm text-[var(--k-accent)] tabular-nums">
                      {b.price}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div
            className={
              books.length > 0
                ? "lg:col-span-5"
                : "grid gap-12 lg:col-span-12 lg:grid-cols-2"
            }
          >
            <ul className="grid gap-4">
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
                        className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-[var(--k-inner)]"
                      >
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
                      <span data-k-display className="block text-2xl">
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
            <div className={books.length > 0 ? "mt-12" : ""}>
              <h3 data-k-display className="text-2xl">
                What one fee covers
              </h3>
              <p className="mt-1 text-sm text-[var(--k-muted)]">{fees.note}</p>
              <ul className="mt-6 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                {included.map((x) => (
                  <li key={x.text} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-[0.45em] size-1.5 shrink-0 rotate-45 bg-[var(--k-accent)]"
                    />
                    {x.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Questions and the centre */}
      <section
        aria-labelledby="faq-h"
        className={`${container} grid gap-10 pb-28 lg:grid-cols-12`}
      >
        <div className="lg:col-span-4">
          <h2 id="faq-h" data-k-h2>
            Questions.
          </h2>
          <a
            href={place.maps}
            {...external}
            data-k-card
            className="mt-8 flex items-start gap-4 p-5"
          >
            <IconMapPin
              aria-hidden
              size={22}
              stroke={1.5}
              className="mt-1 shrink-0 text-[var(--k-accent)]"
            />
            <span>
              <span data-k-display className="block text-xl">
                {place.spoken}, {place.city}
              </span>
              <span className="text-sm text-[var(--k-muted)]">
                {place.street}, {place.pin}. Open in Google Maps.
              </span>
            </span>
          </a>
        </div>
        <div className="lg:col-span-8">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              data-k-faq
              className={i ? "border-t border-[var(--k-line)]" : ""}
            >
              <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-4 py-4">
                <span data-k-display className="text-xl leading-snug">
                  {f.q}
                </span>
                <IconPlus
                  data-plus
                  aria-hidden
                  size={20}
                  stroke={1.5}
                  className="shrink-0 text-[var(--k-accent)]"
                />
              </summary>
              <p className="max-w-[62ch] pb-5 text-[var(--k-muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Enquiry */}
      <section aria-labelledby="ask-h" className={`${container} pb-24`}>
        <div data-k-card className="grid gap-12 p-8 sm:p-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="ask-h" data-k-h2 className="max-w-[12ch]">
              Not sure which batch?
            </h2>
            <ol className="mt-8 grid gap-6">
              {joining.map((j) => (
                <li key={j.verb} className="grid grid-cols-[auto_1fr] gap-4">
                  <span
                    aria-hidden
                    className="mt-2 size-2 rotate-45 bg-[var(--k-accent)]"
                  />
                  <span>
                    <span data-k-display className="block text-xl">
                      {j.verb}
                    </span>
                    <span className="text-sm text-[var(--k-muted)]">
                      {j.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </main>
  )
}
