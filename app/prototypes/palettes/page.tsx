import type { Metadata } from "next"

import { palettes, type Palette } from "./_data"
import { Swatch } from "./_swatch"

export const metadata: Metadata = { title: "Palettes" }

/** WCAG relative luminance and contrast ratio, so the numbers on the page are computed, not typed. */
function lum(hex: string) {
  const f = (c: number) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const n = parseInt(hex.slice(1), 16)
  return (
    0.2126 * f((n >> 16) & 255) +
    0.7152 * f((n >> 8) & 255) +
    0.0722 * f(n & 255)
  )
}
function ratio(a: string, b: string) {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}
const isDark = (hex: string) => lum(hex) < 0.32

const RULES = [
  "Hold hue and chroma, step only lightness in OKLCH. The family stays recognisable instead of drifting grey.",
  "60-30-10: a base for most of the surface, a second colour for structure, and one accent for the few things that matter.",
  "Pair a warm colour with a cool one, never two of the same temperature fighting. Gold and blue are complements.",
  "Never blend complements into a glow or gradient: light mixes to grey. Put gold on top of blue, not through it.",
  "Gold is a metal, not a highlighter. Keep chroma near 0.10 and pair it with warm ivory neutrals: yellow gold beside cool grey looks cheap.",
  "Gold text on white needs the deep gold (6.1:1). Navy on the antique gold is 9.9:1.",
  "Tint every neutral and every shadow toward the base hue. No pure black, no grey shadows.",
]

function Sample({ p }: { p: Palette }) {
  const r = Object.fromEntries(p.roles.map((x) => [x.name, x.hex]))
  const page = r["Page"]!
  const ink = r["Ink"] ?? r["Ivory ink"]!
  const accent =
    r["Gold fill"] ??
    r["Champagne"] ??
    r["Bronze"] ??
    r["Royal"] ??
    r["Gold"] ??
    "#2D54D3"
  const onAccent = isDark(accent) ? "#F4F6FB" : "#00032B"
  const muted = r["Muted"] ?? ink
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: page,
        color: ink,
        boxShadow: "inset 0 0 0 1px rgba(0,15,57,0.12)",
      }}
    >
      <p
        className="text-xs font-bold tracking-[0.14em] uppercase"
        style={{ color: muted }}
      >
        Sample
      </p>
      <p className="mt-2 text-2xl leading-tight font-bold text-balance">
        Coaching for Assam&apos;s biggest exams.
      </p>
      <p className="mt-2 text-sm" style={{ color: muted }}>
        Batches in North Lakhimpur, ICT&apos;s own books and free notes.
      </p>
      <span
        className="mt-4 inline-flex h-11 items-center rounded-lg px-5 text-sm font-bold"
        style={{ background: accent, color: onAccent }}
      >
        Join a free workshop
      </span>
    </div>
  )
}

export default function Palettes() {
  return (
    <main className="min-h-[100dvh] bg-[#F0F5FE] px-5 py-14 text-[#00032B] md:px-8 md:py-20">
      <div className="mx-auto max-w-[1100px]">
        <h1 className="max-w-[18ch] text-4xl leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-6xl">
          Five palettes for ICT, gold and blue first.
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg text-[#334C7B]">
          Built from colour theory, then checked. Every ramp is generated in
          OKLCH and every text pair below is measured against WCAG. Press a
          swatch to copy its hex.
        </p>

        <ul className="mt-10 grid gap-3 md:grid-cols-2">
          {RULES.map((x) => (
            <li
              key={x}
              className="rounded-xl bg-white p-4 text-sm text-[#334C7B] shadow-[0_0_0_1px_rgba(0,15,57,0.09)]"
            >
              {x}
            </li>
          ))}
        </ul>

        <section aria-labelledby="gold-h" className="mt-16">
          <h2 id="gold-h" className="text-2xl font-bold tracking-[-0.02em]">
            Why the gold changed
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-[#000820] p-6 text-[#F8F3E6]">
              <span
                className="block h-16 rounded-lg"
                style={{ background: "#E7AD08" }}
              />
              <p className="mt-4 font-bold">Before: #E7AD08</p>
              <p className="mt-1 text-sm text-[#ACB8CB]">
                Chroma 0.17. It reads as mustard yellow, a highlighter, and
                fights the cool blue.
              </p>
            </div>
            <div className="rounded-2xl bg-[#000820] p-6 text-[#F8F3E6]">
              <span
                className="block h-16 rounded-lg"
                style={{
                  background:
                    "linear-gradient(110deg,#F7E4B0,#F2CC7E 24%,#D7B265 50%,#BD994C 70%,#E8C877 88%,#F7E4B0)",
                }}
              />
              <p className="mt-4 font-bold">
                Now: #D7B265, with a foil gradient
              </p>
              <p className="mt-1 text-sm text-[#ACB8CB]">
                Chroma 0.105, warm ivory beside it. It reads as metal.
              </p>
            </div>
          </div>
        </section>

        {palettes.map((p) => (
          <section key={p.id} aria-labelledby={`${p.id}-h`} className="mt-20">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2
                id={`${p.id}-h`}
                className="text-3xl font-bold tracking-[-0.02em]"
              >
                {p.name}
              </h2>
              <p className="text-sm font-semibold text-[#006F85]">
                {p.scheme}. {p.tag}. {p.used}.
              </p>
            </div>
            <p className="mt-3 max-w-[64ch] text-[#334C7B]">{p.note}</p>

            <div
              className="mt-6 flex h-4 overflow-hidden rounded-full"
              aria-hidden
            >
              {p.ratio.map((x) => (
                <span
                  key={x.label}
                  style={{ width: `${x.pct}%`, background: x.hex }}
                />
              ))}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#334C7B]">
              {p.ratio.map((x) => (
                <li key={x.label} className="tabular-nums">
                  {x.pct}% {x.label}
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h3 className="text-sm font-bold tracking-[0.1em] text-[#334C7B] uppercase">
                  Roles
                </h3>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {p.roles.map((x) => (
                    <li key={x.name}>
                      <Swatch hex={x.hex} label={x.name} dark={isDark(x.hex)} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-5">
                <Sample p={p} />
              </div>
            </div>

            {p.ramps.map((rp) => (
              <div key={rp.name} className="mt-8">
                <h3 className="text-sm font-bold tracking-[0.1em] text-[#334C7B] uppercase">
                  {rp.name} ramp
                </h3>
                <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                  {rp.steps.map((s) => (
                    <li key={s.name}>
                      <Swatch
                        hex={s.hex}
                        label={s.name.split("-").pop()!}
                        dark={isDark(s.hex)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="mt-8">
              <h3 className="text-sm font-bold tracking-[0.1em] text-[#334C7B] uppercase">
                Contrast, measured
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {p.pairs.map((x) => {
                  const c = ratio(x.fg, x.bg)
                  return (
                    <li
                      key={x.label}
                      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                      style={{
                        background: x.bg,
                        color: x.fg,
                        boxShadow: "inset 0 0 0 1px rgba(0,15,57,0.14)",
                      }}
                    >
                      <span className="text-sm font-semibold">{x.label}</span>
                      <span className="text-sm font-bold tabular-nums">
                        {c.toFixed(1)}:1{" "}
                        {c >= 7 ? "AAA" : c >= 4.5 ? "AA" : "large text"}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
