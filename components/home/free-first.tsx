import { IconBrandYoutube, IconMicrophone2 } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"

import { Reveal } from "@/components/motion/reveal"
import { useContent } from "@/i18n/content"
import { Link } from "@/i18n/navigation"
import { links, proof, tracks } from "@/lib/brand"
import type { Resource } from "@/lib/catalog"
import { lineup, type Course } from "@/lib/courses"
import { podcast } from "@/lib/stories"
import { Folder } from "./folder"

const external = { target: "_blank", rel: "noreferrer noopener" } as const

/** Free study material, free workshops and ICT's channels. */
export function FreeFirst({
  resources,
  courses,
}: {
  resources: readonly Resource[]
  courses: readonly Course[]
}) {
  const t = useTranslations("Pulse")
  const { phrase } = useContent()
  const folders = [...Map.groupBy(resources, (r) => r.kind)].map(
    ([kind, items]) => ({ kind, count: items.length })
  )
  const samples = resources.length > 0 && resources.every((r) => r.sample)
  const workshops = tracks.flatMap((track) => {
    const free = lineup(courses, track.exam).free
    return free ? [free] : []
  })
  const hours = proof.find((p) => p.label.includes("hours"))

  return (
    <section
      id="free"
      aria-labelledby="free-heading"
      className="pbs-20 pbe-20 md:pbs-28 md:pbe-28"
    >
      <div className="container-page">
        <Reveal>
          <h2 id="free-heading" className="type-display max-w-[18ch]">
            {t("freeHeading")}
          </h2>
        </Reveal>
        <div className="mbs-12 grid gap-4 md:grid-cols-3">
          <Reveal className="md:col-span-2 md:row-span-2">
            <div className="h-full rounded-[28px] bg-card p-7 shadow-[0_0_0_1px_var(--border)] md:p-9">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">
                  {t("freeMaterial")}
                </h3>
                <Link
                  href="/resources"
                  className="text-sm font-semibold text-primary"
                >
                  {t("openLibrary")}
                </Link>
              </div>
              {samples ? (
                <p className="mbs-2 text-sm text-muted-foreground">
                  {t("sampleTitles")}
                </p>
              ) : null}
              {folders.length ? (
                <>
                  <ul
                    data-folders={folders.length}
                    className="mbs-6 grid grid-cols-2 gap-x-3 gap-y-5"
                  >
                    {folders.map((folder) => (
                      <li key={folder.kind}>
                        <Link
                          data-folder-open
                          href={`/resources?kind=${encodeURIComponent(folder.kind)}`}
                          aria-label={t("folderLabel", {
                            name: phrase(folder.kind),
                            count: folder.count,
                          })}
                          className="block rounded-[14px]"
                        >
                          <Folder
                            name={phrase(folder.kind)}
                            count={folder.count}
                            label={t("folderFiles", { count: folder.count })}
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="mbs-6 text-sm text-muted-foreground">
                    {t("loginOnce")}
                  </p>
                </>
              ) : null}
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="h-full rounded-[28px] bg-ink p-7 text-white">
              <h3 className="font-display text-lg font-semibold">
                {t("workshops")}
              </h3>
              <ul className="mbs-5 grid gap-4">
                {workshops.map((course) => (
                  <li key={course.id}>
                    <Link
                      href={`/courses/${course.slug}`}
                      data-workshop
                      className="flex items-center gap-4"
                    >
                      {course.cover ? (
                        <span
                          data-frame
                          className="relative aspect-[4/3] w-20 flex-none overflow-clip rounded-xl"
                        >
                          <Image
                            src={course.cover}
                            alt={t("poster", { name: course.short })}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </span>
                      ) : null}
                      <span className="min-w-0">
                        <span
                          data-workshop-name
                          className="block font-semibold"
                        >
                          {course.short}
                        </span>
                        <span className="line-clamp-2 text-sm text-on-primary/80">
                          {phrase(course.subtitle)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="grid h-full gap-4">
              <a
                href={links.youtube}
                {...external}
                data-channel
                className="flex items-center justify-between gap-4 rounded-[28px] bg-primary p-7 text-white"
              >
                <span>
                  <span className="tnum block font-display text-3xl font-semibold">
                    {hours?.display}
                  </span>
                  <span className="text-sm text-on-primary">
                    {t("youtubeHours")}
                  </span>
                </span>
                <IconBrandYoutube
                  aria-hidden
                  size={30}
                  stroke={1.5}
                  data-channel-icon
                />
              </a>
              <a
                href={`https://www.youtube.com/watch?v=${podcast.episodes[0]!.id}`}
                {...external}
                data-channel
                className="flex items-center justify-between gap-4 rounded-[28px] bg-card p-7 shadow-[0_0_0_1px_var(--border)]"
              >
                <span>
                  <span className="block font-semibold">
                    {t("podcast", { name: podcast.name })}
                  </span>
                  <span className="tnum text-sm text-muted-foreground">
                    {t("views", {
                      count: podcast.seriesViews.toLocaleString("en-IN"),
                    })}
                  </span>
                </span>
                <IconMicrophone2
                  aria-hidden
                  size={28}
                  stroke={1.5}
                  data-channel-icon
                  className="text-primary"
                />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
