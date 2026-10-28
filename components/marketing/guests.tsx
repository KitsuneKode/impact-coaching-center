import { IconPlayerPlayFilled } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { guestSessions, thumb } from "@/lib/stories"

/**
 * Bijoyee Bartalaap: serving officers who came to talk to ICT students.
 * Guests, never presented as ICT's results.
 */
export function Guests() {
  const t = useTranslations("Stories")
  return (
    <section
      id="guests"
      aria-labelledby="guests-heading"
      className="container-page pbe-20 md:pbe-28"
    >
      <Reveal>
        <p className="text-sm font-semibold text-primary">Bijoyee Bartalaap</p>
        <h2 id="guests-heading" className="type-display mbs-2 max-w-[20ch]">
          {t("guestsClaim")}
        </h2>
        <p className="mbs-3 max-w-[52ch] text-lg text-muted-foreground">
          {t("guestsRest")}
        </p>
      </Reveal>
      <ul className="mbs-10 grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-4">
        {guestSessions.map((guest, i) => (
          <li key={guest.id} data-row-card>
            <Reveal delay={(i % 3) * 0.05} className="h-full">
              <VideoDialog
                id={guest.id}
                title={`${guest.name}, ${guest.role}`}
                subtitle={t("guestsSubtitle")}
                className="group flex h-full w-full flex-col rounded-[inherit] p-3 text-start"
              >
                <span className="relative block aspect-video overflow-clip rounded-[20px] bg-secondary">
                  <Image
                    src={thumb(guest.id)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span
                      data-play
                      className="grid size-12 place-items-center rounded-full bg-highlight text-ink"
                    >
                      <IconPlayerPlayFilled
                        aria-hidden
                        size={18}
                        className="translate-x-px"
                      />
                    </span>
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-3 pbs-4">
                  <span className="block font-semibold">{guest.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {guest.role}
                  </span>
                  <span className="mbs-0.5 block text-sm text-muted-foreground">
                    {guest.detail}
                  </span>
                </span>
              </VideoDialog>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
