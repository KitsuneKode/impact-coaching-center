import { IconCircleCheckFilled } from "@tabler/icons-react"
import Image from "next/image"

import { Reveal } from "@/components/motion/reveal"
import { Lede, Section } from "@/components/ui/section"
import { posters } from "@/lib/brand"

/**
 * ICT's own posters, as published.
 *
 * These are the institute's real result and admission cards, so they are shown
 * whole rather than rebuilt: a redrawn "topper card" is a design; the poster
 * the institute actually posted is evidence. They are loud by design, so each
 * one sits in a uniform frame on the recessed panel, which contains the noise
 * without dulling it.
 *
 * The section removes itself while there are no posters, so the page never
 * shows an empty shelf. See public/posters/README.md to add them.
 */
export function Posters() {
  if (posters.length === 0) return null

  return (
    <Section id="posters">
      <Reveal>
        <Lede
          label="From the notice board"
          claim="The posters ICT puts out, as published."
          rest="Results and admission cards straight from the institute, not redrawn here."
        />
      </Reveal>

      <Reveal delay={0.08} className="mt-10 rounded-card bg-surface p-4 md:p-6">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posters.map((poster) => (
            <li key={poster.src}>
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[0.75rem] bg-card ring-1 ring-border">
                  <Image
                    src={`/posters/${poster.src}`}
                    alt={poster.alt}
                    fill
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
                  {poster.verified ? (
                    <IconCircleCheckFilled
                      size={15}
                      aria-hidden
                      className="mt-0.5 shrink-0 text-verified"
                    />
                  ) : null}
                  {poster.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
