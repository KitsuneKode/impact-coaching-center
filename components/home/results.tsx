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
import { links } from "@/lib/brand"
import { results } from "@/lib/results"
import { thumb } from "@/lib/stories"

/**
 * ICT's results, from one list (lib/results.ts): the first officer on the
 * merit list leads in the page's one amber card, her words beside the line
 * on the official result; every other result is a row on the board with
 * its rank and its proof. Student reviews live in the fan above, not here.
 * A topper ICT confirms is one more entry in the list, and a row here.
 */
export function Results() {
  const t = useTranslations("Pulse")
  const [lead, ...rest] = results

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
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink ps-5 pe-4 text-sm font-semibold text-white"
          >
            {t("trustCheck")}
            <IconArrowUpRight aria-hidden size={16} stroke={2} />
          </a>
        </Reveal>

        <div data-trust-wall className="grid gap-4 lg:grid-cols-3">
          {lead ? (
            <figure
              data-trust-card
              data-featured
              className="grid h-full gap-6 rounded-card p-6 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:items-end md:p-8 lg:col-span-2 [&>div]:self-stretch"
            >
              <div className="flex h-full flex-col justify-between gap-5">
                <Who
                  face={<Monogram name={lead.name} />}
                  name={lead.name}
                  role={lead.post}
                />
                {lead.quote ? (
                  <blockquote className="font-display text-[clamp(1.25rem,1.05rem+0.7vw,1.7rem)] leading-snug font-semibold tracking-[-0.015em] text-balance">
                    &ldquo;{lead.quote}&rdquo;
                  </blockquote>
                ) : null}
              </div>
              {lead.proof.kind === "pdf" ? (
                <a
                  href={lead.proof.href}
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
                      {lead.rank}
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
              ) : null}
            </figure>
          ) : null}

          {rest.length ? (
            <section
              data-trust-card
              aria-labelledby="trust-board"
              className="flex h-full flex-col rounded-card p-5 md:p-6"
            >
              <h3 id="trust-board" className="font-semibold">
                {t("trustBoard")}
              </h3>
              <ol className="mbs-2 grid">
                {rest.map((result) => (
                  <li
                    key={result.name}
                    data-board-row
                    className="grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-3 border-be border-border pbs-4 pbe-4 last:border-be-0"
                  >
                    {result.proof.kind === "video" ? (
                      <Face id={result.proof.id} />
                    ) : (
                      <span className="tnum font-display text-3xl leading-none font-semibold text-primary">
                        {result.rank}
                      </span>
                    )}
                    <span className="grid min-w-0 gap-1">
                      <span className="font-semibold">{result.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {result.proof.kind === "pdf"
                          ? `${result.post} · ${result.exam}`
                          : result.post}
                      </span>
                      {result.quote ? (
                        <span className="mbs-1 line-clamp-3 text-sm text-pretty">
                          &ldquo;{result.quote}&rdquo;
                        </span>
                      ) : null}
                      <span className="mbs-2">
                        {result.proof.kind === "pdf" ? (
                          <Tag
                            href={result.proof.href}
                            icon={
                              <IconCircleCheckFilled aria-hidden size={15} />
                            }
                            verified={result.verified}
                          >
                            {t("trustRank", { serial: result.rank ?? "" })}
                          </Tag>
                        ) : (
                          <VideoDialog
                            id={result.proof.id}
                            title={result.name}
                            subtitle={result.post}
                            vertical
                            className="inline-flex min-h-8 w-fit items-center gap-1.5 rounded-full ps-2.5 pe-3 text-sm font-medium"
                            data-trust-tag=""
                          >
                            <IconPlayerPlayFilled aria-hidden size={13} />
                            {t("trustStoryTag")}
                          </VideoDialog>
                        )}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              <Link
                href="/success-stories"
                data-trust-tag=""
                className="mbs-auto inline-flex min-h-9 w-fit items-center gap-1.5 rounded-full ps-3.5 pe-3 text-sm font-medium"
              >
                {t("trustAll")}
                <IconArrowRight aria-hidden size={14} stroke={2} />
              </Link>
            </section>
          ) : null}
        </div>
      </div>
    </section>
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
