import {
  IconMapPin,
  IconPhone,
  IconPlayerPlayFilled,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { ButtonAnchor } from "@/components/ui/button"
import { contact, place } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { campus } from "@/lib/stories"

/**
 * The room a parent is sending their child into: six photographs of the
 * centre, each a frame from the ICT video it plays, beside the address and
 * the two ways to get there. Answers "can I see the place?" before it is asked.
 */
export function Centre() {
  const t = useTranslations("Pulse")
  const captions = [1, 2, 3, 4, 5, 6].map((n) =>
    t(`centreCaption${n}` as "centreCaption1")
  )

  return (
    <section aria-labelledby="centre-heading" className="pbe-20 md:pbe-28">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-end">
        <Reveal className="grid content-start gap-5 lg:col-span-4">
          <h2 id="centre-heading" className="type-display">
            {t("centreHeading")}
          </h2>
          <p className="text-pretty text-muted-foreground">{t("centreLede")}</p>
          <p className="flex items-start gap-2.5 text-pretty">
            <IconMapPin
              aria-hidden
              size={20}
              stroke={1.75}
              className="mbs-0.5 flex-none text-primary"
            />
            <span>
              {place.street}, {place.city} {place.pin}
            </span>
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonAnchor href={place.maps} target="_blank" size="md">
              <IconMapPin aria-hidden stroke={1.75} />
              {t("directions")}
            </ButtonAnchor>
            <ButtonAnchor
              href={contactHref({ kind: "call" })}
              variant="secondary"
              size="md"
            >
              <IconPhone aria-hidden stroke={1.75} />
              <span className="tnum">{t("callCentre")}</span>
            </ButtonAnchor>
          </div>
          <p className="sr-only">{contact.phones.join(", ")}</p>
        </Reveal>

        {/* A row that scrolls sideways on a phone and settles on each photo. */}
        <ul
          data-centre-row
          className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto lg:col-span-8"
        >
          {campus.map((photo, i) => (
            <li key={photo.src} className="w-44 flex-none snap-start sm:w-52">
              <VideoDialog
                id={photo.video}
                title={captions[i]!}
                vertical
                label={t("centreWatch", { caption: captions[i]! })}
                className="group/photo grid w-full gap-2.5 text-start"
              >
                <span className="relative block aspect-9/16 overflow-clip rounded-card bg-secondary">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 640px) 13rem, 11rem"
                    className="object-cover transition-[scale] duration-500 ease-out group-hover/photo:scale-[1.03]"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-s-3 inset-be-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm"
                  >
                    <IconPlayerPlayFilled size={14} />
                  </span>
                </span>
                <span className="text-sm text-pretty text-muted-foreground">
                  {captions[i]}
                </span>
              </VideoDialog>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
