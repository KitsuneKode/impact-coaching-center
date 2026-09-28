import {
  IconArrowRight,
  IconArrowUpRight,
  IconPhone,
} from "@tabler/icons-react"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import type { CSSProperties } from "react"

import {
  BatchCountdown,
  UntilDate,
} from "@/components/marketing/batch-countdown"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { ButtonAnchor } from "@/components/ui/button"
import { contact, faculty, formatPhone, links, nextBatch } from "@/lib/brand"
import { useContent } from "@/i18n/content"
import { hasStarted } from "@/lib/batch-date"
import { contactHref } from "@/lib/contact"

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

const startDate = new Date(`${nextBatch.startsOn}T00:00:00+05:30`)
/** Settled at build: a build made after the start never renders the banner. */
const startedAtBuild = hasStarted(nextBatch.startsOn)

/** Dates in the reader's language, with Latin digits as on ICT's posters. */
function dateIn(locale: string, style: "long" | "short") {
  return startDate.toLocaleDateString(
    locale === "as" ? "as-IN-u-nu-latn" : "en-IN",
    {
      weekday: style,
      day: "numeric",
      month: style,
      timeZone: "Asia/Kolkata",
    }
  )
}

/**
 * Hero, rendered on the server with CSS-only entry so the headline paints on
 * the first frame (it is the LCP element, and most of this audience is on a
 * mid-range Android phone).
 */
export function Hero() {
  const t = useTranslations("Hero")
  const offer = useTranslations("Offer")
  const locale = useLocale()
  const { teaches } = useContent()
  const startLabel = dateIn(locale, "long")
  const startShort = dateIn(locale, "short")
  return (
    <section className="relative pt-26 pb-16 md:pt-30 md:pb-24">
      <div className="container-page">
        {/* the one eyebrow on the page: a real, dated batch, until it starts */}
        {startedAtBuild ? null : (
          <UntilDate date={nextBatch.startsOn}>
            <a
              href={contactHref({ kind: "workshop" })}
              target="_blank"
              rel="noreferrer noopener"
              className="enter group inline-flex max-w-full items-center gap-2.5 rounded-control border border-border bg-card py-1.5 pr-2.5 pl-3 text-sm shadow-frame transition-colors hover:bg-secondary"
              style={delay(0)}
            >
              <span className="min-w-0 truncate">
                <span className="font-medium">{nextBatch.name}</span>
                <span className="text-muted-foreground">
                  <span className="hidden sm:inline">
                    {" "}
                    {t("batchFor", { exam: nextBatch.exam })}
                  </span>{" "}
                  · {t("startDate")}{" "}
                  <span className="sm:hidden">{startShort}</span>
                  <span className="hidden sm:inline">{startLabel}</span>
                </span>
              </span>
              <BatchCountdown />
              <IconArrowRight
                size={15}
                stroke={1.75}
                className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </UntilDate>
        )}

        {/*
          The claim and the explanation were one h1 at section-heading size, so they
          competed and neither won. Split: the claim gets the hero scale and the ink,
          the explanation becomes a lede beneath it.
        */}
        <h1
          className="enter type-hero mt-7 max-w-5xl first:mt-0"
          style={delay(80)}
        >
          {t.rich("title", {
            mark: (chunks) => <span className="mark">{chunks}</span>,
          })}
        </h1>
        <p
          className="enter type-lede mt-5 max-w-3xl text-muted-foreground"
          style={delay(140)}
        >
          {t("lede")}
        </p>

        <div
          className="enter mt-8 flex flex-wrap items-center gap-3"
          style={delay(180)}
        >
          <ButtonAnchor
            href={contactHref({ kind: "workshop" })}
            target="_blank"
            size="lg"
          >
            {offer("cta")}
            <IconArrowRight data-nudge stroke={1.75} />
          </ButtonAnchor>
          <ButtonAnchor
            href={contactHref({ kind: "call" })}
            variant="secondary"
            size="lg"
          >
            <IconPhone stroke={1.6} />
            <span className="tnum">{formatPhone(contact.phones[0])}</span>
          </ButtonAnchor>
        </div>
      </div>

      {/* ---- the people ---- */}
      <div className="container-page mt-14 md:mt-16">
        <div
          className="enter flex items-baseline justify-between gap-4"
          style={delay(300)}
        >
          <p className="type-label">{t("teachers")}</p>
          <a
            href={links.youtube}
            target="_blank"
            rel="noreferrer noopener"
            className="link hidden items-center gap-1 text-sm sm:inline-flex"
          >
            {t("watch")}
            <IconArrowUpRight size={14} stroke={1.75} />
          </a>
        </div>

        <ul className="-mx-5 mt-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
          {faculty.map((person, index) => (
            <li
              key={person.slug}
              className="enter w-[44vw] shrink-0 snap-start sm:w-[30vw] md:w-auto"
              style={delay(360 + index * 70)}
            >
              <VideoDialog
                id={person.lecture}
                title={t("videoTitle", {
                  called: person.called,
                  teaches: teaches(person.slug),
                })}
                subtitle={t("videoSubtitle")}
                className="w-full"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface ring-1 ring-border md:aspect-[6/7]">
                  <Image
                    src={person.portrait}
                    alt={t("portraitAlt", {
                      name: person.name,
                      teaches: teaches(person.slug),
                    })}
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : undefined}
                    sizes="(max-width: 768px) 44vw, 18vw"
                    className="object-cover object-top contrast-[1.04] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <span className="absolute right-2.5 bottom-2.5 inline-flex size-8 translate-y-1 items-center justify-center rounded-md bg-white/90 text-foreground opacity-0 shadow-frame transition-[opacity,translate] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <IconArrowUpRight size={16} stroke={1.75} />
                  </span>
                </div>
                <p className="mt-3 text-[0.9375rem] font-medium tracking-tight">
                  {person.called}
                </p>
                <p className="text-sm text-muted-foreground">
                  {teaches(person.slug)}
                </p>
              </VideoDialog>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
