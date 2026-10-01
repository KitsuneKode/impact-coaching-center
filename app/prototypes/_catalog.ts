import { cache } from "react"

import type { Book, Resource } from "@/lib/catalog"
import {
  onlySamples,
  publishedBook as liveBook,
  publishedBooks as liveBooks,
  publishedResources as liveResources,
} from "@/lib/catalog-server"
import seed from "@/scripts/dev-seed.json"

export { onlySamples }

/** The dev fixture's titles, marked as samples, for a deployment with no Convex. */
const sampleBooks: Book[] = seed.books.map(({ priceRupees, tone, ...b }) => ({
  ...b,
  tone: tone as Book["tone"],
  pricePaise: priceRupees * 100,
  samplePages: 0,
  sample: true,
}))

const sampleResources: Resource[] = seed.resources.map(({ kind, ...r }) => ({
  ...r,
  kind: kind as Resource["kind"],
  pages: 0,
  sample: true,
}))

/** The live catalogue when there is one, the samples when there is not. */
export const publishedBooks = cache(async (): Promise<Book[]> => {
  const live = await liveBooks().catch(() => [])
  return live.length > 0 ? live : sampleBooks
})

export const publishedBook = cache(async (slug: string) => {
  const live = await liveBook(slug).catch(() => null)
  return live ?? sampleBooks.find((b) => b.slug === slug) ?? null
})

export const publishedResources = cache(async (): Promise<Resource[]> => {
  const live = await liveResources().catch(() => [])
  return live.length > 0 ? live : sampleResources
})
