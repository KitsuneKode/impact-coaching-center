import { IconBrandYoutube, IconMicrophone2 } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

import type { Shelf } from "../../_data"
import { links, podcast, proof, workshops } from "../../_data"
import { Folder } from "../../_folder"
import { Reveal } from "../../_reveal"
import { container, external, folderTones, h2 } from "../_theme"

/** Free study material, free workshops and the channels, as in Pulse. */
export function FreeFirst({
  folders,
  samples,
}: {
  folders: Shelf["folders"]
  samples: Shelf["samples"]
}) {
  return (
    <section id="free" aria-labelledby="free-h" className="py-20 md:py-28">
      <div className={container}>
        <Reveal>
          <h2 id="free-h" className={`${h2} max-w-[18ch]`}>
            Start free. Pay only when you pick a batch.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Reveal className="md:col-span-2 md:row-span-2">
            <div className="h-full rounded-[28px] bg-[var(--pu-card)] p-7 shadow-[0_0_0_1px_var(--pu-line)] md:p-9">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-xl font-semibold tracking-[-0.02em]">
                  Free study material
                </h3>
                <Link
                  href="/resources"
                  className="text-sm font-semibold text-[var(--pu-blue)]"
                >
                  Open the library
                </Link>
              </div>
              {samples && (
                <p className="mt-2 text-sm text-[var(--pu-muted)]">
                  Sample titles until ICT adds its own.
                </p>
              )}
              <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
                {folders.map((f) => (
                  <li key={f.id}>
                    <Link
                      data-fd-hover
                      href={f.href}
                      aria-label={`${f.name}, ${f.items.length} files`}
                      className="block rounded-[14px]"
                    >
                      <Folder folder={f} tones={folderTones} />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-[var(--pu-muted)]">
                Log in once with your mobile number to read any of them.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="h-full rounded-[28px] bg-[var(--pu-ink)] p-7 text-white">
              <h3 className="text-lg font-semibold">Free workshops</h3>
              <ul className="mt-5 grid gap-4">
                {workshops.map((w) => (
                  <li key={w.name}>
                    <Link
                      href={w.href}
                      className="group flex items-center gap-4"
                    >
                      {w.cover && (
                        <span className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-xl">
                          <Image
                            src={w.cover}
                            alt={`${w.name} poster`}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block font-semibold group-hover:text-[var(--pu-amber)]">
                          {w.name}
                        </span>
                        <span className="line-clamp-2 text-sm text-[#AEB9D3]">
                          {w.subtitle}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="grid h-full gap-4">
              <a
                href={links.youtube}
                {...external}
                className="group flex items-center justify-between gap-4 rounded-[28px] bg-[var(--pu-blue)] p-7 text-white"
              >
                <span>
                  <span className="block font-[family-name:var(--pu-display)] text-3xl font-semibold tabular-nums">
                    {proof[2].display}
                  </span>
                  <span className="text-sm text-[var(--pu-on-blue)]">
                    hours of class on YouTube
                  </span>
                </span>
                <IconBrandYoutube
                  aria-hidden
                  size={30}
                  stroke={1.5}
                  className="transition-transform duration-300 ease-out group-hover:scale-110"
                />
              </a>
              <a
                href={`https://www.youtube.com/watch?v=${podcast.episodes[0].id}`}
                {...external}
                className="group flex items-center justify-between gap-4 rounded-[28px] bg-[var(--pu-card)] p-7 shadow-[0_0_0_1px_var(--pu-line)]"
              >
                <span>
                  <span className="block font-semibold">
                    {podcast.name}, the podcast
                  </span>
                  <span className="text-sm text-[var(--pu-muted)] tabular-nums">
                    {podcast.seriesViews.toLocaleString("en-IN")} views
                  </span>
                </span>
                <IconMicrophone2
                  aria-hidden
                  size={28}
                  stroke={1.5}
                  className="text-[var(--pu-blue)] transition-transform duration-300 ease-out group-hover:scale-110"
                />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
