import {
  IconArrowUpRight,
  IconBrandYoutube,
  IconChevronRight,
  IconMicrophone2,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { links, podcast, proof, shelf, workshops } from "../../_data"
import { container, external, folderTones, h2, LampShell } from "../_chrome"
import { FolderBrowser } from "../_client"

export const metadata: Metadata = { title: "Free notes, Lamp" }

export default async function LampNotes() {
  const { folders, samples } = await shelf()
  return (
    <LampShell>
      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 h-[26rem] w-[50rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(245,181,68,0.16),transparent)] blur-2xl"
          />
          <div className={`${container} relative pt-8 pb-12 md:pt-12`}>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-sm text-[var(--lp-muted)]"
            >
              <Link data-quiet href="/prototypes/lamp">
                Home
              </Link>
              <IconChevronRight aria-hidden size={14} stroke={1.75} />
              <span className="text-[var(--lp-text)]">Free notes</span>
            </nav>
            <h1 className="mt-10 max-w-[16ch] text-[clamp(2.6rem,6vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.03em] [font-stretch:112%]">
              Free study material, in six folders.
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg text-[var(--lp-muted)]">
              Log in once with your mobile number and open any of them. No fee,
              no batch needed.
            </p>
            {samples && (
              <p className="mt-4 text-sm text-[var(--lp-amber)]">
                Sample titles for now. ICT&apos;s own notes and papers replace
                them before launch.
              </p>
            )}
          </div>
        </section>

        <section aria-label="Notes" className="pb-16 md:pb-24">
          <div className={container}>
            <FolderBrowser folders={folders} tones={folderTones} />
          </div>
        </section>

        <section aria-labelledby="also-h" className="py-16 md:py-24">
          <div className={container}>
            <h2 id="also-h" className={`${h2} max-w-[18ch]`}>
              Also free.
            </h2>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {workshops.map((w) => (
                <Link
                  key={w.name}
                  href={`/prototypes/lamp/courses/${w.href.split("/").pop()}`}
                  className="group flex flex-col rounded-[26px] bg-[var(--lp-card)] p-2 shadow-[inset_0_0_0_1px_var(--lp-line)] transition-shadow duration-200 hover:shadow-[inset_0_0_0_1px_rgba(245,181,68,0.45)]"
                >
                  {w.cover && (
                    <span className="relative block aspect-[4/3] overflow-hidden rounded-[20px]">
                      <Image
                        src={w.cover}
                        alt={`${w.name} poster`}
                        fill
                        sizes="(min-width: 768px) 380px, 100vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    </span>
                  )}
                  <span className="p-4">
                    <span className="block font-semibold">
                      {w.name}, a free workshop
                    </span>
                    <span className="block text-sm text-[var(--lp-muted)]">
                      {w.subtitle}
                    </span>
                  </span>
                </Link>
              ))}
              <div className="grid gap-4">
                <a
                  href={links.youtube}
                  {...external}
                  className="group flex flex-col justify-between rounded-[26px] bg-[var(--lp-card)] p-6 shadow-[inset_0_0_0_1px_var(--lp-line)] transition-shadow duration-200 hover:shadow-[inset_0_0_0_1px_rgba(245,181,68,0.45)]"
                >
                  <IconBrandYoutube
                    aria-hidden
                    size={26}
                    stroke={1.5}
                    className="text-[var(--lp-amber)]"
                  />
                  <span className="mt-6 block text-3xl font-semibold tracking-[-0.03em] tabular-nums">
                    {proof[2].display} hours
                  </span>
                  <span className="text-sm text-[var(--lp-muted)]">
                    of full classes on YouTube
                  </span>
                </a>
                <a
                  href={`https://www.youtube.com/watch?v=${podcast.episodes[0].id}`}
                  {...external}
                  className="group flex items-center justify-between gap-4 rounded-[26px] bg-[var(--lp-card)] p-6 shadow-[inset_0_0_0_1px_var(--lp-line)] transition-shadow duration-200 hover:shadow-[inset_0_0_0_1px_rgba(245,181,68,0.45)]"
                >
                  <span>
                    <span className="block font-semibold">{podcast.name}</span>
                    <span className="text-sm text-[var(--lp-muted)]">
                      ICT&apos;s podcast
                    </span>
                  </span>
                  <IconMicrophone2
                    aria-hidden
                    size={24}
                    stroke={1.5}
                    className="text-[var(--lp-amber)]"
                  />
                </a>
              </div>
            </div>
            <Link
              href="/resources"
              data-quiet
              className="mt-10 inline-flex items-center gap-1 text-sm text-[var(--lp-muted)] underline decoration-[var(--lp-line-hi)] underline-offset-4"
            >
              Open the live free-notes page
              <IconArrowUpRight aria-hidden size={15} stroke={1.75} />
            </Link>
          </div>
        </section>
      </main>
    </LampShell>
  )
}
