/**
 * Read an environment variable that the code cannot work without.
 *
 * The alternative in this codebase was a non-null assertion, which turns a
 * missing variable into `undefined` flowing onward: CORS allowlists that
 * silently contain nothing, Convex URLs that resolve to "undefined", and an
 * opaque 500 at request time instead of a named failure at startup. Name the
 * variable, fail where it is missing.
 */
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} must be set on this deployment. Refusing to continue with it missing, because the failure it causes downstream does not name the variable.`
    )
  }
  return value
}
