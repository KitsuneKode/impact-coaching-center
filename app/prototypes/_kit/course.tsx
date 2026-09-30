import {
  IconArrowRight,
  IconArrowUpRight,
  IconPhone,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { listedCourseIds, schedules, trackForCourse } from "@/lib/brand"
import { catalogue } from "@/lib/catalogue"

import { Book3D } from "../_book"
import {
  compact,
  faculty,
  faqs,
  offer,
  phone,
  rupees,
  shelf,
  tel,
  thumb,
  whatsapp,
} from "../_data"
import { EnquiryForm } from "../_enquiry"
import { Folder } from "../_folder"
import { PlayInPlace } from "../_fx"
import { Reveal } from "../_reveal"
import {
  container,
  external,
  bookTones,
  folderTones,
  type KitProps,
} from "./shared"
import { PageHead } from "./head"

export const listed = catalogue.filter((c) => listedCourseIds.has(c.id))

/** "Head - body" feature strings from the store, split for display. */
function splitFeature(text: string) {
  const [head, ...rest] = text.split(" - ")
  return { head: head!, body: rest.join(" - ") }
}

export async function KitCourse({ base, slug }: KitProps & { slug: string }) {
  const course = listed.find((c) => c.slug === slug)
  if (!course) notFound()

  const track = trackForCourse(course.id)
  const schedule = schedules[course.id]
  const teachers = (track?.faculty ?? []).map((s) =>
    faculty.find((f) => f.slug === s)!
  )
  const { books, folders } = await shelf()
  const examBooks = books.filter((b) => b.exam === track?.exam)
  const examFolders = folders.filter((f) => !f.exam || f.exam === track?.exam)
  const siblings = listed.filter(
    (c) => c.id !== course.id && trackForCourse(c.id)?.slug === track?.slug
  )

  return (
    <main>
      <PageHead
        base={base}
        trail={[
          { label: "Courses", href: `${base}/courses` },
          { label: course.short },
        ]}
        title={course.short}
        lede={course.subtitle || track?.full}
      />

      {/* Spec and price */}
      <section
        className={`${container} grid items-start gap-6 pb-20 lg:grid-cols-12`}
      >
        <Reveal className="lg:col-span-7">
          <div
            data-coat
            data-k-card
            className="rounded-[var(--k-radius)] p-6 sm:p-8"
          >
            {track && <p className="text-[var(--k-muted)]">{track.full}</p>}
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Timing", schedule?.when],
                ["Days", schedule?.days],
                ["Length", track?.duration],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div
                    key={k}
                    data-k-tile
                    className="rounded-[var(--k-inner)] p-4"
                  >
                    <dt
                      data-k-wide
                      className="text-[0.62rem] text-[var(--k-muted)]"
                    >
                      {k}
                    </dt>
                    <dd className="mt-2 font-medium tabular-nums">{v}</dd>
                  </div>
                ))}
            </dl>
            {schedule?.note && (
              <p className="mt-4 text-sm text-[var(--k-muted)]">
                {schedule.note}
              </p>
            )}
            <p className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1 tabular-nums">
              <span
                data-k-display
                className="text-[clamp(2.2rem,5vw,3.4rem)] leading-none font-light"
              >
                {course.free ? "Free" : rupees(course.price)}
              </span>
              {!course.free && course.mrp > course.price && (
                <s className="text-[var(--k-muted)]">{rupees(course.mrp)}</s>
              )}
              {!course.free && (
                <span className="text-sm text-[var(--k-muted)]">
                  one time, tests, notes and the app included
                </span>
              )}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={whatsapp}
                {...external}
                data-k-press
                data-k-btn
                className="group inline-flex h-12 items-center gap-2 rounded-[var(--k-pill)] px-6 font-semibold whitespace-nowrap"
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
                href={tel}
                data-k-press
                data-k-outline
                className="inline-flex h-12 items-center gap-2 rounded-[var(--k-pill)] px-6 font-semibold tabular-nums"
              >
                <IconPhone aria-hidden size={18} stroke={1.5} />
                Call {phone}
              </a>
            </div>
          </div>
        </Reveal>
        {course.cover && (
          <Reveal delay={0.06} className="lg:col-span-5">
            <div
              data-coat
              data-k-card
              className="rounded-[var(--k-radius)] p-3"
            >
              <span
                data-k-photo
                className="relative block aspect-[4/3] overflow-hidden rounded-[var(--k-inner)]"
              >
                <Image
                  src={course.cover}
                  alt={`${course.short} poster`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-cover"
                />
              </span>
            </div>
          </Reveal>
        )}
      </section>

      {/* What it includes */}
      {course.features.length > 0 && (
        <section aria-labelledby="inc-h" className={`${container} pb-20`}>
          <Reveal>
            <h2 id="inc-h" data-k-h2 className="max-w-[20ch]">
              What the course includes.
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
            {course.features.map((f, i) => {
              const { head, body } = splitFeature(f)
              return (
                <li
                  key={f}
                  className={i % 5 === 0 ? "lg:col-span-6" : "lg:col-span-3"}
                >
                  <Reveal delay={(i % 4) * 0.04} className="h-full">
                    <div
                      data-k-card
                      className="h-full rounded-[var(--k-radius)] p-6"
                    >
                      <p className="font-medium">{head}</p>
                      {body && (
                        <p className="mt-2 text-sm text-[var(--k-muted)]">
                          {body}
                        </p>
                      )}
                    </div>
                  </Reveal>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* The teachers */}
      {track && (
        <section aria-labelledby="watch-h" className={`${container} pb-20`}>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <h2 id="watch-h" data-k-h2 className="max-w-[18ch]">
                  Watch the same teachers teach.
                </h2>
              </Reveal>
              <div
                data-coat
                data-k-card
                className="mt-8 rounded-[var(--k-radius)] p-3"
              >
                <PlayInPlace
                  id={track.sample.id}
                  title={`A ${track.exam} class`}
                  data-k-photo
                  className="group relative block aspect-video w-full overflow-hidden rounded-[var(--k-inner)] bg-black"
                >
                  <Image
                    src={thumb(track.sample.id)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 680px, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span
                      data-k-btn
                      className="grid size-16 place-items-center rounded-[var(--k-pill)] transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
                    >
                      <IconPlayerPlayFilled
                        aria-hidden
                        size={22}
                        className="translate-x-px"
                      />
                    </span>
                  </span>
                </PlayInPlace>
                <p className="px-3 pt-3 pb-1 text-sm text-[var(--k-muted)] tabular-nums">
                  {compact(track.sample.views)} views on YouTube
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <h2 className="text-lg font-medium lg:mt-3">Taught by</h2>
              <ul className="mt-5 grid gap-3">
                {teachers.map((t) => (
                  <li key={t.slug}>
                    <a
                      href={`https://www.youtube.com/watch?v=${t.lecture}`}
                      {...external}
                      data-k-card
                      className="group flex items-center gap-4 rounded-[var(--k-radius)] p-3 pr-5"
                    >
                      <span
                        data-k-photo
                        className="relative size-16 shrink-0 overflow-hidden rounded-[var(--k-inner)]"
                      >
                        <Image
                          src={t.portrait}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover object-top"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{t.name}</span>
                        <span className="block text-sm text-[var(--k-muted)]">
                          {t.teaches}
                        </span>
                      </span>
                      <IconArrowUpRight
                        aria-hidden
                        size={18}
                        stroke={1.5}
                        className="text-[var(--k-muted)] transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  </li>
                ))}
              </ul>
              {siblings.length > 0 && (
                <>
                  <h2 className="mt-10 text-lg font-medium">
                    Also for {track.exam}
                  </h2>
                  <ul className="mt-4 grid gap-2">
                    {siblings.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`${base}/courses/${c.slug}`}
                          className="flex items-center justify-between gap-4 rounded-[var(--k-inner)] px-4 py-3 transition-colors duration-150 hover:bg-[var(--k-hover)]"
                        >
                          <span>
                            <span className="block font-medium">{c.short}</span>
                            <span className="block text-sm text-[var(--k-muted)]">
                              {c.subtitle}
                            </span>
                          </span>
                          <span className="text-sm tabular-nums">
                            {c.free ? "Free" : rupees(c.price)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Books and notes for the same exam */}
      {(examBooks.length > 0 || examFolders.length > 0) && (
        <section aria-labelledby="shelf-h" className={`${container} pb-20`}>
          <Reveal>
            <h2 id="shelf-h" data-k-h2 className="max-w-[22ch]">
              Books and free material for {track?.exam}.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:col-span-6">
              {examBooks.map((b) => (
                <li key={b.slug} className="min-w-0">
                  <Link
                    data-bk-hover
                    href={`${base}/books/${b.slug}`}
                    className="group block"
                  >
                    <Book3D book={b} tones={bookTones} font="var(--cc-sans)" />
                    <span className="mt-3 block truncate px-[18px] font-medium">
                      {b.title}
                    </span>
                    <span className="block px-[18px] text-sm text-[var(--k-muted)] tabular-nums">
                      {b.price}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="grid grid-cols-2 content-start gap-x-3 gap-y-6 sm:grid-cols-3 lg:col-span-6">
              {examFolders.map((f) => (
                <li key={f.id}>
                  <Link
                    data-fd-hover
                    href={`${base}/notes#${f.id}`}
                    aria-label={`${f.name}, ${f.items.length} files`}
                    className="block rounded-[var(--k-inner)]"
                  >
                    <Folder folder={f} tones={folderTones} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Questions */}
      <section
        aria-labelledby="faq-h"
        className={`${container} grid gap-8 pb-20 lg:grid-cols-12`}
      >
        <h2 id="faq-h" data-k-h2 className="lg:col-span-4">
          Before you join.
        </h2>
        <div
          data-k-card
          className="rounded-[var(--k-radius)] px-6 py-2 sm:px-8 lg:col-span-8"
        >
          {faqs.slice(0, 5).map((f, i) => (
            <details
              key={f.q}
              data-k-faq
              className={`${i ? "border-t border-[var(--k-line)]" : ""}`}
            >
              <summary className="flex min-h-16 items-center justify-between gap-4 py-4">
                <span className="font-medium">{f.q}</span>
                <IconPlus
                  data-plus
                  aria-hidden
                  size={20}
                  stroke={1.5}
                  className="shrink-0 text-[var(--k-muted)]"
                />
              </summary>
              <p className="max-w-[62ch] pb-5 text-[var(--k-muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Enquire */}
      <section aria-labelledby="ask-h" className={`${container} pb-20`}>
        <div
          data-coat
          data-k-card
          className="rounded-[var(--k-radius)] p-7 sm:p-12"
        >
          <h2
            id="ask-h"
            data-k-display
            className="max-w-[22ch] text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.12] font-light tracking-[-0.02em]"
          >
            Ask about {course.short}.
          </h2>
          <div className="mt-8 max-w-[760px]">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </main>
  )
}
