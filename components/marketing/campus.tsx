import { IconPlayerPlayFilled } from "@tabler/icons-react"
import Image from "next/image"

import { Reveal } from "@/components/motion/reveal"
import { Lede, Section } from "@/components/ui/section"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { place } from "@/lib/brand"
import { campus } from "@/lib/stories"

/**
 * The actual room, from ICT's own videos.
 *
 * A coaching centre is a place people walk into, and until now this site had
 * no picture of it. These are frames from ICT's own clips of mock tests and
 * guest sessions, kept in colour: the point is that they are unstaged.
 *
 * Deliberately asymmetric, so a grid of six photos does not read as a stock
 * gallery. Each opens the clip it came from.
 */
export function Campus() {
  const [lead, ...rest] = campus

  return (
    <Section id="campus">
      <Reveal>
        <Lede
          label="The centre"
          claim={`${place.spoken}, on an ordinary week.`}
          rest="Not stock photography. These are frames from ICT's own clips of mock tests, classes and guest sessions."
        />
      </Reveal>

      <div className="mt-10 grid gap-3 md:grid-cols-3 md:gap-4">
        <Reveal className="md:col-span-2">
          <Figure item={lead} className="aspect-[16/10]" priority />
        </Reveal>
        <Reveal delay={0.06}>
          <Figure item={rest[0]} className="h-full min-h-56" />
        </Reveal>
        {rest.slice(1).map((item, index) => (
          <Reveal key={item.src} delay={0.06 + index * 0.05}>
            <Figure item={item} className="aspect-[4/3]" />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

function Figure({
  item,
  className,
  priority,
}: {
  item: (typeof campus)[number]
  className?: string
  priority?: boolean
}) {
  return (
    <figure className="h-full">
      <VideoDialog
        id={item.video}
        title={item.caption}
        subtitle="At the ICT centre, North Lakhimpur"
        vertical
        className="h-full w-full"
      >
        <div
          className={`relative overflow-hidden rounded-card bg-surface ring-1 ring-border ${className ?? ""}`}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 92vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <span className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-white/90 text-foreground opacity-0 shadow-frame transition-opacity duration-300 group-hover:opacity-100">
            <IconPlayerPlayFilled size={14} />
          </span>
        </div>
        <figcaption className="mt-2.5 text-sm text-muted-foreground">{item.caption}</figcaption>
      </VideoDialog>
    </figure>
  )
}
