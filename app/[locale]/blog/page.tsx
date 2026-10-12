import { getTranslations, setRequestLocale } from "next-intl/server"
import { IconNews } from "@tabler/icons-react"
import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"

import { StatePanel } from "@/components/ui/page-shell"
import { Section } from "@/components/ui/section"
import { ownLanguageFirst } from "@/lib/blog"
import { publishedPosts } from "@/lib/catalog-server"
import { alternatesFor, openGraphFor } from "@/lib/site"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "BlogPage" })
  const title = t("title")
  const description = t("description")
  return {
    title,
    description,
    alternates: alternatesFor("/blog", locale),
    openGraph: openGraphFor("/blog", title, description, locale),
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

export default async function BlogPage({
  params,
}: PageProps<"/[locale]/blog">) {
  const { locale } = await params
  setRequestLocale(locale)
  const posts = ownLanguageFirst(await publishedPosts(), locale)
  const t = await getTranslations("BlogPage")

  return (
    <Section size="sm" className="pt-26 md:pt-30">
      <div className="grid gap-5">
        <h1 className="type-display max-w-[20ch]">{t("heading")}</h1>
        <p className="type-lede max-w-160 text-muted-foreground">{t("lede")}</p>
      </div>

      {posts.length === 0 ? (
        <StatePanel
          className="mt-14"
          icon={<IconNews stroke={1.75} />}
          title={t("empty")}
          description={t("emptyNote")}
        />
      ) : (
        <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug} lang={post.language === "as" ? "as" : "en"}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full min-h-44 flex-col gap-3 rounded-card border border-border bg-card p-7 shadow-frame transition-shadow hover:shadow-lift"
              >
                <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  {post.publishedAt ? (
                    <time dateTime={new Date(post.publishedAt).toISOString()}>
                      {readableDate(post.publishedAt, locale)}
                    </time>
                  ) : null}
                  {(post.language ?? "en") !== locale ? (
                    <span lang={locale}>
                      {post.publishedAt ? "· " : null}
                      {post.language === "as"
                        ? t("inAssamese")
                        : t("inEnglish")}
                    </span>
                  ) : null}
                </span>
                <span className="text-lg leading-snug font-bold text-foreground underline-offset-4 group-hover:underline">
                  {post.title}
                </span>
                {post.excerpt ? (
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </span>
                ) : null}
                <span
                  lang={locale}
                  className="mt-auto pt-2 text-sm font-bold text-foreground"
                >
                  {t("read")}
                  <span
                    aria-hidden
                    className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
