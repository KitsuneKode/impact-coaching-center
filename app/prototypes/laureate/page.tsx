import {
  IconArrowRight,
  IconArrowUpRight,
  IconMapPin,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

import { timings } from "@/lib/brand"

import { BatchFinder } from "../_blocks/batch-finder"
import { RankClimb } from "../_blocks/rank-climb"
import { RouteExplorer } from "../_blocks/route-explorer"
import { Book3D } from "../_book"
import { campaign } from "../_campaign"
import {
  campus,
  classes,
  compact,
  courses,
  faculty,
  faqs,
  fee,
  included,
  joining,
  links,
  nextBatch,
  offer,
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
import { CountUp, PlayInPlace } from "../_fx"
import { batchDay } from "../_kit/batch-day"
import { buildRoutes } from "../_kit/routes"
import { bookTones, container, external, folderTones } from "../_kit/shared"
import { Reveal } from "../_reveal"
import { SiteReel, TopBar, WeekPlan } from "./_client"
import { base } from "./_theme"

const Rule = () => (
  <div data-lr-rule aria-hidden>
    <i />
  </div>
)

const routeVar: Record<string, string> = {
  apsc: "var(--lr-route-apsc)",
  adre: "var(--lr-route-adre)",
  "assam-police-si": "var(--lr-route-police)",
  banking: "var(--lr-route-banking)",
}

export default async function LaureateHome() {
  const { books, folders, samples } = await shelf()
  const victor = courses.find((c) => c.name === nextBatch.name)
  const day = batchDay(nextBatch.startsOn)

  const barCampaign = {
    ...campaign,
    tag: "New batch",
    headline: `Day ${day}: ${nextBatch.name}.`,
    body: `${nextBatch.exam}, ${nextBatch.timing}, for ${nextBatch.forWho}.`,
    cta: "See the batch",
    href: victor ? `${base}${victor.href}` : `${base}/courses`,
  }

  const finderBatches = timetable.map((t) => ({
    id: t.id,
    name: t.name,
    exam: t.exam,
    when: t.when,
    days: t.days,
    price: fee(t.price),
    href: `${base}${t.href}`,
    start: t.start,
  }))
  const noTiming = courses
    .filter((c) => !c.when && c.price)
    .map((c) => ({
      exam: c.exam,
      name: c.name,
      price: rupees(c.price!),
      href: `${base}/courses/${c.slug}`,
    }))

  const routes = buildRoutes(base, routeVar)

  return (
    <main id="top">
      <TopBar c={barCampaign} />

      {/* Hero */}
      <section
        aria-label="Introduction"
        className={`${container} grid items-center gap-12 pt-12 pb-20 md:pt-16 lg:grid-cols-12`}
      >
        <div className="lg:col-span-6">
          <p
            data-rise
            data-k-wide
            className="text-[0.7rem] text-[var(--k-muted)]"
          >
            North Lakhimpur, Assam
          </p>
          <h1
            data-rise
            data-k-h1
            style={{ animationDelay: "0.06s" }}
            className="mt-5 max-w-[13ch]"
          >
            Coaching for Assam&apos;s <span data-lr-foil>biggest exams.</span>
          </h1>
          <p
            data-rise
            style={{ animationDelay: "0.12s" }}
            className="mt-7 max-w-[42ch] text-lg text-[var(--k-muted)]"
          >
            Batches in North Lakhimpur, ICT&apos;s own books, free notes, and
            every class on the app.
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
              href="#routes"
              data-k-press
              data-k-outline
              className="inline-flex h-12 items-center px-6"
            >
              Choose your exam
            </a>
          </div>
        </div>
        <div
          data-rise
          style={{ animationDelay: "0.24s" }}
          className="lg:col-span-6"
        >
          <div data-k-card className="p-6 sm:p-8">
            <BatchFinder
              batches={finderBatches}
              noTiming={noTiming}
              exams={[...courses.map((c) => c.exam), "Not sure yet"]}
              times={[...timings]}
              askHref={whatsapp}
            />
          </div>
        </div>
      </section>

      {/* Proof */}
      <section aria-label="ICT in numbers" className={`${container} pb-24`}>
        <Rule />
        <dl className="mt-10 grid grid-cols-2 gap-y-8 lg:grid-cols-4">
          {proof.map((p) => (
            <div key={p.label} className="flex flex-col pr-4">
              <dd
                data-k-display
                className="order-1 text-[clamp(2.4rem,4.4vw,3.6rem)] leading-none text-[var(--k-accent-deep)] tabular-nums"
              >
                <CountUp display={p.display} />
              </dd>
              <dt className="order-2 mt-3 max-w-[26ch] text-sm text-[var(--k-muted)]">
                {p.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Merit list */}
      <section
        id="merit"
        aria-labelledby="merit-h"
        className={`${container} scroll-mt-20 pb-24`}
      >
        <Reveal>
          <h2 id="merit-h" data-k-h2 className="max-w-[16ch]">
            On the APSC CCE 2022 merit list.
          </h2>
          <a
            href={links.apscResultPdf}
            {...external}
            data-k-link
            className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm underline decoration-[var(--k-line-hi)] underline-offset-4"
          >
            Result of 17 January 2024
            <IconArrowUpRight aria-hidden size={15} stroke={2} />
          </a>
        </Reveal>
        <ol data-k-card className="mt-10 overflow-hidden">
          {selections.map((s, i) => (
            <li
              key={s.name}
              data-lr-row
              className={i ? "border-t border-[var(--k-line)]" : ""}
            >
              <Reveal delay={i * 0.06}>
                <figure className="grid items-center gap-6 px-6 py-8 sm:px-10 md:grid-cols-[minmax(150px,220px)_1fr_auto]">
                  <span data-lr-rank>
                    <RankClimb value={s.serial} />
                  </span>
                  <blockquote
                    data-k-display
                    className="max-w-[46ch] text-[1.4rem] leading-snug text-pretty italic"
                  >
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                  <figcaption className="md:text-right">
                    <span className="block font-semibold">{s.name}</span>
                    <span className="text-sm text-[var(--k-muted)]">
                      {s.post}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Routes */}
      <section
        id="routes"
        aria-labelledby="routes-h"
        className={`${container} scroll-mt-20 pb-24`}
      >
        <Reveal>
          <h2 id="routes-h" data-k-h2 className="max-w-[20ch]">
            Pick the exam. See the <span data-lr-draw>road to it.</span>
          </h2>
          <p className="mt-4 max-w-[56ch] text-[var(--k-muted)]">
            Every line starts at a free workshop and stops at that exam&apos;s
            real stages. Press a line to open it.
          </p>
        </Reveal>
        <div className="mt-10">
          <RouteExplorer routes={routes} hub={offer.short} />
        </div>
      </section>

      {/* Faculty */}
      <section aria-labelledby="faculty-h" className={`${container} pb-24`}>
        <Reveal>
          <Rule />
          <h2 id="faculty-h" data-k-h2 className="mt-10 max-w-[16ch]">
            The faculty.
          </h2>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
          {faculty.map((f, i) => (
            <li key={f.slug}>
              <Reveal delay={(i % 5) * 0.05}>
                <a
                  href={`https://www.youtube.com/watch?v=${f.lecture}`}
                  {...external}
                  className="group block text-center"
                >
                  <span
                    data-lr-arch
                    data-k-photo
                    className="relative mx-auto block aspect-[3/4] overflow-hidden transition-transform duration-500 ease-out group-hover:-translate-y-1"
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
                    data-k-display
                    className="mt-5 block text-2xl leading-tight"
                  >
                    {f.name}
                  </span>
                  <span className="block text-sm text-[var(--k-muted)]">
                    {f.teaches}
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Watch */}
      <section aria-labelledby="watch-h" className={`${container} pb-24`}>
        <Reveal>
          <h2 id="watch-h" data-k-h2 className="max-w-[18ch]">
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
                className="group relative block aspect-video w-full overflow-hidden rounded-[var(--k-inner)] bg-[#000820]"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes={i === 0 ? "(min-width: 1024px) 560px, 100vw" : "300px"}
                  className="object-cover"
                />
                <span className="absolute inset-0 grid place-items-center bg-[rgba(0,8,32,0.22)]">
                  <span
                    data-k-btn
                    className="grid size-14 place-items-center rounded-full transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
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
                className={`mt-3 leading-tight ${i === 0 ? "text-2xl" : "text-xl"}`}
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
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
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
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,8,32,0.92))]"
                />
                <span
                  data-k-btn
                  className="absolute top-3 right-3 grid size-10 place-items-center rounded-full transition-transform duration-200 ease-out group-hover:scale-105"
                >
                  <IconPlayerPlayFilled
                    aria-hidden
                    size={15}
                    className="translate-x-px"
                  />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4 text-[#F8F3E6]">
                  <span data-k-display className="block text-xl leading-tight">
                    {r.name}
                  </span>
                  <span className="block text-sm text-[#ACB8CB]">
                    {r.exam}, {r.batch}
                  </span>
                </span>
              </PlayInPlace>
            </li>
          ))}
        </ul>
      </section>

      {/* Library */}
      <section
        id="free"
        aria-labelledby="free-h"
        className={`${container} scroll-mt-20 pb-24`}
      >
        <Reveal>
          <Rule />
          <h2 id="free-h" data-k-h2 className="mt-10 max-w-[20ch]">
            Start free. Pay when you pick a batch.
          </h2>
          {samples && (
            <p
              data-k-wide
              className="mt-4 text-[0.66rem] text-[var(--k-muted)]"
            >
              Sample titles until ICT adds its own
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
                  <Book3D book={b} tones={bookTones} font="var(--lr-sans)" />
                  <span
                    data-k-display
                    className="mt-4 block px-[18px] text-xl leading-tight"
                  >
                    {b.title}
                  </span>
                  <span className="block px-[18px] text-sm text-[var(--k-accent-deep)] tabular-nums">
                    {b.price}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="grid content-start gap-4 lg:col-span-5">
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
                    <span
                      data-k-display
                      className="block text-2xl leading-tight"
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
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {included.map((x) => (
            <li key={x.text} data-k-tile className="p-4 text-sm font-medium">
              {x.text}
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
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {campus.slice(0, 4).map((c) => (
            <li key={c.src}>
              <figure>
                <span
                  data-k-photo
                  className="relative block aspect-[4/3] overflow-hidden rounded-[var(--k-inner)]"
                >
                  <Image
                    src={c.src}
                    alt={c.alt}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                  />
                </span>
                <figcaption className="mt-2 text-sm text-[var(--k-muted)]">
                  {c.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <div
          data-k-card
          className="mt-8 flex flex-wrap items-center justify-between gap-5 p-6 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <span
              data-k-btn
              className="grid size-12 shrink-0 place-items-center"
            >
              <IconMapPin aria-hidden size={22} stroke={1.75} />
            </span>
            <address className="not-italic">
              <span data-k-display className="block text-2xl leading-tight">
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

      {/* Questions */}
      <section
        aria-labelledby="faq-h"
        className={`${container} grid gap-8 pb-24 lg:grid-cols-12`}
      >
        <h2 id="faq-h" data-k-h2 className="lg:col-span-4">
          Questions.
        </h2>
        <div data-k-card className="px-6 py-2 sm:px-8 lg:col-span-8">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              data-k-faq
              className={i ? "border-t border-[var(--k-line)]" : ""}
            >
              <summary className="flex min-h-16 items-center justify-between gap-4 py-4">
                <span data-k-display className="text-xl leading-snug">
                  {f.q}
                </span>
                <IconPlus
                  data-plus
                  aria-hidden
                  size={20}
                  stroke={1.5}
                  className="shrink-0 text-[var(--k-accent-deep)]"
                />
              </summary>
              <p className="max-w-[62ch] pb-5 text-[var(--k-muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* First week and enquiry */}
      <section aria-labelledby="join-h" className={`${container} pb-24`}>
        <div data-k-card className="grid gap-12 p-8 sm:p-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-5">
              <span data-lr-seal>
                <Image
                  src="/brand/ict-mark.png"
                  alt=""
                  width={40}
                  height={40}
                  className="size-10"
                />
              </span>
              <p data-k-wide className="text-[0.66rem] text-[var(--k-muted)]">
                Your first week
              </p>
            </div>
            <h2 id="join-h" data-k-h2 className="mt-8 max-w-[12ch]">
              Sit in on a class, <span data-lr-foil>free.</span>
            </h2>
            <div className="mt-8">
              <WeekPlan
                steps={joining.map((j) => ({ verb: j.verb, body: j.body }))}
                cta={offer.cta}
                href={whatsapp}
              />
            </div>
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
            <div data-k-tile className="p-6 sm:p-8">
              <h3 data-k-display className="text-2xl leading-tight">
                Not sure which batch? Tell us your exam and your hours.
              </h3>
              <div className="mt-6">
                <EnquiryForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteReel c={campaign} />
    </main>
  )
}
