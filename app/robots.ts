import type { MetadataRoute } from "next"

import { indexable, siteUrl } from "@/lib/site"

/** Disallow everything until launch; see `indexable` in lib/site.ts. */
export default function robots(): MetadataRoute.Robots {
  return indexable
    ? {
        // Everyone, AI search included (ChatGPT, Perplexity, Claude, Gemini
        // answer from what they can read); never the private paths.
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/admin",
            "/account",
            "/checkout",
            "/api/",
            "/login",
            "/register",
          ],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
      }
    : { rules: { userAgent: "*", disallow: "/" } }
}
