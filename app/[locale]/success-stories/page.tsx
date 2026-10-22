import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandWhatsapp,
  IconChevronRight,
  IconCircleCheckFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { CSSProperties } from "react"

import { Ask } from "@/components/home/ask"
import { Tilt } from "@/components/home/tilt"
import { Guests } from "@/components/marketing/guests"
import { StudentVoices } from "@/components/marketing/student-voices"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { Link } from "@/i18n/navigation"
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

const rise = (delay: number) =>
  ({ "--rise-delay": `${delay}s` }) as CSSProperties

// Every figure is counted from the records the page shows, never typed in.
const proof = [
  { value: selections.length, key: "proofOfficers" },
  { value: publishedStories.length, key: "proofAnnounced" },
  { value: studentReviews.length, key: "proofReviews" },
  { value: guestSessions.length, key: "proofGuests" },
] as const

/**
 * Results in tiers of how far a visitor can check them: officers on the
 * official merit list, ICT's own announced stories, students on video, and
 * guests, who are never presented as results.
 */
export default async function SuccessStoriesPage({
  params,
}: PageProps<"/[locale]/success-stories">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Stories")
  const nav = await getTranslations("Nav")
  const pulse = await getTranslations("Pulse")
  const detail = await getTranslations("CourseDetail")
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(t("shareMessage"))}`

  return (
    <main>
      {/* ---- the claim on blue, with the counts it rests on ---- */}
      <section data-hero="blue" aria-labelledby="stories-heading">
        <div data-hero-glow aria-hidden />
        <div aria-hidden className="h-(--header-height)" />
        <div className="relative container-page grid gap-10 pbs-6 pbe-14 lg:grid-cols-12 lg:items-end lg:gap-14 lg:pbs-10 lg:pbe-20">
          <div className="lg:col-span-7">
            <nav aria-label={detail("breadcrumb")}>
              <ol className="flex items-center gap-1 text-sm text-on-primary">
                <li>
                  <Link href="/" data-crumb>
                    {pulse("home")}
                  </Link>
                </li>
                <li className="flex items-center gap-1">
                  <IconChevronRight aria-hidden size={14} stroke={1.75} />
                  <span aria-current="page" className="text-white">
                    {nav("results")}
                  </span>
                </li>
              </ol>
            </nav>
            <h1
              id="stories-heading"
              data-rise
              className="mbs-6 max-w-[14ch] font-display text-[clamp(2.3rem,1.6rem+3.5vw,4.4rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance"
            >
              {t("heading")}
            </h1>
            <p
              data-rise
              style={rise(0.08)}
              className="mbs-5 max-w-[46ch] text-lg text-pretty text-on-primary"
            >
              {t("lede")}
            </p>
            <div
              data-rise
              style={rise(0.16)}
              className="mbs-8 flex flex-wrap gap-3"
            >
              <a
                href="#officers"
                data-press
                data-cta="amber"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
              >
                {t("meet")}
                <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
              </a>
              <a
                href="#voices"
                data-press
                data-cta="ghost-blue"
                className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,white_45%,transparent)]"
              >
                <IconPlayerPlayFilled aria-hidden size={14} />
                {t("watchReviews")}
              </a>
            </div>
          </div>
          <figure data-rise style={rise(0.1)} className="lg:col-span-5">
            <div className="rounded-[28px] bg-card p-3 shadow-lift">
              <span
                data-poster
                className="relative block aspect-[4/3] overflow-clip rounded-[20px] bg-secondary"
              >
                <Image
                  src="/campus/mock-invigilator.jpg"
                  alt={t("heroAlt")}
                  fill
                  priority
                  sizes="(min-width: 1024px) 34rem, 100vw"
                  className="object-cover"
                />
              </span>
              <figcaption className="ps-2 pe-2 pbs-3 pbe-1 text-sm text-muted-foreground">
                {t("heroCaption")}
              </figcaption>
            </div>
          </figure>
        </div>
        <div className="relative container-page pbe-14 lg:pbe-20">
          <dl
            data-rise
            style={rise(0.24)}
            className="grid grid-cols-2 gap-2 md:grid-cols-4"
          >
            {proof.map((item) => (
              <div
                key={item.key}
                data-fact
                className="flex flex-col rounded-2xl p-4 md:p-5"
              >
                <dt className="order-2 mbs-2 text-sm text-white">
                  {t(item.key)}
                </dt>
                <dd className="tnum order-1 font-display text-4xl leading-none font-semibold">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- tier one: checkable in the official merit list ---- */}
      <section
        id="officers"
        aria-labelledby="officers-heading"
        className="container-page pbs-20 pbe-20 md:pbs-28 md:pbe-28"
      >
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">
              {t("meritLabel")}
            </p>
            <h2
              id="officers-heading"
              className="type-display mbs-2 max-w-[20ch]"
            >
              {t("meritHeading")}
            </h2>
          </div>
          <a
            href={links.apscResultPdf}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline decoration-foreground/30 underline-offset-4"
          >
            {t("checkPdf")}
            <IconArrowUpRight aria-hidden size={16} stroke={1.75} />
          </a>
        </Reveal>
        <ul className="mbs-10 grid gap-4 lg:grid-cols-2">
          {selections.map((person, i) => (
            <li key={person.serial}>
              <Reveal delay={i * 0.06} className="h-full">
                <Tilt max={3} className="h-full">
                  <figure className="flex h-full flex-col gap-8 rounded-[28px] bg-card p-7 shadow-[0_0_0_1px_var(--border)] md:p-10">
                    <div className="flex items-start justify-between gap-4">
                      <span className="tnum font-display text-7xl leading-none font-semibold text-primary">
                        {person.serial}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary ps-3 pe-3 pbs-1.5 pbe-1.5 text-xs font-semibold">
                        <IconCircleCheckFilled
                          aria-hidden
                          size={14}
                          className="text-primary"
                        />
                        {t("serial", { serial: person.serial })}
                      </span>
                    </div>
                    {person.quote ? (
                      <blockquote className="font-display text-[clamp(1.25rem,1rem+1vw,1.75rem)] leading-snug font-medium text-pretty">
                        &ldquo;{person.quote}&rdquo;
                      </blockquote>
                    ) : null}
                    <figcaption className="mbs-auto">
                      <span className="block font-semibold">{person.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {person.post}
                      </span>
                    </figcaption>
                  </figure>
                </Tilt>
              </Reveal>
            </li>
          ))}
        </ul>
        <p className="mbs-6 max-w-[64ch] text-sm text-muted-foreground">
          {t("elsewhere")}
        </p>
      </section>

      {/* ---- tier two: ICT's own announced stories ---- */}
      <section
        aria-labelledby="announced-heading"
        className="container-page pbe-20 md:pbe-28"
      >
        <Reveal>
          <p className="text-sm font-semibold text-primary">
            {t("announcedLabel")}
          </p>
          <h2
            id="announced-heading"
            className="type-display mbs-2 max-w-[22ch]"
          >
            {t("announcedHeading")}
          </h2>
        </Reveal>
        <ul className="mbs-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {publishedStories.map((story, i) => (
            <li key={story.id} data-row-card>
              <Reveal delay={i * 0.05} className="h-full">
                <VideoDialog
                  id={story.id}
                  title={`${story.name}, ${story.outcome}`}
                  subtitle={t("storySubtitle")}
                  vertical
                  className="group flex h-full w-full flex-col rounded-[inherit] p-3 text-start"
                >
                  <span className="relative block aspect-video overflow-clip rounded-[20px] bg-secondary">
                    <Image
                      src={thumb(story.id)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 24rem, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute inset-0 grid place-items-center">
                      <span
                        data-play
                        className="grid size-14 place-items-center rounded-full bg-highlight text-ink"
                      >
                        <IconPlayerPlayFilled
                          aria-hidden
                          size={20}
                          className="translate-x-px"
                        />
                      </span>
                    </span>
                  </span>
                  <span className="p-3 pbs-4">
                    <span className="block font-display text-lg font-semibold">
                      {story.name}
                    </span>
                    <span className="block text-muted-foreground">
                      {story.outcome}
                    </span>
                  </span>
                </VideoDialog>
              </Reveal>
            </li>
          ))}
          <li>
            <Reveal delay={publishedStories.length * 0.05} className="h-full">
              <div className="flex h-full flex-col justify-between gap-6 rounded-[28px] bg-highlight p-7 text-ink">
                <div>
                  <p className="font-display text-xl font-semibold">
                    {t("shareTitle")}
                  </p>
                  <p className="mbs-2">{t("shareBody")}</p>
                </div>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-press
                  className="inline-flex h-12 items-center gap-2 self-start rounded-full bg-ink px-6 font-semibold text-white"
                >
                  <IconBrandWhatsapp aria-hidden size={18} stroke={1.75} />
                  {t("share")}
                </a>
              </div>
            </Reveal>
          </li>
        </ul>
      </section>

      {/* ---- tier three: students on the record ---- */}
      <StudentVoices heading={t("voicesHeading")} lead={t("voicesLead")} />

      {/* ---- tier four: guests, never presented as results ---- */}
      <Guests />

      <Ask />
    </main>
  )
}
