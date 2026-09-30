import {
  IconArrowRight,
  IconArrowUpRight,
  IconPhone,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { listedCourseIds, schedules, trackForCourse } from "@/lib/brand"
import { catalogue } from "@/lib/catalogue"

import { Book3D } from "../../../_book"
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
} from "../../../_data"
import { EnquiryForm } from "../../../_enquiry"
import { Folder } from "../../../_folder"
import { PlayInPlace } from "../../../_fx"
import { Reveal } from "../../../_reveal"
import {
  base,
  bookTones,
  container,
  external,
  folderTones,
  PageHead,
} from "../../_shared"

const listed = catalogue.filter((c) => listedCourseIds.has(c.id))

export function generateStaticParams() {
  return listed.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/prototypes/livery/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const course = listed.find((c) => c.slug === slug)
  return { title: course ? course.short : "Course" }
}

/** "Head - body" feature strings from the store, split for display. */
function splitFeature(text: string) {
  const [head, ...rest] = text.split(" - ")
  return { head: head!, body: rest.join(" - ") }
}

export default async function Course({
  params,
}: PageProps<"/prototypes/livery/courses/[slug]">) {
  const { slug } = await params
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
          <div data-lv-card className="rounded-[14px] p-6 sm:p-8">
            {track && <p className="font-medium">{track.full}</p>}
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Timing", schedule?.when],
                ["Days", schedule?.days],
                ["Length", track?.duration],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-[var(--lv-paper)] p-4">
                    <dt className="text-sm text-[var(--lv-muted)]">{k}</dt>
                    <dd data-lv-display className="mt-1 text-2xl tabular-nums">
                      {v}
                    </dd>
                  </div>
                ))}
            </dl>
            {schedule?.note && (
              <p className="mt-4 text-sm font-medium text-[var(--lv-muted)]">
                {schedule.note}
              </p>
            )}
            <p className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1 tabular-nums">
              <span
                data-lv-display
                className="text-[clamp(3rem,6vw,4.6rem)] leading-none"
              >
                {course.free ? "Free" : rupees(course.price)}
              </span>
              {!course.free && course.mrp > course.price && (
                <s className="text-[var(--lv-muted)]">{rupees(course.mrp)}</s>
              )}
              {!course.free && (
                <span className="text-sm text-[var(--lv-muted)]">
                  one time, tests, notes and the app included
                </span>
              )}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={whatsapp}
                {...external}
                data-lv-press
                data-lv-btn
                className="group inline-flex h-12 items-center gap-2 rounded-lg px-6 font-bold whitespace-nowrap"
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
                href={tel}
                data-lv-press
                data-lv-btn-line
                className="inline-flex h-12 items-center gap-2 rounded-lg px-6 font-bold tabular-nums"
              >
                <IconPhone aria-hidden size={18} stroke={2} />
                Call {phone}
              </a>
            </div>
          </div>
        </Reveal>
        {course.cover && (
          <Reveal delay={0.06} className="lg:col-span-5">
            <span
              data-lv-photo
              className="relative block aspect-[4/3] overflow-hidden rounded-[14px]"
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
          </Reveal>
        )}
      </section>

      {/* What it includes */}
      {course.features.length > 0 && (
        <section
          aria-labelledby="inc-h"
          className="bg-[var(--lv-sky)] py-20 md:py-24"
        >
          <div className={container}>
            <Reveal>
              <h2 id="inc-h" data-lv-h2 className="max-w-[16ch]">
                What the course includes.
              </h2>
            </Reveal>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
              {course.features.map((f, i) => {
                const { head, body } = splitFeature(f)
                return (
                  <li
                    key={f}
                    className={i % 5 === 0 ? "lg:col-span-6" : "lg:col-span-3"}
                  >
                    <Reveal delay={(i % 4) * 0.04} className="h-full">
                      <div data-lv-card className="h-full rounded-[14px] p-6">
                        <p data-lv-display className="text-2xl">
                          {head}
                        </p>
                        {body && (
                          <p className="mt-2 text-sm text-[var(--lv-muted)]">
                            {body}
                          </p>
                        )}
                      </div>
                    </Reveal>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      {/* The teachers */}
      {track && (
        <section
          aria-labelledby="watch-h"
          className={`${container} py-20 md:py-24`}
        >
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <h2 id="watch-h" data-lv-h2 className="max-w-[16ch]">
                  Watch the same teachers teach.
                </h2>
              </Reveal>
              <PlayInPlace
                id={track.sample.id}
                title={`A ${track.exam} class`}
                data-lv-photo
                className="group relative mt-8 block aspect-video w-full overflow-hidden rounded-[14px] bg-[var(--lv-navy)]"
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
                    data-lv-btn
                    className="grid size-16 place-items-center rounded-lg transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
                  >
                    <IconPlayerPlayFilled
                      aria-hidden
                      size={22}
                      className="translate-x-px"
                    />
                  </span>
                </span>
              </PlayInPlace>
              <p className="mt-2 text-sm text-[var(--lv-muted)] tabular-nums">
                {compact(track.sample.views)} views on YouTube
              </p>
            </div>

            <div className="lg:col-span-5">
              <h2 data-lv-display className="text-3xl lg:mt-3">
                Taught by
              </h2>
              <ul className="mt-5 grid gap-3">
                {teachers.map((t) => (
                  <li key={t.slug}>
                    <a
                      href={`https://www.youtube.com/watch?v=${t.lecture}`}
                      {...external}
                      data-lv-card
                      className="group flex items-center gap-4 rounded-[14px] p-3 pr-5"
                    >
                      <span
                        data-lv-photo
                        className="relative size-16 shrink-0 overflow-hidden rounded-lg"
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
                        <span data-lv-display className="block text-2xl">
                          {t.name}
                        </span>
                        <span className="block text-sm text-[var(--lv-muted)]">
                          {t.teaches}
                        </span>
                      </span>
                      <IconArrowUpRight
                        aria-hidden
                        size={20}
                        stroke={2}
                        className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  </li>
                ))}
              </ul>
              {siblings.length > 0 && (
                <>
                  <h2 data-lv-display className="mt-10 text-3xl">
                    Also for {track.exam}
                  </h2>
                  <ul className="mt-4 grid gap-2">
                    {siblings.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`${base}/courses/${c.slug}`}
                          className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors duration-150 hover:bg-white"
                        >
                          <span>
                            <span className="block font-semibold">
                              {c.short}
                            </span>
                            <span className="block text-sm text-[var(--lv-muted)]">
                              {c.subtitle}
                            </span>
                          </span>
                          <span
                            data-lv-display
                            className="text-xl tabular-nums"
                          >
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
            <h2 id="shelf-h" data-lv-h2 className="max-w-[18ch]">
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
                    <Book3D book={b} tones={bookTones} font="var(--lv-sans)" />
                    <span className="mt-3 block truncate px-[18px] font-semibold">
                      {b.title}
                    </span>
                    <span className="block px-[18px] text-sm text-[var(--lv-muted)] tabular-nums">
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
                    className="block rounded-[14px]"
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
      <section aria-labelledby="faq-h" className={`${container} pb-20`}>
        <h2 id="faq-h" data-lv-h2>
          Before you join.
        </h2>
        <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {faqs.slice(0, 6).map((f) => (
            <div key={f.q}>
              <dt data-lv-display className="text-2xl">
                {f.q}
              </dt>
              <dd className="mt-2 text-[var(--lv-muted)]">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Enquire */}
      <section aria-labelledby="ask-h" className="bg-[var(--lv-orange)] py-16">
        <div className={container}>
          <div
            data-lv-card
            className="mx-auto max-w-[820px] rounded-[14px] p-6 sm:p-10"
          >
            <h2 id="ask-h" data-lv-display className="text-4xl">
              Ask about {course.short}.
            </h2>
            <div className="mt-6">
              <EnquiryForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
