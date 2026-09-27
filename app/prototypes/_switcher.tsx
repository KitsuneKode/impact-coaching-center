import Link from "next/link"

export const prototypes = [
  {
    slug: "timetable",
    name: "Timetable",
    idea: "The departures board. Pick the hour you can study; every batch has a printed time.",
    swatch: ["#F4F3EE", "#101828", "#E9A23B"],
  },
  {
    slug: "channel",
    name: "Channel",
    idea: "The viewing room. Dark, video-first: watch the class before you pay for it.",
    swatch: ["#0B1020", "#E8B04B", "#F3F4F8"],
  },
  {
    slug: "gamusa",
    name: "Gamusa",
    idea: "Assam first. A red field on cream, the woven border as the one motif.",
    swatch: ["#B3261E", "#F7F3EA", "#141414"],
  },
  {
    slug: "answer-sheet",
    name: "Answer sheet",
    idea: "The mock test. Paper white, hairline grid, one green, questions numbered.",
    swatch: ["#FBFBF9", "#1B1F27", "#2FB04A"],
  },
] as const

export type PrototypeSlug = (typeof prototypes)[number]["slug"]

/** A small bar to step between prototypes while comparing them. */
export function PrototypeSwitcher({ current }: { current: PrototypeSlug }) {
  const index = prototypes.findIndex((p) => p.slug === current)
  const prev = prototypes.at(index - 1)!
  const next = prototypes[(index + 1) % prototypes.length]!
  const proto = prototypes[index]!
  return (
    <nav
      aria-label="Landing prototypes"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-[#0B0F1A]/85 p-1 text-sm text-white shadow-2xl backdrop-blur-md"
    >
      <Link
        href={`/prototypes/${prev.slug}`}
        className="rounded-full px-3 py-2 transition-colors hover:bg-white/10"
      >
        Previous
      </Link>
      <Link
        href="/prototypes"
        className="rounded-full px-3 py-2 font-medium transition-colors hover:bg-white/10"
      >
        {index + 1}. {proto.name}
      </Link>
      <Link
        href={`/prototypes/${next.slug}`}
        className="rounded-full px-3 py-2 transition-colors hover:bg-white/10"
      >
        Next
      </Link>
    </nav>
  )
}
