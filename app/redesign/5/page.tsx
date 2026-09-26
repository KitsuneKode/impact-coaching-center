import type { Metadata } from "next"
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import {
  campus,
  courses,
  faculty,
  included,
  rupees,
  selections,
  whatsapp,
} from "../_data"
import { ConceptSwitcher } from "../_switcher"

const didone = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--c5-didone",
})
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--c5-sans" })

export const metadata: Metadata = { title: "Gilded" }

// Near-black navy, warm off-white, gold used only as a line or a word.
const tokens = {
  "--bg": "#080B14",
  "--raise": "#0E1322",
  "--gold": "#BF9B53",
  "--ink": "#E8E6E1",
  "--muted": "#8D8B86",
  "--hair": "rgb(191 155 83 / 0.35)",
} as CSSProperties

const didoneCls = "font-[family-name:var(--c5-didone)]"
const [lead] = selections

export default function Gilded() {
  return (
    <div
      style={tokens}
      className={`${didone.variable} ${sans.variable} min-h-[100dvh] bg-[var(--bg)] font-[family-name:var(--c5-sans)] text-[var(--ink)]`}
    >
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-10">
        <Link
          href="/redesign/5"
          className={`${didoneCls} text-xl tracking-[0.02em]`}
        >
          Impact <em className="text-[var(--gold)]">Career</em> Tutorials
        </Link>
        <nav className="hidden gap-10 text-xs tracking-[0.2em] text-[var(--muted)] uppercase md:flex">
          <a href="#courses" className="hover:text-[var(--ink)]">
            Courses
          </a>
          <a href="#faculty" className="hover:text-[var(--ink)]">
            Faculty
          </a>
        </nav>
        <a
          href={whatsapp}
          className="border-b border-[var(--gold)] pb-1 text-sm text-[var(--gold)] transition-colors hover:text-[var(--ink)]"
        >
          Book a free class
        </a>
      </header>

      {/* hero: one line of type over one photograph */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pt-16 pb-28 md:grid-cols-[1.1fr_0.9fr] md:items-end md:px-10 md:pt-24">
        <h1
          className={`${didoneCls} text-5xl leading-[1.04] text-balance md:text-[5.5rem]`}
        >
          Preparation, <em className="text-[var(--gold)]">done properly</em>.
        </h1>
        <div>
          <p className="max-w-[40ch] text-lg leading-relaxed text-[var(--muted)]">
            APSC, ADRE, Assam Police and banking coaching in North Lakhimpur.
            Small batches, recorded classes, mentors until selection.
          </p>
          <a
            href="#courses"
            className="mt-8 inline-flex items-center gap-3 text-sm tracking-[0.18em] text-[var(--ink)] uppercase"
          >
            <span className="h-px w-10 bg-[var(--gold)]" aria-hidden />
            The courses
          </a>
        </div>
      </section>

      <div className="relative mx-auto aspect-[21/9] max-w-7xl overflow-hidden md:mx-10">
        <Image
          src={campus[2]!.src}
          alt={campus[2]!.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80 grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
      </div>

      {/* one quote, alone */}
      {lead ? (
        <section className="mx-auto max-w-4xl px-5 py-32 text-center md:px-10">
          <blockquote
            className={`${didoneCls} text-3xl leading-snug italic md:text-5xl`}
          >
            &ldquo;{lead.quote}&rdquo;
          </blockquote>
          <p className="mt-8 text-sm tracking-[0.18em] text-[var(--muted)] uppercase">
            {lead.name}, {lead.post}
          </p>
        </section>
      ) : null}

      {/* courses as a price list, separated by hairlines only */}
      <section
        id="courses"
        className="mx-auto max-w-5xl scroll-mt-10 px-5 pb-32 md:px-10"
      >
        <h2 className={`${didoneCls} text-4xl md:text-5xl`}>Courses</h2>
        <div className="mt-12 border-t border-[var(--hair)]">
          {courses.map((c) => (
            <Link
              key={c.exam}
              href={c.href}
              className="group grid gap-2 border-b border-[var(--hair)] py-8 md:grid-cols-[1fr_1.5fr_auto] md:items-baseline md:gap-8"
            >
              <p
                className={`${didoneCls} text-3xl transition-colors group-hover:text-[var(--gold)]`}
              >
                {c.exam}
              </p>
              <p className="text-[var(--muted)]">
                {c.name}. {c.covers}.
              </p>
              {c.price ? (
                <p className="text-xl tabular-nums">{rupees(c.price)}</p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      {/* faculty: duotone portraits that warm on hover */}
      <section id="faculty" className="scroll-mt-10 bg-[var(--raise)] py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <h2 className={`${didoneCls} text-4xl md:text-5xl`}>Faculty</h2>
          <ul className="mt-14 grid grid-cols-2 gap-8 md:grid-cols-5">
            {faculty.map((f) => (
              <li key={f.slug} className="group">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={f.portrait}
                    alt={f.name}
                    fill
                    sizes="(max-width: 768px) 45vw, 18vw"
                    className="object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                  />
                </div>
                <p className={`${didoneCls} mt-4 text-xl`}>{f.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{f.teaches}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* what the fee covers: two quiet columns */}
      <section className="mx-auto max-w-5xl px-5 py-28 pb-40 md:px-10">
        <h2 className={`${didoneCls} text-4xl md:text-5xl`}>One fee covers</h2>
        <ul className="mt-12 grid gap-x-16 gap-y-5 md:grid-cols-2">
          {included.map((item) => (
            <li key={item.text} className="flex gap-4 text-[var(--muted)]">
              <span
                aria-hidden
                className="mt-3 h-px w-6 shrink-0 bg-[var(--gold)]"
              />
              {item.text}
            </li>
          ))}
        </ul>
        <a
          href={whatsapp}
          className="mt-16 inline-flex items-center gap-3 text-sm tracking-[0.18em] text-[var(--gold)] uppercase"
        >
          <span className="h-px w-10 bg-[var(--gold)]" aria-hidden />
          Book a free class
        </a>
      </section>

      <ConceptSwitcher current={5} />
    </div>
  )
}
