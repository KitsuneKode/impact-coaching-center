import { getTranslations, setRequestLocale } from "next-intl/server"
import { IconArrowRight, IconNews } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import { Link } from "@/i18n/navigation"

import { StatePanel } from "@/components/ui/page-shell"
import { Reveal } from "@/components/motion/reveal"
import { PageHead } from "@/components/site/page-head"
import { ownLanguageFirst } from "@/lib/blog"
import { publishedPosts } from "@/lib/catalog-server"
import { alternatesFor, openGraphFor } from "@/lib/site"

/* Catalogue data refreshes when it changes (lib/catalog-server.ts); the
   page is static and rebuilt in the background on the same beat. */
export const revalidate = 3600

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

  const nav = await getTranslations("Nav")
  const [lead, ...rest] = posts

  const meta = (post: (typeof posts)[number]) => (
    <>
      {post.publishedAt ? (
        <time dateTime={new Date(post.publishedAt).toISOString()}>
          {readableDate(post.publishedAt, locale)}
        </time>
      ) : null}
      {(post.language ?? "en") !== locale ? (
        <span lang={locale}>
          {post.publishedAt ? " · " : null}
          {post.language === "as" ? t("inAssamese") : t("inEnglish")}
        </span>
      ) : null}
    </>
  )

  return (
    <main>
      <PageHead
        trail={[{ label: nav("blog") }]}
        title={t("heading")}
        lede={t("lede")}
      />

      <section className="container-page pbe-20 md:pbe-28">
        {lead ? (
          <>
            <Reveal>
              <Link
                href={`/blog/${lead.slug}`}
                lang={lead.language === "as" ? "as" : "en"}
                data-row-card
                data-calendar-card
                className="grid gap-6 p-7 md:p-12 lg:grid-cols-12 lg:items-end"
              >
                <span className="lg:col-span-8">
                  <span className="block text-sm text-on-primary">
                    {meta(lead)}
                  </span>
                  <span className="mbs-4 block font-display text-[clamp(1.75rem,1.2rem+2.4vw,3rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance">
                    {lead.title}
                  </span>
                  {lead.excerpt ? (
                    <span className="mbs-4 block max-w-[60ch] text-lg text-on-primary">
                      {lead.excerpt}
                    </span>
                  ) : null}
                </span>
                <span
                  lang={locale}
                  className="flex items-center gap-3 font-semibold lg:col-span-4 lg:justify-end"
                >
                  {t("read")}
                  <span
                    data-row-go
                    className="grid size-11 place-items-center rounded-full"
                  >
                    <IconArrowRight aria-hidden size={18} stroke={2} />
                  </span>
                </span>
              </Link>
            </Reveal>
            {rest.length ? (
              <ul className="mbs-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-4">
                {rest.map((post, i) => (
                  <li
                    key={post.slug}
                    lang={post.language === "as" ? "as" : "en"}
                  >
                    <Reveal delay={(i % 3) * 0.05} className="h-full">
                      <Link
                        href={`/blog/${post.slug}`}
                        data-row-card
                        className="flex h-full min-h-56 flex-col gap-3 overflow-clip p-7"
                      >
                        {post.cover ? (
                          <span className="relative -mx-7 mbe-2 -mt-7 block aspect-[16/9] bg-secondary">
                            <Image
                              src={post.cover.url}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
                              placeholder={
                                post.cover.blurDataUrl ? "blur" : "empty"
                              }
                              blurDataURL={post.cover.blurDataUrl}
                              className="object-cover"
                            />
                          </span>
                        ) : null}
                        <span className="text-xs text-muted-foreground">
                          {meta(post)}
                        </span>
                        <span className="font-display text-xl leading-snug font-semibold text-balance">
                          {post.title}
                        </span>
                        {post.excerpt ? (
                          <span className="line-clamp-3 text-sm text-muted-foreground">
                            {post.excerpt}
                          </span>
                        ) : null}
                        <span
                          lang={locale}
                          className="mbs-auto flex items-center justify-between gap-3 pbs-3 text-sm font-semibold"
                        >
                          {t("read")}
                          <span
                            data-row-go
                            className="grid size-10 place-items-center rounded-full"
                          >
                            <IconArrowRight aria-hidden size={16} stroke={2} />
                          </span>
                        </span>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <StatePanel
            icon={<IconNews stroke={1.75} />}
            title={t("empty")}
            description={t("emptyNote")}
          />
        )}
      </section>
    </main>
  )
}
