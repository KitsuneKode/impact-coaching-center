"use client"

import { IconArrowRight } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useId, useState } from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Link } from "@/i18n/navigation"
import { PARTS, partOf, type Part, type Span } from "@/lib/batch-time"

export type DayBatch = Span & {
  slug: string
  name: string
  exam: string
  /** As ICT writes it: "4 to 5:30 PM". */
  when: string
  days?: string
  note?: string
  price: string
}

/* The timeline runs 6 AM to 10 PM; ticks every three hours. */
const FROM = 6
const TO = 22
const TICKS = [6, 9, 12, 15, 18, 21]
const at = (h: number) => `${((h - FROM) / (TO - FROM)) * 100}%`
const label = (h: number) =>
  `${h % 12 || 12} ${h < 12 || h === 24 ? "AM" : "PM"}`

/**
 * "Which hour can you keep?" Every batch on one day's timeline. Choose a part
 * of the day (or tap a bar) and the batches in it show below, with their
 * time, days and fee. Only parts that have a batch are offered.
 */
export function BatchDay({ batches }: { batches: DayBatch[] }) {
  const t = useTranslations("Timings")
  const id = useId()
  const parts = PARTS.filter((part) =>
    batches.some((batch) => partOf(batch.start) === part)
  )
  const [part, setPart] = useState<Part>(parts[0] ?? "morning")
  const shown = batches
    .filter((batch) => partOf(batch.start) === part)
    .sort((a, b) => a.start - b.start)

  // Overlapping batches get their own lane, so no bar hides another.
  const lanes: number[] = []
  const laneOf = new Map<string, number>()
  for (const batch of [...batches].sort((a, b) => a.start - b.start)) {
    let lane = lanes.findIndex((end) => end <= batch.start)
    if (lane === -1) lane = lanes.push(0) - 1
    lanes[lane] = batch.end
    laneOf.set(batch.slug, lane)
  }

  return (
    <div className="grid gap-8 rounded-[28px] bg-card p-5 shadow-lift sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
      <div className="min-w-0">
        <h2 id={`${id}-h`} className="type-display-sm">
          {t("heading")}
        </h2>
        <p className="mbs-2 max-w-[44ch] text-muted-foreground">{t("lede")}</p>

        <ToggleGroup
          aria-labelledby={`${id}-h`}
          value={[part]}
          onValueChange={(value) => {
            const next = value[0] as Part | undefined
            if (next) setPart(next)
          }}
          spacing={1}
          className="mbs-6 w-full rounded-full bg-secondary p-1"
        >
          {parts.map((p) => (
            <ToggleGroupItem
              key={p}
              value={p}
              className="h-10 flex-1 rounded-full px-3 text-sm font-medium text-muted-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-[0_1px_3px_color-mix(in_oklch,var(--foreground)_14%,transparent)]"
            >
              {t(`parts.${p}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* The day, drawn: one bar per batch. Pointer shortcut only; the
            choices above are the keyboard path. */}
        <div aria-hidden className="mbs-6">
          <div
            className="relative rounded-2xl bg-secondary"
            style={{ blockSize: `${lanes.length * 2 + 0.75}rem` }}
          >
            {batches.map((batch) => {
              const active = partOf(batch.start) === part
              return (
                <button
                  key={batch.slug}
                  type="button"
                  tabIndex={-1}
                  onClick={() => setPart(partOf(batch.start))}
                  data-active={active || undefined}
                  className="absolute h-7 rounded-lg bg-[color-mix(in_oklch,var(--foreground)_14%,transparent)] transition-colors duration-200 data-active:bg-primary"
                  style={{
                    insetInlineStart: at(batch.start),
                    inlineSize: `calc(${at(batch.end)} - ${at(batch.start)})`,
                    insetBlockStart: `${(laneOf.get(batch.slug) ?? 0) * 2 + 0.375}rem`,
                  }}
                  aria-label={`${batch.name}, ${batch.when}`}
                  title={`${batch.name}, ${batch.when}`}
                />
              )
            })}
          </div>
          <div className="tnum relative mbs-2 h-4 text-xs text-muted-foreground">
            {TICKS.map((h) => (
              <span
                key={h}
                className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0 max-sm:nth-[even]:hidden"
                style={{ insetInlineStart: at(h) }}
              >
                {label(h)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ul key={part} data-batch-swap className="grid content-start gap-6">
        {shown.map((batch) => (
          <li key={batch.slug} className="grid gap-1">
            <p className="tnum font-display text-[clamp(2rem,1.5rem+2vw,3rem)] leading-none font-semibold tracking-[-0.04em]">
              {batch.when}
            </p>
            <p className="mbs-3 text-lg font-semibold">{batch.name}</p>
            <p className="text-muted-foreground">
              {batch.exam}
              {batch.days ? ` · ${batch.days}` : ""}
            </p>
            {batch.note ? (
              <p className="mbs-2 w-fit rounded-full bg-[color-mix(in_oklch,var(--primary)_10%,transparent)] px-3 py-1 text-sm font-medium text-primary">
                {batch.note}
              </p>
            ) : null}
            <div className="mbs-3 flex items-center justify-between gap-4 border-t border-border pbs-3">
              <span className="tnum font-semibold">{batch.price}</span>
              <Link
                href={`/courses/${batch.slug}`}
                data-press
                className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary"
              >
                {t("see")}
                <span className="sr-only">: {batch.name}</span>
                <IconArrowRight data-nudge aria-hidden size={17} stroke={2} />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
