import { ProtoNav } from "./_proto-nav"
import { clientSet } from "./_preview"

const allPrototypes = [
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
  {
    slug: "clearcoat",
    name: "Clearcoat",
    idea: "Deep automotive blues that repaint the page. Panels catch the light under the pointer; pick a batch like you would a trim.",
    swatch: ["#070A14", "#3B72EE", "#B4C6DB"],
  },
  {
    slug: "livery",
    name: "Livery",
    idea: "A powder-blue racing livery with one orange stripe. Batches on a timing tower, the newest on a pit board, teachers as a driver line-up.",
    swatch: ["#86BFEA", "#F2621F", "#0B1F3A"],
  },
  {
    slug: "notebook",
    name: "Notebook",
    idea: "A study notebook: graph paper, blue-black ink, one highlighter. Batches on a day planner, exams as sticky notes, buttons that push down.",
    swatch: ["#EDF1F8", "#FFE14D", "#101B4D"],
  },
  {
    slug: "atlas",
    name: "Atlas",
    idea: "The route to each exam drawn as a transit map. Pick a line and the batches, teachers and stages light up.",
    swatch: ["#EAF0EE", "#C81E64", "#0C2A30"],
  },
  {
    slug: "sovereign",
    name: "Sovereign",
    idea: "Deep navy and gold foil, like a charter. The merit list comes first; gold is held to a tenth of the page so it stays precious.",
    swatch: ["#000820", "#D7B265", "#F8F3E6"],
  },
  {
    slug: "meridian",
    name: "Meridian",
    idea: "Royal blue and gold on a cool white page, with an azure accent for facts. A three-question batch finder finds your batch by exam and hour.",
    swatch: ["#3660AF", "#D7B265", "#F8F7F2"],
  },
  {
    slug: "laureate",
    name: "Laureate",
    idea: "The candidate. ICT's antique gold on Oxford navy, light and dark, with the best of the rest: batch finder, route map, merit list, first-week checklist, video reel.",
    swatch: ["#0D2441", "#D7B265", "#F8F5EC"],
  },
  {
    slug: "vesper",
    name: "Vesper",
    idea: "Ink and champagne, after hours. The headline is unlit until your pointer passes over it; chapters, a roll of honour, teachers as an index, books as a printed catalogue.",
    swatch: ["#000820", "#E1CFA5", "#8FA9CB"],
  },
  {
    slug: "charter",
    name: "Charter",
    idea: "Sapphire and bronze on warm pearl, laid out as a bento. Every fact is its own tile: next batch, exam picker, books, free notes, faculty that open as you point, a question tile that answers.",
    swatch: ["#174A92", "#C99065", "#F8F7F2"],
  },
  {
    slug: "calibre",
    name: "Calibre",
    idea: "Navy and gold, finished like a watch. The day's batches are gold arcs on a sunray dial that keeps Indian time and turns its light toward you.",
    swatch: ["#000820", "#D7B265", "#F8F3E6"],
  },
  {
    slug: "diorama",
    name: "Diorama",
    idea: "Sapphire and bronze in isometric line drawings. The classroom, the library, the mock hall and the app as small models you can lift.",
    swatch: ["#F8F7F2", "#174A92", "#C99065"],
  },
  {
    slug: "alloy",
    name: "Alloy",
    idea: "Brushed steel and champagne, laid out like a product page: a book that turns as you scroll and a chart to compare batches side by side.",
    swatch: ["#E6EBF1", "#AE9D73", "#142537"],
  },
  {
    slug: "udoy",
    name: "Udoy",
    idea: "Dusk on the Brahmaputra behind a batch search. Pick your exam and your hour the way you would book a trip, with the proof right under the photo.",
    swatch: ["#131E45", "#F2A65A", "#F5F2EC"],
  },
  {
    slug: "rollcall",
    name: "Rollcall",
    idea: "ICT's own photographs as the background: real classrooms drift behind the headline, and each exam gets a bold, grainy panel of its own.",
    swatch: ["#EDECE8", "#3E4FD8", "#141416"],
  },
  {
    slug: "akhor",
    name: "Akhor",
    idea: "Light and bilingual, after Sarvam: a muga-silk shader, Assamese and English side by side, and a footer that lights up under the pointer.",
    swatch: ["#FAF8F3", "#B8862E", "#1E2347"],
  },
  {
    slug: "apogee",
    name: "Apogee",
    idea: "A black sky and a planet's edge catching the sun. One very large headline, stars that drift with your pointer, and a ghost wordmark under the horizon.",
    swatch: ["#060606", "#F2A24A", "#F4F1EA"],
  },
] as const

export type PrototypeSlug = (typeof allPrototypes)[number]["slug"]

/** Only what the client preview serves, in the order of `clientSet`. */
export const prototypes = clientSet.map((slug) =>
  allPrototypes.find((p) => p.slug === slug)!
)

/** A bar to step between designs, like one, and use the arrow keys. */
export function PrototypeSwitcher({ current }: { current: PrototypeSlug }) {
  if (!prototypes.some((p) => p.slug === current)) return null
  return (
    <ProtoNav
      current={current}
      items={prototypes.map(({ slug, name }) => ({ slug, name }))}
    />
  )
}
