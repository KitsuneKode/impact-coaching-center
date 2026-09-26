import {
  contact,
  faculty,
  included,
  joining,
  links,
  offer,
  proof,
  selections,
  tracks,
} from "@/lib/brand"
import { catalogue } from "@/lib/catalogue"
import { campus, studentReviews, thumb } from "@/lib/stories"

/**
 * Everything the six homepage concepts show, drawn from the same records the
 * live site uses, so a concept can change the look but never the facts.
 */
export const courses = tracks.map((track) => {
  const course = catalogue.find((c) => c.id === track.flagshipId)
  return {
    exam: track.exam,
    full: track.full,
    covers: track.covers,
    duration: track.duration,
    name: course?.short ?? track.exam,
    price: course?.price ?? null,
    mrp: course?.mrp ?? null,
    cover: course?.cover ?? null,
    href: course ? `/courses/${course.slug}` : "/courses",
  }
})

export const rupees = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n)

export const reviews = studentReviews.slice(0, 6).map((r) => ({
  ...r,
  image: thumb(r.id),
  href: `https://www.youtube.com/shorts/${r.id}`,
}))

export const whatsapp = `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`

export {
  campus,
  contact,
  faculty,
  included,
  joining,
  links,
  offer,
  proof,
  selections,
}
