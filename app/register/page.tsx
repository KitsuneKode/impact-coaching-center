import type { Metadata } from "next"

import { AuthPage } from "@/components/account/auth-page"
import { safeReturnPath } from "@/lib/return-path"

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create an Impact Career Tutorials account with a WhatsApp code to your mobile number.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: true },
}

/**
 * The same screen as /login, worded for somebody who has never been here.
 *
 * It is not a second mechanism and there is no second form to fill: entering
 * a number either finds that Person or creates one (ADR-0001). This route
 * exists so a campaign can say "Register free" and land on a page that agrees
 * with the link they clicked.
 *
 * An existing Person who arrives here is simply logged in, which is the right
 * outcome and needs no apology - the alternative is telling somebody their
 * number is "already taken", which is both untrue and unhelpful.
 */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const { next } = await searchParams
  return <AuthPage heading="Create your account" next={safeReturnPath(next)} />
}
