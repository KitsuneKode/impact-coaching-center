import { useLocale, useTranslations } from "next-intl"
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import Image from "next/image"
import { useContent } from "@/i18n/content"
import { Link } from "@/i18n/navigation"

import { UntilDate } from "@/components/marketing/batch-countdown"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { ButtonAnchor } from "@/components/ui/button"
import { Lede, Section } from "@/components/ui/section"
import { hasStarted } from "@/lib/batch-date"
import { inr, lineup, type Course } from "@/lib/courses"
import { facultyBySlug, lectureStill, tracks, type Track } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { cn } from "@/lib/utils"

function startsLabel(iso: string, locale: string) {
  return new Date(`${iso}T00:00:00+05:30`).toLocaleDateString(
    locale === "as" ? "as-IN-u-nu-latn" : "en-IN",
    {
      day: "numeric",
      month: "long",
      timeZone: "Asia/Kolkata",
    }
  )
}

function views(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`
}

/** A pricing card per track, priced from ICT's ClassPlus courses. */
function TrackCard({
  track,
  courses,
  featured = false,
}: {
  track: Track
  courses: readonly Course[]
  featured?: boolean
}) {
  const t = useTranslations("Courses")
  const tf = useTranslations("Fees")
  const locale = useLocale()
  // The WhatsApp message keeps the English exam name ICT's staff read.
  const names = useContent().track(track.slug)
  const { flagship: course, also, free } = lineup(courses, track.exam)
  if (!course) return null
  // ICT's batch date from the admin, else the one written into the brand file.
  const startsOn = course.batchStarts ?? track.startsOn
  const people = track.faculty.map(facultyBySlug)
  const muted = featured ? "text-white/60" : "text-muted-foreground"
  const rule = featured ? "border-white/15" : "border-border"

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-card p-6 md:p-7",
        featured
          ? "bg-primary text-primary-foreground shadow-lift"
          : "border border-border bg-card shadow-frame"
      )}
    >
      <header className="min-h-20">
        <div className="flex items-start justify-between gap-3">
          <h3 className="type-lede">{names.exam}</h3>
          <span
            className={cn(
              "shrink-0 rounded-control px-2.5 py-1 text-sm",
              featured
                ? "bg-white/10 text-white/80"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {names.duration}
          </span>
        </div>
        <p className={cn("mbs-1.5 text-sm", muted)}>{names.covers}</p>
      </header>

      <div className={cn("mbs-6 border-t pbs-6", rule)}>
        <p className={cn("text-sm", muted)}>{course.short}</p>
        <p className="mbs-1.5 flex items-baseline gap-2">
          <span className="tnum text-[2rem] leading-none font-medium tracking-[-0.03em]">
            {inr(course.price)}
          </span>
          {course.mrp > course.price ? (
            <span className={cn("tnum text-sm line-through", muted)}>
              {inr(course.mrp)}
            </span>
          ) : null}
          <span className={cn("text-sm", muted)}>{tf("unit")}</span>
        </p>
        <p className={cn("mbs-2 text-sm leading-relaxed", muted)}>
          {tf("note")}
        </p>
      </div>

      <ButtonAnchor
        href={contactHref({ kind: "track", exam: track.exam })}
        target="_blank"
        variant={featured ? "secondary" : "primary"}
        size="lg"
        className={cn("mbs-5 w-full", featured && "border-transparent")}
      >
        {t("enrol", { exam: names.exam })}
        <IconArrowRight data-nudge stroke={1.75} />
      </ButtonAnchor>

      <Link
        href={`/courses/${course.slug}`}
        className={cn(
          "mbs-3 inline-flex items-center justify-center gap-1 self-center text-sm font-medium underline-offset-4 hover:underline",
          featured ? "text-white" : "text-foreground"
        )}
      >
        {t("seeFull", { course: course.short })}
        <IconArrowRight size={14} stroke={1.75} />
      </Link>

      {free ? (
        <a
          href={contactHref({ kind: "track-free-workshop", exam: track.exam })}
          target="_blank"
          rel="noreferrer noopener"
          className={cn(
            "mbs-1.5 inline-flex items-center justify-center gap-1 self-center text-sm underline underline-offset-4",
            featured
              ? "text-white/70 hover:text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t("tryFree", { course: free.short })}
          <IconArrowUpRight size={14} stroke={1.75} />
        </a>
      ) : null}

      {/* what the fee buys, in ICT's own words from the listing */}
      <ul className={cn("mbs-7 space-y-2.5 border-t pbs-6", rule)}>
        {course.features.slice(0, 5).map((point) => (
          <li key={point} className="flex gap-2.5 text-sm leading-snug">
            <IconCheck
              size={16}
              stroke={2}
              aria-hidden
              className={cn(
                "mbs-0.5 shrink-0",
                featured ? "text-white/70" : "text-muted-foreground"
              )}
            />
            {point}
          </li>
        ))}
      </ul>

      {also.length > 0 ? (
        <dl className={cn("mbs-6 space-y-1.5 border-t pbs-5", rule)}>
          <dt className={cn("text-sm", muted)}>Also in this track</dt>
          {also.map((other) => (
            <dd
              key={other!.id}
              className="flex items-baseline justify-between gap-3 text-sm"
            >
              <Link
                href={`/courses/${other!.slug}`}
                className="underline-offset-4 hover:underline"
              >
                {other!.short}
              </Link>
              <span className={cn("tnum shrink-0", muted)}>
                {other!.free ? t("free") : inr(other!.price)}
              </span>
            </dd>
          ))}
        </dl>
      ) : null}

      {startsOn && !hasStarted(startsOn) ? (
        <UntilDate date={startsOn}>
          <p
            className={cn(
              "mbs-5 rounded-control px-3 py-2 text-sm",
              featured ? "bg-white/10" : "bg-highlight/25"
            )}
          >
            {t("startDate", { date: startsLabel(startsOn, locale) })}
          </p>
        </UntilDate>
      ) : null}

      <div className={cn("mbs-auto border-t pbs-5", rule)}>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {people.map((person) => (
              <span
                key={person.slug}
                className={cn(
                  "relative size-7 overflow-clip rounded-full ring-2",
                  featured ? "bg-white/10 ring-primary" : "bg-surface ring-card"
                )}
              >
                <Image
                  src={person.portrait}
                  alt=""
                  fill
                  sizes="28px"
                  className="object-cover object-top"
                />
              </span>
            ))}
          </div>
          <p className={cn("text-sm", muted)}>
            {people.map((person) => person.called).join(", ")}
          </p>
        </div>

        <VideoDialog
          id={track.sample.id}
          title={t("sampleTitle", { exam: names.exam })}
          subtitle={t("sampleSubtitle")}
          className="group/sample mbs-4 flex w-full items-center gap-3"
        >
          <span
            className={cn(
              "relative aspect-video w-16 shrink-0 overflow-clip rounded-md ring-1",
              featured ? "ring-white/20" : "ring-border"
            )}
          >
            <Image
              src={lectureStill(track.sample.id)}
              alt=""
              fill
              sizes="64px"
              className="object-cover transition-transform duration-500 group-hover/sample:scale-[1.03]"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-5 place-items-center rounded-full bg-white/90 text-ink">
                <IconPlayerPlayFilled className="size-2.5" />
              </span>
            </span>
          </span>
          <span className="text-sm">
            <span className="font-medium underline-offset-4 group-hover/sample:underline">
              {t("watchSample")}
            </span>
            <span className={cn("block", muted)}>
              {t("views", { count: views(track.sample.views) })}
            </span>
          </span>
        </VideoDialog>
      </div>
    </article>
  )
}

export function Courses({ courses }: { courses: readonly Course[] }) {
  const t = useTranslations("Courses")
  return (
    <Section id="courses">
      <Reveal>
        <Lede label={t("label")} claim={t("claim")} rest={t("rest")} />
      </Reveal>

      <Reveal
        delay={0.08}
        className="mbs-12 grid items-stretch gap-4 lg:grid-cols-3"
      >
        {tracks.map((track) => (
          <TrackCard
            key={track.slug}
            track={track}
            courses={courses}
            featured={track.slug === "apsc"}
          />
        ))}
      </Reveal>
    </Section>
  )
}
