import type { MetadataRoute } from "next"

import { indexable, siteUrl } from "@/lib/site"

/** Disallow everything until launch; see `indexable` in lib/site.ts. */
export default function robots(): MetadataRoute.Robots {
  return indexable
    ? { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } }
}
