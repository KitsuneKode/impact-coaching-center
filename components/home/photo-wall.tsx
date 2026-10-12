import Image from "next/image"
import type { CSSProperties } from "react"

import { faculty } from "@/lib/brand"
import { campus } from "@/lib/stories"

/** Every photograph ICT has of itself: the classrooms, then the teachers. */
export const photos = [
  ...campus.map((c) => ({ src: c.src, alt: c.alt })),
  ...faculty.map((f) => ({ src: f.portrait, alt: `${f.name}, ${f.teaches}` })),
]

/**
 * Drifting columns of photos. Each column holds its set twice and slides by
 * half, alternate columns the other way; neighbouring columns never share a
 * photo. Decorative: callers mark it `aria-hidden`.
 */
export function PhotoWall({
  cols,
  durations,
  sizes,
  priority = false,
}: {
  cols: number
  durations: readonly number[]
  /** `sizes` for next/image, matched to the column width. */
  sizes: string
  /** Load the first two frames eagerly: the hero's largest paint. */
  priority?: boolean
}) {
  return (
    <div data-wall style={{ "--cols": cols } as CSSProperties}>
      {Array.from({ length: cols }, (_, col) => {
        const set = [0, 1, 2, 3].map(
          (k) => photos[(col * 4 + k) % photos.length]!
        )
        return (
          <div
            key={col}
            data-wall-col
            style={
              {
                "--dur": `${durations[col % durations.length]}s`,
                animationDelay: `-${col * 7}s`,
              } as CSSProperties
            }
          >
            {[...set, ...set].map((photo, i) => (
              <span key={i}>
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes={sizes}
                  priority={priority && col === 0 && i < 2}
                />
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}
