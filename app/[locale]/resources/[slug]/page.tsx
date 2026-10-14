import { IconArrowRight, IconFileText } from "@tabler/icons-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PaperPage } from "@/components/commerce/paper-page"
import { PageHead } from "@/components/site/page-head"
import { contentFor } from "@/i18n/content-server"
import { Link } from "@/i18n/navigation"
import { brand, tracks } from "@/lib/brand"
import { publishedResource, publishedResources } from "@/lib/catalog-server"
import { lineup } from "@/lib/courses"
import { liveCourses } from "@/lib/courses-server"
import {
  alternatesFor,
  clipDescription,
  localePath,
  openGraphFor,
  siteUrl,
} from "@/lib/site"

/* Cached with the rest of the catalogue (lib/catalog-server.ts). */
export const revalidate = 300

export async function generateStaticParams() {
  return (await publishedResources()).map((resource) => ({
    slug: resource.slug,
  }))
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/resources/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params
  const resource = await publishedResource(slug)
  if (!resource) return { title: "Not found" }
  const t = await getTranslations({ locale, namespace: "ResourcesPage" })
  const { phrase } = await contentFor(locale)
  const title = t("noteTitle", {
    title: resource.title,
    kind: phrase(resource.kind).toLowerCase(),
    exam: phrase(resource.exam),
  })
  const description = clipDescription(
    t("noteDescription", { description: resource.description })
  )
  const path = `/resources/${resource.slug}`
  return {
    title,
    description,
    alternates: alternatesFor(path, locale),
    openGraph: openGraphFor(path, title, description, locale),
    ...(resource.sample ? { robots: { index: false, follow: true } } : {}),
  }
}

/**
 * One free note or paper on its own page, so search finds it by name: what
 * it is, a way to read it (the reader opens on /resources after log-in),
 * more for the same exam, and the course that prepares for that exam.
 */
export default async function ResourcePage({
  params,
}: PageProps<"/[locale]/resources/[slug]">) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const [resource, resources, courses] = await Promise.all([
    publishedResource(slug),
    publishedResources(),
    liveCourses(),
  ])
  if (!resource) notFound()
  const t = await getTranslations("ResourcesPage")
  const nav = await getTranslations("Nav")
  const { phrase } = await contentFor(locale)

  const exam = phrase(resource.exam)
  const related = resources
    .filter((r) => r.exam === resource.exam && r.slug !== resource.slug)
    .toSorted(
      (a, b) =>
        Number(b.kind === resource.kind) - Number(a.kind === resource.kind)
    )
    .slice(0, 6)
  const track = tracks.find((track) => track.exam === resource.exam)
  const course = track ? lineup(courses, track.exam).flagship : undefined
  const url = `${siteUrl}${localePath(`/resources/${resource.slug}`, locale)}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: resource.title,
    description: resource.description,
    url,
    learningResourceType: resource.kind,
    educationalUse: `Preparation for ${resource.exam}`,
    inLanguage: resource.language === "as" ? "as-IN" : "en-IN",
    isAccessibleForFree: true,
    ...(resource.pages ? { numberOfPages: resource.pages } : {}),
    provider: {
      "@type": "EducationalOrganization",
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
      <PageHead
        trail={[
          { label: nav("notes"), href: "/resources" },
          { label: resource.title },
        ]}
        title={
          <span lang={resource.language === "as" ? "as-IN" : undefined}>
            {resource.title}
          </span>
        }
        lede={resource.description || undefined}
      >
        <div className="mbs-8 flex flex-wrap items-center gap-4">
          <Link
            href={`/resources?open=${resource.slug}`}
            data-press
            data-cta="amber"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-highlight px-6 font-semibold text-foreground"
          >
            {t("read")}
            <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
          </Link>
          <p className="max-w-[44ch] text-sm text-muted-foreground">
            {t("readNote")}
          </p>
        </div>
      </PageHead>

      <section
        aria-label={t("facts")}
        className="container-page grid gap-10 pbe-20 lg:grid-cols-12 lg:items-start"
      >
        <div aria-hidden className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-[1/1.414] max-w-[min(20rem,calc(100%-1.5rem))]">
            <PaperPage
              running={resource.title}
              lines={10}
              className="absolute inset-0 translate-x-4 translate-y-4 -rotate-3 opacity-60"
            />
            <PaperPage
              running={resource.title}
              heading={resource.title}
              lines={16}
              className="absolute inset-0 rotate-1"
            />
          </div>
        </div>

        <div className="grid gap-10 lg:col-span-7">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [t("kind"), phrase(resource.kind)],
              [t("exam"), exam],
              [t("pages"), resource.pages ? String(resource.pages) : "—"],
              [
                t("language"),
                resource.language === "as" ? t("languageAs") : t("languageEn"),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[18px] bg-card p-4 shadow-[0_0_0_1px_var(--border)]"
              >
                <dt className="text-xs font-medium text-muted-foreground">
                  {label}
                </dt>
                <dd className="tnum mbs-1 font-semibold text-pretty">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {course ? (
            <Link
              href={`/courses/${course.slug}`}
              data-row-card
              className="flex items-center gap-4 p-5"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  {t("course", { exam })}
                </span>
                <span className="mbs-1 block text-sm text-muted-foreground">
                  {t("courseNote", { course: course.short })}
                </span>
              </span>
              <span
                data-row-go
                className="grid size-11 flex-none place-items-center rounded-full"
              >
                <IconArrowRight aria-hidden size={18} stroke={2} />
              </span>
            </Link>
          ) : null}

          {related.length ? (
            <div>
              <h2 className="type-label">{t("more", { exam })}</h2>
              <ul className="mbs-3 grid gap-2 sm:grid-cols-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/resources/${r.slug}`}
                      className="flex min-h-14 items-start gap-3 rounded-[16px] bg-card p-4 shadow-[0_0_0_1px_var(--border)]"
                    >
                      <IconFileText
                        aria-hidden
                        size={18}
                        stroke={1.75}
                        className="mbs-0.5 flex-none text-muted-foreground"
                      />
                      <span className="min-w-0">
                        <span
                          lang={r.language === "as" ? "as-IN" : undefined}
                          className="block font-medium text-pretty"
                        >
                          {r.title}
                        </span>
                        <span className="tnum block text-sm text-muted-foreground">
                          {phrase(r.kind)}
                          {r.pages ? ` · ${r.pages}` : ""}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/resources"
                className="mbs-4 inline-flex min-h-11 items-center gap-1.5 font-semibold underline decoration-foreground/25 underline-offset-4"
              >
                {t("allNotes")}
                <IconArrowRight aria-hidden size={16} stroke={2} />
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
