import type { Metadata } from "next"
import Link from "next/link"

import { prototypes } from "./_switcher"

export const metadata: Metadata = { title: "Landing prototypes" }

export default function PrototypesIndex() {
  return (
    <main className="min-h-[100dvh] bg-[#0F1115] px-5 py-16 text-[#ECEDF1] md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h1 className="max-w-[20ch] text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          Four landing pages for ICT, from four things an aspirant already
          knows.
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg text-[#A5A9B4]">
          Same facts, faculty, prices and photographs in each. A departures
          board, a viewing room, a gamusa, an answer sheet. None of them is a
          navy-and-gold template.
        </p>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2">
          {prototypes.map((p, i) => (
            <li key={p.slug}>
              <Link
                href={`/prototypes/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-[border-color,transform] duration-200 ease-out hover:border-white/25 active:scale-[0.99]"
              >
                <div className="grid h-36 grid-cols-[3fr_1.4fr_1fr]">
                  {p.swatch.map((hex) => (
                    <span key={hex} style={{ background: hex }} />
                  ))}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <p className="text-sm text-[#A5A9B4]">Prototype {i + 1}</p>
                  <h2 className="text-2xl font-semibold">{p.name}</h2>
                  <p className="text-[#C4C7D0]">{p.idea}</p>
                  <p className="mt-auto pt-4 text-sm font-medium">
                    Open prototype
                    <span
                      aria-hidden
                      className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
