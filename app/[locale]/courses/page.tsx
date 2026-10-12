import { IconArrowRight } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Ask } from "@/components/home/ask"
import { Reveal } from "@/components/motion/reveal"
import { JumpChips } from "@/components/site/jump-chips"
import { PageHead } from "@/components/site/page-head"
import { contentFor } from "@/i18n/content-server"
import { Link } from "@/i18n/navigation"
import { facultyBySlug, schedules, tracks } from "@/lib/brand"
import { inr, lineup } from "@/lib/courses"
import { liveCourses } from "@/lib/courses-server"
import { alternatesFor, openGraphFor } from "@/lib/site"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/courses">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "CoursesPage" })
  const title = t("title")
  const description = t("description")
  return {
    title,
    description,
    alternates: alternatesFor("/courses", locale),
    openGraph: openGraphFor("/courses", title, description, locale),
  }
}

/** Every live course, grouped by exam, straight from ICT's ClassPlus store. */
export default async function CoursesPage({
  params,
}: PageProps<"/[locale]/courses">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Pulse")
  const fees = await getTranslations("Fees")
  const nav = await getTranslations("Nav")
  const content = await contentFor(locale)
  const courses = await liveCourses()

  const groups = tracks.flatMap((track) => {
    const { flagship, also, free } = lineup(courses, track.exam)
    const items = [flagship, ...also, free].filter((c) => c !== undefined)
    return items.length ? [{ track, items }] : []
  })

  return (
    <main>
      <PageHead
        trail={[{ label: nav("courses") }]}
        title={t("coursesTitle")}
        lede={`${fees("note")} ${fees("scholarship")}`}
      >
        <JumpChips
          label={t("jumpExam")}
          items={groups.map(({ track }) => ({
            href: `#${track.slug}`,
            label: content.track(track.slug).exam,
          }))}
        />
      </PageHead>

      {groups.map(({ track, items }) => {
        const names = content.track(track.slug)
        const teachers = track.faculty.map(facultyBySlug)
        return (
          <section
            key={track.slug}
            id={track.slug}
            aria-labelledby={`${track.slug}-heading`}
            className="container-page pbe-20"
          >
            <div className="grid gap-8 lg:grid-cols-12">
              <Reveal className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <h2 id={`${track.slug}-heading`} className="type-display">
                    {names.exam}
                  </h2>
                  <p className="mbs-3 text-muted-foreground">{names.full}</p>
                  <p className="mbs-2 max-w-[34ch] text-muted-foreground">
                    {names.covers}. {names.duration}.
                  </p>
                  <ul
                    className="mbs-5 flex items-center"
                    aria-label={t("faculty")}
                  >
                    {teachers.map((teacher, k) => (
                      <li
                        key={teacher.slug}
                        className={k ? "-ms-2.5" : undefined}
                      >
                        <span
                          data-avatar
                          className="relative block size-11 overflow-clip rounded-full"
                          title={`${teacher.name}, ${content.teaches(teacher.slug)}`}
                        >
                          <Image
                            src={teacher.portrait}
                            alt={`${teacher.name}, ${content.teaches(teacher.slug)}`}
                            fill
                            sizes="44px"
                            className="object-cover object-top"
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <ul className="grid gap-4 lg:col-span-8">
                {items.map((course, i) => {
                  const legacy = schedules[course.id]
                  const when = course.timing
                    ? course.timing
                    : legacy?.when
                      ? `${content.phrase(legacy.when)}${legacy.days ? `, ${content.phrase(legacy.days)}` : ""}`
                      : t("askTiming")
                  return (
                    <li key={course.id}>
                      <Reveal delay={i * 0.05}>
                        <Link
                          href={`/courses/${course.slug}`}
                          data-row-card
                          className="flex flex-col gap-5 overflow-clip p-3 sm:flex-row sm:items-center"
                        >
                          {course.cover ? (
                            <span
                              data-frame
                              className="relative block aspect-[4/3] w-full flex-none overflow-clip rounded-2xl sm:w-52"
                            >
                              <Image
                                src={course.cover}
                                alt={t("poster", { name: course.short })}
                                fill
                                sizes="(min-width: 640px) 208px, 100vw"
                                className="object-cover"
                              />
                            </span>
                          ) : null}
                          <span className="min-w-0 flex-1 ps-2 pe-2 pbe-2 sm:ps-0 sm:pe-0 sm:pbe-0">
                            <span className="block font-display text-xl font-semibold tracking-[-0.02em]">
                              {course.short}
                            </span>
                            {course.subtitle ? (
                              <span className="mbs-1 block text-muted-foreground">
                                {content.phrase(course.subtitle)}
                              </span>
                            ) : null}
                            <span className="tnum mbs-3 block text-sm text-muted-foreground">
                              {when}
                              {course.offlineFee
                                ? ` · ${t("offline", { fee: inr(course.offlineFee) })}`
                                : ""}
                            </span>
                          </span>
                          <span className="flex items-center justify-between gap-4 ps-2 pe-2 pbe-2 sm:flex-col sm:items-end sm:ps-4 sm:pe-4 sm:pbe-0">
                            <span className="tnum text-end">
                              <span className="block font-display text-2xl font-semibold">
                                {course.free ? t("free") : inr(course.price)}
                              </span>
                              {!course.free && course.mrp > course.price ? (
                                <s className="text-sm text-muted-foreground">
                                  {inr(course.mrp)}
                                </s>
                              ) : null}
                            </span>
                            <span
                              data-row-go
                              className="grid size-11 place-items-center rounded-full"
                            >
                              <IconArrowRight
                                aria-hidden
                                size={18}
                                stroke={2}
                              />
                            </span>
                          </span>
                        </Link>
                      </Reveal>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        )
      })}

      <Ask />
    </main>
  )
}
