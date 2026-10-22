"use client"

import { IconPlayerPlayFilled } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useState } from "react"

/**
 * A YouTube video inside a post: its thumbnail until pressed, then the
 * player in the same frame (youtube-nocookie, so nothing of YouTube's loads
 * for readers who never press play).
 */
export function PostVideo({ id, title }: { id: string; title?: string }) {
  const t = useTranslations("BlogPage")
  const [playing, setPlaying] = useState(false)
  const name = title ?? t("video")
  return (
    <figure data-post-figure data-post-video>
      <div className="relative aspect-video overflow-clip rounded-2xl bg-ink">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={t("play", { title: name })}
            data-press
            className="group absolute inset-0 grid place-items-center"
          >
            <Image
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              fill
              sizes="(min-width: 768px) 46rem, 100vw"
              className="object-cover"
            />
            <span
              data-post-play
              className="relative grid size-16 place-items-center rounded-full bg-highlight text-ink"
            >
              <IconPlayerPlayFilled
                aria-hidden
                size={24}
                className="translate-x-0.5"
              />
            </span>
          </button>
        )}
      </div>
      {title ? <figcaption>{title}</figcaption> : null}
    </figure>
  )
}
