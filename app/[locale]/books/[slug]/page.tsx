import {
  IconArrowLeft,
  IconBuildingStore,
  IconTruckDelivery,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { BundleBuy } from "@/components/commerce/bundle-buy"
import { BundleCard } from "@/components/commerce/bundle-card"
import { SampleNotice, ShopCartButton } from "@/components/commerce/shop-shell"
import { Section } from "@/components/ui/section"
import { contentFor } from "@/i18n/content-server"
import { Link } from "@/i18n/navigation"
import { inLanguage, LANGUAGES, type Language } from "@/lib/catalog"
import { publishedBundle, publishedBundles } from "@/lib/catalog-server"
import { alternatesFor, localePath, openGraphFor, siteUrl } from "@/lib/site"

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
    <>
      {bundle.sample ? null : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <Section size="sm" className="pt-8 md:pt-10">
        {bundle.sample ? (
          <div className="mb-6">
            <SampleNotice>{t("placeholderSet")}</SampleNotice>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft className="size-4" aria-hidden />
            {t("allSets")}
          </Link>
          <ShopCartButton />
        </div>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
          <div className="grid content-start gap-5">
            <p className="text-sm text-muted-foreground">
              {[
                phrase(bundle.exam),
                t("booksInSet", { count: bundle.books.length }),
                bundle.soldCount > 0
                  ? t("sold", { count: bundle.soldCount })
                  : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h1 className="type-display text-balance">{title}</h1>
            {bundle.tagline ? (
              <p className="type-lede text-muted-foreground">
                {inLanguage(bundle.tagline, language)}
              </p>
            ) : null}
            <p className="max-w-[62ch] whitespace-pre-line text-muted-foreground">
              {inLanguage(bundle.description, language)}
            </p>
            <ul className="mt-2 grid gap-3 rounded-card border border-border p-5 text-sm">
              <li className="flex gap-3">
                <IconTruckDelivery
                  stroke={1.5}
                  className="size-5 shrink-0"
                  aria-hidden
                />
                <span>
                  <span className="font-medium">{t("delivery")}</span>{" "}
                  <span className="text-muted-foreground">
                    {t("deliveryBody")}
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <IconBuildingStore
                  stroke={1.5}
                  className="size-5 shrink-0"
                  aria-hidden
                />
                <span>
                  <span className="font-medium">{t("collect")}</span>{" "}
                  <span className="text-muted-foreground">
                    {t("collectBody")}
                  </span>
                </span>
              </li>
            </ul>
          </div>

          <BundleBuy bundle={bundle} initialLanguage={language} />
        </div>
      </Section>

      {related.length ? (
        <Section size="sm" className="border-t border-border">
          <h2 className="type-display-sm">{t("allSets")}</h2>
          <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((b) => (
              <li key={b.slug}>
                <BundleCard bundle={b} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  )
}
