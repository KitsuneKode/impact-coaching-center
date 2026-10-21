import { IconArrowDown, IconArrowRight, IconClock } from "@tabler/icons-react"
import Image from "next/image"
import { getLocale, getTranslations } from "next-intl/server"

import { contentFor } from "@/i18n/content-server"
import { Link } from "@/i18n/navigation"
import { facultyBySlug, schedules, tracks } from "@/lib/brand"
import { type Course, inr, lineup } from "@/lib/courses"

/**
 * The courses page starts where a student does: with their exam. One door
 * per exam, in that exam's colour from the home page: what it covers, the
 * batch ICT leads with (when it runs, what it costs), the teachers, and how
 * many courses sit behind it.
 */
export async function ExamDoors({ courses }: { courses: readonly Course[] }) {
  const t = await getTranslations("CoursesPage")
  const pulse = await getTranslations("Pulse")
  const content = await contentFor(await getLocale())

  const doors = tracks.flatMap((track) => {
    const { flagship, also, free } = lineup(courses, track.exam)
    const count = [flagship, ...also, free].filter(Boolean).length
    return flagship ? [{ track, lead: flagship, count }] : []
  })
  if (!doors.length) return null

  return (
    <section
      aria-labelledby="doors-heading"
      className="container-page grid gap-8 pbe-16"
    >
      <div className="grid max-w-[40rem] gap-3">
        <h2 id="doors-heading" className="type-display-sm">
          {t("doorsHeading")}
        </h2>
        <p className="text-pretty text-muted-foreground">{t("doorsLede")}</p>
      </div>
      <ul className="grid gap-4 md:grid-cols-3">
        {doors.map(({ track, lead, count }) => {
          const names = content.track(track.slug)
          const when = lead.timing ?? schedules[lead.id]?.when
          return (
            <li key={track.slug}>
              <article
                data-door={track.slug}
                aria-labelledby={`door-${track.slug}`}
                className="flex h-full flex-col gap-5 rounded-card p-5 md:p-6"
              >
                <header className="grid gap-1.5">
                  <h3
                    id={`door-${track.slug}`}
                    className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em]"
                  >
                    {names.exam}
                  </h3>
                  <p data-door-dim className="text-sm text-pretty">
                    {names.covers}. {names.duration}.
                  </p>
                </header>

                <Link
                  href={`/courses/${lead.slug}`}
                  data-door-lead
                  className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 rounded-2xl p-2.5"
                >
                  <span className="relative aspect-[4/3] overflow-clip rounded-xl bg-secondary">
                    {lead.cover ? (
                      <Image
                        src={lead.cover}
                        alt=""
                        fill
                        sizes="72px"
                        className="object-cover object-top"
                      />
                    ) : null}
                  </span>
                  <span className="grid min-w-0 gap-0.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("doorLead")}
                    </span>
                    <span className="truncate font-semibold">{lead.short}</span>
                    <span className="tnum flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {lead.free ? pulse("free") : inr(lead.price)}
                      </span>
                      {when ? (
                        <span className="inline-flex items-center gap-1">
                          <IconClock aria-hidden size={13} stroke={1.75} />
                          {content.phrase(when)}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </Link>

                <footer className="mbs-auto flex items-center justify-between gap-3">
                  <ul
                    className="flex items-center"
                    aria-label={pulse("faculty")}
                  >
                    {track.faculty.map(facultyBySlug).map((teacher, k) => (
                      <li
                        key={teacher.slug}
                        className={k ? "-ms-2" : undefined}
                      >
                        <span
                          data-door-face
                          className="relative block size-8 overflow-clip rounded-full"
                        >
                          <Image
                            src={teacher.portrait}
                            alt={`${teacher.name}, ${content.teaches(teacher.slug)}`}
                            fill
                            sizes="32px"
                            className="object-cover object-top"
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`#${track.slug}`}
                    data-door-all
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full ps-3.5 pe-3 text-sm font-semibold"
                  >
                    {t("doorCount", { count })}
                    <IconArrowDown aria-hidden size={15} stroke={2} />
                    <span className="sr-only">
                      {t("doorSee", { exam: names.exam })}
                    </span>
                  </a>
                </footer>
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** ICT's own three steps to joining, ending on the message that starts it. */
export async function JoinSteps({ href }: { href: string }) {
  const t = await getTranslations("CoursesPage")
  const content = await contentFor(await getLocale())
  return (
    <section
      aria-labelledby="join-heading"
      className="container-page grid gap-8 pbe-20 md:pbe-28"
    >
      <h2 id="join-heading" className="type-display-sm">
        {t("joinHeading")}
      </h2>
      <ol className="grid gap-4 md:grid-cols-3">
        {content.joining.map((step, i) => (
          <li
            key={step.verb}
            data-join-step
            className="grid content-start gap-2 rounded-card p-5 md:p-6"
          >
            <span className="tnum font-display text-3xl font-semibold text-primary">
              {i + 1}
            </span>
            <span className="text-lg font-semibold">{step.verb}</span>
            <span className="text-pretty text-muted-foreground">
              {step.body}
            </span>
          </li>
        ))}
      </ol>
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        data-press
        className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-highlight ps-6 pe-5 font-semibold text-foreground"
      >
        {t("joinCta")}
        <IconArrowRight aria-hidden size={18} stroke={2} />
      </a>
    </section>
  )
}
