import { getTranslations, setRequestLocale } from "next-intl/server"
import { IconChevronRight } from "@tabler/icons-react"
import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"

import { MarkdownBody } from "@/components/marketing/markdown-body"
import { Section } from "@/components/ui/section"
import { brand } from "@/lib/brand"
import { publishedPost } from "@/lib/catalog-server"
import { alternatesFor, openGraphFor, siteUrl } from "@/lib/site"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params
  const post = await publishedPost(slug)
  if (!post) return {}
  const path = `/blog/${post.slug}`
  return {
    title: post.title,
    description: post.excerpt,
    alternates: alternatesFor(path, locale),
    openGraph: {
      ...openGraphFor(path, post.title, post.excerpt),
      type: "article",
      ...(post.publishedAt
        ? { publishedTime: new Date(post.publishedAt).toISOString() }
        : {}),
      modifiedTime: new Date(post.updatedAt).toISOString(),
    },
  }
}

function readableDate(at: number, locale: string) {
  return new Date(at).toLocaleDateString(
    locale === "as" ? "as-IN-u-nu-latn" : "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }
  )
}

export default async function PostPage({
  params,
}: PageProps<"/[locale]/blog/[slug]">) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Shop")
  const tb = await getTranslations("BlogPage")
  const post = await publishedPost(slug)
  if (!post) notFound()
  const lang = post.language === "as" ? "as" : "en"

  /* Article schema: only claims the visible page makes. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    inLanguage: lang === "as" ? "as-IN" : "en-IN",
    description: post.excerpt,
    ...(post.publishedAt
      ? { datePublished: new Date(post.publishedAt).toISOString() }
      : {}),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: {
      "@type": "Organization",
      name: brand.legalName,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: brand.legalName,
      url: siteUrl,
    },
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Section size="sm" className="pt-26 md:pt-30">
        <nav aria-label={t("breadcrumb")}>
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <li>
              <Link href="/blog" className="hover:text-foreground">
                {t("blog")}
              </Link>
            </li>
            <IconChevronRight size={14} stroke={1.75} aria-hidden />
            <li aria-current="page" className="text-foreground">
              {post.title}
            </li>
          </ol>
        </nav>

        <h1 lang={lang} className="type-display mt-8 max-w-208">
          <span className="text-foreground">{post.title}</span>
        </h1>
        {post.publishedAt ? (
          <p className="mt-6 text-sm text-muted-foreground">
            {tb.rich("published", {
              date: readableDate(post.publishedAt, locale),
              time: (chunks) => (
                <time dateTime={new Date(post.publishedAt!).toISOString()}>
                  {chunks}
                </time>
              ),
            })}
          </p>
        ) : null}
        {post.excerpt ? (
          <p
            lang={lang}
            className="type-lede mt-4 max-w-160 text-muted-foreground"
          >
            {post.excerpt}
          </p>
        ) : null}

        <div lang={lang} className="mt-14 max-w-160">
          <MarkdownBody>{post.body}</MarkdownBody>
        </div>
      </Section>
    </main>
  )
}
