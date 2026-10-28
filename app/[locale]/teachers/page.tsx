import { IconArrowRight, IconPlayerPlayFilled } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { PageHead } from "@/components/site/page-head"
import { contentFor } from "@/i18n/content-server"
import { Link } from "@/i18n/navigation"
import { brand, faculty, tracks } from "@/lib/brand"
import { alternatesFor, openGraphFor, siteUrl } from "@/lib/site"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/teachers">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Teachers" })
  return {
    title: t("metaTitle"),
    description: t("description"),
    alternates: alternatesFor("/teachers", locale),
    openGraph: openGraphFor(
      "/teachers",
      t("metaTitle"),
      t("description"),
      locale
    ),
  }
}

/**
 * The teachers, one by one: what each teaches, for which exams, and a full
 * class of theirs on YouTube, so a student can judge before joining.
 */
export default async function TeachersPage({
  params,
}: PageProps<"/[locale]/teachers">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Teachers")
  const content = await contentFor(locale)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: faculty.map((teacher, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Person",
        name: teacher.name,
        jobTitle: "Teacher",
        knowsAbout: teacher.teaches,
        image: `${siteUrl}${teacher.portrait}`,
        worksFor: {
          "@type": "EducationalOrganization",
          name: brand.legalName,
          url: siteUrl,
        },
      },
    })),
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
        trail={[{ label: t("title") }]}
        title={t("title")}
        lede={t("lede")}
      />

      <ul className="container-page grid gap-6 pbe-20 md:pbe-28">
        {faculty.map((teacher, i) => {
          const exams = tracks.filter((track) =>
            (track.faculty as readonly string[]).includes(teacher.slug)
          )
          return (
            <li key={teacher.slug} id={teacher.slug} className="scroll-mt-28">
              <Reveal delay={(i % 3) * 0.05}>
                <article
                  data-row-card
                  className="grid gap-6 p-3 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-center md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,18rem)]"
                >
                  <span
                    data-frame
                    className="relative block aspect-[4/3] overflow-clip rounded-[20px] bg-primary sm:aspect-[4/5]"
                  >
                    <Image
                      src={teacher.portrait}
                      alt={`${teacher.name}, ${content.teaches(teacher.slug)}`}
                      fill
                      sizes="(min-width: 768px) 17rem, (min-width: 640px) 15rem, 100vw"
                      className="object-cover object-top"
                    />
                  </span>
                  <div className="min-w-0 ps-2 pe-2 sm:ps-0">
                    <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-balance">
                      {teacher.name}
                    </h2>
                    <p className="mbs-1 text-muted-foreground">
                      {teacher.called} · {content.teaches(teacher.slug)}
                    </p>
                    <p className="mbs-3 text-pretty">
                      {t(`notes.${teacher.slug}`)}
                    </p>
                    {exams.length ? (
                      <div className="mbs-5">
                        <h3 className="type-label">{t("for")}</h3>
                        <ul className="mbs-2 flex flex-wrap gap-2">
                          {exams.map((track) => (
                            <li key={track.slug}>
                              <Link
                                href={`/courses#${track.slug}`}
                                data-press
                                className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-secondary px-4 text-sm font-medium"
                              >
                                {content.track(track.slug).exam}
                                <IconArrowRight
                                  aria-hidden
                                  size={14}
                                  stroke={2}
                                />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                  <VideoDialog
                    id={teacher.lecture}
                    title={t("watch", { name: teacher.called })}
                    subtitle={content.teaches(teacher.slug)}
                    className="relative block aspect-video w-full overflow-clip rounded-[20px] sm:col-span-2 md:col-span-1"
                  >
                    <Image
                      src={`https://i.ytimg.com/vi/${teacher.lecture}/hqdefault.jpg`}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 18rem, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute inset-0 grid place-items-center bg-[color-mix(in_oklch,black_25%,transparent)]">
                      <span className="grid size-14 place-items-center rounded-full bg-white/95 text-ink shadow-lift">
                        <IconPlayerPlayFilled aria-hidden size={22} />
                      </span>
                    </span>
                    <span className="sr-only">
                      {t("watch", { name: teacher.called })}
                    </span>
                  </VideoDialog>
                </article>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
