/**
 * The slot renders nothing unless an auth route was intercepted.
 *
 * Required rather than optional: on a hard navigation Next cannot recover the
 * active state of a slot that does not match the URL, and without a default
 * it renders a 404 for the whole page instead of an empty slot. Confirmed in
 * the installed docs for 16.3.5, 03-file-conventions/parallel-routes.md.
 */
export default function AuthModalDefault() {
  return null
}
