import { fetchQuery } from "convex/nextjs"
import { cache } from "react"

import { api } from "@/convex/_generated/api"

import type { Post, PostCard } from "./blog"
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

/** Noindex while there is nothing real to rank: no titles, or only samples. */
export const onlySamples = (items: readonly { sample?: boolean }[]) =>
  items.every((item) => item.sample)
