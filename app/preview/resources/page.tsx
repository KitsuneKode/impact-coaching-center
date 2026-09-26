import type { Metadata } from "next"

import { ResourceList } from "@/components/commerce/resource-list"
import { Section } from "@/components/ui/section"

export const metadata: Metadata = { title: "Free resources" }

export default function PreviewResources() {
  return (
    <Section size="sm" className="pt-10 md:pt-12">
      <h1 className="type-display-sm">Free study material.</h1>
      <p className="type-lede mt-3 max-w-160 text-muted-foreground">
        Notes, past papers and practice sets. Verify your number once to open
        any of them.
      </p>
      <ResourceList />
    </Section>
  )
}
