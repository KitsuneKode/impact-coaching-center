import { alternatesFor } from "@/lib/site"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { IconFileText } from "@tabler/icons-react"
import type { Metadata } from "next"
import { Suspense } from "react"

import { ResourceList } from "@/components/commerce/resource-list"
import { CatalogSkeleton } from "@/components/commerce/catalog-skeleton"
import { SampleNotice } from "@/components/commerce/shop-shell"
import { StatePanel } from "@/components/ui/page-shell"
import { Section } from "@/components/ui/section"
import { onlySamples, publishedResources } from "@/lib/catalog-server"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/resources">): Promise<Metadata> {
  const { locale } = await params
  const resources = await publishedResources()
  const t = await getTranslations({ locale, namespace: "ResourcesPage" })
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/resources", locale),
    ...(onlySamples(resources)
      ? { robots: { index: false, follow: false } }
      : {}),
  }
}

export default async function ResourcesPage({
  params,
}: PageProps<"/[locale]/resources">) {
  const { locale } = await params
  setRequestLocale(locale)
  const resources = await publishedResources()
  const t = await getTranslations("ResourcesPage")
  return (
    <main className="pt-24 md:pt-28">
      <Section size="sm" className="pt-10 md:pt-12">
        {resources.length && onlySamples(resources) ? (
          <div className="mb-8">
            <SampleNotice>{t("sample")}</SampleNotice>
          </div>
        ) : null}
        <h1 className="type-display-sm">{t("heading")}</h1>
        <p className="type-lede mt-3 max-w-160 text-muted-foreground">
          {t("lede")}
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
            title={t("empty")}
            description={t("emptyNote")}
          />
        )}
      </Section>
    </main>
  )
}
