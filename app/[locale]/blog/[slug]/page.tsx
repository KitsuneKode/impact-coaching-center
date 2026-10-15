import { getTranslations, setRequestLocale } from "next-intl/server"
import { IconChevronRight, IconClock } from "@tabler/icons-react"
import Image from "next/image"
import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"

import { PostContents } from "@/components/blog/post-contents"
import { MarkdownBody } from "@/components/marketing/markdown-body"
import { headingsOf, readingMinutes } from "@/lib/article"
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
      ...openGraphFor(path, post.title, post.excerpt, locale),
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
  const headings = headingsOf(post.body)

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
    ...(post.cover ? { image: [post.cover.url] } : {}),
    wordCount: post.body.split(/\s+/).filter(Boolean).length,
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

  const base = `${siteUrl}${locale === "en" ? "" : `/${locale}`}`
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: brand.legalName,
        item: `${base}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("blog"),
        item: `${base}/blog`,
      },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([jsonLd, breadcrumbs]).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />
      <article
        data-post
        className="container-page pbs-[calc(var(--header-height)+1.5rem)] pbe-20 md:pbs-[calc(var(--header-height)+2.5rem)] md:pbe-28"
      >
        {/* How far through the post: a scroll-driven bar, no JavaScript. */}
        <div aria-hidden data-read-progress />
        <div className="mx-auto grid max-w-[46rem] xl:max-w-none xl:grid-cols-[minmax(0,1fr)_46rem_minmax(0,1fr)] xl:gap-12">
          <div className="min-w-0 xl:col-start-2">
            <nav aria-label={t("breadcrumb")}>
              <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                <li>
                  <Link href="/blog" className="hover:text-foreground">
                    {t("blog")}
                  </Link>
                </li>
                <li className="flex min-w-0 items-center gap-1">
                  <IconChevronRight aria-hidden size={14} stroke={1.75} />
                  <span
                    aria-current="page"
                    className="truncate text-foreground"
                  >
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
            <p className="mbs-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {post.publishedAt ? (
                <span>
                  {tb.rich("published", {
                    date: readableDate(post.publishedAt, locale),
                    time: (chunks) => (
                      <time
                        dateTime={new Date(post.publishedAt!).toISOString()}
                      >
                        {chunks}
                      </time>
                    ),
                  })}
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <IconClock aria-hidden size={15} stroke={1.75} />
                {tb("readTime", { minutes: readingMinutes(post.body) })}
              </span>
            </p>
            {post.excerpt ? (
              <p
                lang={lang}
                className="mbs-6 border-s-4 border-primary ps-5 text-xl text-pretty text-muted-foreground"
              >
                {post.excerpt}
              </p>
            ) : null}

            {post.cover ? (
              <div
                data-frame
                className="relative mbs-10 aspect-[16/9] overflow-clip rounded-[24px] bg-secondary"
              >
                <Image
                  src={post.cover.url}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 768px) 46rem, 100vw"
                  placeholder={post.cover.blurDataUrl ? "blur" : "empty"}
                  blurDataURL={post.cover.blurDataUrl}
                  className="object-cover"
                />
              </div>
            ) : null}

            {headings.length > 2 ? (
              <div className="mbs-10 xl:hidden">
                <PostContents headings={headings} variant="fold" />
              </div>
            ) : null}

            <div lang={lang} className="mbs-12">
              <MarkdownBody headings={headings}>{post.body}</MarkdownBody>
            </div>
          </div>
          {headings.length > 2 ? (
            <aside className="hidden xl:col-start-3 xl:block">
              <div className="sticky inset-bs-[calc(var(--header-height)+2rem)]">
                <PostContents headings={headings} variant="rail" />
              </div>
            </aside>
          ) : null}
        </div>
      </article>
    </main>
  )
}
