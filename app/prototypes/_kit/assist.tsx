import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconPhone,
} from "@tabler/icons-react"
import Link from "next/link"

import { phone, tel } from "../_data"
import { assist, assistWhatsapp } from "./assist-content"
import { ShortsRow } from "./assist-videos"
import { PageHead } from "./head"
import { container, external, type KitProps } from "./shared"

export function KitAssist({ base }: KitProps) {
  return (
    <main>
      <PageHead
        base={base}
        trail={[{ label: "ASSIST" }]}
        title={assist.title}
        lede={assist.lede}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={assistWhatsapp}
            {...external}
            data-k-press
            data-k-btn
            className="inline-flex h-12 items-center gap-2 px-6"
          >
            <IconBrandWhatsapp aria-hidden size={20} stroke={1.75} />
            {assist.notify}
          </a>
          <a
            href={tel}
            data-k-press
            data-k-outline
            className="inline-flex h-12 items-center gap-2 px-6 font-semibold tabular-nums"
          >
            <IconPhone aria-hidden size={18} stroke={1.75} />
            {phone}
          </a>
        </div>
      </PageHead>

      <section className={`${container} grid gap-4 pb-16 md:grid-cols-2`}>
        <div data-k-card className="rounded-[var(--k-radius)] p-7">
          <h2 className="text-lg font-semibold">{assist.knownTitle}</h2>
          <p className="mt-3 leading-relaxed text-[var(--k-muted)]">
            {assist.known}
          </p>
        </div>
        <div data-k-tile className="rounded-[var(--k-radius)] p-7">
          <h2 className="text-lg font-semibold">{assist.pendingTitle}</h2>
          <ul className="mt-3">
            {assist.pending.map((item) => (
              <li
                key={item}
                className="border-t border-[var(--k-line)] py-3 leading-relaxed text-[var(--k-muted)] first:border-t-0 first:pt-0"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="assist-videos" className={`${container} pb-20`}>
        <h2 id="assist-videos" data-k-h2>
          {assist.videosTitle}
        </h2>
        <p className="mt-3 mb-8 max-w-[56ch] text-[var(--k-muted)]">
          {assist.videosNote}
        </p>
        <ShortsRow videos={assist.videos} />
      </section>

      <section className={`${container} pb-24`}>
        <h2 data-k-h2>{assist.meanwhileTitle}.</h2>
        <p className="mt-3 max-w-[56ch] text-[var(--k-muted)]">
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
                data-k-link
                className="flex min-h-14 items-center justify-between gap-4 border-t border-[var(--k-line)] py-3 font-medium last:border-b"
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
