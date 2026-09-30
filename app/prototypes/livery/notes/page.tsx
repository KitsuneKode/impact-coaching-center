import { IconBrandYoutube, IconMicrophone2 } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { links, podcast, proof, shelf, workshops } from "../../_data"
import { FolderBrowser } from "../../_folder-browser"
import { Reveal } from "../../_reveal"
import { base, container, external, folderTones, PageHead } from "../_shared"

export const metadata: Metadata = { title: "Free notes" }

export default async function Notes() {
  const { folders, samples } = await shelf()
  return (
    <main>
      <PageHead
        trail={[{ label: "Free notes" }]}
        title="Free study material, in six folders."
        lede="Log in once with your mobile number and open any of them. No fee, no batch needed."
      >
        {samples && (
          <p className="mt-6 inline-block rounded-md bg-[var(--lv-navy)] px-3 py-1.5 text-sm font-semibold text-white">
            Sample titles until ICT adds its own
          </p>
        )}
      </PageHead>

      <section aria-label="Notes" className="bg-[var(--lv-sky)] py-16 md:py-20">
        <div className={container}>
          <FolderBrowser
            folders={folders}
            tones={folderTones}
            readHref="/resources"
          />
        </div>
      </section>

      <section aria-labelledby="also-h" className={`${container} py-20`}>
        <Reveal>
          <h2 id="also-h" data-lv-h2>
            Also free.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          {workshops.map((w) => (
            <Reveal key={w.name} className="lg:col-span-4">
              <Link
                href={`${base}${w.href}`}
                data-lv-card
                className="group flex h-full items-center gap-5 rounded-[14px] p-4"
              >
                {w.cover && (
                  <span
                    data-lv-photo
                    className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-lg"
                  >
                    <Image
                      src={w.cover}
                      alt={`${w.name} poster`}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </span>
                )}
                <span className="min-w-0">
                  <span data-lv-display className="block text-2xl">
                    {w.name}
                  </span>
                  <span className="mt-1 line-clamp-2 text-sm text-[var(--lv-muted)]">
                    {w.subtitle}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
          <Reveal delay={0.06} className="lg:col-span-2">
            <a
              href={links.youtube}
              {...external}
              data-lv-press
              data-lv-btn
              className="flex h-full flex-col justify-between gap-3 rounded-[14px] p-5"
            >
              <IconBrandYoutube aria-hidden size={28} stroke={1.75} />
              <span>
                <span data-lv-display className="block text-5xl tabular-nums">
                  {proof[2].display}
                </span>
                <span className="text-sm font-semibold">
                  hours of class on the app
                </span>
              </span>
            </a>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-2">
            <a
              href={`https://www.youtube.com/watch?v=${podcast.episodes[0].id}`}
              {...external}
              data-lv-press
              data-lv-btn-navy
              className="flex h-full flex-col justify-between gap-3 rounded-[14px] p-5"
            >
              <IconMicrophone2 aria-hidden size={28} stroke={1.75} />
              <span>
                <span data-lv-display className="block text-2xl">
                  {podcast.name}
                </span>
                <span className="text-sm text-[var(--lv-on-navy)] tabular-nums">
                  {podcast.seriesViews.toLocaleString("en-IN")} views
                </span>
              </span>
            </a>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
