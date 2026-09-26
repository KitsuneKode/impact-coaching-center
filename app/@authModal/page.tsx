/**
 * Closes the login modal when navigation lands on "/".
 *
 * On a client-side navigation Next.js keeps a parallel slot showing whatever
 * it last rendered, so after signing in from the modal the dialog stayed open
 * on "Signing you in…" over the home page. Matching the route with an empty
 * page is the documented way to clear the slot.
 */
export default function AuthModalHome() {
  return null
}
