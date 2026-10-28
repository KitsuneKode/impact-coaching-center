import { links, selections } from "@/lib/brand"
import { publishedStories } from "@/lib/stories"

/**
 * ICT's results, one row each: who, which exam and year, the rank or post,
 * and where anyone can check it. The home page and Success Stories read this
 * list, so a topper ICT confirms goes in here once, with its proof link.
 * Nothing goes in without a public source.
 */
export type Result = {
  name: string
  /** The exam and its year as the source names them, e.g. "APSC CCE 2022". */
  exam: string
  /** The post or service they were selected for. */
  post: string
  /** Serial or rank on the published list, when it has one. */
  rank?: number
  /** Their own words, as published. */
  quote?: string
  /** Where it can be checked. */
  proof:
    | { kind: "pdf"; href: string; label: string }
    | { kind: "video"; id: string }
  /** The proof is an official list, not ICT's own channel. */
  verified: boolean
}

export const results: readonly Result[] = [
  ...selections.map((s): Result => ({
    name: s.name,
    exam: "APSC CCE 2022",
    post: s.post,
    rank: s.serial,
    quote: s.quote,
    proof: {
      kind: "pdf",
      href: links.apscResultPdf,
      label: "Final result, 17 January 2024",
    },
    verified: true,
  })),
  ...publishedStories.map((story): Result => ({
    name: story.name,
    exam: story.outcome,
    post: story.outcome,
    proof: { kind: "video", id: story.id },
    verified: false,
  })),
]
