import { CatalogSkeleton } from "@/components/commerce/catalog-skeleton"
import { Section } from "@/components/ui/section"

export default function Loading() {
  return (
    <main className="pt-24 md:pt-28">
      <Section size="sm" className="pt-10 md:pt-12">
        <h1 className="type-display-sm">Free study material.</h1>
        <CatalogSkeleton kind="resources" />
      </Section>
    </main>
  )
}
