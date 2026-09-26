import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

/**
 * Server-only variables for this Next.js process. Importing this module into
 * a client component throws by design - that is the point of keeping the
 * split: a secret cannot leak into the browser bundle by accident.
 *
 * Convex-side variables (SITE_URL, BETTER_AUTH_SECRET, OTP_TRANSPORT,
 * DEV_DEPLOYMENT_NAME) live on the Convex deployment and are read inside
 * convex/* function handlers; they deliberately do not appear here.
 */
export const serverEnv = createEnv({
  server: {
    /* "true" invites search indexing; anything else keeps every route
       noindex. lib/site.ts owns the indexing rules. */
    SITE_INDEXABLE: z.enum(["true", "false"]).optional(),
    /* Shared with the Convex /enquiries route. 32+ chars because that is the
       generation recipe (.env.example: openssl rand -hex 32 → 64 chars). */
    LEAD_INGEST_SECRET: z.string().min(32).optional(),
    /* Cloudflare Turnstile secret. When set, every enquiry submission must
       carry a valid widget token; when unset, verification is skipped. */
    TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  },
  /* Server variables are read from process.env at validation time; the
     strict runtimeEnv record is only needed where client keys must be
     enumerated for bundler inlining. */
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
