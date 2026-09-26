import { fetchQuery } from "convex/nextjs"
import { cache } from "react"

import { api } from "@/convex/_generated/api"

import type { Book, Resource } from "./catalog"

/** Published catalogue for server-rendered pages; empty when Convex is absent. */
const configured = () => Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)

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

/** Noindex while there is nothing real to rank: no titles, or only samples. */
export const onlySamples = (items: readonly { sample?: boolean }[]) =>
  items.every((item) => item.sample)
