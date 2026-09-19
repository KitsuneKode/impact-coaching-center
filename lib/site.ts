/**
 * Where this build lives, and whether search engines may index it.
 *
 * The base URL feeds metadataBase, so every absolute URL the page emits (the
 * WhatsApp link-preview image above all) points at the deployment that is
 * actually serving it. Hardcoding impactcareertutorials.in broke that: the
 * domain's certificate expired in Aug 2025, so a shared pitch link would
 * have fetched its preview image from a dead host.
 *
 * Resolution order: an explicit NEXT_PUBLIC_SITE_URL, then localhost. The
 * host is deliberately not named here. Reading a particular platform's
 * variables is what tied this module to Vercel in the first place, and the
 * host for this project is not settled; every candidate can set one
 * environment variable, so that is all we depend on.
 *
 * Takes env as a parameter so the resolution order - the whole point of this
 * module - can be exercised by a test.
 */
export function resolveSiteUrl(
  env: Record<string, string | undefined>
): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, "")

  // Fail only where the fallback would do irreversible damage: a build that
  // invites indexing. Search engines would record localhost canonicals, a
  // localhost sitemap and a localhost LocalBusiness @id.
  //
  // Keyed on SITE_INDEXABLE alone, matching `indexable` below - which is what
  // actually drives robots.ts and the layout - so the guard and the thing it
  // guards cannot disagree. A non-indexable build is a preview or a local
  // gate run, where localhost is visible and recoverable, and where failing
  // would make `bun run build` unusable for anyone without the variable set.
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
 * official site. Set SITE_INDEXABLE=true on the production domain once signed
 * off.
 */
export const indexable = process.env.SITE_INDEXABLE === "true"
