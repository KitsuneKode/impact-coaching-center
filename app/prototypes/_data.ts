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
