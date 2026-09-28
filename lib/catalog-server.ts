import { fetchQuery } from "convex/nextjs"
import { unstable_cache } from "next/cache"
import { cache } from "react"

import { api } from "@/convex/_generated/api"

import type { Post, PostCard } from "./blog"
import { daysBefore, todayIst, type ExamDate } from "./calendar"
import type { Book, Resource } from "./catalog"
import { clientEnv } from "./env.client"

/** Published catalogue for server-rendered pages; empty when Convex is absent. */
const configured = () => Boolean(clientEnv.NEXT_PUBLIC_CONVEX_URL)

/* `cache` so a page and its metadata share one request. */
export const publishedBooks = cache(async (): Promise<Book[]> =>
  configured() ? fetchQuery(api.catalog.books) : []
)

export const publishedBook = cache(
  async (slug: string): Promise<Book | null> =>
    configured() ? fetchQuery(api.catalog.book, { slug }) : null
)

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
