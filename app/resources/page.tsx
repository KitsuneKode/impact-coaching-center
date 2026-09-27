import { IconFileText } from "@tabler/icons-react"
import type { Metadata } from "next"
import { Suspense } from "react"

import { ResourceList } from "@/components/commerce/resource-list"
import { CatalogSkeleton } from "@/components/commerce/catalog-skeleton"
import { SampleNotice } from "@/components/commerce/shop-shell"
import { StatePanel } from "@/components/ui/page-shell"
import { Section } from "@/components/ui/section"
import { onlySamples, publishedResources } from "@/lib/catalog-server"

export async function generateMetadata(): Promise<Metadata> {
  const resources = await publishedResources()
  return {
    title: "Free resources",
    description:
      "Free notes, past papers and practice sets from Impact Career Tutorials. Log in with your mobile number to read them.",
    alternates: { canonical: "/resources" },
    ...(onlySamples(resources)
      ? { robots: { index: false, follow: false } }
      : {}),
  }
}

export default async function ResourcesPage() {
  const resources = await publishedResources()
  return (
    <main className="pt-24 md:pt-28">
      <Section size="sm" className="pt-10 md:pt-12">
        {resources.length && onlySamples(resources) ? (
          <div className="mb-8">
            <SampleNotice>
              These items show how free resources work. ICT&rsquo;s own notes
              and papers replace them before launch.
            </SampleNotice>
          </div>
        ) : null}
        <h1 className="type-display-sm">Free study material.</h1>
        <p className="type-lede mt-3 max-w-160 text-muted-foreground">
          Notes, past papers and practice sets. Log in with your mobile number
          once to open any of them.
        </p>
        {resources.length ? (
          /* The filter reads the URL; this keeps the rest of the page static. */
          <Suspense fallback={<CatalogSkeleton kind="resources" />}>
            <ResourceList resources={resources} />
          </Suspense>
        ) : (
          <StatePanel
            className="mt-10"
            icon={<IconFileText stroke={1.75} />}
            title="Nothing here yet"
            description="New material appears here as soon as it is published."
          />
        )}
      </Section>
    </main>
  )
}
