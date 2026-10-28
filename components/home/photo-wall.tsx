import { useTranslations } from "next-intl"
import Image from "next/image"
import type { CSSProperties } from "react"

import { Link } from "@/i18n/navigation"
import { faculty } from "@/lib/brand"
import { campus } from "@/lib/stories"

/**
 * Every photograph ICT has of itself, each with where it leads: a classroom
 * to the centre section (it plays its video there), a teacher to their
 * place on /teachers. `label` names the photo on hover.
 */
function usePhotos() {
  const t = useTranslations("Pulse")
  return [
    ...campus.map((c, i) => ({
      src: c.src,
      href: "/#centre",
      label: t(`centreCaption${i + 1}` as "centreCaption1"),
    })),
    ...faculty.map((f) => ({
      src: f.portrait,
      href: `/teachers#${f.slug}`,
      label: f.called,
    })),
  ]
}

/**
 * Drifting columns of photos. Each column holds its set twice and slides by
 * half, alternate columns the other way; neighbouring columns never share a
 * photo. Decorative to assistive tech (callers mark it `aria-hidden`): the
 * links are a pointer shortcut, out of the tab order, to pages the
 * navigation reaches anyway. wall-drive.tsx lets the pointer drag it.
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
  const photos = usePhotos()
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
              <Link
                key={i}
                href={photo.href}
                tabIndex={-1}
                draggable={false}
                data-wall-photo
                data-label={photo.label}
              >
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes={sizes}
                  draggable={false}
                  priority={priority && col === 0 && i < 2}
                />
              </Link>
            ))}
          </div>
        )
      })}
    </div>
  )
}
