import { IconArrowRight, IconMapPin } from "@tabler/icons-react"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { CampusTour, type TourShot } from "@/components/campus/campus-tour"
import { CentreFinder } from "@/components/marketing/centre-finder"
import { Reveal } from "@/components/motion/reveal"
import { PageHead } from "@/components/site/page-head"
import { place } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { alternatesFor, openGraphFor } from "@/lib/site"
import { campus, guestSessions, thumb } from "@/lib/stories"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/campus">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Campus" })
  const title = t("title")
  const description = t("description")
  return {
    title,
    description,
    alternates: alternatesFor("/campus", locale),
    openGraph: openGraphFor("/campus", title, description, locale),
  }
}

/**
 * The tour: every photograph and video ICT has of the centre, the map,
 * and the one step that beats any tour, sitting a free class.
 */
export default async function CampusPage({
  params,
}: PageProps<"/[locale]/campus">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Campus")
  const pulse = await getTranslations("Pulse")

  // The centre's own shorts first, then officers' sessions held there.
  const shots: TourShot[] = [
    ...campus.map((photo, i) => ({
      src: photo.src,
      alt: photo.alt,
      caption: pulse(`centreCaption${i + 1}` as "centreCaption1"),
      video: photo.video,
      vertical: true,
    })),
    ...guestSessions.map((guest) => ({
      src: thumb(guest.id),
      alt: t("guestAlt", { name: guest.name, role: guest.role }),
      caption: t("guestCaption", { name: guest.name, role: guest.role }),
      video: guest.id,
      vertical: false,
    })),
  ]

  return (
    <main>
      <PageHead
        trail={[{ label: t("crumb") }]}
        title={t("heading")}
        lede={t("lede")}
      />

      <section
        aria-label={t("photos")}
        className="container-page pbe-20 md:pbe-28"
      >
        <CampusTour shots={shots} />
      </section>

      <section
        aria-labelledby="visit-heading"
        className="container-page pbe-20 md:pbe-28"
      >
        <Reveal className="grid gap-6 rounded-[32px] bg-primary p-8 text-white md:grid-cols-[1fr_auto] md:items-end md:p-12">
          <div className="grid gap-3">
            <h2
              id="visit-heading"
              className="type-display-sm text-balance text-white"
            >
              {t("visitHeading")}
            </h2>
            <p className="max-w-[52ch] text-pretty text-on-primary">
              {t("visitBody", { place: place.spoken })}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={contactHref({ kind: "workshop" })}
              target="_blank"
              rel="noreferrer noopener"
              data-press
              data-cta="amber"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
            >
              {t("visitCta")}
              <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
            </a>
            <a
              href={place.maps}
              target="_blank"
              rel="noreferrer noopener"
              data-press
              data-cta="ghost-blue"
              className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold text-white"
            >
              <IconMapPin aria-hidden size={18} stroke={1.75} />
              {pulse("directions")}
            </a>
          </div>
        </Reveal>
      </section>

      <section
        aria-labelledby="find-heading"
        className="container-page pbe-20 md:pbe-28"
      >
        <Reveal>
          <h2 id="find-heading" className="type-display">
            {pulse("centresHeading")}
          </h2>
        </Reveal>
        <div className="mbs-8">
          <CentreFinder />
        </div>
      </section>
    </main>
  )
}
