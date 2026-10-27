import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconChevronRight,
  IconDeviceMobile,
  IconPhone,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { CSSProperties } from "react"

import { BundleRow } from "@/components/commerce/bundle-row"
import { Ask } from "@/components/home/ask"
import { Faq } from "@/components/home/faq"
import { Folder } from "@/components/home/folder"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { contentFor } from "@/i18n/content-server"
import { Link } from "@/i18n/navigation"
import {
  brand,
  contact,
  facultyBySlug,
  formatPhone,
  lectureStill,
  links,
  schedules,
  tracks,
} from "@/lib/brand"
import { publishedBundles, publishedResources } from "@/lib/catalog-server"
import { contactHref } from "@/lib/contact"
import { inr, lineup } from "@/lib/courses"
import { liveCourse, liveCourses } from "@/lib/courses-server"
import {
  alternatesFor,
  clipDescription,
  openGraphFor,
  siteUrl,
} from "@/lib/site"
import { PageExam } from "@/components/site/page-exam"
import { BlueField } from "@/components/site/blue-field"

/* Courses come from ClassPlus every few hours; a new one gets its page on
   first visit and every page refreshes within the quarter hour. */
export const revalidate = 3600

export async function generateStaticParams() {
  return (await liveCourses())
    .filter((course) => course.track)
    .map((course) => ({ slug: course.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/courses/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params
  const course = await liveCourse(slug)
  if (!course) return {}
  const t = await getTranslations({ locale, namespace: "CourseDetail" })
  const { phrase } = await contentFor(locale)
  const price = course.free ? t("freeLower") : inr(course.price)
  const title = t("titleSuffix", { course: course.short, price })
  const subtitle = course.subtitle ? `: ${phrase(course.subtitle)}` : ""
  const description = clipDescription(
    `${course.short}${subtitle}. ${t("descSuffix")} ${course.features
      .slice(0, 3)
      .join(". ")}.`
  )
  return {
    title,
    description,
    alternates: alternatesFor(`/courses/${course.slug}`, locale),
    openGraph: openGraphFor(
      `/courses/${course.slug}`,
      title,
      description,
      locale,
      course.cover ? { url: course.cover, alt: course.short } : undefined
    ),
  }
}

const rise = (delay: number) =>
  ({ "--rise-delay": `${delay}s` }) as CSSProperties

/** Enrolment counts are social proof only when they are large enough to be. */
const LEARNERS_WORTH_SHOWING = 20

/** "Head - body" feature lines from the store, split for display. */
function splitFeature(text: string) {
  const [head = "", ...rest] = text.split(" - ")
  return { head, body: rest.join(" - ") }
}

/**
 * Which feature cards go wide in the bento. A wide card takes two cells, and
 * the count is chosen so the cells fill whole rows of both two and four, so
 * the grid never ends on a hole. Tones alternate blue and amber.
 */
function wideTones(count: number) {
  const wide = Math.min(count, (4 - (count % 4)) % 4 || (count >= 8 ? 4 : 0))
  const every = wide ? Math.floor(count / wide) : 0
  return Array.from({ length: count }, (_, i) =>
    wide && i % every === 0 && i / every < wide
      ? (i / every) % 2
        ? "amber"
        : "blue"
      : "paper"
  )
}

export default async function CoursePage({
  params,
}: PageProps<"/[locale]/courses/[slug]">) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const [course, courses, bundles, resources] = await Promise.all([
    liveCourse(slug),
    liveCourses(),
    publishedBundles().catch(() => []),
    publishedResources().catch(() => []),
  ])
  if (!course?.track) notFound()

  const track = tracks.find((t) => t.exam === course.track)
  const legacy = schedules[course.id]
  const t = await getTranslations("Pulse")
  const detail = await getTranslations("CourseDetail")
  const fees = await getTranslations("Fees")
  const nav = await getTranslations("Nav")
  const content = await contentFor(locale)
  const { phrase } = content
  const names = track ? content.track(track.slug) : null
  const exam = names?.exam ?? course.track
  const people = (track?.faculty ?? []).map(facultyBySlug)
  const { flagship, also, free } = lineup(courses, course.track)
  const siblings = [flagship, ...also, free].filter(
    (c): c is NonNullable<typeof c> => c !== undefined && c.id !== course.id
  )
  const sets = bundles.filter((bundle) => bundle.exam === course.track)
  const folders = [
    ...Map.groupBy(
      resources.filter((r) => r.exam === course.track),
      (r) => r.kind
    ),
  ].map(([kind, items]) => ({ kind, count: items.length }))
  const compact = new Intl.NumberFormat(locale === "as" ? "as-IN" : "en-IN", {
    notation: "compact",
  })

  // The hero shows the first four lines' heads; the cards below carry the
  // rest, and any of those four with more to say, never the same line twice.
  const included = course.features.filter(
    (feature, i) => i >= 4 || splitFeature(feature).body
  )
  const tones = wideTones(included.length)
  const timing =
    course.timing ?? (legacy?.when ? phrase(legacy.when) : undefined)
  const facts = [
    { label: t("timingLabel"), value: timing },
    {
      label: t("daysLabel"),
      value: !course.timing && legacy?.days ? phrase(legacy.days) : undefined,
    },
    { label: t("startsLabel"), value: course.batchStarts },
    { label: t("lengthLabel"), value: names?.duration },
    {
      label: t("centreLabel"),
      value: course.offlineFee ? inr(course.offlineFee) : undefined,
    },
  ].filter((fact): fact is { label: string; value: string } => !!fact.value)

  /* Course schema, so search can show the price beside the result */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.short,
    description: course.subtitle || course.features.slice(0, 2).join(". "),
    provider: {
      "@type": "EducationalOrganization",
      name: brand.legalName,
      url: siteUrl,
    },
    offers: {
      "@type": "Offer",
      category: course.free ? "Free" : "Paid",
      price: course.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Blended",
      location: `${brand.legalName}, North Lakhimpur, Assam`,
      ...(timing
        ? { courseSchedule: { "@type": "Schedule", description: timing } }
        : {}),
    },
  }

  return (
    <main>
      <PageExam exam={course.track} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* ---- the course on blue, with its poster and fee on a card ---- */}
      <section data-hero="blue" aria-labelledby="course-heading">
        <BlueField />
        <div data-hero-glow aria-hidden />
        <div aria-hidden className="h-(--header-height)" />
        <div className="relative container-page grid gap-10 pbs-6 pbe-14 lg:grid-cols-12 lg:items-center lg:gap-14 lg:pbs-10 lg:pbe-20">
          <div className="lg:col-span-7">
            <nav aria-label={detail("breadcrumb")}>
              <ol className="flex flex-wrap items-center gap-1 text-sm text-on-primary">
                <li>
                  <Link href="/courses" data-crumb>
                    {nav("courses")}
                  </Link>
                </li>
                <li className="flex items-center gap-1">
                  <IconChevronRight aria-hidden size={14} stroke={1.75} />
                  <Link href={`/courses#${track?.slug ?? ""}`} data-crumb>
                    {exam}
                  </Link>
                </li>
              </ol>
            </nav>
            <h1
              id="course-heading"
              data-rise
              className="mbs-6 font-display text-[clamp(2.3rem,1.6rem+3.5vw,4.4rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance"
            >
              {course.short}
            </h1>
            <p
              data-rise
              style={rise(0.08)}
              className="mbs-4 max-w-[44ch] text-lg text-pretty text-on-primary"
            >
              {course.subtitle ? phrase(course.subtitle) : names?.full}
            </p>
            {facts.length ? (
              <dl
                data-rise
                style={rise(0.16)}
                className="mbs-8 flex flex-wrap gap-2"
              >
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    data-fact
                    className="tnum grid rounded-2xl ps-4 pe-4 pbs-2.5 pbe-2.5"
                  >
                    <dt className="text-xs text-white">{fact.label}</dt>
                    <dd className="font-semibold">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {/* The course's own first lines from ClassPlus, so the blue holds
                what a student came to read, beside the fee card. */}
            {course.features.length ? (
              <ul
                data-rise
                style={rise(0.2)}
                className="mbs-8 grid max-w-[40rem] gap-x-6 gap-y-3 sm:grid-cols-2"
              >
                {course.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mbs-0.5 grid size-5 flex-none place-items-center rounded-full bg-highlight text-ink">
                      <IconCheck aria-hidden size={13} stroke={2.5} />
                    </span>
                    <span className="text-pretty">
                      {phrase(splitFeature(feature).head)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {people.length ? (
              <div
                data-rise
                style={rise(0.24)}
                className="mbs-8 flex items-center gap-3"
              >
                <ul className="flex flex-none">
                  {people.map((person, k) => (
                    <li key={person.slug} className={k ? "-ms-2.5" : undefined}>
                      <span className="relative block size-10 overflow-clip rounded-full bg-primary-deep ring-2 ring-primary">
                        <Image
                          src={person.portrait}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover object-top"
                        />
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-pretty text-on-primary">
                  <span className="font-semibold text-white">
                    {t("taughtBy")}
                  </span>{" "}
                  {people.map((person) => person.name).join(", ")}
                </p>
              </div>
            ) : null}
            {course.learners >= LEARNERS_WORTH_SHOWING ? (
              <p
                data-rise
                style={rise(0.28)}
                className="mbs-6 text-sm text-on-primary"
              >
                <span className="tnum font-semibold text-white">
                  {course.learners}
                </span>{" "}
                {detail("learners")}
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-5">
            <div
              data-rise
              style={rise(0.1)}
              className="rounded-[28px] bg-card p-3 text-foreground shadow-lift"
            >
              {course.cover ? (
                <span
                  data-poster
                  className="relative block aspect-[4/3] overflow-clip rounded-[20px] bg-secondary"
                >
                  <Image
                    src={course.cover}
                    alt={detail("posterAlt", { course: course.short })}
                    fill
                    priority
                    sizes="(min-width: 1024px) 34rem, 100vw"
                    className="object-cover"
                  />
                </span>
              ) : null}
              <div className="p-4 pbs-5 sm:p-5">
                <p className="tnum flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display text-4xl font-semibold tracking-[-0.03em]">
                    {course.free ? t("free") : inr(course.price)}
                  </span>
                  {!course.free && course.mrp > course.price ? (
                    <s className="text-muted-foreground">{inr(course.mrp)}</s>
                  ) : null}
                </p>
                <p className="mbs-1 text-sm text-muted-foreground">
                  {course.free ? detail("freeNote") : t("oneTime")}
                </p>
                <div data-course-actions className="mbs-5">
                  <a
                    data-press
                    data-cta="amber"
                    href={contactHref({
                      kind: "course",
                      courseName: course.short,
                    })}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-highlight px-5 font-semibold text-ink"
                  >
                    {course.free
                      ? detail("joinFree", { course: course.short })
                      : detail("enrol", { course: course.short })}
                    <IconArrowRight
                      data-nudge
                      aria-hidden
                      size={18}
                      stroke={2}
                    />
                  </a>
                  <a
                    data-press
                    data-cta="ghost-paper"
                    href={links.play}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_20%,transparent)]"
                  >
                    <IconDeviceMobile aria-hidden size={17} stroke={1.75} />
                    {t("getApp")}
                  </a>
                  <a
                    data-press
                    data-cta="ghost-paper"
                    href={contactHref({ kind: "call" })}
                    className="tnum inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_20%,transparent)]"
                  >
                    <IconPhone aria-hidden size={17} stroke={1.75} />
                    {formatPhone(contact.phones[0])}
                  </a>
                </div>
                {course.free ? null : (
                  <p className="mbs-4 text-xs text-muted-foreground">
                    {fees("note")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- what the fee buys ---- */}
      {included.length ? (
        <section
          aria-labelledby="includes-heading"
          className="container-page pbs-20 pbe-20 md:pbs-28"
        >
          <Reveal>
            <h2 id="includes-heading" className="type-display max-w-[18ch]">
              {t("includesHeading")}
            </h2>
          </Reveal>
          <div data-includes className="mbs-10">
            <ul>
              {included.map((feature, i) => {
                const { head, body } = splitFeature(feature)
                return (
                  <li key={feature} data-include={tones[i]}>
                    <Reveal delay={(i % 4) * 0.05} className="h-full">
                      <div
                        data-include-card
                        className="h-full rounded-[22px] p-5 sm:p-6"
                      >
                        {/* A tick, not a number: the cards are what is
                            included, not steps, and the grid reorders them. */}
                        <IconCheck
                          aria-hidden
                          size={20}
                          stroke={2.25}
                          data-include-quiet
                        />
                        <p className="mbs-3 font-semibold text-pretty">
                          {head}
                        </p>
                        {body ? (
                          <p
                            data-include-quiet
                            className="mbs-2 text-sm text-pretty"
                          >
                            {body}
                          </p>
                        ) : null}
                      </div>
                    </Reveal>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ---- the teachers, a class to watch, the rest of the exam ---- */}
      {track ? (
        <section
          aria-labelledby="watch-heading"
          className="container-page pbe-20 md:pbe-28"
        >
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-7">
              <Reveal>
                <h2 id="watch-heading" className="type-display max-w-[16ch]">
                  {t("watchHeading")}
                </h2>
              </Reveal>
              <Reveal delay={0.06}>
                <div className="mbs-8 rounded-[28px] bg-card p-3 shadow-[0_0_0_1px_var(--border)]">
                  <VideoDialog
                    id={track.sample.id}
                    title={t("watchSample", { exam })}
                    className="group relative block aspect-video w-full overflow-clip rounded-[20px] bg-ink"
                  >
                    <Image
                      src={lectureStill(track.sample.id)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 44rem, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute inset-0 grid place-items-center">
                      <span
                        data-play
                        className="grid size-16 place-items-center rounded-full bg-highlight text-ink"
                      >
                        <IconPlayerPlayFilled
                          aria-hidden
                          size={22}
                          className="translate-x-px"
                        />
                      </span>
                    </span>
                  </VideoDialog>
                  <p className="tnum ps-3 pe-3 pbs-3 pbe-1 text-sm text-muted-foreground">
                    {t("views", { count: compact.format(track.sample.views) })}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="min-w-0 lg:col-span-5 lg:pbs-3">
              <h3 className="text-lg font-semibold">{t("taughtBy")}</h3>
              <ul className="mbs-4 grid gap-3">
                {people.map((person) => (
                  <li key={person.slug} data-row-card>
                    <VideoDialog
                      id={person.lecture}
                      title={`${person.called}, ${content.teaches(person.slug)}`}
                      className="flex w-full items-center gap-4 rounded-[inherit] p-3 pe-5 text-start"
                    >
                      <span className="relative size-16 flex-none overflow-clip rounded-2xl bg-secondary">
                        <Image
                          src={person.portrait}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover object-top"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">
                          {person.called}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {content.teaches(person.slug)}
                        </span>
                      </span>
                      <IconPlayerPlayFilled
                        aria-hidden
                        size={14}
                        className="text-muted-foreground"
                      />
                    </VideoDialog>
                  </li>
                ))}
              </ul>

              {siblings.length ? (
                <>
                  <h3 className="mbs-10 text-lg font-semibold">
                    {t("alsoFor", { exam })}
                  </h3>
                  <ul className="mbs-3 grid grid-cols-1 gap-1">
                    {siblings.map((other) => (
                      <li key={other.id}>
                        <Link
                          href={`/courses/${other.slug}`}
                          data-sibling
                          className="flex items-center justify-between gap-4 rounded-2xl ps-4 pe-4 pbs-3 pbe-3"
                        >
                          <span className="min-w-0">
                            <span className="block font-semibold">
                              {other.short}
                            </span>
                            {other.subtitle ? (
                              <span className="block truncate text-sm text-muted-foreground">
                                {phrase(other.subtitle)}
                              </span>
                            ) : null}
                          </span>
                          <span className="tnum flex flex-none items-center gap-2 text-sm font-semibold">
                            {other.free ? t("free") : inr(other.price)}
                            <IconArrowUpRight
                              data-nudge
                              aria-hidden
                              size={16}
                              stroke={1.75}
                            />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- the exam's book sets and free notes ---- */}
      {sets.length || folders.length ? (
        <section
          aria-labelledby="shelf-heading"
          className="container-page pbe-20 md:pbe-28"
        >
          <Reveal>
            <h2 id="shelf-heading" className="type-display max-w-[20ch]">
              {t("shelfHeading", { exam })}
            </h2>
          </Reveal>
          {sets.length ? (
            <ul className="mbs-10 grid gap-6">
              {sets.map((bundle, i) => (
                <li key={bundle.slug}>
                  <Reveal delay={i * 0.05}>
                    <BundleRow bundle={bundle} />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : null}
          {folders.length ? (
            <>
              <h3 className="mbs-12 text-lg font-semibold">
                {t("freeNotesFor", { exam })}
              </h3>
              <ul className="mbs-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
                {folders.map((folder) => (
                  <li key={folder.kind}>
                    <Link
                      data-folder-open
                      href={`/resources?kind=${encodeURIComponent(folder.kind)}`}
                      aria-label={t("folderLabel", {
                        name: phrase(folder.kind),
                        count: folder.count,
                      })}
                      className="block rounded-[14px]"
                    >
                      <Folder
                        name={phrase(folder.kind)}
                        count={folder.count}
                        label={t("folderFiles", { count: folder.count })}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}

      <Faq courses={courses} heading={t("beforeJoin")} limit={4} />
      <Ask
        heading={t("askAbout", { course: course.short })}
        defaultTrack={course.track}
      />
    </main>
  )
}
