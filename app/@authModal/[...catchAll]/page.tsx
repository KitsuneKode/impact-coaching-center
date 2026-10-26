/**
 * Closes the login modal on navigation anywhere else. A slot keeps what it
 * last rendered on client navigation, so every route needs an empty match;
 * "/" is rewritten to "/en" by the proxy, so it lands here too.
 */
export default function AuthModalCatchAll() {
  return null
}
