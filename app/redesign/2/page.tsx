import type { Metadata } from "next"
import { Geist } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import {
  campus,
  courses,
  faculty,
  included,
  proof,
  reviews,
  rupees,
  selections,
  whatsapp,
} from "../_data"
import { ConceptSwitcher } from "../_switcher"

const sans = Geist({ subsets: ["latin"], variable: "--c2-sans" })

export const metadata: Metadata = { title: "Midnight" }

// Near-black navy, a royal-blue atmosphere, gold as the single accent.
const tokens = {
  "--bg": "#070C1C",
  "--card": "#0D1530",
  "--edge": "rgb(255 255 255 / 0.08)",
  "--royal": "#3563FF",
  "--gold": "#F0C45C",
  "--ink": "#E8ECF6",
  "--muted": "#8C97B5",
} as CSSProperties

const card =
  "relative overflow-hidden rounded-3xl border border-[var(--edge)] bg-[var(--card)] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"

export default function Midnight() {
  const [officerA, officerB] = selections
  return (
    <div
      style={tokens}
      className={`${sans.variable} min-h-[100dvh] bg-[var(--bg)] font-[family-name:var(--c2-sans)] text-[var(--ink)] antialiased`}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[700px] bg-[radial-gradient(60%_50%_at_70%_0%,rgb(53_99_255/0.22),transparent)]"
      />

      <header className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link
          href="/redesign/2"
          className="flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <Image
            src="/brand/ict-mark.png"
            alt=""
            width={28}
            height={28}
            className="rounded-md bg-white p-0.5"
          />
          Impact Career Tutorials
        </Link>
        <nav className="hidden gap-7 text-sm text-[var(--muted)] md:flex">
          <a href="#courses" className="hover:text-[var(--ink)]">
            Courses
          </a>
          <a href="#why" className="hover:text-[var(--ink)]">
            Why ICT
          </a>
          <a href="#voices" className="hover:text-[var(--ink)]">
            Students
          </a>
        </nav>
        <a
          href={whatsapp}
          className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--bg)] transition-transform active:scale-[0.98]"
        >
          Book a free class
        </a>
      </header>

      {/* hero: split, copy left, faculty stack right */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pt-14 pb-20 md:grid-cols-[1.05fr_1fr] md:px-8 md:pt-20">
        <div>
          <h1 className="text-5xl leading-[1.02] font-semibold tracking-[-0.035em] text-balance md:text-7xl">
            Crack APSC with teachers you&rsquo;ve{" "}
            <span className="text-[var(--gold)]">already watched</span>.
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg text-[var(--muted)]">
            Classroom, night batch and the ICT app, from North Lakhimpur. Every
            lecture is on YouTube before you pay.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#courses"
              className="rounded-full bg-[var(--gold)] px-6 py-3 font-semibold text-[var(--bg)] transition-transform active:scale-[0.98]"
            >
              See the courses
            </a>
            <a
              href="#voices"
              className="rounded-full border border-[var(--edge)] bg-white/[0.03] px-6 py-3 font-medium backdrop-blur transition-colors hover:border-white/25"
            >
              Watch students
            </a>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {faculty.slice(0, 3).map((f, i) => (
            <div
              key={f.slug}
              className={`${card} aspect-[3/4] ${i === 1 ? "translate-y-8" : ""}`}
            >
              <Image
                src={f.portrait}
                alt={f.name}
                fill
                sizes="(max-width: 768px) 30vw, 15vw"
                className="object-cover"
                priority={i === 1}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--bg)] to-transparent p-3 pt-10">
                <p className="text-sm font-medium">{f.called}</p>
                <p className="text-xs text-[var(--muted)]">{f.teaches}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* bento: proof and what's included, five cells for five things */}
      <section
        id="why"
        className="relative mx-auto max-w-7xl scroll-mt-10 px-5 py-16 md:px-8"
      >
        <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight md:text-5xl">
          One fee. Everything to the exam hall.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-4 md:grid-rows-2">
          <div className={`${card} p-7 md:col-span-2 md:row-span-2`}>
            <Image
              src={campus[0]!.src}
              alt={campus[0]!.alt}
              fill
              sizes="(max-width: 768px) 92vw, 45vw"
              className="object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-[var(--card)]/40 to-transparent" />
            <div className="relative flex h-full min-h-72 flex-col justify-end">
              <p className="text-2xl font-semibold">
                20 Prelims and 20 Mains mock tests
              </p>
              <p className="mt-1 text-[var(--muted)]">
                Written in the classroom, discussed the same week.
              </p>
            </div>
          </div>
          {proof.slice(0, 3).map((p, i) => (
            <div
              key={p.label}
              className={`${card} p-7 ${i === 0 ? "md:col-span-2" : ""}`}
            >
              <p className="text-5xl font-semibold tracking-tight text-[var(--gold)] tabular-nums">
                {p.display}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">{p.label}</p>
            </div>
          ))}
        </div>
        <ul className="mt-8 flex flex-wrap gap-2">
          {included.slice(2, 7).map((item) => (
            <li
              key={item.text}
              className="rounded-full border border-[var(--edge)] px-4 py-2 text-sm text-[var(--muted)]"
            >
              {item.text}
            </li>
          ))}
        </ul>
      </section>

      {/* courses: a comparison row */}
      <section
        id="courses"
        className="relative mx-auto max-w-7xl scroll-mt-10 px-5 py-20 md:px-8"
      >
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
          Pick your exam.
        </h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {courses.map((c, i) => (
            <Link
              key={c.exam}
              href={c.href}
              className={`${card} group flex flex-col gap-5 p-7 transition-colors hover:border-white/20 ${i === 0 ? "ring-1 ring-[var(--gold)]/40" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--muted)]">{c.exam}</p>
                {i === 0 ? (
                  <span className="rounded-full bg-[var(--gold)]/15 px-2.5 py-1 text-xs font-medium text-[var(--gold)]">
                    Flagship
                  </span>
                ) : null}
              </div>
              <p className="text-2xl font-semibold">{c.name}</p>
              <p className="text-[var(--muted)]">{c.covers}.</p>
              <div className="mt-auto flex items-baseline gap-3 pt-4">
                {c.price ? (
                  <span className="text-3xl font-semibold tabular-nums">
                    {rupees(c.price)}
                  </span>
                ) : null}
                {c.mrp && c.price && c.mrp > c.price ? (
                  <span className="text-[var(--muted)] tabular-nums line-through">
                    {rupees(c.mrp)}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* officers */}
      <section className="relative mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className={`${card} grid gap-10 p-8 md:grid-cols-2 md:p-12`}>
          {[officerA, officerB].map((s) =>
            s ? (
              <figure key={s.serial}>
                <blockquote className="text-xl leading-relaxed md:text-2xl">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-sm text-[var(--muted)]">
                  <span className="text-[var(--ink)]">{s.name}</span>, {s.post}.
                  APSC CCE 2022, serial {s.serial}.
                </figcaption>
              </figure>
            ) : null
          )}
        </div>
      </section>

      {/* student voices: horizontal scroll-snap */}
      <section id="voices" className="relative scroll-mt-10 py-20">
        <h2 className="mx-auto max-w-7xl px-5 text-3xl font-semibold tracking-tight md:px-8 md:text-5xl">
          Students, on camera.
        </h2>
        <ul className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          {reviews.map((r) => (
            <li key={r.id} className="w-56 shrink-0 snap-start">
              <a
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className={`${card} block aspect-[9/14]`}
              >
                <Image
                  src={r.image}
                  alt={`${r.name} reviewing ICT`}
                  fill
                  sizes="224px"
                  className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </a>
              <p className="mt-3 font-medium">{r.name}</p>
              <p className="text-sm text-[var(--muted)]">{r.batch}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 pb-36 md:px-8">
        <div
          className={`${card} flex flex-col items-start gap-6 p-10 md:flex-row md:items-center md:justify-between md:p-14`}
        >
          <h2 className="max-w-[18ch] text-3xl font-semibold tracking-tight md:text-4xl">
            Sit in on a real class first.
          </h2>
          <a
            href={whatsapp}
            className="rounded-full bg-[var(--gold)] px-7 py-3.5 font-semibold text-[var(--bg)]"
          >
            Book a free class
          </a>
        </div>
      </section>

      <ConceptSwitcher current={2} />
    </div>
  )
}
