import { useTranslations } from "next-intl"
import type { CSSProperties } from "react"

import type { Course } from "@/lib/courses"
import { BatchTicket } from "./batch-ticket"
import { PrimaryCta, WhatsFree } from "./cta"
import { PhotoWall } from "./photo-wall"
import { WordRoll } from "./word-roll"
import { afterWords, splitWords } from "@/components/motion/words"

/** Drift speed per wall column, in seconds. */
const WALL_DURATIONS = [58, 70, 62]

const rise = (delay: number) =>
  ({ "--rise-delay": `${delay}s` }) as CSSProperties

/**
 * "Blue field": ICT's blue on the left, a tilted wall of ICT's own photos
 * drifting on the right and fading into the blue so the text keeps a clean
 * field. Below lg the wall is a band under the copy, and the ticket hides.
 */
export function Hero({
  newest,
  today,
}: {
  newest: Course | undefined
  today: string
}) {
  const t = useTranslations("Pulse")
  const words = t("heroWords").split("|")
  const heading = splitWords(
    <>
      {t("heroLead")}
      <br />
      <WordRoll words={words} />
    </>
  )
  const after = afterWords(heading.count)

  return (
    <section id="top" data-hero="blue" aria-label={t("heroLabel")}>
      <div data-hero-glow aria-hidden />
      <div data-hero-sidewall aria-hidden>
        <PhotoWall
          cols={3}
          durations={WALL_DURATIONS}
          sizes="(min-width: 1024px) 17vw, 34vw"
          priority
        />
      </div>
      <div aria-hidden className="h-(--header-height)" />
      <div className="relative container-page grid gap-10 pbs-10 pbe-16 md:pbs-14 lg:grid-cols-12 lg:items-end lg:gap-14 lg:pbe-24">
        <div className="lg:col-span-6">
          <h1 className="font-display text-[clamp(2.1rem,1.475rem+3.13vw,3.9rem)] leading-[1.04] font-semibold tracking-[-0.04em] text-balance">
            {heading.node}
          </h1>
          <p
            data-rise
            style={rise(after)}
            className="mbs-7 max-w-[46ch] text-lg text-pretty text-on-primary"
          >
            {t("heroCopy")}
          </p>
          <div
            data-rise
            style={rise(after + 0.1)}
            className="mbs-9 flex flex-wrap items-center gap-3"
          >
            <PrimaryCta />
            <WhatsFree tone="blue" />
          </div>
        </div>
        {newest ? (
          <div data-pop className="hidden lg:col-span-6 lg:block">
            <BatchTicket
              course={newest}
              today={today}
              className="max-w-[420px] lg:-ms-4"
            />
          </div>
        ) : null}
      </div>
      <div data-hero-band aria-hidden>
        <PhotoWall cols={3} durations={WALL_DURATIONS} sizes="34vw" />
      </div>
    </section>
  )
}
