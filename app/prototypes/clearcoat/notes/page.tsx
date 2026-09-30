import { IconBrandYoutube, IconMicrophone2 } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { FolderBrowser } from "../../_folder-browser"
import { links, podcast, proof, shelf, workshops } from "../../_data"
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
          <p
            data-cc-tag
            className="mt-6 inline-block rounded-full px-4 py-2 text-[0.7rem]"
          >
            Sample titles until ICT adds its own
          </p>
        )}
      </PageHead>

      <section aria-label="Notes" className={`${container} pb-20`}>
        <FolderBrowser
          folders={folders}
          tones={folderTones}
          readHref="/resources"
        />
      </section>

      <section aria-labelledby="also-h" className={`${container} pb-20`}>
        <Reveal>
          <h2 id="also-h" data-cc-h2 className="max-w-[18ch]">
            Also free.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          {workshops.map((w) => (
            <Reveal key={w.name} className="lg:col-span-4">
              <Link
                href={`${base}${w.href}`}
                data-coat
                data-cc-panel
                className="group flex h-full flex-col rounded-[28px] p-3"
              >
                {w.cover && (
                  <span
                    data-cc-photo
                    className="relative block aspect-[4/3] overflow-hidden rounded-[20px]"
                  >
                    <Image
                      src={w.cover}
                      alt={`${w.name} poster`}
                      fill
                      sizes="(min-width: 1024px) 380px, 100vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </span>
                )}
                <span className="px-3 pt-4 pb-3">
                  <span data-cc-display className="block text-xl font-light">
                    {w.name}
                  </span>
                  <span className="mt-1 line-clamp-2 text-[var(--cc-muted)]">
                    {w.subtitle}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
          <div className="grid gap-4 lg:col-span-4">
            <Reveal delay={0.06}>
              <a
                href={links.youtube}
                {...external}
                data-coat
                data-cc-panel
                className="group flex items-center justify-between gap-4 rounded-[28px] p-6"
              >
                <span>
                  <span
                    data-cc-display
                    className="block text-3xl font-light tabular-nums"
                  >
                    {proof[2].display}
                  </span>
                  <span className="text-sm text-[var(--cc-muted)]">
                    hours of class on the app
                  </span>
                </span>
                <IconBrandYoutube aria-hidden size={30} stroke={1.5} />
              </a>
            </Reveal>
            <Reveal delay={0.1}>
              <a
                href={`https://www.youtube.com/watch?v=${podcast.episodes[0].id}`}
                {...external}
                data-coat
                data-cc-panel
                className="group flex items-center justify-between gap-4 rounded-[28px] p-6"
              >
                <span>
                  <span className="block font-medium">
                    {podcast.name}, the podcast
                  </span>
                  <span className="text-sm text-[var(--cc-muted)] tabular-nums">
                    {podcast.seriesViews.toLocaleString("en-IN")} views
                  </span>
                </span>
                <IconMicrophone2 aria-hidden size={28} stroke={1.5} />
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
