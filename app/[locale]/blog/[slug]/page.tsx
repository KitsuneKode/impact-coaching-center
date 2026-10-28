import { getTranslations, setRequestLocale } from "next-intl/server"
import {
  IconArrowRight,
  IconArrowUp,
  IconChevronRight,
  IconClock,
} from "@tabler/icons-react"
import Image from "next/image"
import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"

import { PostContents } from "@/components/blog/post-contents"
import { PostShare } from "@/components/blog/post-share"
import { MarkdownBody } from "@/components/marketing/markdown-body"
import { ReadCounter } from "@/components/blog/read-counter"
import { PostNextStep } from "@/components/blog/post-next-step"
import { PageExam } from "@/components/site/page-exam"
import { ownLanguageFirst, READS_FROM } from "@/lib/blog"
import { headingsOf, readingMinutes } from "@/lib/article"
import { brand } from "@/lib/brand"
import { publishedPost } from "@/lib/catalog-server"
import { publishedPosts } from "@/lib/catalog-server"
import { alternatesFor, localePath, openGraphFor, siteUrl } from "@/lib/site"

/* Catalogue data refreshes when it changes (lib/catalog-server.ts); the
   page is static and rebuilt in the background on the same beat. */
export const revalidate = 3600

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
      // English posts: the generated title card (./opengraph-image.tsx).
      // Assamese ones keep the photo card; the card cannot shape Assamese.
      ...openGraphFor(
        path,
        post.title,
        post.excerpt,
        locale,
        post.language === "as"
          ? undefined
          : {
              url: `${localePath(path, locale)}/opengraph-image`,
              alt: post.title,
            }
      ),
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
  const [post, posts] = await Promise.all([
    publishedPost(slug),
    publishedPosts(),
  ])
  if (!post) notFound()
  const lang = post.language === "as" ? "as" : "en"
  // Three more to read next: the same exam first, then its own language.
  const more = ownLanguageFirst(
    posts.filter((other) => other.slug !== post.slug),
    lang
  )
    .toSorted(
      (a, b) =>
        Number(b.exam !== undefined && b.exam === post.exam) -
        Number(a.exam !== undefined && a.exam === post.exam)
    )
    .slice(0, 3)
  // Pictures only when every card has one, so the row stays level.
  const covers = more.every((other) => other.cover)
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
    ...(post.exam ? { about: { "@type": "Thing", name: post.exam } } : {}),
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
  const url = `${base}/blog/${post.slug}`
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
      <PageExam exam={post.exam} />
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
        id="post-top"
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
              {(post.reads ?? 0) >= READS_FROM ? (
                <span>
                  {tb("reads", {
                    count: new Intl.NumberFormat(
                      locale === "as" ? "as-IN" : "en-IN",
                      { notation: "compact" }
                    ).format(post.reads ?? 0),
                  })}
                </span>
              ) : null}
            </p>
            <ReadCounter slug={post.slug} />
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

            <div className="mbs-14">
              <PostNextStep exam={post.exam} locale={locale} />
            </div>

            {/* The end of the post: pass it on, or go back up. */}
            <footer className="mbs-12 grid justify-items-start gap-4 border-bs border-border pbs-8">
              <p className="text-sm font-semibold">{tb("shareLabel")}</p>
              <PostShare title={post.title} url={url} />
              <a
                href="#post-top"
                className="mbs-2 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <IconArrowUp aria-hidden size={16} stroke={1.75} />
                {tb("backToTop")}
              </a>
            </footer>
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

      {more.length ? (
        <section
          aria-labelledby="keep-reading"
          className="container-page pbe-20 md:pbe-28"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="keep-reading" className="type-display-sm">
              {tb("keepReading")}
            </h2>
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary"
            >
              {tb("allPosts")}
              <IconArrowRight aria-hidden size={16} stroke={2} />
            </Link>
          </div>
          <ul className="mbs-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((other) => (
              <li key={other.slug} className="flex">
                <Link
                  href={`/blog/${other.slug}`}
                  lang={other.language === "as" ? "as" : "en"}
                  data-row-card
                  className="flex flex-1 flex-col gap-3 overflow-clip p-6"
                >
                  {covers && other.cover ? (
                    <span className="relative -mx-6 mbe-1 -mt-6 block aspect-[16/9] bg-secondary">
                      <Image
                        src={other.cover.url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
                        placeholder={other.cover.blurDataUrl ? "blur" : "empty"}
                        blurDataURL={other.cover.blurDataUrl}
                        className="object-cover"
                      />
                    </span>
                  ) : null}
                  {other.minutes ? (
                    <span
                      lang={locale}
                      className="text-xs text-muted-foreground"
                    >
                      {tb("readTime", { minutes: other.minutes })}
                    </span>
                  ) : null}
                  <span className="font-display text-lg leading-snug font-semibold text-balance">
                    {other.title}
                  </span>
                  {other.excerpt ? (
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {other.excerpt}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
