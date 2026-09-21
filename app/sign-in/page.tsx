import type { Metadata } from "next"
import type { CSSProperties } from "react"

import { SignInForm } from "@/components/marketing/sign-in-form"
import { Section } from "@/components/ui/section"
import { safeReturnPath } from "@/lib/return-path"

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Impact Career Tutorials with a WhatsApp code to your mobile number.",
  alternates: { canonical: "/sign-in" },
  // Nothing here is worth a search result, and an indexed sign-in page only
  // ever collects the wrong kind of traffic.
  robots: { index: false, follow: true },
}

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

/**
 * `next` is typed as it actually arrives. A repeated `?next=` gives an array,
 * which the previous signature denied could happen and `startsWith` would
 * have thrown on. `safeReturnPath` refuses both that and the destinations a
 * prefix check misses.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const { next } = await searchParams
  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <div className="mx-auto max-w-120">
          <h1 className="enter type-display" style={delay(0)}>
            <span className="text-foreground">Sign in.</span>
          </h1>
          <p
            className="enter type-lede mt-4 text-muted-foreground"
            style={delay(60)}
          >
            Your mobile number is your account. We send a WhatsApp code. There
            is no password.
          </p>
          <div
            className="enter mt-10 rounded-card border border-border bg-surface p-6 md:p-8"
            style={delay(120)}
          >
            <SignInForm next={safeReturnPath(next)} />
          </div>
        </div>
      </Section>
    </main>
  )
}
