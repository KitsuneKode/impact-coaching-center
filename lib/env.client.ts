import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

import { launchBuild, skipEnvValidation } from "./env.mode"

/**
 * NEXT_PUBLIC_* variables, validated at load. next.config.ts imports this, so
 * a missing one fails `next build`. Inlined into the browser bundle, so
 * nothing here may be a secret. docs/production.md says where each is set.
 */
export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.url(),
    NEXT_PUBLIC_CONVEX_SITE_URL: z.url(),
    /* Canonical origin; a production build must name it. */
    NEXT_PUBLIC_SITE_URL: launchBuild ? z.url() : z.url().optional(),
    /* Turnstile widget; optional off production so dev stays keyless. */
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: launchBuild
      ? z.string().min(1)
      : z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  },
  skipValidation: skipEnvValidation,
  emptyStringAsUndefined: true,
})
