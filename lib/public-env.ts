/**
 * The public variables browser code needs, read straight from the values
 * Next inlines at build. Not validated here: lib/env.client.ts does that at
 * build time (next.config.ts imports it), and importing it into the browser
 * would ship its validation library to every visitor.
 */
export const publicEnv = {
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL || undefined,
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined,
}
