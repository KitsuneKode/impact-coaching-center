import Link from "next/link"

export const concepts = [
  {
    n: 1,
    name: "Charter",
    idea: "Heritage academy. Deep navy, antique gold, a classical serif.",
    swatch: ["#0B1633", "#C8A24A", "#EEF1F7"],
  },
  {
    n: 2,
    name: "Midnight",
    idea: "Dark, precise, product-grade. Bento grid with a royal-blue glow.",
    swatch: ["#070C1C", "#3563FF", "#F0C45C"],
  },
  {
    n: 3,
    name: "Ledger",
    idea: "Light editorial. A newspaper of results, navy ink, gold rules.",
    swatch: ["#F6F8FC", "#13224A", "#A67C1B"],
  },
  {
    n: 4,
    name: "Poster",
    idea: "Loud and confident. Royal blue field, gold type, exam names big.",
    swatch: ["#1638B8", "#0E2477", "#FFC940"],
  },
  {
    n: 5,
    name: "Gilded",
    idea: "Quiet luxury. Near-black navy, gold hairlines, lots of air.",
    swatch: ["#080B14", "#BF9B53", "#E8E6E1"],
  },
  {
    n: 6,
    name: "Campus",
    idea: "Bright and practical. White, navy and gold, photos first.",
    swatch: ["#FAFBFF", "#0F2A5C", "#E0A91B"],
  },
] as const

/** A small bar to step between concepts while comparing them. */
export function ConceptSwitcher({ current }: { current: number }) {
  const prev = current === 1 ? 6 : current - 1
  const next = current === 6 ? 1 : current + 1
  const concept = concepts[current - 1]!
  return (
    <nav
      aria-label="Design concepts"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-[#0B0F1A]/85 p-1 text-sm text-white shadow-2xl backdrop-blur-md"
    >
      <Link
        href={`/redesign/${prev}`}
        className="rounded-full px-3 py-2 hover:bg-white/10"
      >
        Previous
      </Link>
      <Link
        href="/redesign"
        className="rounded-full px-3 py-2 font-medium hover:bg-white/10"
      >
        {current}. {concept.name}
      </Link>
      <Link
        href={`/redesign/${next}`}
        className="rounded-full px-3 py-2 hover:bg-white/10"
      >
        Next
      </Link>
    </nav>
  )
}
