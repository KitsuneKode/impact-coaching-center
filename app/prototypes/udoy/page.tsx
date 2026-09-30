import {
  IconArrowUpRight,
  IconCheck,
  IconMapPin,
  IconPhone,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

import { timings } from "@/lib/brand"

import { Book3D } from "../_book"
import {
  classes,
  compact,
  courses,
  faculty,
  faqs,
  fee,
  fees,
  included,
  links,
  phone,
  place,
  proof,
  reviews,
  rupees,
  selections,
  shelf,
  tel,
  timetable,
  whatsapp,
  workshops,
} from "../_data"
import { EnquiryForm } from "../_enquiry"
import { Folder } from "../_folder"
import { PlayInPlace } from "../_fx"
import { bookTones, container, external, folderTones } from "../_kit/shared"
import { Reveal } from "../_reveal"
import { BatchSearch, Batches } from "./_client"
import { base } from "./_theme"

export default async function UdoyHome() {
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
  const untimed = courses
    .filter((c) => !c.when && c.price)
    .map((c) => ({
      exam: c.exam,
      name: c.name,
      price: rupees(c.price!),
      href: `${base}${c.href}`,
    }))

  return (
    <main id="top">
      {/* Hero: the river, and a search on it */}
      <section data-ud-hero aria-label="Introduction">
        <div data-ud-photo>
          <Image
            src="/proto/udoy-river-dusk.jpg"
            alt="Dusk over the Brahmaputra"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div
          className={`${container} flex min-h-[100svh] flex-col justify-between gap-16 pt-32 pb-28 md:pt-36`}
        >
          <div>
            <p
              data-rise
              data-ud-label
              className="inline-flex items-center gap-2 text-[#E7EAF2]"
            >
              <IconMapPin aria-hidden size={15} stroke={1.75} />
              {place.city}, {place.region}
            </p>
            <h1
              data-rise
              data-k-h1
              style={{ animationDelay: "0.06s" }}
              className="mt-6 max-w-[13ch]"
            >
              Prepare for Assam&apos;s exams, right here.
            </h1>
            <p
              data-rise
              style={{ animationDelay: "0.12s" }}
              className="mt-6 max-w-[42ch] text-lg text-[#DCE1EC]"
            >
              APSC, ADRE, Assam Police and Banking batches on DC Bungalow Road,
              and every class on the ICT app.
            </p>
          </div>
          <div
            data-rise
            style={{ animationDelay: "0.2s" }}
            className="w-full max-w-[760px]"
          >
            <BatchSearch
              exams={[...courses.map((c) => c.exam), "Not sure yet"]}
              times={[...timings]}
            />
          </div>
        </div>
      </section>

      {/* Proof, right under the photograph */}
      <section
        aria-label="ICT in numbers"
        className={`${container} relative z-10 -mt-14`}
      >
        <ul
          data-ud-proof
          className="grid grid-cols-2 overflow-hidden lg:grid-cols-4"
        >
          {proof.map((p, i) => (
            <li
              key={p.label}
              className={
                i
                  ? "border-[var(--k-line)] max-lg:odd:border-t lg:border-l"
                  : ""
              }
            >
              <a
                href={p.href}
                {...external}
                className="flex h-full flex-col gap-1 p-6 sm:p-7"
              >
                <span className="text-4xl font-bold tracking-[-0.03em] tabular-nums">
                  {p.display}
                </span>
                <span className="text-sm text-[var(--k-muted)]">{p.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Batches */}
      <section
        id="batches"
        aria-labelledby="batches-h"
        className={`${container} scroll-mt-24 pt-24 pb-24`}
      >
        <Reveal>
          <h2 id="batches-h" data-k-h2 className="max-w-[16ch]">
            Batches, by the hour.
          </h2>
        </Reveal>
        <div className="mt-8">
          <Batches batches={batches} untimed={untimed} askHref={whatsapp} />
        </div>
      </section>

      {/* One fee, over the bridge */}
      <section aria-labelledby="fee-h" className={`${container} pb-24`}>
        <div data-ud-band className="flex flex-col p-7 sm:p-12">
          <Image
            data-ud-band-img
            src="/proto/udoy-bridge.jpg"
            alt=""
            fill
            sizes="(min-width: 1280px) 1180px, 100vw"
            className="-z-20"
          />
          <h2 id="fee-h" data-k-h2 className="max-w-[15ch]">
            One fee covers the whole road.
          </h2>
          <p className="mt-4 max-w-[46ch] text-lg text-[var(--k-muted)]">
            {fees.note} {fees.scholarship}
          </p>
          <ul className="mt-auto flex flex-wrap gap-2 pt-40">
            {included.map((x) => (
              <li key={x.text} data-ud-chip>
                <IconCheck
                  aria-hidden
                  size={15}
                  stroke={2.5}
                  className="text-[var(--k-accent-deep)]"
                />
                {x.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Faculty rail */}
      <section aria-labelledby="faculty-h" className="pb-24">
        <div className={container}>
          <Reveal>
            <h2 id="faculty-h" data-k-h2>
              Who teaches you.
            </h2>
          </Reveal>
        </div>
        <ul
          data-ud-rail
          className="mt-10 flex scroll-px-5 gap-4 overflow-x-auto px-5 md:scroll-px-[max(2rem,calc((100vw_-_1176px)/2))] md:px-[max(2rem,calc((100vw_-_1176px)/2))]"
        >
          {faculty.map((f) => (
            <li key={f.slug} className="w-[240px] shrink-0 sm:w-[270px]">
              <a
                href={`https://www.youtube.com/watch?v=${f.lecture}`}
                {...external}
                data-ud-person
                className="group block"
              >
                <span className="relative block aspect-[4/5] overflow-hidden rounded-[var(--k-radius)] bg-[#1B2A5A]">
                  <Image
                    src={f.portrait}
                    alt={`${f.name}, ${f.teaches}`}
                    fill
                    sizes="270px"
                    className="object-cover object-top"
                  />
                  <span className="absolute right-3 bottom-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-white/90 px-3 text-xs font-semibold text-[#0E1733] backdrop-blur">
                    <IconPlayerPlayFilled aria-hidden size={12} />
                    Watch a lecture
                  </span>
                </span>
                <span className="mt-4 block text-xl font-semibold">
                  {f.name}
                </span>
                <span className="block text-sm text-[var(--k-muted)]">
                  {f.teaches}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Results and students */}
      <section aria-labelledby="merit-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="merit-h" data-k-h2 className="max-w-[18ch]">
            From these classrooms to the APSC merit list.
          </h2>
          <a
            href={links.apscResultPdf}
            {...external}
            data-k-link
            className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[var(--k-accent-deep)] underline underline-offset-4"
          >
            APSC CCE 2022 result, 17 January 2024
            <IconArrowUpRight aria-hidden size={15} stroke={2} />
          </a>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          {selections.map((s) => (
            <figure
              key={s.name}
              data-k-card
              className="flex flex-col gap-6 p-7 sm:p-9 lg:col-span-6"
            >
              <blockquote className="text-xl leading-snug font-medium tracking-[-0.01em] text-pretty">
                &ldquo;{s.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto flex items-center justify-between gap-4">
                <span>
                  <span className="block font-semibold">{s.name}</span>
                  <span className="text-sm text-[var(--k-muted)]">
                    {s.post}
                  </span>
                </span>
                <span className="rounded-full bg-[var(--k-ink)] px-4 py-2 text-sm font-semibold text-white tabular-nums">
                  Serial {s.serial}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {reviews.slice(0, 4).map((r) => (
            <li key={r.id}>
              <PlayInPlace
                id={r.id}
                title={`${r.name}, ${r.batch}`}
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[var(--k-radius)] bg-[#0E1733] text-left"
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
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(10,18,48,0.9))]"
                />
                <span className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-[#F2A65A] text-[#0E1733] transition-transform duration-200 ease-out group-hover:scale-105">
                  <IconPlayerPlayFilled
                    aria-hidden
                    size={15}
                    className="translate-x-px"
                  />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4 text-[#F7F4EE]">
                  <span className="block text-lg font-semibold">{r.name}</span>
                  <span className="block text-sm text-[#C9D0DE]">
                    {r.exam}, {r.batch}
                  </span>
                </span>
              </PlayInPlace>
            </li>
          ))}
        </ul>
      </section>

      {/* Watch */}
      <section aria-labelledby="watch-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="watch-h" data-k-h2 className="max-w-[18ch]">
            Watch a full class first.
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {classes.slice(0, 3).map((c) => (
            <li key={c.id}>
              <PlayInPlace
                id={c.id}
                title={c.title}
                className="group relative block aspect-video w-full overflow-hidden rounded-[var(--k-inner)] bg-[#0E1733]"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 grid place-items-center bg-[rgba(10,18,48,0.2)]">
                  <span className="grid size-14 place-items-center rounded-full bg-white/90 text-[#0E1733] backdrop-blur transition-transform duration-200 ease-out group-active:scale-95">
                    <IconPlayerPlayFilled
                      aria-hidden
                      size={20}
                      className="translate-x-px"
                    />
                  </span>
                </span>
              </PlayInPlace>
              <p className="mt-3 text-lg leading-snug font-semibold">
                {c.title}
              </p>
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
        className={`${container} scroll-mt-24 pb-24`}
      >
        <Reveal>
          <h2 id="free-h" data-k-h2 className="max-w-[18ch]">
            Free notes, before any fee.
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
                    <Book3D book={b} tones={bookTones} font="var(--ud-sans)" />
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

      {/* Visit */}
      <section aria-labelledby="visit-h" className={`${container} pb-24`}>
        <div data-k-card className="grid overflow-hidden lg:grid-cols-12">
          <div className="p-7 sm:p-10 lg:col-span-5">
            <h2 id="visit-h" data-k-h2 className="max-w-[12ch]">
              Come and see the classroom.
            </h2>
            <address className="mt-6 text-lg not-italic">
              {place.street}
              <br />
              {place.city}, {place.region} {place.pin}
            </address>
            <p className="mt-2 text-sm text-[var(--k-muted)]">
              Ask anyone for {place.spoken}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={place.maps}
                {...external}
                data-k-press
                data-k-btn
                className="inline-flex h-12 items-center gap-2 px-6"
              >
                Get directions
                <IconArrowUpRight aria-hidden size={17} stroke={2} />
              </a>
              <a
                href={tel}
                data-k-press
                data-k-outline
                className="inline-flex h-12 items-center gap-2 px-6 font-semibold tabular-nums"
              >
                <IconPhone aria-hidden size={17} stroke={1.75} />
                {phone}
              </a>
            </div>
          </div>
          <iframe
            data-ud-map
            title="ICT on the map"
            src={`https://www.google.com/maps?q=${place.lat},${place.lng}&z=16&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="min-h-[340px] w-full border-0 lg:col-span-7 lg:min-h-full"
          />
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
                  <span className="text-lg font-semibold">{f.q}</span>
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
            <h3 className="text-2xl font-bold tracking-[-0.02em]">
              Tell us your exam and your hours.
            </h3>
            <p className="mt-2 text-sm text-[var(--k-muted)]">
              We reply the same day.
            </p>
            <div className="mt-6">
              <EnquiryForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
