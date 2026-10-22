"use client"

import {
  IconArrowRight,
  IconCheck,
  IconCopy,
  IconPlayerPlayFilled,
  IconX,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useState, type ReactNode } from "react"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { useMinute } from "@/components/site/use-live-promos"

/** A promotion as the site shows it; the live query and the admin preview both produce this. */
export type Promo = {
  kind: "bar" | "banner" | "modal" | "reel"
  tag: string
  headline: string
  body: string
  cta: string
  href: string
  coupon: string
  reelIds: readonly string[]
  image: { url: string; blurDataUrl?: string } | null
  /** When it switches itself off; the last week reads as a deadline. */
  endsAt?: number
}

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS

/**
 * "Ends in 3 days", in the visitor's language, once a promotion is in its
 * last week. Counted here rather than with Intl.RelativeTimeFormat: Chrome
 * ships no Assamese for it and would say "in 3 days" on the Assamese site.
 */
function EndsIn({ endsAt, className }: { endsAt?: number; className: string }) {
  const t = useTranslations("Promos")
  const now = useMinute()
  if (!endsAt || now === null || endsAt <= now || endsAt - now > 7 * DAY_MS)
    return null
  const left = endsAt - now
  const [unit, n] =
    left >= DAY_MS
      ? ["day", Math.round(left / DAY_MS)]
      : left >= HOUR_MS
        ? ["hour", Math.round(left / HOUR_MS)]
        : ["soon", 0]
  return <span className={className}>{t("ends", { unit, n })}</span>
}

const external = (href: string) =>
  href.startsWith("http")
    ? { target: "_blank", rel: "noreferrer noopener" }
    : {}

/** The code, with a button that copies it and says so. */
function Coupon({ code }: { code: string }) {
  const t = useTranslations("Promos")
  const [copied, setCopied] = useState(false)
  return (
    <span className="inline-flex items-center gap-2 justify-self-start rounded-full bg-secondary ps-4 pe-1.5 pbs-1.5 pbe-1.5">
      <span className="text-xs text-muted-foreground">{t("code")}</span>
      <span className="tnum font-mono font-semibold tracking-wider">
        {code}
      </span>
      <button
        type="button"
        data-press
        onClick={() => {
          void navigator.clipboard?.writeText(code).then(
            () => {
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1600)
            },
            () => {}
          )
        }}
        aria-label={t("copy", { code })}
        className="grid size-8 place-items-center rounded-full bg-card"
      >
        <span key={copied ? "done" : "copy"} data-swap>
          {copied ? (
            <IconCheck aria-hidden size={15} stroke={2} />
          ) : (
            <IconCopy aria-hidden size={15} stroke={1.75} />
          )}
        </span>
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? t("copied") : ""}
      </span>
    </span>
  )
}

/** The pop-up's face. `title` and `close` let the dialog wire its heading and buttons. */
export function PromoCard({
  promo,
  title,
  close,
  onAction,
}: {
  promo: Promo
  title?: (text: string) => ReactNode
  close?: (label: string) => ReactNode
  onAction?: () => void
}) {
  const t = useTranslations("Promos")
  return (
    <div className="relative grid overflow-clip rounded-[28px] bg-card text-foreground">
      {promo.image ? (
        <span className="relative block aspect-[16/9] bg-secondary">
          <Image
            src={promo.image.url}
            alt=""
            fill
            sizes="28rem"
            placeholder={promo.image.blurDataUrl ? "blur" : "empty"}
            blurDataURL={promo.image.blurDataUrl}
            className="object-cover"
          />
        </span>
      ) : (
        <span aria-hidden className="block h-2 bg-primary" />
      )}
      <div className="grid gap-4 p-6 sm:p-7">
        {promo.tag ? (
          <span className="justify-self-start rounded-full bg-highlight ps-3 pe-3 pbs-1 pbe-1 text-xs font-semibold text-ink">
            {promo.tag}
          </span>
        ) : null}
        <EndsIn
          endsAt={promo.endsAt}
          className="-mbs-2 text-sm font-semibold text-primary"
        />
        {title ? (
          title(promo.headline)
        ) : (
          <p className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance">
            {promo.headline}
          </p>
        )}
        {promo.body ? (
          <p className="text-pretty text-muted-foreground">{promo.body}</p>
        ) : null}
        {promo.coupon ? <Coupon code={promo.coupon} /> : null}
        <div className="flex flex-wrap items-center gap-3 pbs-1">
          {promo.cta ? (
            <a
              href={promo.href || "#"}
              {...external(promo.href)}
              onClick={onAction}
              data-press
              data-cta="amber"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
            >
              {promo.cta}
              <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
            </a>
          ) : null}
          {close ? close(t("notNow")) : null}
        </div>
      </div>
    </div>
  )
}

/** A band before the footer: the offer on blue, with a close. */
export function PromoBanner({
  promo,
  onClose,
  onAction,
}: {
  promo: Promo
  onClose?: () => void
  onAction?: () => void
}) {
  const t = useTranslations("Promos")
  return (
    <aside
      aria-label={promo.tag || t("label")}
      // Room above and below, and ICT's ink rather than its blue: a page that
      // ends on a blue band would otherwise run straight into the banner.
      className="@container container-page pbs-14 pbe-16 md:pbs-20"
    >
      <div
        data-promo-banner
        className="relative grid gap-6 overflow-clip rounded-[32px] bg-ink p-7 text-white @3xl:grid-cols-12 @3xl:items-center @3xl:p-10"
      >
        {promo.image ? (
          <span className="relative block aspect-[16/9] overflow-clip rounded-[20px] bg-primary-deep @3xl:col-span-4">
            <Image
              src={promo.image.url}
              alt=""
              fill
              sizes="(min-width: 768px) 24rem, 100vw"
              className="object-cover"
            />
          </span>
        ) : null}
        <div className={promo.image ? "@3xl:col-span-8" : "@3xl:col-span-12"}>
          {promo.tag ? (
            <span className="inline-block rounded-full bg-highlight ps-3 pe-3 pbs-1 pbe-1 text-xs font-semibold text-ink">
              {promo.tag}
            </span>
          ) : null}
          <p className="mbs-3 max-w-[24ch] font-display text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-tight font-semibold tracking-[-0.03em] text-balance">
            {promo.headline}
          </p>
          {promo.body ? (
            <p className="mbs-3 max-w-[56ch] text-white/75">{promo.body}</p>
          ) : null}
          <EndsIn
            endsAt={promo.endsAt}
            className="mbs-3 block text-sm font-semibold text-highlight"
          />
          <div className="mbs-6 flex flex-wrap items-center gap-3">
            {promo.cta ? (
              <a
                href={promo.href || "#"}
                {...external(promo.href)}
                onClick={onAction}
                data-press
                data-cta="amber"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
              >
                {promo.cta}
                <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
              </a>
            ) : null}
            {promo.coupon ? (
              <span className="tnum rounded-full bg-white/12 ps-4 pe-4 pbs-2 pbe-2 font-mono font-semibold tracking-wider">
                {promo.coupon}
              </span>
            ) : null}
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            data-press
            onClick={onClose}
            aria-label={t("close")}
            className="absolute inset-e-3 inset-bs-3 grid size-11 place-items-center rounded-full bg-white/12"
          >
            <IconX aria-hidden size={18} stroke={2} />
          </button>
        ) : null}
      </div>
    </aside>
  )
}

/** Short videos in a row: the offer said by the people making it. */
export function PromoReel({
  promo,
  onAction,
}: {
  promo: Promo
  onAction?: () => void
}) {
  const t = useTranslations("Promos")
  return (
    <section
      aria-label={promo.tag || t("label")}
      className="container-page pbe-16"
    >
      <div className="rounded-[32px] bg-card p-6 shadow-[0_0_0_1px_var(--border)] md:p-9">
        {promo.tag ? (
          <span className="text-sm font-semibold text-primary">
            {promo.tag}
          </span>
        ) : null}
        <p className="mbs-2 font-display text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-tight font-semibold tracking-[-0.03em] text-balance">
          {promo.headline}
        </p>
        {promo.body ? (
          <p className="mbs-2 max-w-[56ch] text-muted-foreground">
            {promo.body}
          </p>
        ) : null}
        <EndsIn
          endsAt={promo.endsAt}
          className="mbs-2 block text-sm font-semibold text-primary"
        />
        <ul className="mbs-6 grid grid-cols-[repeat(auto-fill,minmax(min(100%,9rem),12rem))] gap-3">
          {promo.reelIds.map((id, i) => (
            <li key={id}>
              <VideoDialog
                id={id}
                title={`${promo.headline} (${i + 1})`}
                vertical
                // A play is the reel's click: the videos are the offer.
                onClick={onAction}
                className="group block w-full"
              >
                <span className="relative block aspect-[9/16] overflow-clip rounded-[20px] bg-ink">
                  <Image
                    src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                    alt=""
                    fill
                    sizes="12rem"
                    className="object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span
                      data-play
                      className="grid size-12 place-items-center rounded-full bg-highlight text-ink"
                    >
                      <IconPlayerPlayFilled
                        aria-hidden
                        size={18}
                        className="translate-x-px"
                      />
                    </span>
                  </span>
                </span>
              </VideoDialog>
            </li>
          ))}
        </ul>
        {promo.cta ? (
          <a
            href={promo.href || "#"}
            {...external(promo.href)}
            onClick={onAction}
            data-press
            data-cta="amber"
            className="mbs-6 inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
          >
            {promo.cta}
            <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
          </a>
        ) : null}
      </div>
    </section>
  )
}
