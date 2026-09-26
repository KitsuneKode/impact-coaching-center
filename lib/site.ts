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

export const siteUrl = resolveSiteUrl(process.env)

/**
 * Off until launch. The page carries offers the owner has not yet confirmed
 * (see `toConfirm` in lib/brand.ts), so it must not be indexed as ICT's
 * official site.
 */
export const indexable = process.env.SITE_INDEXABLE === "true"
