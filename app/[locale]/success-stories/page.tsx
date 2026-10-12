import { getTranslations, setRequestLocale } from "next-intl/server"
import {
  IconArrowUpRight,
  IconBrandWhatsapp,
  IconCircleCheckFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import type { CSSProperties } from "react"

import { Enquire } from "@/components/marketing/enquire"
import { Guests } from "@/components/marketing/guests"
import { StudentVoices } from "@/components/marketing/student-voices"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { ButtonAnchor } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { contact, links, selections } from "@/lib/brand"
import { alternatesFor, openGraphFor } from "@/lib/site"
import {
  guestSessions,
  publishedStories,
  studentReviews,
  thumb,
} from "@/lib/stories"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/success-stories">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Stories" })
  const title = t("title")
  const description = t("description")
  return {
    title,
    description,
    alternates: alternatesFor("/success-stories", locale),
    openGraph: openGraphFor("/success-stories", title, description, locale),
  }
}

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

// Every figure is counted from the records the page shows, never typed in.
const proof = [
  { value: selections.length, key: "proofOfficers" },
  { value: publishedStories.length, key: "proofAnnounced" },
  { value: studentReviews.length, key: "proofReviews" },
  { value: guestSessions.length, key: "proofGuests" },
] as const

export default async function SuccessStoriesPage({
  params,
}: PageProps<"/[locale]/success-stories">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Stories")
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(t("shareMessage"))}`
  return (
    <main>
      {/* ---- hero ---- */}
      <section className="pt-26 pb-14 md:pt-30 md:pb-20">
        <div className="container-page grid items-end gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div>
            <p
              className="enter text-sm font-medium text-muted-foreground"
              style={delay(0)}
            >
              {t("eyebrow")}
            </p>
            <h1 className="enter type-hero mt-4 max-w-[13ch]" style={delay(40)}>
              {t("heading")}
            </h1>
            <p
              className="enter type-lede mt-5 max-w-[46ch] text-muted-foreground"
              style={delay(80)}
            >
              {t("lede")}
            </p>
            <div className="enter mt-8 flex flex-wrap gap-3" style={delay(120)}>
              <ButtonAnchor href="#officers" size="lg">
                {t("meet")}
              </ButtonAnchor>
              <ButtonAnchor href="#voices" variant="secondary" size="lg">
                <IconPlayerPlayFilled className="size-4" aria-hidden />
                {t("watchReviews")}
              </ButtonAnchor>
            </div>
          </div>

          <figure className="enter" style={delay(160)}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-card shadow-frame">
              <Image
                src="/campus/mock-invigilator.jpg"
                alt={t("heroAlt")}
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 45vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-sm text-muted-foreground">
              {t("heroCaption")}
            </figcaption>
          </figure>
        </div>

        <div className="container-page mt-14">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border md:grid-cols-4">
            {proof.map((item, i) => (
              <div
                key={item.key}
                className="enter bg-background p-5 md:p-6"
                style={delay(200 + i * 50)}
              >
                <dt className="sr-only">{t(item.key)}</dt>
                <dd>
                  <span className="tnum block font-display text-[2.75rem] leading-none tracking-[-0.03em]">
                    {item.value}
                  </span>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    {t(item.key)}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- tier one: checkable in a primary source ---- */}
      <Section
        size="sm"
        id="officers"
        className="scroll-mt-24 border-t border-border"
      >
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("meritLabel")}
            </p>
            <h2 className="type-display-sm mt-2 max-w-[22ch] text-balance">
              {t("meritHeading")}
            </h2>
          </div>
          <a
            href={links.apscResultPdf}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
          >
            {t("checkPdf")}
            <IconArrowUpRight className="size-4" aria-hidden />
          </a>
        </Reveal>

        <Reveal delay={0.08} className="mt-10 grid gap-5 lg:grid-cols-2">
          {selections.map((person) => (
            <article
              key={person.serial}
              className="flex flex-col gap-8 rounded-card border border-border bg-card p-7 shadow-frame md:p-9"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-medium">{person.name}</p>
                  <p className="mt-1 text-muted-foreground">{person.post}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-control border border-verified/25 bg-verified/8 px-2.5 py-1 text-xs font-medium text-verified">
                  <IconCircleCheckFilled size={14} aria-hidden />
                  {t("serial", { serial: person.serial })}
                </span>
              </div>
              {person.quote ? (
                <blockquote className="font-display text-[1.5rem] leading-snug text-pretty md:text-[1.75rem]">
                  &ldquo;{person.quote}&rdquo;
                </blockquote>
              ) : null}
              <p className="mt-auto text-sm text-muted-foreground">
                {t("serialNote", { serial: person.serial })}
              </p>
            </article>
          ))}
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 max-w-[64ch] text-sm text-muted-foreground">
            {t("elsewhere")}
          </p>
        </Reveal>
      </Section>

      {/* ---- tier two: ICT's own published stories ---- */}
      <Section size="sm" className="border-t border-border">
        <Reveal>
          <p className="text-sm font-medium text-muted-foreground">
            {t("announcedLabel")}
          </p>
          <h2 className="type-display-sm mt-2 max-w-[24ch] text-balance">
            {t("announcedHeading")}
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="mt-10 grid gap-5 md:grid-cols-2">
          {publishedStories.map((story) => (
            <VideoDialog
              key={story.id}
              id={story.id}
              title={`${story.name}, ${story.outcome}`}
              subtitle={t("storySubtitle")}
              vertical
              className="group flex w-full flex-col overflow-hidden rounded-card border border-border bg-card text-left shadow-frame transition-[box-shadow,transform] duration-200 ease-out hover:shadow-lift active:scale-[0.99]"
            >
              <span className="relative block aspect-video bg-surface">
                <Image
                  src={thumb(story.id)}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 92vw, 45vw"
                  className="object-cover"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-14 place-items-center rounded-full bg-white/95 text-foreground shadow-frame transition-transform duration-200 ease-out group-hover:scale-105">
                    <IconPlayerPlayFilled className="size-5" />
                  </span>
                </span>
              </span>
              <span className="flex items-baseline justify-between gap-4 p-6">
                <span>
                  <span className="block text-lg font-medium">
                    {story.name}
                  </span>
                  <span className="block text-muted-foreground">
                    {story.outcome}
                  </span>
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("watch")}
                </span>
              </span>
            </VideoDialog>
          ))}

          <div className="flex flex-col justify-between gap-6 rounded-card bg-surface p-7">
            <div>
              <p className="text-lg font-medium">{t("shareTitle")}</p>
              <p className="mt-2 text-muted-foreground">{t("shareBody")}</p>
            </div>
            <ButtonAnchor
              href={whatsapp}
              target="_blank"
              variant="secondary"
              size="md"
              className="self-start"
            >
              <IconBrandWhatsapp className="size-4" aria-hidden />
              {t("share")}
            </ButtonAnchor>
          </div>
        </Reveal>
      </Section>

      {/* ---- tier three: students on the record ---- */}
      <div id="voices" className="scroll-mt-24 border-t border-border">
        <StudentVoices heading={t("voicesHeading")} lead={t("voicesLead")} />
      </div>

      {/* ---- tier four: guests, never presented as results ---- */}
      <div className="border-t border-border">
        <Guests />
      </div>

      <Enquire />
    </main>
  )
}
