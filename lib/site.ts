import type { Metadata } from "next"

import { brand } from "./brand"
import { clientEnv } from "./env.client"
import { serverEnv } from "./env.server"

/** Where this build lives, and whether search engines may index it. */
export function resolveSiteUrl(
  env: Record<string, string | undefined>
): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, "")

  // Fail only where the fallback would do irreversible damage: a build that
  // invites indexing. Search engines would record localhost canonicals, a
  // localhost sitemap and a localhost LocalBusiness @id.
  if (env.SITE_INDEXABLE === "true") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be set when SITE_INDEXABLE is true. Falling back to localhost would publish localhost URLs in canonicals, the sitemap, the Open Graph image and the LocalBusiness @id."
    )
  }

  return "http://localhost:3000"
}

export const siteUrl = resolveSiteUrl({
  NEXT_PUBLIC_SITE_URL: clientEnv.NEXT_PUBLIC_SITE_URL,
  SITE_INDEXABLE: serverEnv.SITE_INDEXABLE,
})

/**
 * Off until launch. The page carries offers the owner has not yet confirmed
 * (see `toConfirm` in lib/brand.ts), so it must not be indexed as ICT's
 * official site.
 */
export const indexable = serverEnv.SITE_INDEXABLE === "true"

/**
 * One complete Open Graph object per route. `openGraph` is a single metadata
 * key, so a page that sets any of it replaces the root object wholesale -
 * the shared fields (type, locale, siteName) have to come through here rather
 * than be inherited. `url` resolves against `metadataBase`; the `opengraph-image`
 * file convention supplies `images` on every route.
 */
export function openGraphFor(
  path: string,
  title: string,
  description: string,
  locale = "en",
  image?: { url: string; alt: string }
): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    locale: locale === "as" ? "as_IN" : "en_IN",
    url: localePath(path, locale),
    siteName: brand.legalName,
    title,
    description,
    // A page's own openGraph replaces the parent's, image included, so every
    // page names one: its own picture when it has one, else ICT's card.
    images: [image ?? SHARE_IMAGE],
  }
}

/** ICT's share card, 1200x630: the five teachers and the headline. */
const SHARE_IMAGE = {
  url: "/og/ict.jpg",
  width: 1200,
  height: 630,
  alt: "Impact Career Tutorials: Crack APSC from North Lakhimpur. Portraits of the five ICT teachers.",
}

/** A meta description of at most `max` characters, cut at a word. */
export function clipDescription(text: string, max = 160) {
  const flat = text.replace(/\s+/g, " ").trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:]$/, "")}…`
}

/** A public path in a given language: English unprefixed, Assamese under /as. */
export function localePath(path: string, locale: string) {
  if (locale === "en") return path
  return path === "/" ? `/${locale}` : `/${locale}${path}`
}

/** Canonical plus hreflang alternates for a public path, per language. */
export function alternatesFor(
  path: string,
  locale: string
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localePath(path, locale),
    languages: {
      "en-IN": path,
      "as-IN": localePath(path, "as"),
      "x-default": path,
    },
  }
}

/** Ownership tags for Search Console and Bing, when set on the host. */
export const siteVerification = {
  google: serverEnv.GOOGLE_SITE_VERIFICATION,
  other: serverEnv.BING_SITE_VERIFICATION
    ? { "msvalidate.01": serverEnv.BING_SITE_VERIFICATION }
    : undefined,
}
