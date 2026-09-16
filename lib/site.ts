/**
 * Where this build lives, and whether search engines may index it.
 *
 * The base URL feeds metadataBase, so every absolute URL the page emits (the
 * WhatsApp link-preview image above all) points at the deployment that is
 * actually serving it. Hardcoding impactcareertutorials.in broke that: the
 * domain's certificate expired in Aug 2025, so a shared pitch link would
 * have fetched its preview image from a dead host.
 *
 * Resolution order: an explicit NEXT_PUBLIC_SITE_URL (set this at launch),
 * then Vercel's own system variables, then localhost.
 */
function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export const siteUrl = resolveSiteUrl().replace(/\/$/, "")

/**
 * Off until launch. The page carries offers the owner has not yet confirmed
 * (see `toConfirm` in lib/brand.ts), so it must not be indexed as ICT's
 * official site. Set SITE_INDEXABLE=true on the production domain once signed
 * off.
 */
export const indexable = process.env.SITE_INDEXABLE === "true"
