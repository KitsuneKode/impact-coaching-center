"use client"

import { IconPlayerPlayFilled } from "@tabler/icons-react"
import Image from "next/image"
import { useState, type CSSProperties } from "react"

type Video = { id: string; title: string }

const embed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?${new URLSearchParams({
    autoplay: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
  }).toString()}`

/**
 * ICT's YouTube Shorts as posters. A tap loads the player, so the page does
 * not pull three videos in before anyone asks for one; only one plays at a time.
 */
export function ShortsRow({ videos }: { videos: Video[] }) {
  const [playing, setPlaying] = useState<string | null>(null)
  return (
    <ul
      data-k-snap
      style={{ "--n": videos.length } as CSSProperties}
      className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:max-w-[calc(var(--n)*270px)] md:grid-cols-[repeat(var(--n),minmax(0,1fr))] md:overflow-visible md:px-0"
    >
      {videos.map((v) => (
        <li
          key={v.id}
          className="w-[62%] shrink-0 snap-start sm:w-[44%] md:w-auto"
        >
          <div className="relative aspect-[9/16] overflow-hidden rounded-[20px] bg-black">
            {playing === v.id ? (
              <iframe
                src={embed(v.id)}
                title={v.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 size-full border-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(v.id)}
                aria-label={`Play ${v.title}`}
                className="group absolute inset-0 block size-full cursor-pointer"
              >
                <Image
                  src={`/yt/${v.id}.jpg`}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 360px, 62vw"
                  className="object-cover"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"
                />
                <span
                  aria-hidden
                  className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow-lg transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
                >
                  <IconPlayerPlayFilled size={26} />
                </span>
              </button>
            )}
          </div>
          <p className="mt-3 font-medium">{v.title}</p>
        </li>
      ))}
    </ul>
  )
}
