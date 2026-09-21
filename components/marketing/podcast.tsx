import { IconMicrophone, IconPlayerPlayFilled } from "@tabler/icons-react"
import Image from "next/image"

import { AnimatedNumber } from "@/components/motion-primitives/animated-number"
import { Reveal } from "@/components/motion/reveal"
import { Lede, Section } from "@/components/ui/section"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { links } from "@/lib/brand"
import { podcast, thumb } from "@/lib/stories"

function views(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`
}

/**
 * Axom Dhwani, ICT's podcast.
 *
 * Worth its own section because it is the most watched thing the institute
 * makes, ahead of every lecture, and because it is the part of ICT that speaks
 * to Assam rather than only to aspirants. For a parent deciding where to send
 * their child, an institute with a public voice reads differently from one
 * with a price list.
 */
export function Podcast() {
  const [lead, ...rest] = podcast.episodes

  return (
    <Section id="podcast">
      <Reveal>
        <Lede
          label="Axom Dhwani"
          claim="ICT also makes a podcast about Assam."
          rest={`Hosted by ${podcast.hosts}, on history, cinema, geopolitics and the people of the state. Episodes have been watched more than a lakh and a half times.`}
          link={{ href: links.youtube, label: "All episodes", external: true }}
        />
      </Reveal>

      {/* grid-cols-1 is minmax(0,1fr): without it the single mobile column
          grows to fit the longest truncated title and widens the whole page */}
      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Reveal className="min-w-0">
          <VideoDialog
            id={lead.id}
            title={lead.title}
            subtitle={lead.guest}
            className="w-full overflow-hidden rounded-card border border-border bg-card shadow-frame transition-shadow hover:shadow-lift"
          >
            <span className="relative block aspect-video bg-surface">
              <Image
                src={thumb(lead.id)}
                alt={lead.title}
                fill
                sizes="(max-width: 1024px) 92vw, 55vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid size-14 place-items-center rounded-full bg-white/95 text-foreground shadow-lift transition-transform duration-300 group-hover:scale-105">
                  <IconPlayerPlayFilled className="size-5" />
                </span>
              </span>
            </span>
            <span className="flex items-end justify-between gap-4 p-5">
              <span>
                <span className="block text-[1.0625rem] font-medium">
                  {lead.title}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {lead.guest}
                </span>
              </span>
              <span className="tnum shrink-0 text-sm text-muted-foreground">
                {views(lead.views)} views
              </span>
            </span>
          </VideoDialog>
        </Reveal>

        <Reveal delay={0.08} className="flex min-w-0 flex-col gap-3">
          <div className="rounded-card bg-surface p-6">
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <IconMicrophone size={16} stroke={1.75} />
              Across the series
            </p>
            <p className="mt-2 text-[2.25rem] leading-none font-medium tracking-[-0.03em]">
              <AnimatedNumber value={podcast.seriesViews} />
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              views on the ICT channel, more than any of its lectures.
            </p>
          </div>

          <ul className="flex flex-col gap-px overflow-hidden rounded-card border border-border bg-border">
            {rest.slice(0, 4).map((episode) => (
              <li key={episode.id} className="bg-card">
                <VideoDialog
                  id={episode.id}
                  title={episode.title}
                  subtitle={episode.guest}
                  className="flex w-full items-center gap-3 p-3 transition-colors hover:bg-secondary"
                >
                  <span className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-md bg-surface">
                    <Image
                      src={thumb(episode.id)}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover grayscale-[0.8] transition-[filter] duration-500 group-hover:grayscale-0"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {episode.title}
                    </span>
                    <span className="tnum block text-xs text-muted-foreground">
                      {views(episode.views)} views
                    </span>
                  </span>
                  <IconPlayerPlayFilled
                    size={13}
                    className="shrink-0 text-muted-foreground transition-transform group-hover:scale-110"
                  />
                </VideoDialog>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  )
}
