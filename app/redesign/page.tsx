import type { Metadata } from "next"
import Link from "next/link"

import { concepts } from "./_switcher"

export const metadata: Metadata = { title: "Homepage concepts" }

export default function RedesignIndex() {
  return (
    <main className="min-h-[100dvh] bg-[#0A1020] px-4 py-16 text-[#E9EDF6] md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          Seven directions for the ICT homepage.
        </h1>
        <p className="mt-5 max-w-[56ch] text-lg text-[#9AA6C2]">
          Same facts, faculty and photos in each. Only the look changes: navy or
          royal blue with gold, from quiet luxury to loud poster.
        </p>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {concepts.map((c) => (
            <li key={c.n}>
              <Link
                href={`/redesign/${c.n}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-[border-color,transform] duration-200 ease-out hover:border-white/25 active:scale-[0.99]"
              >
                <div className="grid h-36 grid-cols-[3fr_1.4fr_1fr]">
                  {c.swatch.map((hex) => (
                    <span key={hex} style={{ background: hex }} />
                  ))}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <p className="text-sm text-[#9AA6C2]">Concept {c.n}</p>
                  <h2 className="text-2xl font-semibold">{c.name}</h2>
                  <p className="text-[#B7C1D8]">{c.idea}</p>
                  <p className="mt-auto pt-4 text-sm font-medium text-[#F0C45C]">
                    Open concept
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
