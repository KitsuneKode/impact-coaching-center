import { useContent } from "@/i18n/content"
import { useTranslations } from "next-intl"
import { IconPlayerPlayFilled } from "@tabler/icons-react"
import Image from "next/image"

import { Reveal } from "@/components/motion/reveal"
import { Lede, Section } from "@/components/ui/section"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { campus } from "@/lib/stories"

/** The actual room, from ICT's own videos. */
export function Campus() {
  const t = useTranslations("Campus")
  const content = useContent()
  const [lead, ...rest] = campus

  return (
    <Section id="campus">
      <Reveal>
        <Lede
          label={t("label")}
          claim={t("claim", { place: content.place })}
          rest={t("rest")}
        />
      </Reveal>

      <div className="mbs-10 grid gap-3 md:grid-cols-3 md:gap-4">
        <Reveal className="md:col-span-2">
          <Figure item={lead} className="aspect-[16/10]" priority />
        </Reveal>
        <Reveal delay={0.06}>
          <Figure item={rest[0]} className="min-h-56 flex-1" />
        </Reveal>
        {/* Three, not four: a full row, never an orphan on its own line. */}
        {rest.slice(1, 4).map((item, index) => (
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
  const subtitle = useTranslations("Campus")("subtitle")
  return (
    <figure className="flex h-full flex-col">
      <VideoDialog
        id={item.video}
        title={item.caption}
        subtitle={subtitle}
        vertical
        className="flex h-full w-full flex-col text-left"
      >
        <div
          className={`relative overflow-clip rounded-card bg-surface ring-1 ring-border ${className ?? ""}`}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 92vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <span className="absolute inset-e-3 inset-be-3 grid size-9 place-items-center rounded-full bg-white/90 text-foreground opacity-0 shadow-frame transition-opacity duration-300 group-hover:opacity-100">
            <IconPlayerPlayFilled size={14} />
          </span>
        </div>
        <figcaption className="mbs-2.5 text-sm text-muted-foreground">
          {item.caption}
        </figcaption>
      </VideoDialog>
    </figure>
  )
}
