import { IconPlayerPlayFilled } from "@tabler/icons-react"
import Image from "next/image"

import { Reveal } from "@/components/motion/reveal"
import { Lede, Section } from "@/components/ui/section"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { guestSessions, thumb } from "@/lib/stories"

/**
 * Bijoyee Bartalaap: serving officers who came to talk to ICT students.
 *
 * The wording here is load-bearing. ICT's own posters call each of them a
 * guest speaker, and this section says the same. They are people who sat with
 * students in that room, not results the institute produced, and a coaching
 * site that blurs the two has started lying.
 */
export function Guests() {
  return (
    <Section id="guests">
      <Reveal>
        <Lede
          label="Bijoyee Bartalaap"
          claim="Officers who have sat with ICT students."
          rest="A serving IPS, the Deputy Commissioner of Lakhimpur, and APSC officers have taken sessions here. They are guests of the institute, not its results."
        />
      </Reveal>

      <Reveal delay={0.08}>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guestSessions.map((guest) => (
            <li key={guest.id}>
              <VideoDialog
                id={guest.id}
                title={`${guest.name}, ${guest.role}`}
                subtitle="Bijoyee Bartalaap, a guest session at ICT"
                className="flex h-full w-full flex-col overflow-hidden rounded-card border border-border bg-card shadow-frame transition-shadow hover:shadow-lift"
              >
                <span className="relative block aspect-video bg-surface">
                  <Image
                    src={thumb(guest.id)}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 92vw, 31vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="block font-medium">{guest.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {guest.role}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {guest.detail}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm underline-offset-4 group-hover:underline">
                    Watch the session
                    <IconPlayerPlayFilled size={12} />
                  </span>
                </span>
              </VideoDialog>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
