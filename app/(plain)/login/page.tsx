import type { Metadata } from "next"

import { AuthPage } from "@/components/account/auth-page"
import { safeReturnPath } from "@/lib/return-path"
import { openGraphFor } from "@/lib/site"

const title = "Log in"
const description =
  "Log in to Impact Career Tutorials with a WhatsApp code to your mobile number."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/login" },
  openGraph: openGraphFor("/login", title, description),
  // Nothing here is worth a search result, and an indexed log-in page only
  // ever collects the wrong kind of traffic.
  robots: { index: false, follow: true },
}

/**
 * `next` is typed as it actually arrives. A repeated `?next=` gives an array,
 * which a `next?: string` signature denies can happen and `startsWith` would
 * throw on.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const { next } = await searchParams
  return <AuthPage heading="Log in" next={safeReturnPath(next)} />
}
