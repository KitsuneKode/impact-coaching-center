import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

/*
 * The share card for pages without a picture of their own, in Pulse's
 * colours. Satori reads no woff2 or variable fonts, so lib/og holds static
 * TTF instances cut from the site's own fonts (Unbounded 600, Figtree 500).
 * Latin only: Satori cannot shape Assamese (conjuncts break, vowel signs
 * land on the wrong side), so Assamese pages keep the photo card. Hex, not
 * OKLCH: Satori parses neither OKLCH nor CSS variables (app/globals.css).
 */
const BLUE = "#1f5fd1"
const DEEP = "#17479e"
const AMBER = "#ffc24a"

export const OG_SIZE = { width: 1200, height: 630 }

const dir = join(process.cwd(), "lib/og")
const asset = (name: string) => readFile(join(dir, name))

export async function ogCard({
  eyebrow,
  title,
  footer,
}: {
  eyebrow: string
  title: string
  footer: string
}) {
  const [display, sans, mark] = await Promise.all([
    asset("unbounded-600.ttf"),
    asset("figtree-500.ttf"),
    readFile(join(process.cwd(), "public/brand/ict-mark.png")),
  ])
  // Long titles step down so three lines still fit the card.
  const size = title.length > 70 ? 54 : title.length > 40 ? 64 : 76
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "white",
        backgroundColor: BLUE,
        backgroundImage: `radial-gradient(circle at 92% 0%, rgba(255,255,255,0.18), transparent 46%), linear-gradient(160deg, ${BLUE} 55%, ${DEEP})`,
        fontFamily: "Figtree",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            width: 72,
            height: 72,
            borderRadius: 18,
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${mark.toString("base64")}`}
            width={48}
            height={48}
            alt=""
          />
        </div>
        <div style={{ fontSize: 28, color: AMBER }}>{eyebrow}</div>
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Unbounded",
          fontSize: size,
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          maxWidth: 1000,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 26, opacity: 0.82 }}>{footer}</div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Unbounded", data: display, weight: 600, style: "normal" },
        { name: "Figtree", data: sans, weight: 500, style: "normal" },
      ],
    }
  )
}
