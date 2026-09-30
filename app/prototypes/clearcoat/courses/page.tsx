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
              data-cc-press
              data-cc-outline
              className="inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold"
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
          className={`${container} scroll-mt-24 pb-20`}
        >
          <div className="grid gap-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <h2 id={`${track.slug}-h`} data-cc-h2>
                  {track.exam}
                </h2>
                <p className="mt-3 text-[var(--cc-muted)]">{track.full}</p>
                <p className="mt-2 max-w-[34ch] text-[var(--cc-muted)]">
                  {track.covers}. {track.duration}.
                </p>
                <ul className="mt-5 flex items-center" aria-label="Faculty">
                  {teachers.map((f, k) => (
                    <li key={f.slug} className={k ? "-ml-2.5" : ""}>
                      <span
                        data-cc-avatar
                        className="relative block size-11 overflow-hidden rounded-full"
                        title={`${f.name}, ${f.teaches}`}
                      >
                        <Image
                          src={f.portrait}
                          alt={`${f.name}, ${f.teaches}`}
                          fill
                          sizes="44px"
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
                        data-coat
                        data-cc-panel
                        className="group flex flex-col gap-5 overflow-hidden rounded-[28px] p-3 sm:flex-row sm:items-center"
                      >
                        {c.cover && (
                          <span
                            data-cc-photo
                            className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[20px] sm:w-52"
                          >
                            <Image
                              src={c.cover}
                              alt={`${c.short} poster`}
                              fill
                              sizes="(min-width: 640px) 208px, 100vw"
                              className="object-cover"
                            />
                          </span>
                        )}
                        <span className="min-w-0 flex-1 px-2 pb-2 sm:px-0 sm:pb-0">
                          <span
                            data-cc-display
                            className="block text-xl font-light"
                          >
                            {c.short}
                          </span>
                          {c.subtitle && (
                            <span className="mt-1 block text-[var(--cc-muted)]">
                              {c.subtitle}
                            </span>
                          )}
                          <span className="mt-3 block text-sm text-[var(--cc-muted)] tabular-nums">
                            {s?.when
                              ? `${s.when}${s.days ? `, ${s.days}` : ""}`
                              : "Ask for the timing"}
                          </span>
                        </span>
                        <span className="flex items-center justify-between gap-4 px-2 pb-2 sm:flex-col sm:items-end sm:px-4 sm:pb-0">
                          <span className="text-right tabular-nums">
                            <span
                              data-cc-display
                              className="block text-2xl font-light"
                            >
                              {c.free ? "Free" : rupees(c.price)}
                            </span>
                            {!c.free && c.mrp > c.price && (
                              <s className="text-sm text-[var(--cc-muted)]">
                                {rupees(c.mrp)}
                              </s>
                            )}
                          </span>
                          <span
                            data-cc-btn
                            className="grid size-11 place-items-center rounded-full transition-transform duration-300 ease-out group-hover:translate-x-1"
                          >
                            <IconArrowRight aria-hidden size={18} stroke={2} />
                          </span>
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
