import "server-only"

import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

/**
 * Cover art for the 3D books. Files prepared by `scripts/book-covers.ts` live
 * in public/book-covers/<slug>/{front,back,spine}.webp and win over the shop's
 * uploaded cover, so new covers can be previewed before they are uploaded.
 */
export function localCovers(slug: string) {
  const file = (face: string) => {
    const rel = `/book-covers/${slug}/${face}.webp`
    return existsSync(path.join(process.cwd(), "public", rel)) ? rel : null
  }
  return { front: file("front"), back: file("back"), spine: file("spine") }
}

const spines = new Map<string, Promise<{ bg: string; ink: string } | null>>()

/**
 * The spine colour, sampled from the cover's left edge (where the real spine
 * meets it) and darkened a touch, with a legible ink to match. Memoised.
 */
export function spineFrom(url: string) {
  if (!spines.has(url))
    spines.set(
      url,
      sample(url).catch(() => null)
    )
  return spines.get(url)!
}

async function sample(url: string) {
  const buf = url.startsWith("/")
    ? await readFile(path.join(process.cwd(), "public", url))
    : Buffer.from(await (await fetch(url)).arrayBuffer())
  const { width = 1, height = 1 } = await sharp(buf).metadata()
  const strip = await sharp(buf)
    .extract({
      left: 0,
      top: 0,
      width: Math.max(1, Math.round(width * 0.05)),
      height,
    })
    .stats()
  const [r, g, b] = strip.channels.map((c) => c.mean) as [
    number,
    number,
    number,
  ]
  const k = 0.82
  const bg = `rgb(${Math.round(r * k)} ${Math.round(g * k)} ${Math.round(b * k)})`
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) * k
  return { bg, ink: lum > 150 ? "#141414" : "#F6F6F4" }
}
