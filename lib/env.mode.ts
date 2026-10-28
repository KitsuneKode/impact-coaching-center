/** A Vercel production build: the one build where launch-only keys are required. */
export const launchBuild = process.env.VERCEL_ENV === "production"

/**
 * CI and tests build without a Convex backend, so they opt out explicitly.
 * Nothing sets this on Vercel, so a real deployment always validates.
 */
export const skipEnvValidation =
  process.env.SKIP_ENV_VALIDATION === "1" || process.env.NODE_ENV === "test"
