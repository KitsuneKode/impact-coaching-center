import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

import { launchBuild, skipEnvValidation } from "./env.mode"

/**
 * Server-only variables for the Next.js process. Importing this into a client
 * component throws, so a secret cannot reach the browser by accident.
 * Convex-side variables live on the Convex deployment (docs/production.md).
 */
export const serverEnv = createEnv({
  server: {
    /* "true" invites indexing; lib/site.ts owns the rules. */
    SITE_INDEXABLE: z.enum(["true", "false"]).optional(),
    /* Shared with the Convex /enquiries route; `openssl rand -hex 32`. Off
       production a missing one gives the honest WhatsApp fallback. */
    LEAD_INGEST_SECRET: launchBuild
      ? z.string().min(32)
      : z.string().min(32).optional(),
    /* Turnstile secret; unset off production means the check is skipped. */
    TURNSTILE_SECRET_KEY: launchBuild
      ? z.string().min(1)
      : z.string().min(1).optional(),
  },
  experimental__runtimeEnv: process.env,
  skipValidation: skipEnvValidation,
  emptyStringAsUndefined: true,
})
