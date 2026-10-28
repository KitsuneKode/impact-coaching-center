"use client"

import { useQuery } from "convex/react"
import Image from "next/image"

import { convexConfigured } from "@/app/providers"
import { api } from "@/convex/_generated/api"

const useCover = (slug: string) =>
  useQuery(api.catalog.resourceCover, { slug }) ?? null

/**
 * The note's real first page, its top third, fading into the sheet: what a
 * student gets for logging in, shown rather than described. Page one is
 * public on purpose (convex/catalog.ts resourceCover). Without one, or
 * without Convex, the ruled lines stand in (app/pulse.css).
 */
export const NotePeek: ({ slug }: { slug: string }) => React.ReactNode =
  convexConfigured ? LivePeek : () => <span data-notes-lines aria-hidden />

function LivePeek({ slug }: { slug: string }) {
  const cover = useCover(slug)
  if (!cover) return <span data-notes-lines aria-hidden />
  return (
    <span data-notes-peek aria-hidden>
      <Image
        src={cover.url}
        alt=""
        fill
        sizes="(min-width: 1024px) 28rem, 90vw"
        className="object-cover object-top"
      />
    </span>
  )
}
