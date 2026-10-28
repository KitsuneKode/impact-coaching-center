import { IconBrandYoutube, IconRosette } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import type { CSSProperties } from "react"

import { links } from "@/lib/brand"
import type { Course } from "@/lib/courses"
import { BatchTicket } from "./batch-ticket"
import { PrimaryCta, WhatsFree } from "./cta"
import { PhotoWall } from "./photo-wall"
import { WallDrive } from "./wall-drive"
import { WordRoll } from "./word-roll"
import { afterWords, splitWords } from "@/components/motion/words"
import { BlueField } from "@/components/site/blue-field"

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
      <BlueField />
      <WallDrive />
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
      <div
        data-hero-body
        className="relative container-page grid gap-10 pbs-10 pbe-16 md:pbs-14 lg:grid-cols-12 lg:items-center lg:gap-14 lg:pbe-20"
      >
        <div className="lg:col-span-6">
          <h1 className="font-display text-[clamp(2.1rem,1.25rem+3.4vw,4.5rem)] leading-[1.04] font-semibold tracking-[-0.04em] text-balance">
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
            className="mbs-9 grid gap-3 sm:flex sm:flex-wrap sm:items-center"
          >
            <PrimaryCta />
            <WhatsFree tone="blue" className="justify-center" />
          </div>
          {/* Two facts a parent can check, each linked to where it is published. */}
          <ul
            data-rise
            style={rise(after + 0.2)}
            aria-label={t("heroProofLabel")}
            className="mbs-10 flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-on-primary"
          >
            <li>
              <a
                href={links.apscResultPdf}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
              >
                <IconRosette aria-hidden size={18} stroke={1.75} />
                {t("heroProofOfficers")}
              </a>
            </li>
            <li>
              <a
                href={links.youtube}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
              >
                <IconBrandYoutube aria-hidden size={18} stroke={1.75} />
                {t("heroProofYoutube")}
              </a>
            </li>
          </ul>
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
