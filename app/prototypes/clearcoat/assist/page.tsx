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
            data-cc-press
            data-cc-btn
            className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold"
          >
            <IconBrandWhatsapp aria-hidden size={20} stroke={1.75} />
            {assist.notify}
          </a>
          <a
            href={tel}
            data-cc-press
            data-cc-outline
            className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold tabular-nums"
          >
            <IconPhone aria-hidden size={18} stroke={1.75} />
            {phone}
          </a>
        </div>
      </PageHead>

      <section className={`${container} grid gap-4 pb-16 md:grid-cols-2`}>
        <div data-coat data-cc-panel className="rounded-[28px] p-7">
          <h2 className="text-lg font-semibold">{assist.knownTitle}</h2>
          <p className="mt-3 leading-relaxed text-[var(--cc-muted)]">
            {assist.known}
          </p>
        </div>
        <div data-coat data-cc-panel className="rounded-[28px] p-7">
          <h2 className="text-lg font-semibold">{assist.pendingTitle}</h2>
          <ul className="mt-3">
            {assist.pending.map((item) => (
              <li
                key={item}
                className="border-t border-white/10 py-3 leading-relaxed text-[var(--cc-muted)] first:border-t-0 first:pt-0"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="assist-videos" className={`${container} pb-20`}>
        <h2 id="assist-videos" data-cc-h2>
          {assist.videosTitle}
        </h2>
        <p className="mt-3 mb-8 max-w-[56ch] text-[var(--cc-muted)]">
          {assist.videosNote}
        </p>
        <ShortsRow videos={assist.videos} />
      </section>

      <section className={`${container} pb-24`}>
        <h2 data-cc-h2>{assist.meanwhileTitle}.</h2>
        <p className="mt-3 max-w-[56ch] text-[var(--cc-muted)]">
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
                className="flex min-h-14 items-center justify-between gap-4 border-t border-white/10 py-3 font-medium last:border-b"
              >
                {l.label}
                <IconArrowRight aria-hidden size={18} stroke={1.75} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
