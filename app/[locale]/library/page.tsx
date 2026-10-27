import {
  IconArrowRight,
  IconBooks,
  IconChevronRight,
  IconPhone,
  IconUsersGroup,
  IconWifi,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { CSSProperties } from "react"

import { Reveal } from "@/components/motion/reveal"
import { SeatMap } from "@/components/site/seat-map"
import { DraftNotice } from "@/components/ui/draft-notice"
import { contentFor } from "@/i18n/content-server"
import { Link } from "@/i18n/navigation"
import { contact, formatPhone } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { inr } from "@/lib/courses"
import {
  libraryApproved,
  libraryHours,
  libraryPlans,
  libraryUpdated,
} from "@/lib/library"
import { alternatesFor, openGraphFor } from "@/lib/site"
import { BlueField } from "@/components/site/blue-field"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/library">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Pulse" })
  const title = t("libraryMetaTitle")
  const description = t("libraryLede")
  return {
    title,
    description,
    alternates: alternatesFor("/library", locale),
    openGraph: openGraphFor("/library", title, description, locale),
    ...(libraryApproved ? {} : { robots: { index: false, follow: true } }),
  }
}

const rise = (delay: number) =>
  ({ "--rise-delay": `${delay}s` }) as CSSProperties

const drafted = new Date(`${libraryUpdated}T00:00:00Z`).toLocaleDateString(
  "en-IN",
  { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
)

const facts = [
  { icon: IconUsersGroup, key: "libFact1" },
  { icon: IconWifi, key: "libFact2" },
  { icon: IconBooks, key: "libFact3" },
] as const

/**
 * The library: what it gives, how to get a seat, and ICT's plans once ICT
 * confirms them. No online payment; seats are paid for at the centre.
 */
export default async function LibraryPage({
  params,
}: PageProps<"/[locale]/library">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Pulse")
  const library = await getTranslations("Library")
  const nav = await getTranslations("Nav")
  const detail = await getTranslations("CourseDetail")
  const { place } = await contentFor(locale)

  return (
    <main>
      {/* ---- the room on blue ---- */}
      <section data-hero="blue" aria-labelledby="library-heading">
        <BlueField />
        <div data-hero-glow aria-hidden />
        <div aria-hidden className="h-(--header-height)" />
        <div className="relative container-page grid gap-10 pbs-6 pbe-14 lg:grid-cols-12 lg:items-center lg:gap-14 lg:pbs-10 lg:pbe-20">
          <div className="lg:col-span-6">
            <nav aria-label={detail("breadcrumb")}>
              <ol className="flex items-center gap-1 text-sm text-on-primary">
                <li>
                  <Link href="/" data-crumb>
                    {t("home")}
                  </Link>
                </li>
                <li className="flex items-center gap-1">
                  <IconChevronRight aria-hidden size={14} stroke={1.75} />
                  <span aria-current="page" className="text-white">
                    {nav("library")}
                  </span>
                </li>
              </ol>
            </nav>
            <h1
              id="library-heading"
              data-rise
              className="mbs-6 max-w-[16ch] font-display text-[clamp(2.2rem,1.5rem+3.2vw,4rem)] leading-[1.04] font-semibold tracking-[-0.04em] text-balance"
            >
              {t("libraryTitle")}
            </h1>
            <p
              data-rise
              style={rise(0.08)}
              className="mbs-5 max-w-[46ch] text-lg text-pretty text-on-primary"
            >
              {t("libraryLede")}
            </p>
            <div
              data-rise
              style={rise(0.16)}
              className="mbs-8 flex flex-wrap gap-3"
            >
              <a
                href={contactHref({ kind: "workshop" })}
                target="_blank"
                rel="noreferrer noopener"
                data-press
                data-cta="amber"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
              >
                {t("libAsk")}
                <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
              </a>
              <a
                href={contactHref({ kind: "call" })}
                data-press
                data-cta="ghost-blue"
                className="tnum inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,white_45%,transparent)]"
              >
                <IconPhone aria-hidden size={17} stroke={1.75} />
                {formatPhone(contact.phones[0])}
              </a>
            </div>
          </div>
          <div
            data-rise
            style={rise(0.12)}
            className="@container lg:col-span-6"
          >
            <SeatMap label={t("libSeatsLabel")} />
          </div>
        </div>
      </section>

      {libraryApproved ? null : (
        <div className="container-page pbs-10">
          <DraftNotice drafted={drafted}>{library("draft")}</DraftNotice>
        </div>
      )}

      {/* ---- what it gives ---- */}
      <section
        aria-labelledby="facts-heading"
        className="container-page pbs-16 pbe-20 md:pbs-24 md:pbe-28"
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 id="facts-heading" className="type-display max-w-[14ch]">
                {t("libFactsHeading")}
              </h2>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="mbs-8 rounded-[28px] bg-card p-3 shadow-[0_0_0_1px_var(--border)]">
                <span className="relative block aspect-[4/3] overflow-clip rounded-[20px] bg-secondary">
                  <Image
                    src="/campus/students-writing.jpg"
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 30rem, 100vw"
                    className="object-cover"
                  />
                </span>
              </div>
            </Reveal>
          </div>
          <ul className="grid content-center gap-4 lg:col-span-7">
            {facts.map(({ icon: Icon, key }, i) => (
              <li key={key}>
                <Reveal delay={i * 0.06}>
                  <div className="flex gap-5 rounded-[22px] bg-card p-6 shadow-[0_0_0_1px_var(--border)]">
                    <span
                      data-channel-icon
                      className="grid size-12 flex-none place-items-center rounded-2xl"
                    >
                      <Icon aria-hidden size={22} stroke={1.5} />
                    </span>
                    <span>
                      <span className="block font-semibold">
                        {t(`${key}Title`)}
                      </span>
                      <span className="mbs-1 block text-muted-foreground">
                        {t(`${key}Body`)}
                      </span>
                    </span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- how to get a seat ---- */}
      <section
        aria-labelledby="steps-heading"
        className="container-page pbe-20 md:pbe-28"
      >
        <Reveal>
          <h2 id="steps-heading" className="type-display">
            {t("libStepsHeading")}
          </h2>
        </Reveal>
        <ol className="mbs-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4">
          {(["libStep1", "libStep2", "libStep3"] as const).map((key, i) => (
            <li key={key}>
              <Reveal delay={i * 0.06} className="h-full">
                <div className="h-full rounded-[22px] bg-card p-6 shadow-[0_0_0_1px_var(--border)]">
                  <span
                    data-step-num
                    aria-hidden
                    className="tnum grid size-10 place-items-center rounded-full font-display font-semibold"
                  >
                    {i + 1}
                  </span>
                  <p className="mbs-5 text-lg text-pretty">
                    {t(key, { place })}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* ---- plans and fees, once ICT confirms them ---- */}
      <section
        aria-labelledby="plans-heading"
        className="container-page pbe-20 md:pbe-28"
      >
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="plans-heading" className="type-display">
            {t("libPlansHeading")}
          </h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {t("libHours")}:
            </span>{" "}
            {libraryHours ?? t("libHoursPending")}
          </p>
        </Reveal>
        {libraryPlans.length ? (
          <ul className="mbs-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))] gap-4">
            {libraryPlans.map((plan, i) => (
              <li key={plan.name}>
                <Reveal delay={i * 0.06} className="h-full">
                  <div
                    data-include-card
                    className="flex h-full flex-col rounded-[28px] p-7"
                  >
                    <span className="font-semibold">{plan.name}</span>
                    <span className="tnum mbs-4 font-display text-4xl font-semibold">
                      {inr(plan.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                    <ul className="mbs-6 grid gap-2 text-sm">
                      {plan.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <Reveal delay={0.06}>
            <div className="mbs-10 flex flex-col items-start justify-between gap-6 rounded-[28px] bg-highlight p-7 text-ink md:flex-row md:items-center md:p-9">
              <p className="max-w-[52ch] text-lg text-pretty">
                {t("libPlansPending")}
              </p>
              <a
                href={contactHref({ kind: "workshop" })}
                target="_blank"
                rel="noreferrer noopener"
                data-press
                className="inline-flex h-12 flex-none items-center gap-2 rounded-full bg-ink px-6 font-semibold text-white"
              >
                {t("askFee")}
                <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
              </a>
            </div>
          </Reveal>
        )}
      </section>
    </main>
  )
}
