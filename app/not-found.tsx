import { ButtonLink } from "@/components/ui/button"
import { Section } from "@/components/ui/section"

/**
 * The branded 404.
 *
 * Renders inside the root layout, so the header and footer stay - which is the
 * whole point. Someone who mistyped a URL is one tap from the courses; someone
 * who followed a dead link from outside can still see who ICT are.
 *
 * Next also serves this for any URL that matches no route, so it is the last
 * page a lost visitor sees. It offers the three destinations that are actually
 * useful rather than a single "go home" that discards their intent.
 */
export default function NotFound() {
  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <div className="max-w-160">
          <h1 className="type-display">
            <span className="text-foreground">This page does not exist.</span>{" "}
            <span className="text-muted-foreground">
              The link may be mistyped, or it may have moved.
            </span>
          </h1>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/">Home</ButtonLink>
            <ButtonLink href="/courses" variant="secondary">
              Courses and fees
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost">
              Talk to ICT
            </ButtonLink>
          </div>
        </div>
      </Section>
    </main>
  )
}
