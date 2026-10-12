import createMiddleware from "next-intl/middleware"

import { routing } from "./i18n/routing"

/** Resolves the language for public pages: /as prefix, else the saved choice. */
export default createMiddleware(routing)

export const config = {
  // English-only areas and files are left alone.
  matcher:
    "/((?!api|admin|account|checkout|login|register|_next|_vercel|.*\\..*).*)",
}
