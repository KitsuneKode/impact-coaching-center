import { hasLocale } from "next-intl"

import { routing } from "@/i18n/routing"
import type { Language } from "@/lib/catalog"
import { buildSearchIndex } from "@/lib/search-index"

/* Rebuilt at most every quarter hour, like the course pages it lists. */
export const revalidate = 3600

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/** The site search index for one language, fetched the first time search opens. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale))
    return new Response(null, { status: 404 })
  const items = await buildSearchIndex(locale as Language)
  return Response.json(items, {
    headers: {
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  })
}
