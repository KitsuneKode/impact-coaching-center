import { IconBuildingStore, IconTruckDelivery } from "@tabler/icons-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { BundleRow } from "@/components/commerce/bundle-row"
import { SetView } from "@/components/commerce/set-view"
import { SampleNotice } from "@/components/commerce/shop-shell"
import { contentFor } from "@/i18n/content-server"
import { inLanguage, LANGUAGES, type Language } from "@/lib/catalog"
import { publishedBundle, publishedBundles } from "@/lib/catalog-server"
import { alternatesFor, localePath, openGraphFor, siteUrl } from "@/lib/site"

/* Catalogue data is cached for five minutes (lib/catalog-server.ts); the
   page is static and rebuilt in the background on the same beat. */
export const revalidate = 300

/* Known slugs are built ahead; a new one renders on first visit and is kept. */
export async function generateStaticParams() {
  return (await publishedBundles()).map((bundle) => ({ slug: bundle.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/books/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params
  const bundle = await publishedBundle(slug)
  if (!bundle) return { title: "Not found" }
  const language = locale as Language
  const title = inLanguage(bundle.title, language)
  const description = bundle.tagline
    ? inLanguage(bundle.tagline, language)
    : inLanguage(bundle.description, language).slice(0, 160)
  return {
    title,
    description,
    alternates: alternatesFor(`/books/${bundle.slug}`, locale),
    openGraph: openGraphFor(
      `/books/${bundle.slug}`,
      title,
      description,
      locale
    ),
    ...(bundle.sample ? { robots: { index: false, follow: false } } : {}),
  }
}

export default async function BundlePage({
  params,
}: PageProps<"/[locale]/books/[slug]">) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const language = locale as Language
  const t = await getTranslations("Shop")
  const pulse = await getTranslations("Pulse")
  const { phrase } = await contentFor(locale)
  const [bundle, bundles] = await Promise.all([
    publishedBundle(slug),
    publishedBundles(),
  ])
  if (!bundle) notFound()

  const title = inLanguage(bundle.title, language)
  const related = bundles.filter((b) => b.slug !== bundle.slug).slice(0, 3)
  const url = new URL(localePath(`/books/${bundle.slug}`, locale), siteUrl)

  // One Product with an Offer per language set.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: inLanguage(bundle.description, language),
    category: phrase(bundle.exam),
    url: url.href,
    ...(bundle.cover ? { image: bundle.cover.url } : {}),
    offers: LANGUAGES.map((l) => ({
      "@type": "Offer",
      name: l === "as" ? t("assameseSet") : t("englishSet"),
      price: (bundle.variants[l].pricePaise / 100).toFixed(2),
      priceCurrency: "INR",
      availability: bundle.variants[l].available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: url.href,
    })),
  }

  return (
    <main>
      {bundle.sample ? null : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <SetView
        bundle={bundle}
        initialLanguage={language}
        examLabel={phrase(bundle.exam)}
      />

      <section className="container-page grid gap-10 pbs-6 pbe-16 lg:grid-cols-12">
        <div className="grid content-start gap-5 lg:col-span-7">
          {bundle.sample ? (
            <SampleNotice>{t("placeholderSet")}</SampleNotice>
          ) : null}
          <p className="max-w-[62ch] text-lg whitespace-pre-line text-muted-foreground">
            {inLanguage(bundle.description, language)}
          </p>
        </div>
        <ul className="grid content-start gap-3 rounded-[28px] bg-card p-6 text-sm shadow-[0_0_0_1px_var(--border)] lg:col-span-5">
          <li className="flex gap-3">
            <IconTruckDelivery
              stroke={1.5}
              className="size-5 flex-none"
              aria-hidden
            />
            <span>
              <span className="font-medium">{t("delivery")}</span>{" "}
              <span className="text-muted-foreground">{t("deliveryBody")}</span>
            </span>
          </li>
          <li className="flex gap-3">
            <IconBuildingStore
              stroke={1.5}
              className="size-5 flex-none"
              aria-hidden
            />
            <span>
              <span className="font-medium">{t("collect")}</span>{" "}
              <span className="text-muted-foreground">{t("collectBody")}</span>
            </span>
          </li>
        </ul>
      </section>

      {related.length ? (
        <section aria-labelledby="more-sets" className="container-page pbe-20">
          <h2 id="more-sets" className="type-display">
            {pulse("moreSets")}
          </h2>
          <ul className="mbs-8 grid gap-6">
            {related.map((b) => (
              <li key={b.slug}>
                <BundleRow bundle={b} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
