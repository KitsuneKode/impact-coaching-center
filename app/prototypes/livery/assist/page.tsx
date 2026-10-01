import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconPhone,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"

import { phone, tel } from "../../_data"
import { assist, assistWhatsapp } from "../../_kit/assist-content"
import { ShortsRow } from "../../_kit/assist-videos"
import { base, container, external, PageHead } from "../_shared"

export const metadata: Metadata = { title: "ASSIST scholarship test" }

export default function Assist() {
  return (
    <main>
      <PageHead
        trail={[{ label: "ASSIST" }]}
        title={assist.title}
        lede={assist.lede}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={assistWhatsapp}
            {...external}
            data-lv-press
            data-lv-btn
            className="inline-flex h-12 items-center gap-2 rounded-lg px-6 font-bold"
          >
            <IconBrandWhatsapp aria-hidden size={20} stroke={2} />
            {assist.notify}
          </a>
          <a
            href={tel}
            data-lv-press
            data-lv-btn-line
            className="inline-flex h-12 items-center gap-2 rounded-lg px-6 font-bold tabular-nums"
          >
            <IconPhone aria-hidden size={18} stroke={2} />
            {phone}
          </a>
        </div>
      </PageHead>

      <section className={`${container} grid gap-4 pb-16 md:grid-cols-2`}>
        <div data-lv-card className="rounded-[14px] p-7">
          <h2 data-lv-display className="text-3xl">
            {assist.knownTitle}
          </h2>
          <p className="mt-3 leading-relaxed font-medium text-[var(--lv-muted)]">
            {assist.known}
          </p>
        </div>
        <div data-lv-board data-dark className="rounded-[14px] p-7">
          <h2 data-lv-display className="text-3xl">
            {assist.pendingTitle}
          </h2>
          <ul className="mt-3">
            {assist.pending.map((item) => (
              <li
                key={item}
                className="border-t border-white/15 py-3 leading-relaxed text-[var(--lv-on-navy)] first:border-t-0 first:pt-0"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="assist-videos" className={`${container} pb-20`}>
        <h2 id="assist-videos" data-lv-h2>
          {assist.videosTitle}
        </h2>
        <p className="mt-3 mb-8 max-w-[56ch] font-medium text-[var(--lv-muted)]">
          {assist.videosNote}
        </p>
        <ShortsRow videos={assist.videos} />
      </section>

      <section className={`${container} pb-24`}>
        <h2 data-lv-h2>{assist.meanwhileTitle}.</h2>
        <p className="mt-3 max-w-[56ch] font-medium text-[var(--lv-muted)]">
          {assist.meanwhile}
        </p>
        <ul className="mt-6 max-w-xl">
          {[
            { href: `${base}/courses`, label: assist.courses },
            { href: `${base}/exams`, label: assist.exams },
          ].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="flex min-h-14 items-center justify-between gap-4 border-t border-[var(--lv-line,rgba(11,31,58,0.15))] py-3 font-bold last:border-b"
              >
                {l.label}
                <IconArrowRight aria-hidden size={18} stroke={2} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
