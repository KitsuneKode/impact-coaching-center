import {
  IconArrowRight,
  IconArrowUpRight,
  IconCircleCheckFilled,
  IconPlayerPlayFilled,
  IconShieldCheck,
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
 * Why trust ICT, as one wall of cards with one anatomy: who is speaking in a
 * pill at the top, what they said or filmed, and a tag naming the proof. The
 * officer first on the merit list leads in the page's one amber card, with
 * the result itself beside her words. Every quote, name and video is real
 * and published; nothing here is written for anyone.
 */
export function Results() {
  const t = useTranslations("Pulse")
  const voices = useTranslations("Voices")
  const [lead, second] = selections
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
          {/* The lead: her words, and the line on the result that proves them. */}
          <li className="md:col-span-2">
            <figure
              data-trust-card
              data-featured
              className="grid h-full gap-6 rounded-card p-6 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:items-end md:p-8"
            >
              <div className="grid gap-5">
                <Who
                  face={<Monogram name={lead.name} />}
                  name={lead.name}
                  role={lead.post}
                />
                <blockquote className="font-display text-[clamp(1.25rem,1.05rem+0.7vw,1.7rem)] leading-snug font-semibold tracking-[-0.015em] text-balance">
                  &ldquo;{lead.quote}&rdquo;
                </blockquote>
              </div>
              <a
                href={links.apscResultPdf}
                target="_blank"
                rel="noreferrer noopener"
                data-trust-slip
                className="grid gap-3 rounded-2xl p-4"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {t("trustSlip")}
                </span>
                <span className="flex items-baseline gap-4">
                  <span className="tnum font-display text-4xl font-semibold text-primary">
                    {lead.serial}
                  </span>
                  <span className="grid min-w-0">
                    <span className="font-semibold">{lead.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {lead.post}
                    </span>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <IconCircleCheckFilled
                    aria-hidden
                    size={16}
                    className="text-verified"
                  />
                  {t("trustOpenPdf")}
                  <IconArrowUpRight aria-hidden size={14} stroke={2} />
                </span>
              </a>
            </figure>
          </li>

          <TrustCard
            face={<Monogram name={second.name} />}
            name={second.name}
            role={second.post}
            tag={
              <Tag
                href={links.apscResultPdf}
                icon={<IconCircleCheckFilled aria-hidden size={15} />}
                verified
              >
                {t("trustRank", { serial: second.serial })}
              </Tag>
            }
          >
            <blockquote className="leading-relaxed text-pretty">
              &ldquo;{second.quote}&rdquo;
            </blockquote>
          </TrustCard>

          {story ? (
            <TrustCard
              face={<Face id={story.id} />}
              name={story.name}
              role={story.outcome}
              tag={
                <Tag
                  icon={<IconShieldCheck aria-hidden size={15} stroke={1.75} />}
                >
                  {t("trustStoryTag")}
                </Tag>
              }
            >
              <div className="flex items-end gap-4">
                <Upright
                  id={story.id}
                  title={story.name}
                  subtitle={story.outcome}
                  className="w-28 flex-none"
                />
                <p className="grid gap-1">
                  <span className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em]">
                    {story.outcome}
                  </span>
                  <span className="text-sm text-pretty text-muted-foreground">
                    {t("trustStoryLine")}
                  </span>
                </p>
              </div>
            </TrustCard>
          ) : null}

          {/* Students' own review videos, upright as they were filmed. */}
          <li className="md:col-span-2">
            <section
              data-trust-card
              aria-labelledby="trust-students"
              className="grid h-full gap-5 rounded-card p-5 md:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 id="trust-students" className="font-semibold">
                  {t("trustStudents")}
                </h3>
                <Link
                  href="/success-stories#voices"
                  data-trust-tag=""
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full ps-3 pe-2.5 text-sm font-medium"
                >
                  {voices("hearAll", { count: studentReviews.length })}
                  <IconArrowRight aria-hidden size={14} stroke={2} />
                </Link>
              </div>
              <ul data-trust-strip className="flex gap-3">
                {students.map((student) => (
                  <li key={student.id} className="grid min-w-0 gap-2">
                    <Upright
                      id={student.id}
                      title={student.name}
                      subtitle={`${student.batch}, ${student.exam}`}
                    />
                    <span className="grid min-w-0 text-sm">
                      <span className="truncate font-semibold">
                        {student.name}
                      </span>
                      <span className="truncate text-muted-foreground">
                        {batchLine(student)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </li>
        </ul>
      </div>
    </section>
  )
}

/** "Victor 6 · ADRE"; a card that names no batch reads just "APSC". */
function batchLine(student: { batch: string; exam: string }) {
  const batch = student.batch.replace(/\s*batch$/i, "")
  return batch === student.exam ? student.exam : `${batch} · ${student.exam}`
}

function TrustCard({
  face,
  name,
  role,
  tag,
  className,
  children,
}: {
  face: ReactNode
  name: string
  role: string
  tag: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <li className={className}>
      <figure
        data-trust-card
        className="flex h-full flex-col gap-5 rounded-card p-5 md:p-6"
      >
        <Who face={face} name={name} role={role} />
        {children}
        <div className="mbs-auto">{tag}</div>
      </figure>
    </li>
  )
}

/** Who is speaking: face, name and what they are, in one pill. */
function Who({
  face,
  name,
  role,
}: {
  face: ReactNode
  name: string
  role: string
}) {
  return (
    <figcaption
      data-trust-who
      className="flex w-fit max-w-full items-center gap-2.5 rounded-full py-1 ps-1 pe-4"
    >
      {face}
      <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
        <span className="text-sm font-semibold">{name}</span>
        <span className="text-sm text-muted-foreground">{role}</span>
      </span>
    </figcaption>
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
      className="grid size-8 flex-none place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
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
      className="relative size-8 flex-none overflow-clip rounded-full bg-secondary"
    >
      <Image
        src={thumb(id)}
        alt=""
        fill
        sizes="32px"
        className="scale-[1.6] object-cover object-[50%_35%]"
      />
    </span>
  )
}

/** What the proof is, at the foot of the card. */
function Tag({
  icon,
  href,
  verified = false,
  children,
}: {
  icon: ReactNode
  href?: string
  verified?: boolean
  children: ReactNode
}) {
  const className =
    "inline-flex min-h-8 w-fit items-center gap-1.5 rounded-full ps-2.5 pe-3 text-sm font-medium"
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      data-trust-tag={verified ? "verified" : ""}
      className={className}
    >
      {icon}
      {children}
      <IconArrowUpRight aria-hidden size={13} stroke={2} />
    </a>
  ) : (
    <span data-trust-tag={verified ? "verified" : ""} className={className}>
      {icon}
      {children}
    </span>
  )
}

/** A review as it was filmed: upright, cropped to the frame; plays in place. */
function Upright({
  id,
  title,
  subtitle,
  className,
}: {
  id: string
  title: string
  subtitle: string
  className?: string
}) {
  return (
    <VideoDialog
      id={id}
      title={title}
      subtitle={subtitle}
      vertical
      className={`relative block aspect-[9/16] w-full overflow-clip rounded-xl bg-secondary ${className ?? ""}`}
    >
      {/* The saved thumbnail is the upright video centred on a wide frame. */}
      <Image
        src={thumb(id)}
        alt=""
        fill
        sizes="(min-width: 1024px) 11rem, 40vw"
        className="object-cover"
        data-trust-post
      />
      <span className="absolute inset-0 grid place-items-center">
        <span
          aria-hidden
          className="grid size-10 place-items-center rounded-full bg-white text-foreground shadow-lift"
        >
          <IconPlayerPlayFilled
            aria-hidden
            size={16}
            className="translate-x-px"
          />
        </span>
      </span>
    </VideoDialog>
  )
}
