"use client"

import {
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useId, useRef, useState } from "react"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { type StudentReview, thumb } from "@/lib/stories"

type Filter = "all" | StudentReview["exam"]

/**
 * Students in their own words, as a row that snaps each card to the centre.
 * Cards tilt back as they leave the centre (CSS scroll-driven, app/pulse.css
 * "Voices carousel"), so nothing runs in JavaScript while it scrolls. Every
 * card is a button that plays its Short; the arrows move one card; the
 * filter narrows to an exam. Reduced motion gets a flat row.
 */
export function VoicesCarousel({ reviews }: { reviews: StudentReview[] }) {
  const t = useTranslations("Voices")
  const id = useId()
  const track = useRef<HTMLUListElement>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const shown =
    filter === "all" ? reviews : reviews.filter((r) => r.exam === filter)
  const exams = [...new Set(reviews.map((r) => r.exam))]

  const step = (direction: number) => {
    const el = track.current
    const card = el?.querySelector<HTMLElement>("li")
    if (!el || !card) return
    const rtl = getComputedStyle(el).direction === "rtl" ? -1 : 1
    el.scrollBy({ left: rtl * direction * (card.offsetWidth + 16) })
  }

  return (
    <div>
      <div className="container-page flex flex-wrap items-center justify-between gap-4">
        <ToggleGroup
          aria-label={t("filter")}
          value={[filter]}
          onValueChange={(value) => {
            const next = value[0] as Filter | undefined
            if (!next) return
            setFilter(next)
            track.current?.scrollTo({ left: 0 })
          }}
          spacing={1}
          className="rounded-full bg-secondary p-1"
        >
          {(["all", ...exams] as Filter[]).map((value) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="h-9 rounded-full px-4 text-sm font-medium text-muted-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-[0_1px_3px_color-mix(in_oklch,var(--foreground)_14%,transparent)]"
            >
              {value === "all" ? t("all", { count: reviews.length }) : value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex gap-2">
          <button
            type="button"
            data-press
            onClick={() => step(-1)}
            aria-controls={`${id}-track`}
            aria-label={t("previous")}
            className="grid size-11 place-items-center rounded-full bg-card shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <IconChevronLeft aria-hidden size={20} stroke={1.75} />
          </button>
          <button
            type="button"
            data-press
            onClick={() => step(1)}
            aria-controls={`${id}-track`}
            aria-label={t("next")}
            className="grid size-11 place-items-center rounded-full bg-card shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <IconChevronRight aria-hidden size={20} stroke={1.75} />
          </button>
        </div>
      </div>

      <ul
        id={`${id}-track`}
        ref={track}
        data-voices-track
        aria-label={t("listLabel", { count: shown.length })}
        className="mbs-8"
      >
        {shown.map((student) => (
          <li key={student.id} data-voice>
            <VideoDialog
              id={student.id}
              title={`${student.name}, ${student.batch}`}
              subtitle={t("subtitle", { exam: student.exam })}
              vertical
              className="group block w-full text-start"
            >
              <span className="relative block aspect-[3/4] overflow-clip rounded-[22px] bg-secondary">
                <Image
                  src={thumb(student.id)}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 16rem, 62vw"
                  className="object-cover"
                />
                <span
                  data-play
                  className="absolute inset-e-3 inset-bs-3 grid size-10 place-items-center rounded-full bg-highlight text-foreground"
                >
                  <IconPlayerPlayFilled
                    aria-hidden
                    size={15}
                    className="translate-x-px"
                  />
                </span>
              </span>
              {/* Below the card: the thumbnails already print a name banner. */}
              <span className="mbs-3 block font-semibold text-pretty">
                {student.name}
              </span>
              <span className="block text-sm text-muted-foreground">
                {student.batch} · {student.exam}
              </span>
            </VideoDialog>
          </li>
        ))}
      </ul>
    </div>
  )
}
