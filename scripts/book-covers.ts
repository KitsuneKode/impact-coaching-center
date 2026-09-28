/**
 * Prepares book cover art for the 3D books.
 *
 *   bun scripts/book-covers.ts <folder>
 *
 * Name each file after the book's slug:
 *   <slug>.jpg        front cover only
 *   <slug>-back.jpg   back cover
 *   <slug>-spine.jpg  spine
 *   <slug>-wrap.jpg   the printer's full cover (back, spine, front side by side)
 *
 * A wrap is split into back, spine and front using the 3:4 cover shape. Every
 * face is trimmed of flat scanner borders, cropped to shape, resized and saved
 * as WebP in public/book-covers/<slug>/. Photos taken at an angle cannot be
 * straightened here; scan flat or export from the print PDF.
 */
import { mkdir, readdir } from "node:fs/promises"
import path from "node:path"
import sharp, { type Sharp } from "sharp"

const HEIGHT = 1600
const WIDTH = 1200 // 3:4, the shape Book3D draws

const dir = process.argv[2]
if (!dir) {
  console.error("Usage: bun scripts/book-covers.ts <folder>")
  process.exit(1)
}

const out = (slug: string) => path.join("public", "book-covers", slug)

async function face(input: Sharp, slug: string, name: string) {
  await mkdir(out(slug), { recursive: true })
  const file = path.join(out(slug), `${name}.webp`)
  await input
    .resize(
      name === "spine"
        ? { height: HEIGHT }
        : { width: WIDTH, height: HEIGHT, fit: "cover", position: "centre" }
    )
    .webp({ quality: 84 })
    .toFile(file)
  console.log(`  ${file}`)
}

/** Trim flat borders a scanner or export leaves around the art. */
async function trimmed(file: string) {
  const buf = await sharp(file).rotate().trim({ threshold: 18 }).toBuffer()
  return { buf, meta: await sharp(buf).metadata() }
}

for (const entry of (await readdir(dir)).sort()) {
  const match = /^(.+?)(?:-(back|spine|wrap))?\.(jpe?g|png|webp|tiff?)$/i.exec(
    entry
  )
  if (!match) continue
  const [, slug, part] = match as unknown as [
    string,
    string,
    string | undefined,
  ]
  const { buf, meta } = await trimmed(path.join(dir, entry))
  console.log(`${entry} -> ${slug}`)

  if (part === "wrap") {
    const h = meta.height!
    const w = meta.width!
    const coverW = Math.round((h * 3) / 4)
    const spineW = w - coverW * 2
    if (spineW < 4) {
      console.warn(
        "  wrap is not wide enough for back + spine + front; skipped"
      )
      continue
    }
    const crop = (left: number, width: number) =>
      sharp(buf).extract({ left, top: 0, width, height: h })
    await face(crop(0, coverW), slug, "back")
    await face(crop(coverW, spineW), slug, "spine")
    await face(crop(coverW + spineW, coverW), slug, "front")
    continue
  }
  await face(sharp(buf), slug, part ?? "front")
}
