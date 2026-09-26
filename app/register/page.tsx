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

/** The same screen as /login, worded for somebody who has never been here. */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const { next } = await searchParams
  return <AuthPage heading="Create your account" next={safeReturnPath(next)} />
}
