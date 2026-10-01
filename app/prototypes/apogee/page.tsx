import {
  IconArrowUpRight,
  IconBrandWhatsapp,
  IconCheck,
  IconMapPin,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { timings } from "@/lib/brand"

import { BatchFinder } from "../_blocks/batch-finder"
import { RouteExplorer } from "../_blocks/route-explorer"
import { Book3D } from "../_book"
import { barCampaign, campaign } from "../_campaign"
import {
  campus,
  courses,
  faculty,
  faqs,
  fee,
  included,
  links,
  offer,
  phone,
  place,
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
import { FolderBrowser } from "../_folder-browser"
import { PlayInPlace } from "../_fx"
import { buildRoutes } from "../_kit/routes"
import { bookTones, container, external, folderTones } from "../_kit/shared"
import { SiteReel, TopBar } from "../_kit/site-promos"
import { Reveal } from "../_reveal"
import { Sky } from "./_client"
import { base } from "./_theme"

const routeColours: Record<string, string> = {
  apsc: "var(--ap-route-apsc)",
  adre: "var(--ap-route-adre)",
  "assam-police-si": "var(--ap-route-police)",
  banking: "var(--ap-route-banking)",
}

function Section({
  id,
  title,
  lede,
  children,
}: {
  id: string
  title: ReactNode
  lede?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className={`${container} scroll-mt-20 pb-28 md:pb-36`}
    >
      <Reveal>
        <h2 id={`${id}-h`} data-k-h2 className="max-w-[18ch]">
          {title}
        </h2>
        {lede && (
          <p className="mt-5 max-w-[48ch] text-[var(--k-muted)]">{lede}</p>
        )}
      </Reveal>
      <div className="mt-12 md:mt-16">{children}</div>
    </section>
  )
}

export default async function ApogeeHome() {
  const { books, folders, samples } = await shelf()
  const workshop = workshops[0]

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
      href: `${base}${c.href}`,
    }))

  const shelfBooks = books.slice(0, 5)
  const bento = shelfBooks.length === 5

  return (
    <main>
      <Sky>
        <div data-ap-bar>
          <TopBar c={barCampaign(base)} />
        </div>
        <div data-ap-content className={container}>
          <div className="grid items-start gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,47rem)_16.5rem]">
            <div>
              {workshop && (
                <Link
                  data-ap-in
                  data-ap-badge
                  href={`${base}${workshop.href}`}
                  className="mb-8"
                >
                  <b>{workshop.name}</b>
                  <span>Free APSC workshop on the ICT app</span>
                </Link>
              )}
              <h1
                data-k-h1
                data-ap-in
                style={{ animationDelay: "0.12s" }}
                className="max-w-[17ch]"
              >
                Assam&apos;s biggest exams, taught in North Lakhimpur.
              </h1>
            </div>
            <div
              data-ap-in
              data-ap-side
              style={{ animationDelay: "0.3s" }}
              className="lg:mt-[4.4rem]"
            >
              <p className="leading-relaxed text-[#CFCBC1]">
                Batches, ICT&apos;s own books, free notes and every class on the
                app. Start with a free workshop.
              </p>
              <a href={whatsapp} {...external} data-ap-cta className="mt-7">
                <span>
                  <IconBrandWhatsapp aria-hidden size={22} stroke={1.75} />
                </span>
                {offer.cta}
              </a>
            </div>
          </div>
        </div>
      </Sky>

      <Section
        id="batches"
        title="Find the batch that fits your day."
        lede="Pick your exam and the hour you can study. The batches that fit are listed with their fees."
      >
        <div data-k-card data-ap-rim className="p-6 sm:p-10">
          <BatchFinder
            batches={finderBatches}
            noTiming={noTiming}
            exams={[...courses.map((c) => c.exam), "Not sure yet"]}
            times={[...timings]}
            askHref={whatsapp}
          />
        </div>
        <ul className="mt-10 flex flex-wrap gap-2.5">
          {included.map((x) => (
            <li
              key={x.text}
              data-k-chip
              className="inline-flex items-center gap-2 rounded-full bg-[var(--k-chip)] py-2 pr-4 pl-3 text-sm shadow-[inset_0_0_0_1px_var(--k-line)]"
            >
              <IconCheck
                aria-hidden
                size={15}
                stroke={2}
                className="text-[var(--k-accent)]"
              />
              {x.text}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="exams"
        title="The road to each exam."
        lede="Every line starts at a free workshop and stops at that exam's real stages. Press a line to open it."
      >
        <RouteExplorer
          routes={buildRoutes(base, routeColours)}
          hub={offer.short}
        />
      </Section>

      <Section
        id="results"
        title="On the APSC CCE 2022 merit list."
        lede={
          <a
            href={links.apscResultPdf}
            {...external}
            data-k-link
            className="inline-flex min-h-11 items-center gap-1 underline decoration-[var(--k-line-hi)] underline-offset-4"
          >
            Result of 17 January 2024
            <IconArrowUpRight aria-hidden size={15} stroke={2} />
          </a>
        }
      >
        <div className="grid gap-x-12 gap-y-16 md:grid-cols-2">
          {selections.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.08}>
              <article data-ap-honour>
                <p
                  data-ap-serial
                  aria-label={`Serial ${s.serial}`}
                  className="tabular-nums"
                >
                  {s.serial}
                </p>
                <h3 data-k-display className="mt-8 text-3xl leading-none">
                  {s.name}
                </h3>
                <p className="mt-2 text-sm text-[var(--k-accent)]">{s.post}</p>
                <blockquote className="mt-6 max-w-[38ch] text-lg leading-snug text-[var(--k-muted)]">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
              </article>
            </Reveal>
          ))}
        </div>
        <ul className="mt-20 grid grid-cols-2 gap-3 md:grid-cols-4">
          {reviews.slice(0, 4).map((r) => (
            <li key={r.id}>
              <PlayInPlace
                id={r.id}
                title={`${r.name}, ${r.batch}`}
                data-k-photo
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[14px] bg-[#0C0B0A] text-left"
              >
                <Image
                  src={r.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(6,6,6,0.94))]"
                />
                <span
                  data-k-btn
                  className="absolute top-3 right-3 grid size-10 place-items-center rounded-full"
                >
                  <IconPlayerPlayFilled
                    aria-hidden
                    size={14}
                    className="translate-x-px"
                  />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span data-k-display className="block text-lg leading-tight">
                    {r.name}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--k-muted)]">
                    {r.exam}, {r.batch}
                  </span>
                </span>
              </PlayInPlace>
            </li>
          ))}
        </ul>
      </Section>

      <section
        id="teachers"
        aria-labelledby="teachers-h"
        className="scroll-mt-20 pb-28 md:pb-36"
      >
        <div className={container}>
          <Reveal>
            <h2 id="teachers-h" data-k-h2 className="max-w-[18ch]">
              Who teaches you.
            </h2>
            <p className="mt-5 max-w-[48ch] text-[var(--k-muted)]">
              Press a portrait to watch one of their classes, right here.
            </p>
          </Reveal>
        </div>
        <ul data-ap-rail className="mt-12 md:mt-16">
          {faculty.map((f) => (
            <li key={f.slug} data-ap-person>
              <PlayInPlace
                id={f.lecture}
                title={`${f.called}, a class`}
                data-ap-frame
                data-k-photo
                className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[14px] bg-[#0C0B0A]"
              >
                <Image
                  src={f.portrait}
                  alt={f.name}
                  fill
                  sizes="300px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(6,6,6,0.9))]"
                />
                <span
                  data-k-btn
                  className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full"
                >
                  <IconPlayerPlayFilled
                    aria-hidden
                    size={15}
                    className="translate-x-px"
                  />
                </span>
              </PlayInPlace>
              <h3 data-k-display className="mt-4 text-xl leading-tight">
                {f.called}
              </h3>
              <p className="mt-1 text-sm text-[var(--k-accent)]">{f.teaches}</p>
              <p className="mt-2 text-sm text-[var(--k-muted)]">{f.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <Section
        id="library"
        title="ICT's own books, and notes that cost nothing."
        lede={
          samples
            ? "Sample titles until ICT adds its own. Free notes for every exam are below them."
            : "Read sample pages before you buy. Free notes for every exam are below the books."
        }
      >
        {shelfBooks.length > 0 && (
          <ul
            className={
              bento
                ? "grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3"
                : "grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4"
            }
          >
            {shelfBooks.map((b, i) => (
              <li
                key={b.slug}
                className={
                  bento && i === 0
                    ? "col-span-2 min-w-0 md:col-span-1 md:row-span-2"
                    : "min-w-0"
                }
              >
                <Link
                  data-bk-hover
                  href={`${base}/books/${b.slug}`}
                  className="group block"
                >
                  <Book3D book={b} tones={bookTones} font="var(--ap-sans)" />
                  <span className="mt-4 block px-[18px] font-medium">
                    {b.title}
                  </span>
                  <span className="block px-[18px] text-sm text-[var(--k-muted)]">
                    {b.subtitle}
                  </span>
                  <span className="mt-1 block px-[18px] text-sm tabular-nums">
                    {b.price}, {b.pages} pages
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-24">
          <h3 data-k-display className="max-w-[20ch] text-3xl leading-tight">
            Six folders. Nothing to pay.
          </h3>
          <div className="mt-10">
            <FolderBrowser
              folders={folders}
              tones={folderTones}
              readHref="/resources"
            />
          </div>
        </div>
      </Section>

      <Section
        id="begin"
        title="Not sure where to start? Ask."
        lede={offer.promise}
      >
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="grid gap-2">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  data-k-faq
                  className="rounded-[14px] bg-[var(--k-card)] px-5 shadow-[inset_0_0_0_1px_var(--k-line)]"
                >
                  <summary className="flex min-h-16 items-center justify-between gap-6 py-3">
                    <span className="text-lg leading-snug font-medium">
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
                  <p className="max-w-[60ch] pb-5 text-[var(--k-muted)]">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6">
            <div data-k-card data-ap-rim className="p-6 sm:p-10">
              <h3 data-k-display className="text-3xl leading-tight">
                Tell us your exam and your hours.
              </h3>
              <div className="mt-8">
                <EnquiryForm />
              </div>
              <a
                href={tel}
                data-k-press
                data-k-outline
                className="mt-6 inline-flex h-11 items-center px-5 text-sm tabular-nums"
              >
                Or call {phone}
              </a>
            </div>
          </div>
        </div>
        <figure className="mt-16 grid items-end gap-6 md:grid-cols-[1.4fr_1fr]">
          <span
            data-k-photo
            className="relative block aspect-[16/9] overflow-hidden rounded-[14px]"
          >
            <Image
              src={campus[0]!.src}
              alt={campus[0]!.alt}
              fill
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover"
            />
          </span>
          <figcaption>
            <address className="not-italic">
              <span className="flex items-center gap-2">
                <IconMapPin
                  aria-hidden
                  size={18}
                  stroke={1.75}
                  className="text-[var(--k-accent)]"
                />
                <span data-k-display className="text-2xl leading-tight">
                  {place.street}, {place.city}
                </span>
              </span>
              <span className="mt-2 block pl-[26px] text-[var(--k-muted)]">
                {place.region} {place.pin}. Ask for {place.spoken}.
              </span>
            </address>
            <a
              href={place.maps}
              {...external}
              data-k-press
              data-k-outline
              className="mt-5 inline-flex h-11 items-center gap-2 px-4 text-sm"
            >
              Directions
              <IconArrowUpRight aria-hidden size={15} stroke={2} />
            </a>
          </figcaption>
        </figure>
      </Section>
      <SiteReel c={campaign} />
    </main>
  )
}
