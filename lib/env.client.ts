import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

/**
 * NEXT_PUBLIC_* variables, validated once at module load. These are inlined
 * into the client bundle at build time, so nothing here may be a secret.
 *
 * The Convex pair is optional on purpose: without them the site still builds
 * and serves every static page, just without live data (convexConfigured
 * gates those features). Production requires both - docs/production.md is
 * where that requirement is enforced, since it is a deployment decision, not
 * a code one.
 */
export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.url().optional(),
    NEXT_PUBLIC_CONVEX_SITE_URL: z.url().optional(),
    NEXT_PUBLIC_SITE_URL: z.url().optional(),
    /* Cloudflare Turnstile site key. Absent means the widget does not render
       and the server skips verification - the form stays usable while the
       keys are unprovisioned, which is fine for development but not for
       launch (docs/production.md lists it as required there). */
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  },
  emptyStringAsUndefined: true,
})
