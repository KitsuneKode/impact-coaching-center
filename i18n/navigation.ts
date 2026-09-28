import { createNavigation } from "next-intl/navigation"

import { routing } from "./routing"

/**
 * Locale-aware Link and router for the public pages. Routes that are English
 * only (/login, /register, /checkout, /account, /admin) keep using next/link.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
