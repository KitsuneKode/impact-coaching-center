import type { Metadata } from "next"
import Link from "next/link"

import { PickButton, PicksPanel } from "./_picks-panel"
import { complete, concepts, favourites } from "./_preview"
import { prototypes } from "./_switcher"

export const metadata: Metadata = { title: "Website designs" }

const sections = [
  {
    id: "shortlist",
    title: "Our shortlist",
    note: "The ten we would start from. Each is a complete site: offers, courses, books, free notes and the enquiry form.",
    slugs: favourites,
  },
  {
    id: "complete",
    title: "Also complete",
    note: "The same full pages in other looks.",
    slugs: complete,
  },
  {
    id: "concepts",
    title: "First-round concepts",
    note: "Our first ideas for the home page, brought up to the same pages.",
    slugs: concepts,
  },
]

export default function PrototypesIndex() {
  const items = prototypes.map(({ slug, name }) => ({ slug, name }))
  const numbered = sections.map((section, i) => ({
    ...section,
    first: sections.slice(0, i).reduce((sum, s) => sum + s.slugs.length, 0),
  }))
  return (
    <main className="min-h-[100dvh] bg-[#0F1115] px-5 py-16 text-[#ECEDF1] md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h1 className="max-w-[20ch] text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          {prototypes.length} designs for the ICT website.
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg text-[#A5A9B4]">
          Same courses, batches, books and free notes in every one; only the
          look and feel changes. Open each on your phone and on a computer. On a
          computer, the left and right arrow keys move between designs and Esc
          comes back here. Tap the heart on the ones you like, up to three.
          Forms here are for trying out and do not send anything.
        </p>
        <PicksPanel items={items} />
        {numbered.map((section) => (
          <section
            key={section.id}
            aria-labelledby={section.id}
            className="mt-16"
          >
            <h2 id={section.id} className="text-2xl font-semibold">
              {section.title}
            </h2>
            <p className="mt-2 max-w-[60ch] text-[#A5A9B4]">{section.note}</p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {section.slugs.map((slug, i) => {
                const p = prototypes.find((x) => x.slug === slug)!
                return (
                  <li key={p.slug} className="relative">
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
                        <p className="text-sm text-[#A5A9B4]">
                          Design {section.first + i + 1}
                        </p>
                        <h3 className="text-2xl font-semibold">{p.name}</h3>
                        <p className="text-[#C4C7D0]">{p.idea}</p>
                        <p className="mt-auto pt-4 text-sm font-medium">
                          Open design
                          <span
                            aria-hidden
                            className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-1"
                          >
                            →
                          </span>
                        </p>
                      </div>
                    </Link>
                    <PickButton slug={p.slug} name={p.name} />
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
