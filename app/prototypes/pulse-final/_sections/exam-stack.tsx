import { IconArrowRight } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { tracks } from "@/lib/brand"

import { courses, rupees } from "../../_data"
import { StickyStack } from "../../_fx"
import { Reveal } from "../../_reveal"
import { panelField } from "../_content"
import { container, h2, siteBase } from "../_theme"

/**
 * The three tracks, each on its own grainy colour field, stacking as you
 * scroll — Rollcall's panels in Pulse's palette. Replaces Pulse's batch
 * tickets and carries the batch hour inside each panel.
 */
export function ExamStack() {
  return (
    <section
      id="courses"
      aria-labelledby="courses-h"
      className="py-20 md:py-28"
    >
      <div className={container}>
        <Reveal>
          <h2 id="courses-h" className={`${h2} max-w-[18ch]`}>
            Three exams.{" "}
            <span className="text-[var(--pu-muted)]">One classroom.</span>
          </h2>
        </Reveal>
        <div className="mt-12">
          <StickyStack top={96} step={18} gap="30vh">
            {courses.map((c) => {
              const p = panelField[c.slug] ?? panelField.apsc!
              const bt = tracks.find((b) => b.slug === c.slug)!
              return (
                <Link
                  key={c.slug}
                  href={`${siteBase}${c.href}`}
                  data-pf-panel
                  style={
                    {
                      "--pf-field": p.field,
                      "--pf-ink": p.ink,
                      "--pf-dim": p.dim,
                      "--pf-mrp": p.mrp,
                      "--pf-btn": p.btn,
                      "--pf-btn-ink": p.btnInk,
                      "--tilt": p.tilt,
                    } as CSSProperties
                  }
                  className="grid items-center gap-8 p-7 sm:p-10 md:min-h-[480px] md:grid-cols-12 md:gap-10"
                >
                  <div className="md:col-span-7">
                    <div className="flex flex-wrap gap-2">
                      <span data-pf-tag>{bt.duration}</span>
                      <span data-pf-tag>{c.name}</span>
                    </div>
                    <p className="mt-8 font-[family-name:var(--pu-display)] text-[clamp(1.6rem,3vw,2.75rem)] leading-[1.02] font-semibold tracking-[-0.03em]">
                      {c.exam}. <span data-pf-dim>{bt.covers}.</span>
                    </p>
                    <p className="mt-6 max-w-[42ch] text-lg">
                      {c.full}.{" "}
                      {c.when ? `${c.when}${c.days ? `, ${c.days}` : ""}.` : ""}
                    </p>
                    <p className="mt-8 flex flex-wrap items-center gap-4">
                      <span className="font-[family-name:var(--pu-display)] text-xl font-semibold tabular-nums">
                        {c.price ? rupees(c.price) : "Ask for the fee"}
                        {c.price && c.mrp ? (
                          <s data-pf-mrp className="ml-3 text-base">
                            {rupees(c.mrp)}
                          </s>
                        ) : null}
                      </span>
                      <span
                        data-pf-go
                        className="grid size-11 place-items-center rounded-full"
                      >
                        <IconArrowRight aria-hidden size={18} stroke={2} />
                      </span>
                    </p>
                  </div>
                  {c.cover && (
                    <div className="md:col-span-5">
                      <span data-pf-poster>
                        <Image
                          src={c.cover}
                          alt={`${c.name} poster`}
                          fill
                          sizes="(min-width: 768px) 420px, 90vw"
                          className="object-cover"
                        />
                      </span>
                    </div>
                  )}
                </Link>
              )
            })}
          </StickyStack>
        </div>
      </div>
    </section>
  )
}
