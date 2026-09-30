"use client"

import { IconArrowRight, IconMapPinFilled } from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { useState, type CSSProperties } from "react"

export type Route = {
  slug: string
  short: string
  name: string
  colour: string
  summary: string
  stations: { name: string; facts?: string }[]
  batches: {
    id: number
    name: string
    when: string
    days: string | null
    price: string
    href: string
  }[]
  teachers: { name: string; portrait: string; teaches: string }[]
  guideHref: string
}

const colourVar = (c: string) => ({ "--route": c }) as CSSProperties

/**
 * The route to each exam as a transit map. Every line leaves the same hub
 * (the free workshop) and stops at that exam's real stages. Hover or focus a
 * line to light it up; press it to open its stages, batches and teachers. The
 * batches legend below reacts to the same line.
 */
export function RouteExplorer({
  routes,
  hub,
}: {
  routes: Route[]
  hub: string
}) {
  const [sel, setSel] = useState(routes[0]!.slug)
  const [hover, setHover] = useState<string | null>(null)
  const reduce = useReducedMotion()
  const active = hover ?? sel
  const current = routes.find((r) => r.slug === sel)!

  const legend = new Map<
    number,
    { batch: Route["batches"][number]; routes: Route[] }
  >()
  for (const r of routes)
    for (const b of r.batches) {
      const e = legend.get(b.id)
      if (e) e.routes.push(r)
      else legend.set(b.id, { batch: b, routes: [r] })
    }

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div data-rm-map data-k-card className="p-4 sm:p-6 lg:col-span-7">
          <div className="flex items-center gap-3 pb-2">
            <span data-rm-hub aria-hidden>
              <IconMapPinFilled size={18} />
            </span>
            <span data-at-mono>Start here: {hub}</span>
          </div>
          <div className="relative">
            <span data-rm-trunk aria-hidden />
            <ul className="grid">
              {routes.map((r) => (
                <li key={r.slug}>
                  <button
                    type="button"
                    data-rm-route
                    data-on={r.slug === sel ? "" : undefined}
                    data-dim={r.slug !== active ? "" : undefined}
                    aria-pressed={r.slug === sel}
                    aria-label={`${r.short}: ${r.stations.map((s) => s.name).join(", ")}`}
                    style={colourVar(r.colour)}
                    onClick={() => setSel(r.slug)}
                    onPointerEnter={() => setHover(r.slug)}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover(r.slug)}
                    onBlur={() => setHover(null)}
                  >
                    <span aria-hidden />
                    <span className="block py-2 pr-4">
                      <span className="flex items-center gap-2 pb-7">
                        <span data-rm-swatch aria-hidden />
                        <span data-at-mono className="!text-[var(--k-ink)]">
                          {r.short}
                        </span>
                      </span>
                      <span data-rm-line aria-hidden />
                      <span className="relative flex justify-between gap-2">
                        {r.stations.map((s) => (
                          <span
                            key={s.name}
                            data-rm-station
                            className="w-full max-w-[8.5rem] first:justify-items-start"
                          >
                            <span data-rm-dot aria-hidden />
                            <span className="mt-2 text-center text-xs leading-tight font-semibold text-pretty">
                              {s.name}
                            </span>
                          </span>
                        ))}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5">
          <AnimatePresence initial={false} mode="wait">
            <m.div
              key={current.slug}
              data-k-card
              style={colourVar(current.colour)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.24, ease: [0.23, 1, 0.32, 1] },
              }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="overflow-hidden"
            >
              <div className="h-2" style={{ background: "var(--route)" }} />
              <div className="p-6 sm:p-7">
                <p data-at-mono>{current.short}</p>
                <h3
                  data-k-display
                  className="mt-2 text-2xl leading-tight font-extrabold"
                >
                  {current.name}
                </h3>
                <p className="mt-3 text-[var(--k-muted)]">{current.summary}</p>

                <ol className="mt-6 grid gap-3">
                  {current.stations.map((s, i) => (
                    <li key={s.name} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white tabular-nums"
                        style={{ background: "var(--route)" }}
                      >
                        {i + 1}
                      </span>
                      <span>
                        <span className="block font-semibold">{s.name}</span>
                        {s.facts && (
                          <span className="block text-sm text-[var(--k-muted)] tabular-nums">
                            {s.facts}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>

                {current.teachers.length > 0 && (
                  <div className="mt-6 flex items-center gap-3">
                    <ul className="flex" aria-label="Teachers on this route">
                      {current.teachers.map((t, k) => (
                        <li key={t.name} className={k ? "-ml-2.5" : ""}>
                          <span
                            data-k-avatar
                            className="relative block size-10 overflow-hidden rounded-full"
                            title={`${t.name}, ${t.teaches}`}
                          >
                            <Image
                              src={t.portrait}
                              alt={`${t.name}, ${t.teaches}`}
                              fill
                              sizes="40px"
                              className="object-cover object-top"
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                    <span className="text-sm text-[var(--k-muted)]">
                      {current.teachers
                        .map((t) => t.name.split(" ")[0])
                        .join(", ")}
                    </span>
                  </div>
                )}

                <Link
                  href={current.guideHref}
                  data-k-press
                  data-k-btn
                  className="group mt-7 inline-flex h-12 items-center gap-2 px-6"
                >
                  Read the exam
                  <IconArrowRight
                    aria-hidden
                    size={18}
                    stroke={2}
                    className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </m.div>
          </AnimatePresence>
        </div>
      </div>

      <ol
        data-rm-legend
        data-k-card
        className="mt-6 divide-y divide-[var(--k-line)] overflow-hidden"
        aria-label="Batches and fees"
      >
        {[...legend.values()].map(({ batch, routes: rs }) => {
          const on = rs.some((r) => r.slug === sel)
          const dim = !rs.some((r) => r.slug === active)
          return (
            <li
              key={batch.id}
              data-on={on ? "" : undefined}
              data-dim={dim ? "" : undefined}
            >
              <Link
                href={batch.href}
                className="grid items-center gap-x-6 gap-y-1 px-5 py-4 sm:grid-cols-[1.4fr_1fr_1.2fr_7rem]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex -space-x-1">
                    {rs.map((r) => (
                      <span
                        key={r.slug}
                        data-rm-swatch
                        style={colourVar(r.colour)}
                      />
                    ))}
                  </span>
                  <span data-k-display className="text-lg font-extrabold">
                    {batch.name}
                  </span>
                </span>
                <span className="font-semibold tabular-nums">{batch.when}</span>
                <span className="text-sm text-[var(--k-muted)]">
                  {batch.days ?? "Days on the batch page"}
                </span>
                <span
                  data-k-display
                  className="text-lg font-extrabold tabular-nums sm:text-right"
                >
                  {batch.price}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
