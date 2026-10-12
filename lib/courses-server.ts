import { cache } from "react"

import { todayIst } from "./calendar"
import { catalogue } from "./catalogue"
import { publishedCourses } from "./catalog-server"
import { fromMirror, fromSnapshot, type Course } from "./courses"

/**
 * Courses from the ClassPlus mirror, in ICT's order. The committed snapshot
 * only stands in when the mirror is unreachable or not yet synced, so a page
 * is never empty.
 */
export const liveCourses = cache(async (): Promise<Course[]> => {
  const rows = await publishedCourses()
  return rows.length
    ? rows.map((row) => fromMirror(row))
    : catalogue.map(fromSnapshot)
})

export const liveCourse = cache(async (slug: string) =>
  (await liveCourses()).find((course) => course.slug === slug)
)

/** Today in IST, `yyyy-mm-dd`, once per request. */
export const todayInIndia = cache(async () => todayIst(Date.now()))
