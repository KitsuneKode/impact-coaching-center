/**
 * PROTOTYPE: sample books and resources for the /preview surfaces.
 *
 * None of this is ICT's catalogue. Titles, prices and page counts are
 * placeholders chosen to exercise the layouts, and every page that renders
 * them says so. Replace with Convex records (KIT-57, KIT-58) once ICT sends
 * its real titles and PDFs; nothing outside /preview may import this file.
 */
export type PreviewBook = {
  slug: string
  title: string
  subtitle: string
  exam: string
  edition: string
  pages: number
  /** Sample price, integer paise. */
  pricePaise: number
  /** Cover tone, a token name from the design system. */
  tone: "primary" | "highlight" | "muted"
  description: string
  contents: readonly string[]
  samplePages: number
}

export type PreviewResource = {
  slug: string
  title: string
  exam: string
  kind: "Notes" | "Question paper" | "Current affairs" | "Practice set"
  pages: number
  description: string
}

export const previewBooks: readonly PreviewBook[] = [
  {
    slug: "assam-history-culture",
    title: "Assam History and Culture",
    subtitle: "Study notes for APSC Prelims and Mains",
    exam: "APSC",
    edition: "Sample edition",
    pages: 240,
    pricePaise: 34900,
    tone: "primary",
    description:
      "Sample listing. ICT's own notes would describe the book here: what it covers, who it is for, and how it maps to the syllabus.",
    contents: [
      "Ancient Assam",
      "The Ahom kingdom",
      "Colonial period",
      "Freedom movement",
      "Art, festivals and literature",
    ],
    samplePages: 6,
  },
  {
    slug: "apsc-prelims-solved-papers",
    title: "APSC Prelims Solved Papers",
    subtitle: "Previous years with explanations",
    exam: "APSC",
    edition: "Sample edition",
    pages: 180,
    pricePaise: 29900,
    tone: "highlight",
    description:
      "Sample listing. A solved-papers book would list the years covered and how answers are explained.",
    contents: [
      "How to use this book",
      "General Studies I",
      "General Studies II (CSAT)",
      "Answer keys",
    ],
    samplePages: 5,
  },
  {
    slug: "assam-gk-capsule",
    title: "Assam GK Capsule",
    subtitle: "Quick revision for ADRE and Assam Police",
    exam: "ADRE and Assam Police",
    edition: "Sample edition",
    pages: 120,
    pricePaise: 19900,
    tone: "muted",
    description:
      "Sample listing. A short revision book would show its format: one-liners, tables and practice questions.",
    contents: ["Geography", "Polity", "Economy", "Schemes", "Practice MCQs"],
    samplePages: 4,
  },
  {
    slug: "quant-and-reasoning-drills",
    title: "Quant and Reasoning Drills",
    subtitle: "Timed sets for Bank, SSC and Railway",
    exam: "Bank, SSC, Railway",
    edition: "Sample edition",
    pages: 200,
    pricePaise: 24900,
    tone: "primary",
    description:
      "Sample listing. A practice book would say how many sets it has and how they are timed.",
    contents: [
      "Number system",
      "Percentages and ratios",
      "Puzzles",
      "Mock sets",
    ],
    samplePages: 5,
  },
]

export const previewResources: readonly PreviewResource[] = [
  {
    slug: "apsc-prelims-gs-paper",
    title: "APSC Prelims GS paper",
    exam: "APSC",
    kind: "Question paper",
    pages: 24,
    description: "Sample item. A past paper with the official answer key.",
  },
  {
    slug: "monthly-assam-current-affairs",
    title: "Assam current affairs, monthly",
    exam: "APSC",
    kind: "Current affairs",
    pages: 18,
    description: "Sample item. The month's Assam news that exams ask about.",
  },
  {
    slug: "polity-one-page-notes",
    title: "Indian Polity one-page notes",
    exam: "ADRE and Assam Police",
    kind: "Notes",
    pages: 12,
    description:
      "Sample item. Articles, bodies and amendments on one sheet each.",
  },
  {
    slug: "reasoning-warm-up-set",
    title: "Reasoning warm-up set",
    exam: "Bank, SSC, Railway",
    kind: "Practice set",
    pages: 10,
    description: "Sample item. Twenty timed questions with worked answers.",
  },
  {
    slug: "assam-geography-maps",
    title: "Assam geography with maps",
    exam: "ADRE and Assam Police",
    kind: "Notes",
    pages: 16,
    description: "Sample item. Rivers, districts and parks, map by map.",
  },
]

export const previewBookBySlug = (slug: string) =>
  previewBooks.find((book) => book.slug === slug)
