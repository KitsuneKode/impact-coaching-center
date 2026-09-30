import { IconArrowRight } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { listedCourseIds, schedules, tracks } from "@/lib/brand"
import { catalogue } from "@/lib/catalogue"

import { faculty, fees, rupees } from "../../_data"
import { Reveal } from "../../_reveal"
import { base, container, PageHead } from "../_shared"

export const metadata: Metadata = { title: "Courses" }

const listed = catalogue.filter((c) => listedCourseIds.has(c.id))

export default function Courses() {
  const groups = tracks.map((t) => ({
    track: t,
    teachers: t.faculty.map((s) => faculty.find((f) => f.slug === s)!),
    items: listed
      .filter(
        (c) =>
          c.id === t.flagshipId ||
          (t.alsoIds as readonly number[]).includes(c.id) ||
          c.id === t.freeId
      )
      .sort((a, b) => Number(a.free) - Number(b.free)),
  }))

  return (
    <main>
      <PageHead
        trail={[{ label: "Courses" }]}
        title="Every course, by exam."
        lede={`${fees.note} ${fees.scholarship}`}
      >
        <nav aria-label="Jump to an exam" className="mt-8 flex flex-wrap gap-2">
          {groups.map(({ track }) => (
            <a
              key={track.slug}
              href={`#${track.slug}`}
              data-lv-press
              data-lv-chip
              className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold"
            >
              {track.exam}
            </a>
          ))}
        </nav>
      </PageHead>

      {groups.map(({ track, teachers, items }) => (
        <section
          key={track.slug}
          id={track.slug}
          aria-labelledby={`${track.slug}-h`}
          className="scroll-mt-24 pb-20"
        >
          <span aria-hidden data-lv-stripe />
          <div className={`${container} grid gap-8 pt-10 lg:grid-cols-12`}>
            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <h2 id={`${track.slug}-h`} data-lv-h2>
                  {track.exam}
                </h2>
                <p className="mt-3 font-medium">{track.full}</p>
                <p className="mt-2 max-w-[34ch] text-[var(--lv-muted)]">
                  {track.covers}. {track.duration}.
                </p>
                <ul className="mt-5 flex items-center" aria-label="Faculty">
                  {teachers.map((f, k) => (
                    <li key={f.slug} className={k ? "-ml-2" : ""}>
                      <span
                        data-lv-photo
                        className="relative block size-12 overflow-hidden rounded-lg ring-2 ring-[var(--lv-paper)]"
                        title={`${f.name}, ${f.teaches}`}
                      >
                        <Image
                          src={f.portrait}
                          alt={`${f.name}, ${f.teaches}`}
                          fill
                          sizes="48px"
                          className="object-cover object-top"
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <ul className="grid gap-4 lg:col-span-8">
              {items.map((c, i) => {
                const s = schedules[c.id]
                return (
                  <li key={c.id}>
                    <Reveal delay={i * 0.05}>
                      <Link
                        href={`${base}/courses/${c.slug}`}
                        data-lv-card
                        className="group grid overflow-hidden rounded-[14px] sm:grid-cols-[auto_1fr_auto]"
                      >
                        <span className="grid place-items-center bg-[var(--lv-orange)] px-6 py-4 text-[var(--lv-navy)] sm:min-w-[96px]">
                          <span
                            data-lv-display
                            className="text-5xl tabular-nums"
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </span>
                        <span className="min-w-0 p-5">
                          <span data-lv-display className="block text-3xl">
                            {c.short}
                          </span>
                          {c.subtitle && (
                            <span className="mt-1 block text-[var(--lv-muted)]">
                              {c.subtitle}
                            </span>
                          )}
                          <span className="mt-3 block text-sm font-semibold tabular-nums">
                            {s?.when
                              ? `${s.when}${s.days ? `, ${s.days}` : ""}`
                              : "Ask for the timing"}
                          </span>
                        </span>
                        <span className="flex items-center justify-between gap-4 border-t border-[var(--lv-line)] p-5 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:border-l">
                          <span className="text-right tabular-nums">
                            <span data-lv-display className="block text-3xl">
                              {c.free ? "Free" : rupees(c.price)}
                            </span>
                            {!c.free && c.mrp > c.price && (
                              <s className="text-sm text-[var(--lv-muted)]">
                                {rupees(c.mrp)}
                              </s>
                            )}
                          </span>
                          <IconArrowRight
                            aria-hidden
                            size={22}
                            stroke={2.25}
                            className="transition-transform duration-200 ease-out group-hover:translate-x-1"
                          />
                        </span>
                      </Link>
                    </Reveal>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ))}
    </main>
  )
}
