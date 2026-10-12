import {
  IconArrowRight,
  IconBrandYoutube,
  IconFileText,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Suspense } from "react"

import { NotesBrowser } from "@/components/commerce/notes-browser"
import { SampleNotice } from "@/components/commerce/shop-shell"
import { Reveal } from "@/components/motion/reveal"
import { PageHead } from "@/components/site/page-head"
import { StatePanel } from "@/components/ui/page-shell"
import { contentFor } from "@/i18n/content-server"
import { Link } from "@/i18n/navigation"
import { links } from "@/lib/brand"
import { onlySamples, publishedResources } from "@/lib/catalog-server"
import { liveCourses } from "@/lib/courses-server"
import { alternatesFor, openGraphFor } from "@/lib/site"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/resources">): Promise<Metadata> {
  const { locale } = await params
  const resources = await publishedResources()
  const t = await getTranslations({ locale, namespace: "ResourcesPage" })
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/resources", locale),
    openGraph: openGraphFor("/resources", t("title"), t("description"), locale),
    ...(onlySamples(resources)
      ? { robots: { index: false, follow: false } }
      : {}),
  }
}

/** Free notes in folders, then the rest of what ICT gives away. */
export default async function ResourcesPage({
  params,
}: PageProps<"/[locale]/resources">) {
  const { locale } = await params
  setRequestLocale(locale)
  const [resources, courses] = await Promise.all([
    publishedResources(),
    liveCourses(),
  ])
  const t = await getTranslations("ResourcesPage")
  const pulse = await getTranslations("Pulse")
  const nav = await getTranslations("Nav")
  const { phrase } = await contentFor(locale)
  const free = courses.filter((course) => course.free && course.track)

  return (
    <main>
      <PageHead
        trail={[{ label: nav("notes") }]}
        title={pulse("notesTitle")}
        lede={t("lede")}
      >
        {resources.length && onlySamples(resources) ? (
          <div className="mbs-6 max-w-xl">
            <SampleNotice>{t("sample")}</SampleNotice>
          </div>
        ) : null}
      </PageHead>

      <section aria-label={t("title")} className="container-page pbe-20">
        {resources.length ? (
          /* The browser reads the URL; this keeps the rest of the page static. */
          <Suspense fallback={<div className="min-h-96" />}>
            <NotesBrowser resources={resources} />
          </Suspense>
        ) : (
          <StatePanel
            icon={<IconFileText stroke={1.75} />}
            title={t("empty")}
            description={t("emptyNote")}
          />
        )}
      </section>

      <section
        aria-labelledby="also-free"
        className="container-page pbe-20 md:pbe-28"
      >
        <Reveal>
          <h2 id="also-free" className="type-display">
            {pulse("alsoFree")}
          </h2>
        </Reveal>
        <ul className="mbs-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {free.map((course, i) => (
            <li key={course.id}>
              <Reveal delay={i * 0.05} className="h-full">
                <Link
                  href={`/courses/${course.slug}`}
                  data-row-card
                  className="flex h-full flex-col overflow-clip p-3"
                >
                  {course.cover ? (
                    <span className="relative block aspect-[4/3] overflow-clip rounded-[20px] bg-secondary">
                      <Image
                        src={course.cover}
                        alt={pulse("poster", { name: course.short })}
                        fill
                        sizes="(min-width: 1024px) 24rem, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </span>
                  ) : null}
                  <span className="flex flex-1 items-end justify-between gap-4 p-3 pbs-4">
                    <span className="min-w-0">
                      <span className="block font-display text-xl font-semibold">
                        {course.short}
                      </span>
                      {course.subtitle ? (
                        <span className="mbs-1 block text-sm text-muted-foreground">
                          {phrase(course.subtitle)}
                        </span>
                      ) : null}
                      <span className="mbs-2 block text-sm font-semibold text-primary">
                        {pulse("freeCourse")}
                      </span>
                    </span>
                    <span
                      data-row-go
                      className="grid size-11 flex-none place-items-center rounded-full"
                    >
                      <IconArrowRight aria-hidden size={18} stroke={2} />
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
          <li>
            <Reveal delay={free.length * 0.05} className="h-full">
              <a
                href={links.youtube}
                target="_blank"
                rel="noreferrer noopener"
                data-row-card
                data-youtube-card
                className="flex h-full min-h-56 flex-col justify-between gap-8 p-7"
              >
                <IconBrandYoutube aria-hidden size={40} stroke={1.5} />
                <span>
                  <span className="block font-display text-2xl font-semibold text-balance">
                    {pulse("youtubeTitle")}
                  </span>
                  <span className="mbs-2 block">{pulse("youtubeBody")}</span>
                </span>
              </a>
            </Reveal>
          </li>
        </ul>
      </section>
    </main>
  )
}
