import Image from "next/image"
import type { CSSProperties } from "react"

import { campus, faculty } from "../../_data"

/**
 * Every photograph ICT has of itself: the classrooms, then the teachers.
 * The walls are decorative — callers mark them `aria-hidden`.
 */
export const photos = [
  ...campus.map((c) => ({ src: c.src, alt: c.alt })),
  ...faculty.map((f) => ({
    src: f.portrait,
    alt: `${f.name}, ${f.teaches}`,
  })),
]

/**
 * Drifting columns: each column renders its set twice and animates
 * `translateY` to -50%, alternate columns run the other way. All movement is
 * inside `prefers-reduced-motion: no-preference`; reduced motion is a still
 * wall. Decorative: `alt=""`.
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
  /** Eager-load the first two frames of the first column (the LCP hero only). */
  priority?: boolean
}) {
  return (
    <div data-pf-wall style={{ "--cols": cols } as CSSProperties}>
      {Array.from({ length: cols }, (_, col) => {
        const set = [0, 1, 2, 3].map(
          (k) => photos[(col * 2 + k * 3) % photos.length]!
        )
        return (
          <div
            key={col}
            data-pf-col
            style={
              {
                "--dur": `${durations[col % durations.length]}s`,
              } as CSSProperties
            }
          >
            {[...set, ...set].map((p, i) => (
              <span key={i}>
                <Image
                  src={p.src}
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

/**
 * A horizontal ribbon of photos drifting sideways. The set renders twice so
 * `translateX(-50%)` loops seamlessly.
 */
export function PhotoRibbon({
  set,
  dur,
  reverse = false,
  sizes,
}: {
  set: { src: string; alt: string }[]
  dur: number
  reverse?: boolean
  sizes: string
}) {
  return (
    <div
      data-pf-ribbon
      data-rev={reverse || undefined}
      style={{ "--dur": `${dur}s` } as CSSProperties}
    >
      {[...set, ...set].map((p, i) => (
        <span key={i}>
          <Image src={p.src} alt="" fill sizes={sizes} />
        </span>
      ))}
    </div>
  )
}
