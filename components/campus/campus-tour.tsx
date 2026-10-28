"use client"

import { IconPhone, IconPlayerPlayFilled } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useState } from "react"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { ButtonAnchor } from "@/components/ui/button"
import { centres, contact, formatPhone } from "@/lib/brand"
import { contactHref } from "@/lib/contact"

export type TourShot = {
  src: string
  alt: string
  caption: string
  video: string
  /** Shorts are 9:16; talks at the board are 16:9. */
  vertical: boolean
}

/**
 * The centre in pictures, one centre at a time. Three columns of photos,
 * each a frame from the ICT video it opens; as the page scrolls the outer
 * columns rise and the middle one sinks, so the wall has depth. Browsers
 * without scroll-driven animation, and reduced motion, get the still grid.
 */
export function CampusTour({ shots }: { shots: TourShot[] }) {
  const t = useTranslations("Campus")
  const c = useTranslations("Centres")
  const [at, setAt] = useState(centres[0]!.id)
  const centre = centres.find((x) => x.id === at) ?? centres[0]!

  // Dealt into three columns, left to right, like cards.
  const columns: TourShot[][] = [[], [], []]
  shots.forEach((shot, i) => columns[i % 3]!.push(shot))

  return (
    <div className="grid gap-8">
      <fieldset data-tour-switch className="flex flex-wrap gap-2">
        <legend className="sr-only">{t("pick")}</legend>
        {centres.map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={x.id === at}
            onClick={() => setAt(x.id)}
            data-press
            data-tour-centre
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full ps-5 pe-5 font-semibold"
          >
            {x.town}
            <span className="text-xs font-medium opacity-70">
              {x.main ? c("main") : x.at ? null : c("soon")}
            </span>
          </button>
        ))}
      </fieldset>

      {centre.at ? (
        <div
          data-tour-grid
          className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4"
        >
          {columns.map((column, k) => (
            <div
              key={k}
              data-tour-col={k}
              className="grid content-start gap-3 max-md:contents md:gap-4"
            >
              {column.map((shot) => (
                <VideoDialog
                  key={shot.src}
                  id={shot.video}
                  title={shot.caption}
                  vertical={shot.vertical}
                  label={t("watch", { caption: shot.caption })}
                  className="group/shot grid w-full gap-2 text-start"
                >
                  <span
                    className={`relative block overflow-clip rounded-card bg-secondary ${shot.vertical ? "aspect-4/5" : "aspect-video"}`}
                  >
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      sizes="(min-width: 768px) 30vw, 46vw"
                      className="object-cover transition-[scale] duration-500 ease-out group-hover/shot:scale-[1.03]"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-s-3 inset-be-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-frame"
                    >
                      <IconPlayerPlayFilled size={14} />
                    </span>
                  </span>
                  <span className="text-sm text-pretty text-muted-foreground">
                    {shot.caption}
                  </span>
                </VideoDialog>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid justify-items-start gap-4 rounded-[28px] bg-card p-8 shadow-[0_0_0_1px_var(--border)] md:p-10">
          <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-balance">
            {t("soonHeading", { town: centre.town })}
          </p>
          <p className="max-w-[52ch] text-pretty text-muted-foreground">
            {t("soonBody", { town: centre.town })}
          </p>
          <ButtonAnchor
            href={contactHref({ kind: "call" })}
            variant="secondary"
            size="md"
          >
            <IconPhone aria-hidden stroke={1.75} />
            <span className="tnum">{formatPhone(contact.phones[0])}</span>
          </ButtonAnchor>
        </div>
      )}
    </div>
  )
}
