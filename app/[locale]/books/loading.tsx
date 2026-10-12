import { CatalogSkeleton } from "@/components/commerce/catalog-skeleton"
import { Section } from "@/components/ui/section"

export default function Loading() {
  return (
    <Section size="sm" className="pt-10 md:pt-12">
      <h1 className="type-display max-w-[20ch]">
        Books for the exams we teach.
      </h1>
      <CatalogSkeleton kind="books" />
    </Section>
  )
}
