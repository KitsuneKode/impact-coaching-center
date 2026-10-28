import Image from "next/image"
import type { CSSProperties } from "react"

import { brand } from "@/lib/brand"
import type { Picture } from "@/lib/catalog"

export type BookTone = "amber" | "paper" | "ink"

/** Half the book's thickness in px, from its page count. */
function halfDepth(pages: number) {
  return Math.round(Math.min(20, Math.max(9, 6 + pages / 24)))
}

/**
 * A book as a 3D object: cover, spine, page block and back. It rests turned
 * to show its spine and swings toward the reader when a `data-book-open`
 * ancestor is hovered or focused. With a cover photo the photo is the cover;
 * without one the cover is typeset in the tone's colours. Decorative.
 */
export function Book3D({
  title,
  subtitle,
  exam,
  cover,
  pages = 200,
  tone = "amber",
  className,
}: {
  title: string
  subtitle?: string
  exam?: string
  cover?: Picture | null
  pages?: number
  tone?: BookTone
  className?: string
}) {
  return (
    <div
      data-book={tone}
      aria-hidden
      className={className}
      style={{ "--book-depth": `${halfDepth(pages)}px` } as CSSProperties}
    >
      <div data-book-inner>
        <div data-book-spine>
          <span>{title}</span>
        </div>
        <div data-book-pages />
        <div data-book-back />
        <div data-book-cover data-photo={cover ? "" : undefined}>
          {cover ? (
            <Image
              src={cover.url}
              alt=""
              fill
              sizes="(min-width: 768px) 320px, 45vw"
              {...(cover.blurDataUrl
                ? {
                    placeholder: "blur" as const,
                    blurDataURL: cover.blurDataUrl,
                  }
                : {})}
            />
          ) : (
            <>
              {exam ? <span data-book-exam>{exam}</span> : null}
              <span data-book-title>{title}</span>
              {subtitle ? <span data-book-sub>{subtitle}</span> : null}
              <span data-book-foot>
                <Image src={brand.mark} alt="" width={18} height={18} />
                {brand.legalName}
              </span>
            </>
          )}
        </div>
      </div>
      <div data-book-shadow />
    </div>
  )
}
