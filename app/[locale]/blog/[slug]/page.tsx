import { getTranslations, setRequestLocale } from "next-intl/server"
import { IconChevronRight } from "@tabler/icons-react"
import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"

import { MarkdownBody } from "@/components/marketing/markdown-body"
import { brand } from "@/lib/brand"
import { publishedPost } from "@/lib/catalog-server"
import { publishedPosts } from "@/lib/catalog-server"
import { alternatesFor, openGraphFor, siteUrl } from "@/lib/site"

/* Catalogue data is cached for five minutes (lib/catalog-server.ts); the
   page is static and rebuilt in the background on the same beat. */
export const revalidate = 300

/* Known slugs are built ahead; a new one renders on first visit and is kept. */
export async function generateStaticParams() {
  return (await publishedPosts()).map((post) => ({ slug: post.slug }))
}

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
      <article className="container-page pbs-[calc(var(--header-height)+1.5rem)] pbe-20 md:pbs-[calc(var(--header-height)+2.5rem)] md:pbe-28">
        <div className="mx-auto max-w-[46rem]">
          <nav aria-label={t("breadcrumb")}>
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              <li>
                <Link href="/blog" className="hover:text-foreground">
                  {t("blog")}
                </Link>
              </li>
              <li className="flex min-w-0 items-center gap-1">
                <IconChevronRight aria-hidden size={14} stroke={1.75} />
                <span aria-current="page" className="truncate text-foreground">
                  {post.title}
                </span>
              </li>
            </ol>
          </nav>

          <h1
            lang={lang}
            className="mbs-8 font-display text-[clamp(2rem,1.4rem+2.8vw,3.5rem)] leading-[1.06] font-semibold tracking-[-0.035em] text-balance"
          >
            {post.title}
          </h1>
          {post.publishedAt ? (
            <p className="mbs-5 text-sm text-muted-foreground">
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
              className="mbs-6 border-s-4 border-primary ps-5 text-xl text-pretty text-muted-foreground"
            >
              {post.excerpt}
            </p>
          ) : null}

          <div lang={lang} className="mbs-12">
            <MarkdownBody>{post.body}</MarkdownBody>
          </div>
        </div>
      </article>
    </main>
  )
}
