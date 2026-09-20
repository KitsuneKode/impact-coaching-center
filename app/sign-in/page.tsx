import type { Metadata } from "next"
import type { CSSProperties } from "react"

import { SignInForm } from "@/components/marketing/sign-in-form"
import { Section } from "@/components/ui/section"

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Impact Career Tutorials with your mobile number and a one-time code.",
  alternates: { canonical: "/sign-in" },
  // Nothing here is worth a search result, and an indexed sign-in page only
  // ever collects the wrong kind of traffic.
  robots: { index: false, follow: true },
}

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

/**
 * `next` is read from the query string and deliberately restricted to a path
 * on this site: an open redirect on a sign-in page hands an attacker a
 * trustworthy-looking link that lands somewhere else entirely.
 */
function safeNext(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/"
  return value
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
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
            Your mobile number is your account. No password to remember.
          </p>
          <div
            className="enter mt-10 rounded-card border border-border bg-surface p-6 md:p-8"
            style={delay(120)}
          >
            <SignInForm next={safeNext(next)} />
          </div>
        </div>
      </Section>
    </main>
  )
}
