import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconMapPin,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { Book3D } from "../_book"
import { campaign } from "../_campaign"
import {
  campus,
  classes,
  compact,
  courses,
  faculty,
  faqs,
  included,
  joining,
  links,
  nextBatch,
  offer,
  phone,
  place,
  proof,
  rupees,
  selections,
  shelf,
  tel,
  whatsapp,
} from "../_data"
import { EnquiryForm } from "../_enquiry"
import { Folder } from "../_folder"
import { CountUp, PlayInPlace, SpotlightGroup } from "../_fx"
import { batchDay } from "../_kit/batch-day"
import { bookTones, container, external, folderTones } from "../_kit/shared"
import { SiteReel, TopBar } from "../_kit/site-promos"
import { Reveal } from "../_reveal"
import { AskTile, ExamPicker } from "./_client"
import { base } from "./_theme"

/** The header above each bento: a small label, a title, one line of context. */
function Head({
  id,
  label,
  title,
  lede,
}: {
  id: string
  label: string
  title: ReactNode
  lede?: string
}) {
  return (
    <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
      <div>
        <p data-ch-label className="text-[var(--k-accent-deep)]">
          {label}
        </p>
        <h2 id={id} data-k-h2 className="mt-3 max-w-[20ch]">
          {title}
        </h2>
      </div>
      {lede && <p className="max-w-[40ch] text-[var(--k-muted)]">{lede}</p>}
    </Reveal>
  )
}

const rise = (n: number) => ({ animationDelay: `${n * 0.06}s` })

export default async function CharterHome() {
  const { books, folders, samples } = await shelf()
  const victor = courses.find((c) => c.name === nextBatch.name)
  const day = batchDay(nextBatch.startsOn)
  const book = books[0]
  const folder = folders[0]
  const lecture = classes[0]!

  const barCampaign = {
    ...campaign,
    tag: "New batch",
    headline: `Day ${day}: ${nextBatch.name}.`,
    body: `${nextBatch.exam}, ${nextBatch.timing}, for ${nextBatch.forWho}.`,
    cta: "See the batch",
    href: victor ? `${base}${victor.href}` : `${base}/courses`,
  }

  const picks = courses.map((c) => ({
    slug: c.slug,
    exam: c.exam,
    batch: c.name,
    when: c.when,
    duration: c.duration,
    price: c.price ? rupees(c.price) : "Ask",
    href: `${base}${c.href}`,
  }))

  return (
    <main>
      <TopBar c={barCampaign} />

      {/* Hero bento */}
      <section
        id="top"
        aria-label="Introduction"
        className={`${container} pt-6 pb-16 md:pt-8 md:pb-24`}
      >
        <SpotlightGroup className="grid gap-4 lg:grid-cols-12">
          <div
            data-ch-tile
            data-tone="deep"
            data-spot
            data-rise
            className="flex min-h-[540px] flex-col justify-between lg:col-span-8 lg:row-span-2"
          >
            <div aria-hidden data-ch-rings />
            <div>
              <span data-k-tag>North Lakhimpur, Assam</span>
              <h1 data-k-h1 className="mt-7 max-w-[13ch]">
                Coaching for Assam&apos;s <span data-ch-em>biggest exams.</span>
              </h1>
              <p className="mt-6 max-w-[40ch] text-lg text-[var(--k-muted)]">
                Batches in North Lakhimpur, ICT&apos;s own books, free notes,
                and every class on the app.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
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
                  href="#learn"
                  data-k-press
                  data-k-outline
                  className="inline-flex h-12 items-center px-6"
                >
                  See what you get
                </a>
              </div>
            </div>
            <div className="mt-12 flex items-center gap-4">
              <ul className="flex -space-x-3">
                {faculty.slice(0, 5).map((f) => (
                  <li key={f.slug}>
                    <span
                      data-k-avatar
                      className="relative block size-11 overflow-hidden rounded-full"
                    >
                      <Image
                        src={f.portrait}
                        alt={f.name}
                        fill
                        sizes="44px"
                        className="object-cover object-top"
                      />
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[var(--k-muted)]">
                Taught by {faculty[0]!.name} and {faculty.length - 1} others
              </p>
            </div>
          </div>

          <div
            data-ch-tile
            data-spot
            data-lift
            data-rise
            style={rise(1)}
            className="flex flex-col lg:col-span-4"
          >
            <p data-ch-label>Current batch</p>
            <p className="mt-4 flex items-baseline gap-3">
              <span data-k-display className="text-2xl text-[var(--k-muted)]">
                Day
              </span>
              <span data-ch-num className="text-[6.5rem] text-[var(--k-on)]">
                {day}
              </span>
            </p>
            <p data-k-display className="mt-3 text-3xl leading-none">
              {nextBatch.name}
            </p>
            <p className="mt-2 text-sm text-[var(--k-muted)]">
              {nextBatch.exam}. {nextBatch.timing}, for {nextBatch.forWho}.
            </p>
            <Link
              href={barCampaign.href}
              data-k-link
              className="mt-auto inline-flex min-h-11 items-center gap-1 pt-4 text-sm font-semibold text-[var(--k-on)]"
            >
              See the batch
              <IconArrowUpRight aria-hidden size={15} stroke={2} />
            </Link>
          </div>

          <div
            data-ch-tile
            data-tone="pearl"
            data-spot
            data-rise
            style={rise(2)}
            className="lg:col-span-4"
          >
            <ExamPicker picks={picks} />
          </div>
        </SpotlightGroup>
      </section>

      {/* What you get */}
      <section
        id="learn"
        aria-labelledby="learn-h"
        className={`${container} scroll-mt-20 pb-16 md:pb-24`}
      >
        <Head
          id="learn-h"
          label="What you get"
          title="One fee. Classes, tests, notes and the app."
          lede={
            samples
              ? "Books and notes are sample titles until ICT adds its own."
              : undefined
          }
        />
        <SpotlightGroup className="grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div data-ch-tile data-spot className="h-full">
              <p data-ch-label>One fee covers</p>
              <ul className="mt-5 grid gap-3">
                {included.map((x) => (
                  <li key={x.text} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#E8EEF8] text-[#174A92]">
                      <IconCheck aria-hidden size={14} stroke={2.5} />
                    </span>
                    <span>{x.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {folder && (
            <Reveal className="lg:col-span-3" delay={0.06}>
              <Link
                href={`${base}/notes`}
                data-ch-tile
                data-tone="bronze"
                data-spot
                data-lift
                data-fd-hover
                className="flex h-full flex-col"
              >
                <p data-ch-label>Free notes</p>
                <div className="mx-auto mt-6 w-[88%] max-w-[220px]">
                  <Folder folder={folder} tones={folderTones} />
                </div>
                <p
                  data-k-display
                  className="mt-auto pt-4 text-2xl leading-tight"
                >
                  {folders.length} folders. Nothing to pay.
                </p>
              </Link>
            </Reveal>
          )}

          {book && (
            <Reveal className="lg:col-span-4 lg:row-span-2" delay={0.12}>
              <Link
                href={`${base}${book.href}`}
                data-ch-tile
                data-tone="sapphire"
                data-spot
                data-lift
                data-bk-hover
                className="flex h-full flex-col"
              >
                <p data-ch-label>ICT&apos;s own books</p>
                <div className="grid flex-1 place-items-center py-6">
                  <div className="w-[78%] max-w-[320px]">
                    <Book3D
                      book={book}
                      tones={bookTones}
                      font="var(--ch-sans)"
                    />
                  </div>
                </div>
                <div className="flex items-end justify-between gap-4 pt-2">
                  <div>
                    <p data-k-display className="text-2xl leading-tight">
                      {book.title}
                    </p>
                    <p className="mt-1 text-sm text-[var(--k-muted)]">
                      {book.exam}, {book.pages} pages
                    </p>
                  </div>
                  <span data-ch-num className="text-3xl text-[var(--k-accent)]">
                    {book.price}
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          <Reveal className="lg:col-span-8" delay={0.08}>
            <div
              data-ch-tile
              data-tone="deep"
              data-spot
              className="grid h-full gap-6 sm:grid-cols-[1.25fr_1fr] sm:items-center"
            >
              <PlayInPlace
                id={lecture.id}
                title={lecture.title}
                data-k-photo
                className="group relative block aspect-video w-full overflow-hidden rounded-[18px] bg-[#000624]"
              >
                <Image
                  src={lecture.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="object-cover"
                />
                <span className="absolute inset-0 grid place-items-center bg-[rgba(0,6,36,0.28)]">
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
              <div>
                <p data-ch-label>Watch before you join</p>
                <p data-k-display className="mt-3 text-3xl leading-tight">
                  {lecture.title}
                </p>
                <p className="mt-2 text-sm text-[var(--k-muted)]">
                  {lecture.by},{" "}
                  <span className="tabular-nums">{compact(lecture.views)}</span>{" "}
                  views on the ICT channel.
                </p>
              </div>
            </div>
          </Reveal>
        </SpotlightGroup>
      </section>

      {/* Who you learn with */}
      <section
        id="people"
        aria-labelledby="people-h"
        className={`${container} scroll-mt-20 pb-16 md:pb-24`}
      >
        <Head
          id="people-h"
          label="Who you learn with"
          title="Teachers you can meet, and results you can check."
        />
        <SpotlightGroup className="grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div data-ch-tile data-tone="sapphire" data-spot className="h-full">
              <p data-ch-label>APSC CCE 2022 merit list</p>
              <ul className="mt-6 grid gap-8 sm:grid-cols-2">
                {selections.map((s) => (
                  <li key={s.name}>
                    <p
                      data-ch-num
                      className="text-[5.5rem] text-[var(--k-accent)]"
                      aria-label={`Serial ${s.serial}`}
                    >
                      {s.serial}
                    </p>
                    <p data-k-display className="mt-4 text-2xl leading-tight">
                      {s.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--k-muted)]">
                      {s.post}
                    </p>
                  </li>
                ))}
              </ul>
              <a
                href={links.apscResultPdf}
                {...external}
                data-k-link
                className="mt-8 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--k-accent)]"
              >
                Read the result of 17 January 2024
                <IconArrowUpRight aria-hidden size={15} stroke={2} />
              </a>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={0.06}>
            <dl
              data-ch-tile
              data-spot
              className="grid h-full grid-cols-2 gap-x-6 gap-y-8"
            >
              {proof.map((p) => (
                <div key={p.label} className="flex flex-col">
                  <dd
                    data-ch-num
                    className="order-1 text-[3.2rem] text-[var(--k-on)]"
                  >
                    <CountUp display={p.display} />
                  </dd>
                  <dt className="order-2 mt-2 text-sm text-[var(--k-muted)]">
                    {p.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal className="lg:col-span-12" delay={0.08}>
            <div data-ch-tile data-tone="pearl" data-spot>
              <p data-ch-label>Faculty</p>
              <div data-ch-fan className="mt-5">
                {faculty.map((f) => (
                  <a
                    key={f.slug}
                    href={`https://www.youtube.com/watch?v=${f.lecture}`}
                    {...external}
                    aria-label={`Watch a class by ${f.name}`}
                  >
                    <Image
                      src={f.portrait}
                      alt=""
                      fill
                      sizes="(min-width: 900px) 320px, 45vw"
                    />
                    <span data-ch-cap>
                      <span
                        data-k-display
                        className="block text-xl leading-tight"
                      >
                        {f.name}
                      </span>
                      <span>{f.teaches}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </SpotlightGroup>
      </section>

      {/* Come and see */}
      <section
        id="visit"
        aria-labelledby="visit-h"
        className={`${container} scroll-mt-20 pb-16 md:pb-24`}
      >
        <Head
          id="visit-h"
          label="Come and see"
          title="Ask us anything, or walk in."
        />
        <SpotlightGroup className="grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <div data-ch-tile data-tone="pearl" data-spot className="h-full">
              <p data-ch-label>Ask first</p>
              <div className="mt-5">
                <AskTile items={faqs.slice(0, 5)} />
              </div>
              <a
                href="#questions"
                data-k-link
                className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--k-on)]"
              >
                All questions
                <IconArrowRight aria-hidden size={15} stroke={2} />
              </a>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-6" delay={0.06}>
            <div
              data-ch-tile
              data-flush
              data-spot
              className="flex h-full flex-col"
            >
              <span
                data-k-photo
                className="relative block aspect-[16/10] overflow-hidden"
              >
                <Image
                  src={campus[0]!.src}
                  alt={campus[0]!.alt}
                  fill
                  sizes="(min-width: 1024px) 600px, 100vw"
                  className="object-cover object-[50%_30%]"
                />
              </span>
              <div className="flex flex-wrap items-start justify-between gap-4 p-6 sm:p-8">
                <address className="not-italic">
                  <span className="flex items-center gap-2">
                    <IconMapPin
                      aria-hidden
                      size={20}
                      stroke={1.75}
                      className="text-[var(--k-accent-deep)]"
                    />
                    <span data-k-display className="text-2xl leading-tight">
                      {place.street}, {place.city}
                    </span>
                  </span>
                  <span className="mt-1 block pl-7 text-sm text-[var(--k-muted)]">
                    {place.region} {place.pin}. Ask for {place.spoken}.
                  </span>
                </address>
                <a
                  href={place.maps}
                  {...external}
                  data-k-press
                  data-k-outline
                  className="inline-flex h-11 items-center gap-2 px-5 text-sm"
                >
                  Get directions
                  <IconArrowUpRight aria-hidden size={15} stroke={2} />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-12" delay={0.08}>
            <div
              data-ch-tile
              data-tone="deep"
              data-spot
              className="grid gap-12 lg:grid-cols-12"
            >
              <div className="lg:col-span-5">
                <p data-ch-label>Your first week</p>
                <h3 data-k-h2 className="mt-4 max-w-[12ch]">
                  Sit in on a class, <span data-ch-em>free.</span>
                </h3>
                <ol className="mt-8 grid gap-5">
                  {joining.map((j, i) => (
                    <li
                      key={j.verb}
                      className="grid grid-cols-[2.4rem_1fr] gap-3"
                    >
                      <span
                        data-ch-num
                        className="grid size-9 place-items-center rounded-full bg-white/10 text-lg text-[var(--k-accent)]"
                      >
                        {i + 1}
                      </span>
                      <span>
                        <span
                          data-k-display
                          className="block text-xl leading-tight"
                        >
                          {j.verb}
                        </span>
                        <span className="mt-1 block text-sm text-[var(--k-muted)]">
                          {j.body}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="lg:col-span-7">
                <div data-k-tile className="p-6 sm:p-8">
                  <h3 data-k-display className="text-2xl leading-tight">
                    Not sure which batch? Tell us your exam and your hours.
                  </h3>
                  <div className="mt-6">
                    <EnquiryForm />
                  </div>
                  <a
                    href={tel}
                    data-k-press
                    data-k-outline
                    className="mt-5 inline-flex h-11 items-center px-5 text-sm tabular-nums"
                  >
                    Or call {phone}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </SpotlightGroup>
      </section>

      {/* Every question */}
      <section
        id="questions"
        aria-labelledby="questions-h"
        className={`${container} scroll-mt-20 pb-24`}
      >
        <div data-ch-tile className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p data-ch-label className="text-[var(--k-accent-deep)]">
              Every question
            </p>
            <h2 id="questions-h" data-k-h2 className="mt-3 max-w-[10ch]">
              Answered here.
            </h2>
          </div>
          <div className="lg:col-span-8">
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
        </div>
      </section>

      <SiteReel c={campaign} />
    </main>
  )
}
