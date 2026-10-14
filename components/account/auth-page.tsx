import { SignInForm } from "@/components/account/sign-in-form"
import { Section } from "@/components/ui/section"

/** The one screen behind both /login and /register. */
export function AuthPage({ heading, next }: { heading: string; next: string }) {
  return (
    <main>
      <Section size="sm" className="pbs-26 md:pbs-30">
        <div className="mx-auto max-w-112">
          <h1 className="type-display">
            <span className="text-foreground">{heading}</span>
          </h1>
          <div className="mbs-8 rounded-card border border-border bg-surface p-6 md:p-8">
            <SignInForm next={next} />
          </div>
        </div>
      </Section>
    </main>
  )
}
