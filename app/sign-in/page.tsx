import type { Metadata } from "next"

import { SignInForm } from "@/components/account/sign-in-form"
import { Section } from "@/components/ui/section"
import { safeReturnPath } from "@/lib/return-path"

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Log in to Impact Career Tutorials with your mobile number and a one-time code.",
  alternates: { canonical: "/sign-in" },
  // Nothing here is worth a search result, and an indexed log-in page only
  // ever collects the wrong kind of traffic.
  robots: { index: false, follow: true },
}

/**
 * `next` is typed as it actually arrives. A repeated `?next=` gives an array,
 * which the previous signature denied could happen and `startsWith` would
 * have thrown on. `safeReturnPath` refuses both that and the destinations a
 * prefix check misses.
 *
 * The route stays `/sign-in` although the page now says "Log in". The path is
 * already written into `lib/policies.ts`, the sitemap guard and the staff-only
 * state on /admin/leads; renaming it would buy a visitor nothing and cost a
 * redirect plus three documents that have to agree.
 *
 * No `.enter` animation here, unlike the marketing routes: this is the
 * transactional register in docs/design-guide.md §2, and a log-in form does
 * not need to introduce itself.
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
        <div className="mx-auto max-w-112">
          <h1 className="type-display">
            <span className="text-foreground">Log in</span>
          </h1>
          <div className="mt-8 rounded-card border border-border bg-surface p-6 md:p-8">
            <SignInForm next={safeReturnPath(next)} />
          </div>
        </div>
      </Section>
    </main>
  )
}
