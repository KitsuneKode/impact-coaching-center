import { IconArrowRight, IconChevronRight, IconPlus } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { listedCourseIds, schedules, trackForCourse } from "@/lib/brand"
import { catalogue } from "@/lib/catalogue"

import { Book3D } from "../../../_book"
import { Folder } from "../../../_folder"
import {
  compact,
  faculty,
  faqs,
  offer,
  rupees,
  shelf,
  thumb,
  whatsapp,
} from "../../../_data"
import { PlayInPlace, SpotlightGroup } from "../../../_fx"
import { Reveal } from "../../../_reveal"
import {
  bookTones,
  CallCta,
  card,
  container,
  external,
  folderTones,
  h2,
  LampShell,
  Play,
  PrimaryCta,
} from "../../_chrome"
import { EnrolBar } from "../../_client"

const listed = catalogue.filter((c) => listedCourseIds.has(c.id))

export function generateStaticParams() {
  return listed.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/prototypes/lamp/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const course = listed.find((c) => c.slug === slug)
  return { title: course ? `${course.short}, Lamp` : "Course" }
}

/** "Head - body" feature strings from the store, split for display. */
function splitFeature(text: string) {
  const [head, ...rest] = text.split(" - ")
  return { head: head!, body: rest.join(" - ") }
}

export default async function LampCourse({
  params,
}: PageProps<"/prototypes/lamp/courses/[slug]">) {
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
    <LampShell>
      <EnrolBar watch="lp-price">
        <div className={`${container} flex h-14 items-center gap-4`}>
          <p className="min-w-0 truncate font-semibold">{course.short}</p>
          <p className="text-sm text-[var(--lp-muted)] tabular-nums">
            {course.free ? "Free" : rupees(course.price)}
          </p>
          <a
            data-press
            data-primary
            href={whatsapp}
            {...external}
            className="ml-auto inline-flex h-10 items-center rounded-full bg-[var(--lp-amber)] px-4 text-sm font-semibold text-[var(--lp-bg)]"
          >
            {offer.cta}
          </a>
        </div>
      </EnrolBar>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-[10%] h-[28rem] w-[44rem] rounded-full bg-[radial-gradient(closest-side,rgba(245,181,68,0.18),transparent)] blur-2xl"
          />
          <div className={`${container} relative pt-8 pb-16 md:pt-12 md:pb-24`}>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-sm text-[var(--lp-muted)]"
            >
              <Link data-quiet href="/prototypes/lamp#courses">
                Courses
              </Link>
              <IconChevronRight aria-hidden size={14} stroke={1.75} />
              <span className="text-[var(--lp-text)]">{course.short}</span>
            </nav>
            <div className="mt-10 grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-6">
                {track && (
                  <p className="text-[var(--lp-muted)]">{track.full}</p>
                )}
                <h1 className="mt-2 text-[clamp(2.6rem,6vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.03em] [font-stretch:112%]">
                  {course.short}
                </h1>
                {course.subtitle && (
                  <p className="mt-4 text-xl text-[var(--lp-muted)]">
                    {course.subtitle}
                  </p>
                )}
                <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-[var(--lp-line)] pt-8 sm:grid-cols-3">
                  {schedule?.when && (
                    <div>
                      <dt className="text-sm text-[var(--lp-muted)]">Timing</dt>
                      <dd className="mt-1 font-medium tabular-nums">
                        {schedule.when}
                      </dd>
                    </div>
                  )}
                  {schedule?.days && (
                    <div>
                      <dt className="text-sm text-[var(--lp-muted)]">Days</dt>
                      <dd className="mt-1 font-medium">{schedule.days}</dd>
                    </div>
                  )}
                  {track && (
                    <div>
                      <dt className="text-sm text-[var(--lp-muted)]">
                        Duration
                      </dt>
                      <dd className="mt-1 font-medium">{track.duration}</dd>
                    </div>
                  )}
                  {schedule?.note && (
                    <div className="col-span-2 sm:col-span-3">
                      <dt className="sr-only">Note</dt>
                      <dd className="text-sm text-[var(--lp-amber)]">
                        {schedule.note}
                      </dd>
                    </div>
                  )}
                </dl>
                <p
                  id="lp-price"
                  className="mt-8 flex items-baseline gap-3 tabular-nums"
                >
                  <span className="text-5xl font-semibold tracking-[-0.03em]">
                    {course.free ? "Free" : rupees(course.price)}
                  </span>
                  {!course.free && course.mrp > course.price && (
                    <s className="text-[var(--lp-muted)]">
                      {rupees(course.mrp)}
                    </s>
                  )}
                  {!course.free && (
                    <span className="text-sm text-[var(--lp-muted)]">
                      one time, tests, notes and the app included
                    </span>
                  )}
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <PrimaryCta />
                  <CallCta />
                </div>
              </div>
              {course.cover && (
                <div className="lg:col-span-6">
                  <div className="rounded-[26px] bg-[var(--lp-card)] p-2 shadow-[0_0_0_1px_var(--lp-line-hi),0_40px_120px_-40px_rgba(245,181,68,0.4)]">
                    <span className="relative block aspect-[4/3] overflow-hidden rounded-[20px]">
                      <Image
                        src={course.cover}
                        alt={`${course.short} poster`}
                        fill
                        priority
                        sizes="(min-width: 1024px) 560px, 100vw"
                        className="object-cover"
                      />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* What the course includes, from ICT's own listing. */}
        {course.features.length > 0 && (
          <section aria-labelledby="inc-h" className="py-16 md:py-24">
            <div className={container}>
              <Reveal>
                <h2 id="inc-h" className={`${h2} max-w-[18ch]`}>
                  What the course includes.
                </h2>
              </Reveal>
              <SpotlightGroup className="mt-12">
                <ul
                  data-lp-bento
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {course.features.map((f, i) => {
                    const { head, body } = splitFeature(f)
                    return (
                      <li
                        key={f}
                        data-spot
                        className={`${card} p-6 ${i === 0 && (course.features.length + 1) % 4 === 0 ? "lg:col-span-2" : ""}`}
                      >
                        <p className="relative z-[1] font-semibold">{head}</p>
                        {body && (
                          <p className="relative z-[1] mt-2 text-sm text-[var(--lp-muted)]">
                            {body}
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </SpotlightGroup>
            </div>
          </section>
        )}

        {/* A class from this track, and who teaches it. */}
        {track && (
          <section aria-labelledby="watch-h" className="py-16 md:py-24">
            <div className={`${container} grid gap-12 lg:grid-cols-12`}>
              <div className="lg:col-span-7">
                <h2 id="watch-h" className={`${h2} max-w-[16ch]`}>
                  Watch the same teachers teach.
                </h2>
                <div className="mt-10 rounded-[24px] bg-[var(--lp-card)] p-2 shadow-[0_0_0_1px_var(--lp-line-hi)]">
                  <PlayInPlace
                    id={track.sample.id}
                    title={`A ${track.exam} class`}
                    className="group relative block aspect-video w-full overflow-hidden rounded-[18px] bg-black"
                  >
                    <Image
                      src={thumb(track.sample.id)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 680px, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute inset-0 grid place-items-center bg-[rgba(7,9,14,0.18)]">
                      <Play size="lg" />
                    </span>
                  </PlayInPlace>
                  <p className="px-3 pt-3 pb-1 text-sm text-[var(--lp-muted)] tabular-nums">
                    {compact(track.sample.views)} views on YouTube
                  </p>
                </div>
              </div>
              <div className="lg:col-span-5">
                <h2 className="text-lg font-semibold lg:mt-3">Taught by</h2>
                <ul className="mt-6 grid gap-3">
                  {teachers.map((t) => (
                    <li key={t.slug}>
                      <a
                        href={`https://www.youtube.com/watch?v=${t.lecture}`}
                        {...external}
                        className="group flex items-center gap-4 rounded-[22px] bg-[var(--lp-card)] p-3 pr-5 shadow-[inset_0_0_0_1px_var(--lp-line)] transition-shadow duration-200 hover:shadow-[inset_0_0_0_1px_rgba(245,181,68,0.45)]"
                      >
                        <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-[#0B1A33]">
                          <Image
                            src={t.portrait}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover object-top grayscale transition-[filter] duration-300 group-hover:grayscale-0"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold">{t.name}</span>
                          <span className="block text-sm text-[var(--lp-muted)]">
                            {t.teaches}
                          </span>
                        </span>
                        <IconArrowRight
                          aria-hidden
                          size={18}
                          stroke={1.75}
                          className="text-[var(--lp-muted)] transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
                {siblings.length > 0 && (
                  <>
                    <h2 className="mt-12 text-lg font-semibold">
                      Also for {track.exam}
                    </h2>
                    <ul className="mt-4 grid gap-2">
                      {siblings.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/prototypes/lamp/courses/${c.slug}`}
                            className="group flex items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-colors duration-150 hover:bg-[rgba(226,232,242,0.04)]"
                          >
                            <span>
                              <span className="block font-medium">
                                {c.short}
                              </span>
                              <span className="block text-sm text-[var(--lp-muted)]">
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

        {/* Books and notes for the same exam. */}
        {(examBooks.length > 0 || examFolders.length > 0) && (
          <section aria-labelledby="shelf-h" className="py-16 md:py-24">
            <div className={container}>
              <h2 id="shelf-h" className={`${h2} max-w-[20ch]`}>
                Books and free material for {track?.exam}.
              </h2>
              <div className="mt-12 grid gap-10 lg:grid-cols-12">
                <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:col-span-6">
                  {examBooks.map((b) => (
                    <li key={b.slug} className="min-w-0">
                      <Link
                        data-bk-hover
                        href={`/prototypes/lamp/books/${b.slug}`}
                        className="group block"
                      >
                        <Book3D
                          book={b}
                          tones={bookTones}
                          font="var(--lp-sans)"
                        />
                        <span className="mt-3 block truncate px-[18px] font-semibold">
                          {b.title}
                        </span>
                        <span className="block px-[18px] text-sm text-[var(--lp-muted)] tabular-nums">
                          {b.price}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="grid grid-cols-2 content-start gap-x-3 gap-y-5 sm:grid-cols-3 lg:col-span-6">
                  {examFolders.map((f) => (
                    <li key={f.id}>
                      <Link
                        data-fd-hover
                        href={`/prototypes/lamp/notes#${f.id}`}
                        aria-label={`${f.name}, ${f.items.length} files`}
                        className="block rounded-[14px]"
                      >
                        <Folder folder={f} tones={folderTones} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Questions */}
        <section aria-labelledby="faq-h" className="py-16 md:py-24">
          <div className={`${container} grid gap-10 md:grid-cols-12`}>
            <h2 id="faq-h" className={`${h2} md:col-span-4`}>
              Before you join.
            </h2>
            <div className="md:col-span-8">
              {faqs.slice(0, 5).map((f) => (
                <details key={f.q} className="border-b border-[var(--lp-line)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium">
                    {f.q}
                    <IconPlus
                      data-plus
                      aria-hidden
                      size={20}
                      stroke={1.75}
                      className="shrink-0 text-[var(--lp-muted)]"
                    />
                  </summary>
                  <p className="max-w-[62ch] pb-6 text-[var(--lp-muted)]">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </LampShell>
  )
}
