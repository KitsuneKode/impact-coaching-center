import {
  IconArrowRight,
  IconBrandYoutube,
  IconFileText,
  IconPlus,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Suspense } from "react"

import { NotesBrowser } from "@/components/commerce/notes-browser"
import { PaperBooks, type PaperSet } from "@/components/commerce/paper-books"
import { SampleNotice } from "@/components/commerce/shop-shell"
import { Reveal } from "@/components/motion/reveal"
import { PageHead } from "@/components/site/page-head"
import { StatePanel } from "@/components/ui/page-shell"
import { contentFor } from "@/i18n/content-server"
import { Link } from "@/i18n/navigation"
import { links } from "@/lib/brand"
import { inLanguage, type Language, lowestPrice } from "@/lib/catalog"
import {
  onlySamples,
  publishedBundles,
  publishedResources,
} from "@/lib/catalog-server"
import { liveCourses } from "@/lib/courses-server"
import { alternatesFor, openGraphFor } from "@/lib/site"

/* Catalogue data refreshes when it changes (lib/catalog-server.ts); the
   page is static and rebuilt in the background on the same beat. */
export const revalidate = 3600

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
  const [resources, courses, bundles] = await Promise.all([
    publishedResources(),
    liveCourses(),
    publishedBundles(),
  ])
  const t = await getTranslations("ResourcesPage")
  const shop = await getTranslations("Shop")
  const pulse = await getTranslations("Pulse")
  const nav = await getTranslations("Nav")
  const { phrase } = await contentFor(locale)
  const free = courses.filter((course) => course.free && course.track)
  // The printed sets the question-paper folders point to: on sale only.
  const language = locale as Language
  const paperSets: PaperSet[] = bundles
    .filter((bundle) => !bundle.sample)
    .map((bundle) => {
      const editions = bundle.books.map(
        (book) =>
          book.editions[language] ?? book.editions.en ?? book.editions.as
      )
      const lead = editions[0]
      return {
        slug: bundle.slug,
        exam: bundle.exam,
        examLabel: phrase(bundle.exam),
        title: inLanguage(bundle.title, language),
        books: bundle.books.length,
        pricePaise: lowestPrice(bundle),
        papers: bundle.books.some((book) =>
          /paper/i.test(book.editions.en?.title ?? "")
        ),
        cover: {
          title: lead?.title ?? inLanguage(bundle.title, language),
          subtitle: lead?.subtitle,
          picture: lead?.cover ?? null,
        },
      }
    })

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
          <>
            <NotesBrowser resources={resources} />
            {paperSets.length ? (
              <Suspense>
                <PaperBooks sets={paperSets} />
              </Suspense>
            ) : null}
          </>
        ) : (
          <StatePanel
            icon={<IconFileText stroke={1.75} />}
            title={t("empty")}
            description={t("emptyNote")}
          />
        )}
      </section>

      {resources.length ? (
        /*
         * Every file as a plain link, rendered on the server: the folder
         * browser above runs in the browser, so this is what search engines
         * follow to each note's own page.
         */
        <section aria-labelledby="every-file" className="container-page pbe-20">
          <h2 id="every-file" className="type-display-sm">
            {t("everyFile")}
          </h2>
          <p className="mbs-2 text-muted-foreground">{t("everyFileNote")}</p>
          {/* One closed list per exam: every link is in the page for
              search engines, without a wall of hundreds for people. */}
          <div data-every-file className="mbs-8 max-w-3xl">
            {[...Map.groupBy(resources, (r) => r.exam)].map(([exam, files]) => (
              <details key={exam} data-faq>
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-4 font-semibold">
                  <span>
                    {phrase(exam)}
                    <span className="tnum ms-2 text-sm font-normal text-muted-foreground">
                      {shop("everyFileCount", { count: files.length })}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    data-faq-icon
                    className="grid size-8 flex-none place-items-center rounded-full"
                  >
                    <IconPlus size={16} stroke={2} />
                  </span>
                </summary>
                <ul className="grid gap-x-8 pbe-5 sm:grid-cols-2">
                  {files.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/resources/${r.slug}`}
                        lang={r.language === "as" ? "as-IN" : undefined}
                        className="block py-1.5 text-pretty text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {r.title}
                        <span className="text-xs"> · {phrase(r.kind)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>
      ) : null}

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
