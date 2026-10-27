import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconChevronRight,
  IconCircleCheck,
  IconClockHour4,
  IconPhone,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { CSSProperties } from "react"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { Link } from "@/i18n/navigation"
import { contact, formatPhone } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { alternatesFor, openGraphFor } from "@/lib/site"
import { thumb } from "@/lib/stories"
import { BlueField } from "@/components/site/blue-field"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/assist">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Assist" })
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/assist", locale),
    openGraph: openGraphFor("/assist", t("title"), t("description"), locale),
  }
}

const rise = (delay: number) =>
  ({ "--rise-delay": `${delay}s` }) as CSSProperties

/** ICT's own YouTube Shorts about the test. */
const videos = [
  { id: "pJdfEqqHcQE", key: "assistVideo1" },
  { id: "ICvIqOER2og", key: "assistVideo2" },
] as const

/**
 * The scholarship test, stated only as far as ICT has published it. The rest
 * is listed as coming from ICT (see `toConfirm` in lib/brand.ts).
 */
export default async function AssistPage({
  params,
}: PageProps<"/[locale]/assist">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Assist")
  const pulse = await getTranslations("Pulse")
  const detail = await getTranslations("CourseDetail")
  const pending = t.raw("pendingItems") as string[]

  return (
    <main>
      {/* ---- the test on blue ---- */}
      <section data-hero="blue" aria-labelledby="assist-heading">
        <BlueField />
        <div data-hero-glow aria-hidden />
        <div aria-hidden className="h-(--header-height)" />
        <div className="relative container-page pbs-6 pbe-14 lg:pbs-10 lg:pbe-20">
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
                  ASSIST
                </span>
              </li>
            </ol>
          </nav>
          <h1
            id="assist-heading"
            data-rise
            className="mbs-6 font-display text-[clamp(3.5rem,2rem+8vw,8rem)] leading-[0.95] font-semibold tracking-[-0.05em]"
          >
            {t("claim")}
          </h1>
          <p
            data-rise
            style={rise(0.08)}
            className="mbs-5 max-w-[46ch] text-lg text-pretty text-on-primary"
          >
            {t("rest")}
          </p>
          <div
            data-rise
            style={rise(0.16)}
            className="mbs-8 flex flex-wrap gap-3"
          >
            <a
              href={contactHref({ kind: "assist" })}
              target="_blank"
              rel="noreferrer noopener"
              data-press
              data-cta="amber"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
            >
              <IconBrandWhatsapp aria-hidden size={19} stroke={1.75} />
              {t("notify")}
            </a>
            <a
              href={contactHref({ kind: "call" })}
              data-press
              data-cta="ghost-blue"
              className="tnum inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold"
            >
              <IconPhone aria-hidden size={17} stroke={1.75} />
              {formatPhone(contact.phones[0])}
            </a>
          </div>
        </div>
      </section>

      {/* ---- what is known, and what is still to come ---- */}
      <section className="container-page grid grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] gap-4 pbs-16 pbe-20 md:pbs-24">
        <Reveal className="h-full">
          <div className="h-full rounded-[28px] bg-card p-7 shadow-[0_0_0_1px_var(--border)] md:p-9">
            <IconCircleCheck
              aria-hidden
              size={28}
              stroke={1.5}
              className="text-primary"
            />
            <h2 className="mbs-4 font-display text-2xl font-semibold tracking-[-0.02em]">
              {t("known")}
            </h2>
            <p className="mbs-3 text-lg text-muted-foreground">
              {t("knownBody")}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.06} className="h-full">
          <div className="h-full rounded-[28px] bg-highlight p-7 text-ink md:p-9">
            <IconClockHour4 aria-hidden size={28} stroke={1.5} />
            <h2 className="mbs-4 font-display text-2xl font-semibold tracking-[-0.02em]">
              {t("pending")}
            </h2>
            <ul className="mbs-3 grid">
              {pending.map((item) => (
                <li
                  key={item}
                  className="border-bs border-[color-mix(in_oklch,var(--ink-fixed)_14%,transparent)] pbs-3 pbe-3 first:border-bs-0 first:pbs-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* ---- ICT's own videos ---- */}
      <section
        aria-labelledby="assist-videos"
        className="container-page pbe-20 md:pbe-28"
      >
        <Reveal>
          <h2 id="assist-videos" className="type-display">
            {pulse("assistVideos")}
          </h2>
          <p className="mbs-3 text-lg text-muted-foreground">
            {pulse("assistVideosNote")}
          </p>
        </Reveal>
        <ul className="mbs-10 grid grid-cols-[repeat(auto-fill,minmax(min(100%,9.5rem),15rem))] gap-4">
          {videos.map((video, i) => (
            <li key={video.id}>
              <Reveal delay={i * 0.06}>
                <VideoDialog
                  id={video.id}
                  title={pulse(video.key)}
                  vertical
                  className="group block w-full text-start"
                >
                  <span className="relative block aspect-[9/16] overflow-clip rounded-[22px] bg-ink">
                    <Image
                      src={thumb(video.id)}
                      alt=""
                      fill
                      sizes="16rem"
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
                  <span className="mbs-3 block font-semibold">
                    {pulse(video.key)}
                  </span>
                </VideoDialog>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- meanwhile ---- */}
      <section
        aria-labelledby="meanwhile-heading"
        className="container-page pbe-20 md:pbe-28"
      >
        <Reveal>
          <div className="grid gap-8 rounded-[32px] bg-primary p-7 text-white md:p-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h2
                id="meanwhile-heading"
                className="font-display text-[clamp(1.6rem,1.2rem+1.8vw,2.5rem)] leading-tight font-semibold tracking-[-0.03em]"
              >
                {t("meanwhile")}.
              </h2>
              <p className="mbs-3 max-w-[46ch] text-lg text-on-primary">
                {t("meanwhileBody")}
              </p>
            </div>
            <ul className="grid gap-2 lg:col-span-5">
              {[
                { href: "/courses", label: t("courses") },
                { href: "/exams", label: t("exams") },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-blue-row
                    className="flex items-center justify-between gap-4 rounded-2xl ps-5 pe-5 pbs-4 pbe-4 font-semibold"
                  >
                    {item.label}
                    <IconArrowRight
                      data-nudge
                      aria-hidden
                      size={18}
                      stroke={2}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </main>
  )
}
