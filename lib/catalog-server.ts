import { fetchQuery } from "convex/nextjs"
import type { FunctionReturnType } from "convex/server"
import { unstable_cache } from "next/cache"
import { cache } from "react"

import { api } from "@/convex/_generated/api"

import type { Post, PostCard } from "./blog"
import { daysBefore, todayIst, type ExamDate } from "./calendar"
import type { PublicBundle, Resource } from "./catalog"
import { clientEnv } from "./env.client"

export type PublicCourse = FunctionReturnType<typeof api.courses.list>[number]

/** Published catalogue for server-rendered pages; empty when Convex is absent. */
const configured = () => Boolean(clientEnv.NEXT_PUBLIC_CONVEX_URL)

/* `cache` so a page and its metadata share one request. */
export const publishedBundles = cache(async (): Promise<PublicBundle[]> =>
  configured() ? fetchQuery(api.catalog.bundles) : []
)

export const publishedBundle = cache(
  async (slug: string): Promise<PublicBundle | null> =>
    configured() ? fetchQuery(api.catalog.bundle, { slug }) : null
)

/* Courses follow ClassPlus every six hours; pages need not be fresher. */
const cachedCourses = unstable_cache(
  (): Promise<PublicCourse[]> => fetchQuery(api.courses.list),
  ["courses"],
  { revalidate: 900 }
)

/** Courses from the ClassPlus mirror; empty when Convex is unreachable. */
export const publishedCourses = cache(async (): Promise<PublicCourse[]> => {
  if (!configured()) return []
  try {
    return await cachedCourses()
  } catch (error) {
    console.error("Courses unavailable", error)
    return []
  }
})

export const publishedResources = cache(async (): Promise<Resource[]> =>
  configured() ? fetchQuery(api.catalog.resources) : []
)

export const publishedPosts = cache(async (): Promise<PostCard[]> =>
  configured() ? fetchQuery(api.blog.posts) : []
)

export const publishedPost = cache(
  async (slug: string): Promise<Post | null> =>
    configured() ? fetchQuery(api.blog.post, { slug }) : null
)

/* Dates change a few times a month; an hour's staleness keeps the exam
   pages static without a deploy per notice. */
const cachedDates = unstable_cache(
  (since: string): Promise<ExamDate[]> =>
    fetchQuery(api.calendar.dates, { since }),
  ["exam-dates"],
  { revalidate: 3600 }
)

/**
 * Published exam dates from 120 days back, plus today's IST day to split
 * them on. A failed read shows an empty calendar rather than a broken exam
 * page, and is not cached.
 */
export const examDates = cache(async () => {
  const today = todayIst(Date.now())
  if (!configured()) return { today, dates: [] }
  try {
    return { today, dates: await cachedDates(daysBefore(today, 120)) }
  } catch (error) {
    console.error("Exam calendar unavailable", error)
    return { today, dates: [] as ExamDate[] }
  }
})

/** Noindex while there is nothing real to rank: no titles, or only samples. */
export const onlySamples = (items: readonly { sample?: boolean }[]) =>
  items.every((item) => item.sample)
