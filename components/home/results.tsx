import {
  IconArrowRight,
  IconArrowUpRight,
  IconCircleCheckFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import type { ReactNode } from "react"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { Link } from "@/i18n/navigation"
import { links, selections } from "@/lib/brand"
import { publishedStories, studentReviews, thumb } from "@/lib/stories"

/**
 * Why trust ICT, as a wall of cards with one anatomy: who, what they are,
 * then the proof. The two officers come first and link to the official merit
 * list; then a story ICT published and students' own review videos (the five
 * the fan above does not show). Nothing here is written for them.
 */
export function Results() {
  const t = useTranslations("Pulse")
  const story = publishedStories[0]
  const students = studentReviews.slice(5, 10)

  return (
    <section aria-labelledby="results-heading" className="pbe-20 md:pbe-28">
      <div className="container-page grid gap-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="grid max-w-[40rem] gap-4">
            <h2 id="results-heading" className="type-display">
              {t("trustHeading")}
            </h2>
            <p className="text-pretty text-muted-foreground">
              {t("trustLede")}
            </p>
          </div>
          <a
            href={links.apscResultPdf}
            target="_blank"
            rel="noreferrer noopener"
            data-press
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground ps-5 pe-4 text-sm font-semibold text-background"
          >
            {t("trustCheck")}
            <IconArrowUpRight aria-hidden size={16} stroke={2} />
          </a>
        </Reveal>

        <ul
          data-trust-wall
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <TrustCard
            who={selections[0].name}
            what={t("trustOfficer", {
              post: selections[0].post,
              serial: selections[0].serial,
            })}
            face={<Monogram name={selections[0].name} />}
          >
            <Quote text={selections[0].quote} />
            <Verified label={t("trustVerified")} />
          </TrustCard>

          {story ? (
            <TrustCard
              who={story.name}
              what={t("trustStory", { outcome: story.outcome })}
              face={<Face id={story.id} />}
            >
              <Post id={story.id} title={story.name} subtitle={story.outcome} />
            </TrustCard>
          ) : null}

          <TrustCard
            who={selections[1].name}
            what={t("trustOfficer", {
              post: selections[1].post,
              serial: selections[1].serial,
            })}
            face={<Monogram name={selections[1].name} />}
          >
            <Quote text={selections[1].quote} />
            <Verified label={t("trustVerified")} />
          </TrustCard>

          {students.map((student, i) => (
            <TrustCard
              key={student.id}
              who={student.name}
              what={
                // Some cards name no batch, only "APSC batch".
                /batch$/i.test(student.batch)
                  ? `${student.batch} · ${student.exam}`
                  : t("trustStudent", {
                      batch: student.batch,
                      exam: student.exam,
                    })
              }
              face={<Face id={student.id} />}
              // Phones keep two of the five; the rest are one tap away.
              className={i >= 2 ? "max-md:hidden" : undefined}
            >
              <Post
                id={student.id}
                title={student.name}
                subtitle={`${student.batch}, ${student.exam}`}
              />
              <p className="text-sm text-muted-foreground">
                {t("trustReview")}
              </p>
            </TrustCard>
          ))}

          <li>
            <Link
              href="/success-stories"
              data-trust-all
              className="flex h-full min-h-40 flex-col justify-between gap-6 rounded-card p-6"
            >
              <span className="font-display text-xl leading-tight font-semibold tracking-[-0.02em]">
                {t("trustAll")}
              </span>
              <span
                data-row-go
                className="grid size-11 place-items-center self-end rounded-full"
              >
                <IconArrowRight aria-hidden size={18} stroke={2} />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}

function TrustCard({
  who,
  what,
  face,
  className,
  children,
}: {
  who: string
  what: string
  face: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <li className={className}>
      <figure
        data-trust-card
        className="flex h-full flex-col gap-5 rounded-card bg-card p-5 md:p-6"
      >
        <figcaption className="flex items-center gap-3">
          {face}
          <span className="grid min-w-0">
            <span className="truncate font-semibold">{who}</span>
            <span className="text-sm text-pretty text-muted-foreground">
              {what}
            </span>
          </span>
        </figcaption>
        {children}
      </figure>
    </li>
  )
}

/** Initials, for the officers: there is no photo of them we may use. */
function Monogram({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
  return (
    <span
      aria-hidden
      className="grid size-12 flex-none place-items-center rounded-xl bg-primary font-display text-sm font-semibold text-primary-foreground"
    >
      {initials}
    </span>
  )
}

/** The student's face, from the review they filmed. */
function Face({ id }: { id: string }) {
  return (
    <span
      aria-hidden
      data-trust-face
      className="relative size-12 flex-none overflow-clip rounded-xl bg-secondary"
    >
      <Image
        src={thumb(id)}
        alt=""
        fill
        sizes="48px"
        className="object-cover object-[50%_32%]"
      />
    </span>
  )
}

function Quote({ text }: { text: string }) {
  return (
    <blockquote className="leading-relaxed text-pretty">
      &ldquo;{text}&rdquo;
    </blockquote>
  )
}

function Verified({ label }: { label: string }) {
  return (
    <a
      href={links.apscResultPdf}
      target="_blank"
      rel="noreferrer noopener"
      data-trust-verified
      className="mbs-auto inline-flex min-h-9 w-fit items-center gap-1.5 rounded-full ps-2.5 pe-3 text-sm font-medium"
    >
      <IconCircleCheckFilled aria-hidden size={16} />
      {label}
      <IconArrowUpRight aria-hidden size={14} stroke={2} />
    </a>
  )
}

/** The review itself, as ICT posted it; plays in place. */
function Post({
  id,
  title,
  subtitle,
}: {
  id: string
  title: string
  subtitle: string
}) {
  return (
    <VideoDialog
      id={id}
      title={title}
      subtitle={subtitle}
      vertical
      className="relative block aspect-[16/10] w-full overflow-clip rounded-xl bg-secondary"
    >
      <Image
        src={thumb(id)}
        alt=""
        fill
        sizes="(min-width: 1024px) 24rem, (min-width: 768px) 45vw, 90vw"
        className="object-cover object-[50%_30%]"
        data-trust-post
      />
      <span className="absolute inset-0 grid place-items-center">
        <span
          aria-hidden
          className="grid size-12 place-items-center rounded-full bg-white text-foreground shadow-lift"
        >
          <IconPlayerPlayFilled
            aria-hidden
            size={18}
            className="translate-x-px"
          />
        </span>
      </span>
    </VideoDialog>
  )
}
