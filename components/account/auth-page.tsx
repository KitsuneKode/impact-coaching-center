import { SignInForm } from "@/components/account/sign-in-form"
import { Section } from "@/components/ui/section"

/**
 * The one screen behind both /login and /register.
 *
 * There is a single mechanism: entering a mobile number either finds that
 * Person or creates one (ADR-0001). Two routes exist because people arrive
 * from two different places - a "Log in" link in the header, a "Register
 * free" call to action in a campaign - and landing either of them on a page
 * worded for the other reads as a mistake.
 *
 * What is NOT done here is offering the two as a choice on one page. Two
 * buttons doing byte-for-byte the same thing is a decision the visitor cannot
 * make correctly, because there is no wrong answer and no way to tell.
 *
 * So: the same field, the same action, different framing.
 *
 * No `.enter` animation, unlike the marketing routes - this is the
 * transactional register in docs/design-guide.md §2, and a log-in form does
 * not need to introduce itself.
 */
export function AuthPage({ heading, next }: { heading: string; next: string }) {
  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <div className="mx-auto max-w-112">
          <h1 className="type-display">
            <span className="text-foreground">{heading}</span>
          </h1>
          <div className="mt-8 rounded-card border border-border bg-surface p-6 md:p-8">
            <SignInForm next={next} />
          </div>
        </div>
      </Section>
    </main>
  )
}
