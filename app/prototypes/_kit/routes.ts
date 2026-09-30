import { tracks } from "@/lib/brand"

import type { Route } from "../_blocks/route-explorer"
import { examGuides, faculty, fee, timetable } from "../_data"

/** Short names for the map; the full names stay on the exams page. */
const stationName: Record<string, string> = {
  "Written paper for Class XII level posts (Paper III)": "Class XII paper",
  "Written paper for graduate level posts (Paper IV)": "Graduate paper",
  "Skill test, for posts that need one": "Skill test",
  "Medical, then the height and chest check": "Medical check",
  "What they have in common": "What they share",
}

/**
 * The route map's data: one line per exam guide, with its real stages, the
 * batches that prepare for it and the teachers who take them. `colours` maps
 * an exam slug to the line colour the theme wants.
 */
export function buildRoutes(
  base: string,
  colours: Record<string, string>
): Route[] {
  return examGuides.map((g) => {
    const track = tracks.find((t) => t.slug === g.track)!
    return {
      slug: g.slug,
      short: g.short,
      name: g.name,
      colour: colours[g.slug] ?? "var(--k-ink)",
      summary: g.summary,
      stations: g.stages.map((s) => ({
        name: stationName[s.name] ?? s.name,
        facts: s.facts,
      })),
      batches: timetable
        .filter((t) => t.exam === track.exam)
        .map((t) => ({
          id: t.id,
          name: t.name,
          when: t.when,
          days: t.days,
          price: fee(t.price),
          href: `${base}${t.href}`,
        })),
      teachers: track.faculty.map((s) => {
        const f = faculty.find((x) => x.slug === s)!
        return { name: f.name, portrait: f.portrait, teaches: f.teaches }
      }),
      guideHref: `${base}/exams`,
    }
  })
}
