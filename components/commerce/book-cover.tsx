import { useTranslations } from "next-intl"
import Image from "next/image"

import type { Picture } from "@/lib/catalog"
import { cn } from "@/lib/utils"

const tones = {
  primary: {
    cover: "bg-primary text-primary-foreground",
    rule: "bg-primary-foreground/40",
    muted: "text-primary-foreground/70",
  },
  highlight: {
    cover: "bg-highlight text-foreground",
    rule: "bg-foreground/30",
    muted: "text-foreground/65",
  },
  muted: {
    cover: "bg-card text-foreground ring-1 ring-border ring-inset",
    rule: "bg-foreground/25",
    muted: "text-muted-foreground",
  },
} as const

/**
 * A book as an object: a cover with a spine and a block of page edges. The
 * uploaded cover photo when there is one, a typeset cover until then.
 */
export function BookCover({
  title,
  subtitle,
  exam,
  tone = "muted",
  size = "md",
  cover,
  className,
}: {
  cover?: Picture | null
  title: string
  subtitle?: string
  exam?: string
  tone?: keyof typeof tones
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const tr = useTranslations("Shop")
  const t = tones[tone]
  const small = size === "sm"
  if (cover)
    return (
      <div className={cn("relative aspect-[3/4] w-full", className)}>
        <PageEdges />
        <div className="relative h-full overflow-clip rounded-[3px_8px_8px_3px] bg-card shadow-[0_1px_1px_rgb(0_0_0/0.08),0_8px_20px_-6px_rgb(0_0_0/0.25)]">
          <Image
            src={cover.url}
            alt={tr("coverAlt", { title })}
            fill
            {...(cover.blurDataUrl
              ? { placeholder: "blur" as const, blurDataURL: cover.blurDataUrl }
              : {})}
            sizes={
              size === "sm"
                ? "64px"
                : size === "lg"
                  ? "(min-width: 1024px) 320px, 60vw"
                  : "(min-width: 1024px) 200px, 45vw"
            }
            className="object-cover"
          />
          <Spine />
        </div>
      </div>
    )
  return (
    <div className={cn("@container relative aspect-[3/4] w-full", className)}>
      <PageEdges />
      <div
        className={cn(
          "relative flex h-full flex-col justify-between overflow-clip rounded-[3px_8px_8px_3px] shadow-[0_1px_1px_rgb(0_0_0/0.08),0_8px_20px_-6px_rgb(0_0_0/0.25)]",
          t.cover,
          "p-[9cqw] ps-[14cqw]"
        )}
      >
        <Spine />

        {small ? null : (
          <span
            className={cn(
              "text-[4.4cqw] leading-tight font-medium tracking-[0.12em] uppercase",
              t.muted
            )}
          >
            {exam ?? "Impact Career Tutorials"}
          </span>
        )}

        <div className="grid gap-[0.6em]">
          <span aria-hidden className={cn("h-px w-[18%]", t.rule)} />
          <p
            className={cn(
              "font-display leading-[1.08] text-balance",
              small ? "text-[11cqw]" : "text-[10.5cqw]"
            )}
          >
            {title}
          </p>
          {subtitle && !small ? (
            <p className={cn("line-clamp-2 text-[5cqw] leading-snug", t.muted)}>
              {subtitle}
            </p>
          ) : null}
        </div>

        {small ? null : (
          <span
            translate="no"
            className={cn("text-[4cqw] tracking-[0.1em] uppercase", t.muted)}
          >
            Impact Career Tutorials
          </span>
        )}
      </div>
    </div>
  )
}

/** Page edges, visible past the cover's right side. */
function PageEdges() {
  return (
    <span
      aria-hidden
      className="absolute inset-y-[2%] inset-e-[-3%] w-[6%] rounded-r-[3px] bg-[repeating-linear-gradient(90deg,var(--color-card)_0_1px,var(--color-border)_1px_2px)] shadow-sm"
    />
  )
}

/** A darker band with a highlight where the cover bends. */
function Spine() {
  return (
    <>
      <span
        aria-hidden
        className="absolute inset-y-0 inset-s-0 w-[7%] bg-gradient-to-r from-black/25 via-black/10 to-transparent"
      />
      <span
        aria-hidden
        className="absolute inset-y-0 inset-s-[7%] w-px bg-white/15"
      />
    </>
  )
}
