import {
  IconBook,
  IconBooks,
  IconBuildingStore,
  IconTruckDelivery,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { SetFinder } from "@/components/commerce/set-finder"
import { ShopCartButton } from "@/components/commerce/shop-shell"
import { JumpChips } from "@/components/site/jump-chips"
import { PageHead } from "@/components/site/page-head"
import { StatePanel } from "@/components/ui/page-shell"
import { contentFor } from "@/i18n/content-server"
import { onlySamples, publishedBundles } from "@/lib/catalog-server"
import { slugify } from "@/lib/catalog"
import { alternatesFor, openGraphFor } from "@/lib/site"
import { OrderSteps } from "@/components/commerce/order-steps"
import { VolumeShelf } from "@/components/commerce/volume-shelf"
import type { Language } from "@/lib/catalog"

/* Catalogue data refreshes when it changes (lib/catalog-server.ts); the
   page is static and rebuilt in the background on the same beat. */
export const revalidate = 3600

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
    openGraph: openGraphFor("/books", t("title"), t("description"), locale),
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

/** ICT's book sets, grouped by exam; each opens to choose English or Assamese. */
export default async function BooksPage({
  params,
}: PageProps<"/[locale]/books">) {
  const { locale } = await params
  setRequestLocale(locale)
  const bundles = await publishedBundles()
  const t = await getTranslations("BooksPage")
  const pulse = await getTranslations("Pulse")
  const nav = await getTranslations("Nav")
  const { phrase } = await contentFor(locale)
  const groups = [...Map.groupBy(bundles, (bundle) => bundle.exam)]

  return (
    <main>
      <PageHead
        trail={[{ label: nav("books") }]}
        title={pulse("booksTitle")}
        lede={
          bundles.length && onlySamples(bundles)
            ? pulse("setsSample")
            : undefined
        }
      >
        <ul className="mbs-8 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {promises.map(({ icon: Icon, key }) => (
            <li
              key={key}
              className="flex items-center gap-3 text-sm text-muted-foreground sm:inline-flex sm:rounded-full sm:bg-card sm:ps-2 sm:pe-5 sm:pbs-2 sm:pbe-2 sm:shadow-[0_0_0_1px_var(--border)]"
            >
              <span className="grid size-8 place-items-center rounded-full bg-secondary text-foreground">
                <Icon aria-hidden stroke={1.5} className="size-[18px]" />
              </span>
              {t(key)}
            </li>
          ))}
        </ul>
        <div className="mbs-6 flex flex-wrap items-center justify-between gap-4">
          {groups.length > 1 ? (
            <JumpChips
              label={pulse("jumpExam")}
              items={groups.map(([exam]) => ({
                href: `#${slugify(exam)}`,
                label: phrase(exam),
              }))}
            />
          ) : (
            <span />
          )}
          <ShopCartButton />
        </div>
      </PageHead>
      <VolumeShelf
        bundles={bundles}
        language={locale as Language}
        label={pulse("volumesLabel")}
      />

      {groups.length ? (
        <SetFinder
          groups={groups.map(([exam, sets]) => ({
            id: slugify(exam),
            label: phrase(exam),
            bundles: sets,
          }))}
        />
      ) : (
        <div className="container-page pbe-20">
          <StatePanel
            icon={<IconBooks stroke={1.75} />}
            title={t("empty")}
            description={t("emptyNote")}
          />
        </div>
      )}
      <OrderSteps />
    </main>
  )
}
