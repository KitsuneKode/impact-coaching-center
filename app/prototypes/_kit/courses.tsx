import { IconArrowRight } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

import { listedCourseIds, schedules, tracks } from "@/lib/brand"
import { catalogue } from "@/lib/catalogue"

import { faculty, fees, rupees } from "../_data"
import { Reveal } from "../_reveal"
import { container, type KitProps } from "./shared"
import { PageHead } from "./head"

const listed = catalogue.filter((c) => listedCourseIds.has(c.id))

export function KitCourses({ base }: KitProps) {
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
        base={base}
        trail={[{ label: "Courses" }]}
        title="Every course, by exam."
        lede={`${fees.note} ${fees.scholarship}`}
      >
        <nav aria-label="Jump to an exam" className="mt-8 flex flex-wrap gap-2">
          {groups.map(({ track }) => (
            <a
              key={track.slug}
              href={`#${track.slug}`}
              data-k-press
              data-k-outline
              className="inline-flex h-11 items-center rounded-[var(--k-pill)] px-5 text-sm font-semibold"
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
                <h2 id={`${track.slug}-h`} data-k-h2>
                  {track.exam}
                </h2>
                <p className="mt-3 text-[var(--k-muted)]">{track.full}</p>
                <p className="mt-2 max-w-[34ch] text-[var(--k-muted)]">
                  {track.covers}. {track.duration}.
                </p>
                <ul className="mt-5 flex items-center" aria-label="Faculty">
                  {teachers.map((f, k) => (
                    <li key={f.slug} className={k ? "-ml-2.5" : ""}>
                      <span
                        data-k-avatar
                        className="relative block size-11 overflow-hidden rounded-[var(--k-pill)]"
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
                        data-k-card
                        className="group flex flex-col gap-5 overflow-hidden rounded-[var(--k-radius)] p-3 sm:flex-row sm:items-center"
                      >
                        {c.cover && (
                          <span
                            data-k-photo
                            className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[var(--k-inner)] sm:w-52"
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
                            data-k-display
                            className="block text-xl font-light"
                          >
                            {c.short}
                          </span>
                          {c.subtitle && (
                            <span className="mt-1 block text-[var(--k-muted)]">
                              {c.subtitle}
                            </span>
                          )}
                          <span className="mt-3 block text-sm text-[var(--k-muted)] tabular-nums">
                            {s?.when
                              ? `${s.when}${s.days ? `, ${s.days}` : ""}`
                              : "Ask for the timing"}
                          </span>
                        </span>
                        <span className="flex items-center justify-between gap-4 px-2 pb-2 sm:flex-col sm:items-end sm:px-4 sm:pb-0">
                          <span className="text-right tabular-nums">
                            <span
                              data-k-display
                              className="block text-2xl font-light"
                            >
                              {c.free ? "Free" : rupees(c.price)}
                            </span>
                            {!c.free && c.mrp > c.price && (
                              <s className="text-sm text-[var(--k-muted)]">
                                {rupees(c.mrp)}
                              </s>
                            )}
                          </span>
                          <span
                            data-k-btn
                            className="grid size-11 place-items-center rounded-[var(--k-pill)] transition-transform duration-300 ease-out group-hover:translate-x-1"
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
