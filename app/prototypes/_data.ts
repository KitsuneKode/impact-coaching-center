import {
  contact,
  faculty,
  faqs,
  formatPhone,
  included,
  joining,
  lectures,
  lectureStill,
  links,
  nextBatch,
  offer,
  place,
  proof,
  schedules,
  selections,
  tracks,
} from "@/lib/brand"
import { catalogue } from "@/lib/catalogue"
import { groupByFolder } from "@/lib/free-folders"

import { localCovers, spineFrom } from "./_covers"
import {
  onlySamples,
  publishedBooks,
  publishedResources,
} from "@/lib/catalog-server"
import {
  campus,
  guestSessions,
  podcast,
  publishedStories,
  studentReviews,
  thumb,
} from "@/lib/stories"

/**
 * Everything the four landing prototypes show, drawn from the same records the
 * live site uses. A prototype may change the look, never the facts. Nothing in
 * this file is invented; every figure traces to lib/brand.ts, lib/catalogue.ts
 * or lib/stories.ts, which carry the sources.
 */

/** The three tracks with their flagship course's price, cover and timing. */
export const courses = tracks.map((track) => {
  const course = catalogue.find((c) => c.id === track.flagshipId)
  const schedule = schedules[track.flagshipId]
  return {
    slug: track.slug,
    exam: track.exam,
    full: track.full,
    covers: track.covers,
    duration: track.duration,
    name: course?.short ?? track.exam,
    price: course?.price ?? null,
    mrp: course?.mrp ?? null,
    cover: course?.cover ?? null,
    when: schedule?.when ?? null,
    days: schedule?.days ?? null,
    note: schedule?.note ?? null,
    faculty: track.faculty.map((slug) => faculty.find((f) => f.slug === slug)!),
    href: course ? `/courses/${course.slug}` : "/courses",
    freeHref: track.freeId
      ? `/courses/${catalogue.find((c) => c.id === track.freeId)?.slug ?? ""}`
      : null,
  }
})

/**
 * Every batch that has a printed timing, as a timetable. Read off ICT's own
 * posters (see `schedules` in lib/brand.ts).
 */
export const timetable = Object.entries(schedules)
  .map(([id, s]) => {
    const course = catalogue.find((c) => c.id === Number(id))
    const track = tracks.find(
      (t) =>
        t.flagshipId === Number(id) ||
        (t.alsoIds as readonly number[]).includes(Number(id)) ||
        t.freeId === Number(id)
    )
    return course && track
      ? {
          id: Number(id),
          name: course.short,
          exam: track.exam,
          when: s.when,
          days: s.days ?? null,
          note: s.note ?? null,
          price: course.price,
          href: `/courses/${course.slug}`,
        }
      : null
  })
  .filter((row) => row !== null)
  .map((row) => ({ ...row, ...clock(row.when) }))
  .sort((a, b) => a.start - b.start)

/** "4 to 5:30 PM" -> { start: 16, end: 17.5 }, for ordering and day bars. */
function clock(when: string) {
  const m = /^(\d+)(?::(\d+))? to (\d+)(?::(\d+))? (AM|PM)$/.exec(when)
  if (!m) return { start: 0, end: 0 }
  const pm = m[5] === "PM"
  const hour = (h: string, min?: string) => {
    const n = Number(h) + Number(min ?? 0) / 60
    return pm && n < 12 ? n + 12 : n
  }
  return { start: hour(m[1]!, m[2]), end: hour(m[3]!, m[4]) }
}

export const rupees = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n)

export const compact = (n: number) =>
  new Intl.NumberFormat("en-IN", { notation: "compact" }).format(n)

export const reviews = studentReviews.map((r) => ({
  ...r,
  image: thumb(r.id),
  href: `https://www.youtube.com/shorts/${r.id}`,
}))

export const officers = guestSessions.map((g) => ({
  ...g,
  image: thumb(g.id),
  href: `https://www.youtube.com/watch?v=${g.id}`,
}))

export const classes = lectures.map((l) => ({
  ...l,
  image: lectureStill(l.id),
  href: `https://www.youtube.com/watch?v=${l.id}`,
}))

/** The two free workshops, listed free on the ICT app. */
export const workshops = tracks
  .map((t) => catalogue.find((c) => c.id === t.freeId))
  .filter((c) => c !== undefined)
  .map((c) => ({
    name: c.short,
    subtitle: c.subtitle,
    cover: c.cover,
    features: c.features.slice(0, 4),
    href: `/courses/${c.slug}`,
  }))

/**
 * Books for sale and free notes, straight from the live shop. Until ICT adds
 * its own titles these are samples, and `samples` says so on the page.
 */
export async function shelf() {
  const [books, resources] = await Promise.all([
    publishedBooks().catch(() => []),
    publishedResources().catch(() => []),
  ])
  const all = [...books, ...resources]
  const notes = resources.map((r) => ({
    slug: r.slug,
    title: r.title,
    exam: r.exam,
    kind: r.kind,
    pages: r.pages,
    href: "/resources",
  }))
  return {
    books: await Promise.all(
      books.map(async (b) => {
        const local = localCovers(b.slug)
        const coverUrl = local.front ?? b.coverUrl ?? null
        return {
          slug: b.slug,
          title: b.title,
          subtitle: b.subtitle,
          description: b.description,
          exam: b.exam,
          pages: b.pages,
          price: rupees(b.pricePaise / 100),
          tone: b.tone,
          coverUrl,
          backUrl: local.back,
          spineUrl: local.spine,
          spine: coverUrl ? await spineFrom(coverUrl) : null,
          href: `/books/${b.slug}`,
        }
      })
    ),
    resources: notes,
    /** The six fixed free-material folders, empty ones included. */
    folders: groupByFolder(notes).map((f) => ({ ...f, href: "/resources" })),
    samples: all.length > 0 && onlySamples(all),
  }
}

export type Shelf = Awaited<ReturnType<typeof shelf>>

export const whatsapp = `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`
export const tel = `tel:${contact.phones[0]}`
export const phone = formatPhone(contact.phones[0])

export {
  campus,
  contact,
  faculty,
  faqs,
  included,
  joining,
  links,
  nextBatch,
  offer,
  place,
  podcast,
  proof,
  publishedStories,
  selections,
  thumb,
}
