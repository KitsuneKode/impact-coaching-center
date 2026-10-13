"use client"

import { IconPlayerPlayFilled, IconRotate } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useRef, useState } from "react"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { useContent } from "@/i18n/content"
import type { faculty } from "@/lib/brand"

type Teacher = (typeof faculty)[number]

/**
 * One teacher card. It turns over on click or tap, never on hover. The hidden
 * face is `inert` so focus cannot fall into it, and focus follows the flip.
 */
export function TeacherCard({ teacher }: { teacher: Teacher }) {
  const t = useTranslations("Pulse")
  const content = useContent()
  const [flipped, setFlipped] = useState(false)
  const front = useRef<HTMLButtonElement>(null)
  const back = useRef<HTMLButtonElement>(null)
  const teaches = content.teaches(teacher.slug)

  const flip = (to: boolean) => {
    setFlipped(to)
    requestAnimationFrame(() => (to ? back : front).current?.focus())
  }

  return (
    <li data-flip data-flipped={flipped || undefined}>
      <div data-flip-inner>
        <div
          data-flip-face
          inert={flipped}
          className="overflow-clip rounded-[24px] bg-primary"
        >
          <button
            ref={front}
            type="button"
            data-card-button
            aria-expanded={flipped}
            aria-label={t("turnOver", { name: teacher.name })}
            onClick={() => flip(true)}
            className="block w-full text-start"
          >
            <span data-frame className="relative block aspect-[4/5]">
              <Image
                src={teacher.portrait}
                alt={`${teacher.name}, ${teaches}`}
                fill
                sizes="(min-width: 768px) 230px, 50vw"
                className="object-cover object-top"
              />
            </span>
            <span className="flex items-center justify-between gap-2 bg-card p-4">
              <span className="min-w-0">
                <span className="block font-semibold">{teacher.name}</span>
                <span className="line-clamp-2 text-sm text-muted-foreground">
                  {teaches}
                </span>
              </span>
              <IconRotate
                aria-hidden
                size={18}
                stroke={1.5}
                className="flex-none text-muted-foreground"
              />
            </span>
          </button>
        </div>
        <div
          data-flip-face
          data-flip-back
          inert={!flipped}
          className="flex flex-col rounded-[24px] bg-foreground p-5 text-white"
        >
          <span className="text-sm text-on-primary/80">{teacher.called}</span>
          <span className="mbs-1 font-display text-lg leading-tight font-semibold">
            {teacher.name}
          </span>
          <span className="mbs-3 text-sm text-on-primary">
            {content.phrase(teacher.note)}
          </span>
          <span className="mbs-auto flex flex-col gap-2 pbs-3">
            <VideoDialog
              id={teacher.lecture}
              title={teacher.name}
              subtitle={teaches}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-highlight text-sm font-semibold text-foreground"
            >
              <IconPlayerPlayFilled aria-hidden size={14} />
              {t("watchClass")}
            </VideoDialog>
            <button
              ref={back}
              type="button"
              data-press
              onClick={() => flip(false)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white shadow-[inset_0_0_0_1px_color-mix(in_oklch,white_35%,transparent)]"
            >
              <IconRotate
                aria-hidden
                size={15}
                stroke={1.5}
                className="-scale-x-100"
              />
              {t("turnBack")}
            </button>
          </span>
        </div>
      </div>
    </li>
  )
}
