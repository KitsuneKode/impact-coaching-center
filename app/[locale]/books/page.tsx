import { alternatesFor } from "@/lib/site"
import { getTranslations, setRequestLocale } from "next-intl/server"
import {
  IconBook,
  IconBooks,
  IconBuildingStore,
  IconTruckDelivery,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { Suspense } from "react"

import { BundleGrid } from "@/components/commerce/bundle-grid"
import { CatalogSkeleton } from "@/components/commerce/catalog-skeleton"
import { SampleNotice, ShopCartButton } from "@/components/commerce/shop-shell"
import { StatePanel } from "@/components/ui/page-shell"
import { Section } from "@/components/ui/section"
import { onlySamples, publishedBundles } from "@/lib/catalog-server"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/books">): Promise<Metadata> {
  const { locale } = await params
  const bundles = await publishedBundles()
  const t = await getTranslations({ locale, namespace: "BooksPage" })
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/books", locale),
    ...(onlySamples(bundles)
      ? { robots: { index: false, follow: false } }
      : {}),
  }
}

const promises = [
  { icon: IconBook, key: "promiseSample" },
  { icon: IconTruckDelivery, key: "promiseDelivery" },
  { icon: IconBuildingStore, key: "promiseCollect" },
] as const

export default async function BooksPage({
  params,
}: PageProps<"/[locale]/books">) {
  const { locale } = await params
  setRequestLocale(locale)
  const bundles = await publishedBundles()
  const t = await getTranslations("BooksPage")

  return (
    <Section size="sm" className="pt-10 md:pt-12">
      {bundles.length && onlySamples(bundles) ? (
        <div className="mb-8">
          <SampleNotice>{t("sample")}</SampleNotice>
        </div>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-5">
          <h1 className="type-display max-w-[20ch]">{t("heading")}</h1>
          <div>
            <ShopCartButton />
          </div>
        </div>
        <ul className="grid gap-2.5 text-sm text-muted-foreground">
          {promises.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center gap-2.5">
              <Icon
                stroke={1.5}
                className="size-[18px] text-foreground"
                aria-hidden
              />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>
      {bundles.length ? (
        /* The filter reads the URL; this keeps the rest of the page static. */
        <Suspense fallback={<CatalogSkeleton kind="books" />}>
          <BundleGrid bundles={bundles} />
        </Suspense>
      ) : (
        <StatePanel
          className="mt-10"
          icon={<IconBooks stroke={1.75} />}
          title={t("empty")}
          description={t("emptyNote")}
        />
      )}
    </Section>
  )
}
