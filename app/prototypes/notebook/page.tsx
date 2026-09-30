import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconMapPin,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { Book3D } from "../_book"
import {
  campus,
  classes,
  compact,
  examGuides,
  faculty,
  faqs,
  fee,
  fees,
  included,
  joining,
  links,
  offer,
  phone,
  place,
  proof,
  reviews,
  selections,
  shelf,
  tel,
  timetable,
  whatsapp,
  workshops,
} from "../_data"
import { EnquiryForm } from "../_enquiry"
import { Folder } from "../_folder"
import { CountUp, PlayInPlace } from "../_fx"
import { bookTones, container, external, folderTones } from "../_kit/shared"
import { Reveal } from "../_reveal"
import { Planner, PlanCard, type PlannerRow } from "./_client"
import { base } from "./_theme"

const tilt = (deg: number) => ({ "--nb-r": `${deg}deg` }) as CSSProperties

export default async function NotebookHome() {
  const { books, folders, samples } = await shelf()
  const rows: PlannerRow[] = timetable.map((t) => ({
    id: t.id,
    name: t.name,
    exam: t.exam,
    when: t.when,
    days: t.days,
    price: fee(t.price),
    href: `${base}${t.href}`,
    start: t.start,
    end: t.end,
  }))

  return (
    <main id="top">
      {/* Hero */}
      <section
        aria-label="Introduction"
        className={`${container} grid items-center gap-14 pt-12 pb-20 md:pt-16 lg:grid-cols-12`}
      >
        <div className="lg:col-span-7">
          <p data-rise data-nb-hand>
            North Lakhimpur, Assam
          </p>
          <h1
            data-rise
            data-k-h1
            style={{ animationDelay: "0.06s" }}
            className="mt-3 max-w-[14ch]"
          >
            Coaching for Assam&apos;s <span data-nb-mark>biggest exams.</span>
          </h1>
          <p
            data-rise
            style={{ animationDelay: "0.12s" }}
            className="mt-6 max-w-[44ch] text-lg text-[var(--k-muted)]"
          >
            Batches in North Lakhimpur, ICT&apos;s own books, free notes, and
            every class on the app.
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
                stroke={2.25}
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              />
            </a>
            <a
              href="#planner"
              data-k-press
              data-k-outline
              className="inline-flex h-12 items-center px-6"
            >
              Find your hour
            </a>
          </div>
        </div>
        <div
          data-rise
          style={{ animationDelay: "0.24s", ...tilt(1.2) }}
          className="lg:col-span-5"
        >
          <PlanCard
            steps={joining.map((j) => ({ verb: j.verb, body: j.body }))}
            cta={offer.cta}
            href={whatsapp}
          />
        </div>
      </section>

      {/* Planner */}
      <section
        id="planner"
        aria-labelledby="planner-h"
        className={`${container} scroll-mt-20 pb-24`}
      >
        <Reveal>
          <h2 id="planner-h" data-k-h2 className="max-w-[18ch]">
            Find the <span data-nb-mark>hour</span> you can study.
          </h2>
        </Reveal>
        <div className="mt-10">
          <Planner rows={rows} />
        </div>
      </section>

      {/* Exams as sticky notes */}
      <section aria-labelledby="exams-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="exams-h" data-k-h2 className="max-w-[20ch]">
            Know the exam before you pick a batch.
          </h2>
        </Reveal>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {examGuides.map((g, i) => (
            <li key={g.slug} className={i % 2 ? "lg:mt-10" : ""}>
              <Link
                href={`${base}/exams`}
                data-nb-note
                data-nb-tilt
                style={tilt([-2.2, 1.6, -1, 2.4][i] ?? 0)}
                className={`relative flex min-h-[260px] flex-col p-6 ${i % 2 ? "bg-white" : "bg-[var(--k-accent)]"}`}
              >
                <span data-nb-hand className="!text-[var(--k-ink)] opacity-70">
                  {g.body}
                </span>
                <span
                  data-k-display
                  className="mt-2 text-2xl leading-tight font-extrabold"
                >
                  {g.short}
                </span>
                <span className="mt-3 text-sm text-pretty text-[var(--k-ink)]/80">
                  {g.summary.split(". ")[0]}.
                </span>
                <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-bold">
                  {g.stages.length} {g.stages.length === 1 ? "stage" : "stages"}
                  <IconArrowRight aria-hidden size={15} stroke={2.25} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* What a fee covers */}
      <section
        aria-labelledby="fee-h"
        className={`${container} grid gap-10 pb-24 lg:grid-cols-12`}
      >
        <Reveal className="lg:col-span-5">
          <h2 id="fee-h" data-k-h2 className="max-w-[14ch]">
            What one fee covers.
          </h2>
          <p className="mt-4 max-w-[38ch] text-[var(--k-muted)]">{fees.note}</p>
          <p data-nb-hand className="mt-4">
            {fees.scholarship}
          </p>
        </Reveal>
        <ul
          data-nb-ruled
          data-k-card
          className="grid gap-x-8 py-6 pr-6 pl-16 sm:grid-cols-2 lg:col-span-7"
        >
          {included.map((x) => (
            <li key={x.text} className="flex items-start gap-3 py-2">
              <span data-nb-check aria-hidden>
                <IconCheck size={18} stroke={3} />
              </span>
              <span className="font-medium">{x.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Desk: books and free notes */}
      <section
        id="free"
        aria-labelledby="desk-h"
        className={`${container} scroll-mt-20 pb-24`}
      >
        <Reveal>
          <h2 id="desk-h" data-k-h2 className="max-w-[20ch]">
            Start free. Pay when you pick a batch.
          </h2>
          {samples && (
            <p data-nb-hand className="mt-3">
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

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:col-span-7">
            {books.slice(0, 4).map((b) => (
              <li key={b.slug} className="min-w-0">
                <Link
                  data-bk-hover
                  href={`${base}/books/${b.slug}`}
                  className="group block"
                >
                  <Book3D book={b} tones={bookTones} font="var(--nb-sans)" />
                  <span className="mt-4 block px-[18px] font-bold">
                    {b.title}
                  </span>
                  <span className="block px-[18px] text-sm text-[var(--k-muted)] tabular-nums">
                    {b.price}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="grid content-start gap-5 lg:col-span-5">
            {workshops.map((w, i) => (
              <li key={w.name}>
                <Link
                  href={`${base}${w.href}`}
                  data-k-card
                  data-nb-tape
                  data-nb-tilt
                  style={
                    {
                      ...tilt(i ? 1.4 : -1.4),
                      "--nb-tape": `${i ? 4 : -4}deg`,
                    } as CSSProperties
                  }
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
                    <span
                      data-k-display
                      className="block text-xl font-extrabold"
                    >
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

      {/* Teachers as polaroids */}
      <section aria-labelledby="teachers-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="teachers-h" data-k-h2 className="max-w-[16ch]">
            The people in front of the class.
          </h2>
        </Reveal>
        <ul className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
          {faculty.map((f, i) => (
            <li key={f.slug}>
              <a
                href={`https://www.youtube.com/watch?v=${f.lecture}`}
                {...external}
                data-nb-tilt
                data-nb-tape
                style={
                  {
                    ...tilt([-2, 1.5, -1, 2, -1.6][i] ?? 0),
                    "--nb-tape": `${[3, -4, 2, -3, 4][i] ?? 0}deg`,
                  } as CSSProperties
                }
                className="block bg-white p-3 pb-5"
              >
                <span
                  data-k-photo
                  className="relative block aspect-[4/5] overflow-hidden"
                >
                  <Image
                    src={f.portrait}
                    alt={`${f.name}, ${f.teaches}`}
                    fill
                    sizes="(min-width: 1024px) 220px, 45vw"
                    className="object-cover object-top"
                  />
                </span>
                <span
                  data-nb-hand
                  className="mt-3 block !text-[1.5rem] !text-[var(--k-ink)]"
                >
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

      {/* Watch first */}
      <section aria-labelledby="watch-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="watch-h" data-k-h2 className="max-w-[20ch]">
            Watch a real class before you join.
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-5 lg:grid-cols-12">
          {classes.slice(0, 3).map((c, i) => (
            <li
              key={c.id}
              className={i === 0 ? "lg:col-span-6" : "lg:col-span-3"}
            >
              <PlayInPlace
                id={c.id}
                title={c.title}
                data-k-photo
                className="group relative block aspect-video w-full overflow-hidden bg-[var(--k-ink)]"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes={i === 0 ? "(min-width: 1024px) 560px, 100vw" : "300px"}
                  className="object-cover"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span
                    data-k-btn
                    className="grid size-14 place-items-center transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
                  >
                    <IconPlayerPlayFilled
                      aria-hidden
                      size={20}
                      className="translate-x-px"
                    />
                  </span>
                </span>
              </PlayInPlace>
              <p
                data-k-display
                className={`mt-3 font-extrabold ${i === 0 ? "text-2xl" : "text-lg"}`}
              >
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

      {/* Results as a report card */}
      <section aria-labelledby="results-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="results-h" data-k-h2 className="max-w-[20ch]">
            On the APSC CCE 2022 list.
          </h2>
          <a
            href={links.apscResultPdf}
            {...external}
            data-k-link
            className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm underline underline-offset-4"
          >
            Result of 17 January 2024
            <IconArrowUpRight aria-hidden size={15} stroke={2} />
          </a>
        </Reveal>
        <ul className="mt-10 grid gap-5 lg:grid-cols-2">
          {selections.map((s, i) => (
            <li key={s.name}>
              <Reveal delay={i * 0.05} className="h-full">
                <figure
                  data-k-card
                  data-nb-ruled
                  className="flex h-full gap-5 py-7 pr-6 pl-16"
                >
                  <span
                    data-nb-circle
                    data-k-display
                    className="self-start text-3xl font-extrabold tabular-nums"
                  >
                    {s.serial}
                  </span>
                  <span className="grid gap-3">
                    <blockquote
                      data-nb-hand
                      className="!text-[1.45rem] !text-[var(--k-ink)]"
                    >
                      &ldquo;{s.quote}&rdquo;
                    </blockquote>
                    <figcaption>
                      <span className="block font-bold">{s.name}</span>
                      <span className="text-sm text-[var(--k-muted)]">
                        {s.post}
                      </span>
                    </figcaption>
                  </span>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
        <dl className="mt-10 grid grid-cols-2 gap-y-8 lg:grid-cols-4">
          {proof.map((p) => (
            <div key={p.label} className="flex flex-col pr-4">
              <dd
                data-k-display
                className="order-1 text-[clamp(2.2rem,4.4vw,3.4rem)] leading-none font-extrabold tabular-nums"
              >
                <CountUp display={p.display} />
              </dd>
              <dt className="order-2 mt-2 max-w-[24ch] text-sm text-[var(--k-muted)]">
                {p.label}
              </dt>
            </div>
          ))}
        </dl>
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {reviews.slice(0, 4).map((r) => (
            <li key={r.id}>
              <PlayInPlace
                id={r.id}
                title={`${r.name}, ${r.batch}`}
                data-k-photo
                className="group relative block aspect-[4/5] w-full overflow-hidden bg-[var(--k-ink)] text-left"
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
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(16,27,77,0.92))]"
                />
                <span
                  data-k-btn
                  className="absolute top-3 right-3 grid size-10 place-items-center transition-transform duration-200 ease-out group-hover:scale-105"
                >
                  <IconPlayerPlayFilled
                    aria-hidden
                    size={15}
                    className="translate-x-px"
                  />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span
                    data-nb-hand
                    className="block !text-[1.4rem] !text-white"
                  >
                    {r.name}
                  </span>
                  <span className="block text-sm text-white/80">
                    {r.exam}, {r.batch}
                  </span>
                </span>
              </PlayInPlace>
            </li>
          ))}
        </ul>
      </section>

      {/* Centre */}
      <section aria-labelledby="centre-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="centre-h" data-k-h2 className="max-w-[18ch]">
            The classroom on DC Bungalow Road.
          </h2>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          {campus.slice(0, 4).map((c, i) => (
            <li key={c.src}>
              <figure
                data-nb-tilt
                data-nb-tape
                style={
                  {
                    ...tilt([-2, 1.4, -1.2, 2][i] ?? 0),
                    "--nb-tape": `${[3, -3, 4, -4][i] ?? 0}deg`,
                  } as CSSProperties
                }
                className="bg-white p-2.5 pb-4"
              >
                <span
                  data-k-photo
                  className="relative block aspect-[4/3] overflow-hidden"
                >
                  <Image
                    src={c.src}
                    alt={c.alt}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                  />
                </span>
                <figcaption data-nb-hand className="mt-2 !text-[1.15rem]">
                  {c.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <div
          data-k-card
          className="mt-10 flex flex-wrap items-center justify-between gap-5 p-6"
        >
          <div className="flex items-start gap-4">
            <span
              data-k-btn
              className="grid size-12 shrink-0 place-items-center"
            >
              <IconMapPin aria-hidden size={22} stroke={1.75} />
            </span>
            <address className="not-italic">
              <span data-k-display className="block text-xl font-extrabold">
                {place.street}, {place.city}
              </span>
              <span className="text-sm text-[var(--k-muted)]">
                {place.region} {place.pin}. Ask for {place.spoken}.
              </span>
            </address>
          </div>
          <a
            href={place.maps}
            {...external}
            data-k-press
            data-k-outline
            className="inline-flex h-12 items-center gap-2 px-6"
          >
            Get directions
            <IconArrowUpRight aria-hidden size={16} stroke={2} />
          </a>
        </div>
      </section>

      {/* Questions as margin notes */}
      <section aria-labelledby="faq-h" className={`${container} pb-24`}>
        <h2 id="faq-h" data-k-h2>
          Questions.
        </h2>
        <dl className="mt-10 grid gap-x-12 gap-y-9 md:grid-cols-2">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt data-k-display className="text-xl font-extrabold">
                {f.q}
              </dt>
              <dd className="mt-2 text-[var(--k-muted)]">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Enquire as an admission slip */}
      <section aria-labelledby="join-h" className={`${container} pb-20`}>
        <div
          data-k-card
          data-nb-ruled
          className="grid gap-10 py-10 pr-6 pl-16 sm:pr-10 lg:grid-cols-12"
        >
          <span data-nb-hole style={{ top: 30 }} />
          <span data-nb-hole style={{ top: "50%" }} />
          <span data-nb-hole style={{ bottom: 30 }} />
          <div className="lg:col-span-5">
            <p data-nb-hand>Not sure which batch?</p>
            <h2 id="join-h" data-k-h2 className="mt-1 max-w-[12ch]">
              Sit in on a class, <span data-nb-mark>free.</span>
            </h2>
            <p className="mt-4 max-w-[36ch] text-[var(--k-muted)]">
              Tell us your exam and the hours you can study. Or call {phone}.
            </p>
            <a
              href={tel}
              data-k-press
              data-k-outline
              className="mt-6 inline-flex h-12 items-center px-6 tabular-nums"
            >
              Call {phone}
            </a>
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </main>
  )
}
