import {
  IconArrowUpRight,
  IconBed,
  IconBooks,
  IconChevronRight,
  IconClipboardCheck,
  IconCompass,
  IconDeviceMobile,
  IconLanguage,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

import { schedules, trackForCourse } from "@/lib/brand"
import { catalogue } from "@/lib/catalogue"

import { Book3D } from "../_book"
import {
  classes,
  compact,
  faculty,
  faqs,
  links,
  offer,
  proof,
  rupees,
  selections,
  shelf,
  whatsapp,
  workshops,
} from "../_data"
import { EnquiryForm } from "../_enquiry"
import { Folder } from "../_folder"
import { PlayInPlace, ScrollTilt } from "../_fx"
import { bookTones, container, external, folderTones } from "../_kit/shared"
import { Reveal } from "../_reveal"
import { Rail } from "./_client"
import { base } from "./_theme"

/** The four batches a first-time visitor chooses between. */
const compared = [886514, 804860, 896874, 869154]

const highlights = [
  {
    Icon: IconClipboardCheck,
    title: "20 Prelims and 20 Mains mock tests.",
    body: "In the APSC course, each one evaluated.",
  },
  {
    Icon: IconLanguage,
    title: "Taught in Assamese and English.",
    body: "Classes mix the two so nobody is left behind.",
    light: true,
  },
  {
    Icon: IconBooks,
    title: "A library with WiFi.",
    body: "Study space and material for enrolled students.",
  },
  {
    Icon: IconDeviceMobile,
    title: "Every class, recorded.",
    body: "Missed one? Watch it on the app the same day.",
    light: true,
  },
  {
    Icon: IconCompass,
    title: "Mentorship till selection.",
    body: "One-on-one guidance that tracks your progress.",
  },
  {
    Icon: IconBed,
    title: "Hostel accommodation.",
    body: "Ask about availability when you enquire.",
    light: true,
  },
]

export default async function AlloyHome() {
  const { books, folders, samples } = await shelf()
  const lecture = classes[0]!
  const batches = compared
    .map((id) => catalogue.find((c) => c.id === id))
    .filter((c) => c !== undefined)
    .map((c) => ({
      ...c,
      exam: trackForCourse(c.id)?.exam ?? "",
      when: schedules[c.id]?.when ?? null,
      days: schedules[c.id]?.days ?? schedules[c.id]?.note ?? null,
      points: c.features.slice(0, 4).map((f) => f.split(" - ")[0]!),
    }))

  return (
    <main id="top">
      {/* Hero: one object */}
      <section
        aria-label="Introduction"
        className="pt-16 pb-24 text-center md:pt-24"
      >
        <div className={container}>
          <p
            data-rise
            className="text-lg font-semibold text-[var(--k-accent-deep)]"
          >
            Impact Career Tutorials
          </p>
          <h1
            data-rise
            data-k-h1
            style={{ animationDelay: "0.06s" }}
            className="mx-auto mt-3 max-w-[14ch]"
          >
            Serious coaching for Assam&apos;s exams.
          </h1>
          <p
            data-rise
            style={{ animationDelay: "0.12s" }}
            className="mx-auto mt-6 max-w-[44ch] text-xl text-[var(--k-muted)]"
          >
            APSC, ADRE, Assam Police and Banking, in North Lakhimpur and on the
            ICT app.
          </p>
          <div
            data-rise
            style={{ animationDelay: "0.18s" }}
            className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
          >
            <a
              href={whatsapp}
              {...external}
              data-k-press
              data-k-btn
              className="inline-flex h-11 items-center px-6 whitespace-nowrap"
            >
              {offer.cta}
            </a>
            <a href="#compare" data-al-link className="text-lg">
              Compare the batches
              <IconChevronRight aria-hidden size={18} stroke={2} />
            </a>
          </div>
        </div>

        <div className="mx-auto mt-16 w-full max-w-[1040px] px-5 md:px-8">
          <ScrollTilt>
            <div data-al-device>
              <div data-al-screen>
                <PlayInPlace
                  id={lecture.id}
                  title={lecture.title}
                  className="group absolute inset-0 block size-full"
                >
                  <Image
                    src={lecture.image}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1040px) 980px, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle,rgba(0,9,25,0)_40%,rgba(0,9,25,0.45))]">
                    <span className="grid size-20 place-items-center rounded-full bg-white/80 text-[#142537] shadow-2xl backdrop-blur-md transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95">
                      <IconPlayerPlayFilled
                        aria-hidden
                        size={28}
                        className="translate-x-0.5"
                      />
                    </span>
                  </span>
                </PlayInPlace>
              </div>
            </div>
            <div data-al-base aria-hidden />
          </ScrollTilt>
          <p className="mt-6 text-sm text-[var(--k-muted)]">
            {lecture.title}, by {lecture.by}.{" "}
            <span className="tabular-nums">{compact(lecture.views)}</span>{" "}
            views.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section aria-labelledby="hl-h" className="pb-28">
        <div className={container}>
          <Reveal>
            <h2 id="hl-h" data-k-h2>
              The highlights.
            </h2>
          </Reveal>
        </div>
        <div className="mt-10">
          <Rail label="Highlights">
            {highlights.map((h) => (
              <article
                key={h.title}
                data-al-slide
                data-light={h.light || undefined}
                className="flex aspect-[4/5] flex-col justify-between p-8"
              >
                <span data-al-medal>
                  <h.Icon aria-hidden size={28} stroke={1.6} />
                </span>
                <div>
                  <h3 className="text-[1.9rem] leading-[1.08] font-semibold tracking-[-0.035em]">
                    {h.title}
                  </h3>
                  <p
                    className={`mt-3 text-lg ${h.light ? "text-[#52657A]" : "text-[#A5BAD1]"}`}
                  >
                    {h.body}
                  </p>
                </div>
              </article>
            ))}
          </Rail>
        </div>
      </section>

      {/* Numbers */}
      <section aria-label="ICT in numbers" className={`${container} pb-28`}>
        <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {proof.map((p) => (
            <li key={p.label}>
              <a href={p.href} {...external} className="group block">
                <span
                  data-al-steel-text
                  className="block text-[clamp(3.4rem,6vw,5.2rem)] leading-none font-semibold tracking-[-0.05em]"
                >
                  {p.display}
                </span>
                <span className="mt-3 block max-w-[24ch] text-[var(--k-muted)]">
                  {p.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Compare */}
      <section
        id="compare"
        aria-labelledby="compare-h"
        className="scroll-mt-20 bg-[#FFFFFF] py-24"
      >
        <div className={container}>
          <Reveal>
            <h2 id="compare-h" data-k-h2 className="text-center">
              Which batch is right for you?
            </h2>
          </Reveal>
        </div>
        <div
          data-al-compare
          className="mt-14 flex gap-6 overflow-x-auto px-5 md:mx-auto md:grid md:max-w-[1240px] md:grid-cols-4 md:px-8"
        >
          {batches.map((b) => (
            <div key={b.id} data-al-col className="w-[74vw] shrink-0 md:w-auto">
              <Link href={`${base}/courses/${b.slug}`} className="group block">
                {b.cover && (
                  <span data-al-poster>
                    <Image
                      src={b.cover}
                      alt={`${b.short} poster`}
                      fill
                      sizes="(min-width: 768px) 280px, 74vw"
                      className="object-cover"
                    />
                  </span>
                )}
                <span className="mt-6 block text-2xl font-semibold tracking-[-0.03em]">
                  {b.short}
                </span>
              </Link>
              <p className="mt-1 line-clamp-2 min-h-[2.9em] text-sm text-[var(--k-muted)]">
                {b.subtitle}
              </p>
              <p className="mt-4 text-xl font-semibold">
                {rupees(b.price)}{" "}
                <s className="text-sm font-normal text-[var(--k-muted)]">
                  {rupees(b.mrp)}
                </s>
              </p>
              <div className="mt-4 flex items-center gap-4">
                <Link
                  href={`${base}/courses/${b.slug}`}
                  data-k-press
                  data-k-btn
                  className="inline-flex h-9 items-center px-4 text-sm"
                >
                  See the batch
                </Link>
              </div>
              <dl className="mt-8">
                <div data-al-row>
                  <dt>Exam</dt>
                  <dd className="mt-1 font-medium">{b.exam}</dd>
                </div>
                <div data-al-row>
                  <dt>Timing</dt>
                  <dd className="mt-1 font-medium">
                    {b.when ?? (
                      <a
                        href={whatsapp}
                        {...external}
                        data-al-link
                        className="text-base"
                      >
                        Ask for the timing
                        <IconChevronRight aria-hidden size={16} stroke={2} />
                      </a>
                    )}
                  </dd>
                  {b.days && (
                    <dd className="text-sm text-[var(--k-muted)]">{b.days}</dd>
                  )}
                </div>
                <div data-al-row>
                  <dt>Included</dt>
                  <dd className="mt-2">
                    <ul className="grid gap-2 text-sm">
                      {b.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* Faculty */}
      <section aria-labelledby="faculty-h" className={`${container} py-28`}>
        <Reveal>
          <h2 id="faculty-h" data-k-h2 className="text-center">
            Meet the faculty.
          </h2>
        </Reveal>
        <ul className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {faculty.map((f) => (
            <li key={f.slug} className="text-center">
              <a
                href={`https://www.youtube.com/watch?v=${f.lecture}`}
                {...external}
                className="group block"
              >
                <span className="relative mx-auto block aspect-square w-[78%] overflow-hidden rounded-full shadow-[0_0_0_1px_rgba(20,37,55,0.08),0_20px_30px_-18px_rgba(20,37,55,0.5)]">
                  <Image
                    src={f.portrait}
                    alt={`${f.name}, ${f.teaches}`}
                    fill
                    sizes="200px"
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </span>
                <span className="mt-5 block text-lg font-semibold tracking-[-0.02em]">
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

      {/* Merit, etched */}
      <section aria-labelledby="merit-h" className={`${container} pb-28`}>
        <Reveal>
          <h2 id="merit-h" data-k-h2 className="max-w-[16ch]">
            On the APSC CCE 2022 merit list.
          </h2>
          <a
            href={links.apscResultPdf}
            {...external}
            data-al-link
            className="mt-4"
          >
            The result of 17 January 2024
            <IconArrowUpRight aria-hidden size={16} stroke={2} />
          </a>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {selections.map((s) => (
            <figure
              key={s.name}
              data-al-plaque
              className="flex flex-col gap-8 p-8 sm:p-10"
            >
              <p
                data-al-champ-text
                className="text-[clamp(4rem,9vw,6.5rem)] leading-[0.85] font-semibold tracking-[-0.06em]"
              >
                {s.serial}
              </p>
              <blockquote
                data-al-etch
                className="text-xl leading-snug font-medium tracking-[-0.015em] text-pretty"
              >
                &ldquo;{s.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto">
                <span className="block font-semibold">{s.name}</span>
                <span data-al-etch className="text-sm">
                  {s.post}, serial {s.serial}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Free */}
      <section
        id="free"
        aria-labelledby="free-h"
        className={`${container} scroll-mt-24 pb-28`}
      >
        <Reveal>
          <h2 id="free-h" data-k-h2 className="max-w-[16ch]">
            Free to start.
          </h2>
          <p className="mt-4 max-w-[44ch] text-xl text-[var(--k-muted)]">
            Notes, past papers and two free workshops. Pay only when you pick a
            batch.
          </p>
          {samples && (
            <p className="mt-2 text-sm text-[var(--k-muted)]">
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
                    <Book3D book={b} tones={bookTones} font="var(--al-sans)" />
                    <span className="mt-4 block px-[18px] font-semibold">
                      {b.title}
                    </span>
                    <span className="block px-[18px] text-sm text-[var(--k-muted)]">
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
                    <span className="block text-lg font-semibold tracking-[-0.02em]">
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
                  <span className="text-lg font-semibold tracking-[-0.02em]">
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
