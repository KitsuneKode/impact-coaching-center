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
  {
    slug: "lamp",
    name: "Lamp",
    idea: "A dark study room lit by one warm lamp. Spotlight bento, focus cards, the class tipping into view.",
    swatch: ["#07090E", "#F5B544", "#ECEFF4"],
  },
  {
    slug: "tiles",
    name: "Tiles",
    idea: "A light product-page bento where the tiles work: pick your hour, flip centre and app, search the questions.",
    swatch: ["#F2F3F5", "#1E63CF", "#0A1020"],
  },
  {
    slug: "path",
    name: "Path",
    idea: "A year at ICT as a scroll story, from the first message to the interview. Sage and forest, stacking course cards.",
    swatch: ["#E9EDE6", "#123D2C", "#CDEB6B"],
  },
  {
    slug: "stage",
    name: "Stage",
    idea: "The teachers are the show. Charcoal and vermilion, a portrait accordion, lectures that open in place.",
    swatch: ["#0D0D0F", "#F0592F", "#F2F0EC"],
  },
  {
    slug: "mist",
    name: "Mist",
    idea: "Light glass over a slow aurora. A magnifying dock, a parallax hero, one hub per exam with its course, books and free notes.",
    swatch: ["#F2F5F4", "#A9CDF2", "#0D1B1E"],
  },
  {
    slug: "pulse",
    name: "Pulse",
    idea: "ICT's own blue in three bold fields. A rolling exam name, batches as tickets, teacher cards that flip.",
    swatch: ["#1F5FD1", "#FFC24A", "#F5F7FB"],
  },
  {
    slug: "season",
    name: "Season",
    idea: "Set to whichever exam is next: an almanac countdown, the year on one chart, and the free mocks, books and batch for that exam.",
    swatch: ["#EDF1F0", "#0A6B63", "#0C1719"],
  },
  {
    slug: "sandhya",
    name: "Sandhya",
    idea: "Lamp, rebuilt for a phone and read in Assamese first: thumb-reach actions, snap shelves, 700/400 Anek.",
    swatch: ["#07090E", "#F5B544", "#ECEFF4"],
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
