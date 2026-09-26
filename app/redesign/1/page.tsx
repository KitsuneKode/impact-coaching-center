import type { Metadata } from "next"
import { Cormorant_Garamond, Manrope } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import {
  campus,
  contact,
  courses,
  faculty,
  links,
  proof,
  rupees,
  selections,
  whatsapp,
} from "../_data"
import { ConceptSwitcher } from "../_switcher"

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--c1-display",
})
const body = Manrope({ subsets: ["latin"], variable: "--c1-body" })

export const metadata: Metadata = { title: "Charter" }

// Deep navy field, antique gold, ivory ink.
const tokens = {
  "--bg": "#0B1633",
  "--panel": "#101F45",
  "--line": "rgb(200 162 74 / 0.28)",
  "--gold": "#C8A24A",
  "--ink": "#EEF1F7",
  "--muted": "#9AA6C2",
} as CSSProperties

const rise =
  "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:duration-700 motion-safe:fill-mode-both"

export default function Charter() {
  return (
    <div
      style={tokens}
      className={`${display.variable} ${body.variable} min-h-[100dvh] bg-[var(--bg)] font-[family-name:var(--c1-body)] text-[var(--ink)]`}
    >
      <header className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link href="/redesign/1" className="flex items-center gap-3">
          <Image
            src="/brand/ict-mark.png"
            alt=""
            width={32}
            height={32}
            className="rounded-sm bg-white p-0.5"
          />
          <span className="font-[family-name:var(--c1-display)] text-xl font-semibold tracking-wide">
            Impact Career Tutorials
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[var(--muted)] md:flex">
          <a href="#courses" className="hover:text-[var(--ink)]">
            Courses
          </a>
          <a href="#faculty" className="hover:text-[var(--ink)]">
            Faculty
          </a>
          <a href="#results" className="hover:text-[var(--ink)]">
            Results
          </a>
        </nav>
        <a
          href={whatsapp}
          className="rounded-full border border-[var(--gold)] px-5 py-2.5 text-sm font-medium text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--bg)]"
        >
          Book a free class
        </a>
      </header>

      {/* hero: a manifesto, centred like a charter */}
      <section className="relative overflow-hidden px-5 pt-16 pb-24 text-center md:pt-24 md:pb-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgb(200_162_74/0.14),transparent_65%)]"
        />
        <p
          className={`${rise} text-sm tracking-[0.3em] text-[var(--gold)] uppercase`}
        >
          North Lakhimpur, Assam
        </p>
        <h1
          className={`${rise} mx-auto mt-6 max-w-[16ch] font-[family-name:var(--c1-display)] text-5xl leading-[1.05] font-medium text-balance [animation-delay:80ms] md:text-7xl`}
        >
          Where Assam&rsquo;s officers{" "}
          <em className="text-[var(--gold)] not-italic md:italic">begin</em>.
        </h1>
        <p
          className={`${rise} mx-auto mt-6 max-w-[46ch] text-lg text-[var(--muted)] [animation-delay:160ms]`}
        >
          Coaching for APSC, ADRE, Assam Police and banking exams, taught by
          faculty you can watch on YouTube first.
        </p>
        <div
          className={`${rise} mt-10 flex flex-wrap justify-center gap-3 [animation-delay:240ms]`}
        >
          <a
            href="#courses"
            className="rounded-full bg-[var(--gold)] px-7 py-3.5 font-semibold text-[var(--bg)] transition-transform active:scale-[0.98]"
          >
            See the courses
          </a>
          <a
            href={`tel:${contact.phones[0]}`}
            className="rounded-full border border-white/20 px-7 py-3.5 font-medium transition-colors hover:border-white/50"
          >
            Call the centre
          </a>
        </div>
      </section>

      {/* proof as an engraved row */}
      <section className="border-y border-[var(--line)]">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
          {proof.map((p) => (
            <div
              key={p.label}
              className="border-[var(--line)] px-5 py-8 text-center not-last:border-r md:px-8"
            >
              <dt className="sr-only">{p.label}</dt>
              <dd className="font-[family-name:var(--c1-display)] text-5xl text-[var(--gold)]">
                {p.display}
              </dd>
              <dd className="mt-2 text-sm text-[var(--muted)]">{p.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* courses: three chapters */}
      <section
        id="courses"
        className="mx-auto max-w-6xl scroll-mt-10 px-5 py-24 md:px-8"
      >
        <h2 className="max-w-[20ch] font-[family-name:var(--c1-display)] text-4xl font-medium md:text-5xl">
          Three roads into government service.
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-[var(--line)] md:grid-cols-3">
          {courses.map((c) => (
            <Link
              key={c.exam}
              href={c.href}
              className="group flex flex-col gap-6 bg-[var(--bg)] p-8 transition-colors hover:bg-[var(--panel)]"
            >
              <p className="font-[family-name:var(--c1-display)] text-3xl">
                {c.exam}
              </p>
              <p className="text-[var(--muted)]">{c.covers}.</p>
              <div className="mt-auto flex items-end justify-between border-t border-[var(--line)] pt-6">
                <div>
                  <p className="text-sm text-[var(--muted)]">{c.name}</p>
                  {c.price ? (
                    <p className="text-2xl font-semibold tabular-nums">
                      {rupees(c.price)}
                    </p>
                  ) : null}
                </div>
                <span
                  aria-hidden
                  className="text-[var(--gold)] transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* officers: quotes set large */}
      <section
        id="results"
        className="scroll-mt-10 bg-[var(--panel)] px-5 py-24 md:px-8"
      >
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2">
          {selections.map((s) => (
            <figure key={s.serial} className="grid gap-6">
              <span
                aria-hidden
                className="font-[family-name:var(--c1-display)] text-7xl leading-none text-[var(--gold)]"
              >
                &ldquo;
              </span>
              <blockquote className="-mt-8 font-[family-name:var(--c1-display)] text-3xl leading-snug">
                {s.quote}
              </blockquote>
              <figcaption className="text-[var(--muted)]">
                <span className="font-semibold text-[var(--ink)]">
                  {s.name}
                </span>
                , {s.post}. Serial {s.serial}, APSC CCE 2022.
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mx-auto mt-14 max-w-6xl text-sm text-[var(--muted)]">
          <a
            href={links.apscResultPdf}
            className="text-[var(--gold)] underline underline-offset-4"
          >
            Check the commission&rsquo;s result
          </a>
        </p>
      </section>

      {/* faculty: portrait row */}
      <section
        id="faculty"
        className="mx-auto max-w-6xl scroll-mt-10 px-5 py-24 md:px-8"
      >
        <h2 className="font-[family-name:var(--c1-display)] text-4xl font-medium md:text-5xl">
          The faculty.
        </h2>
        <ul className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-5">
          {faculty.map((f) => (
            <li key={f.slug}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl ring-1 ring-[var(--line)]">
                <Image
                  src={f.portrait}
                  alt={f.name}
                  fill
                  sizes="(max-width: 768px) 45vw, 18vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 font-semibold">{f.called}</p>
              <p className="text-sm text-[var(--muted)]">{f.teaches}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* campus + close */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-32 md:grid-cols-[1.2fr_1fr] md:items-center md:px-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-[var(--line)]">
          <Image
            src={campus[1]!.src}
            alt={campus[1]!.alt}
            fill
            sizes="(max-width: 768px) 92vw, 55vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-[family-name:var(--c1-display)] text-4xl font-medium text-balance md:text-5xl">
            Sit in on a class before you pay.
          </h2>
          <p className="mt-4 text-[var(--muted)]">
            DC Bungalow Road, North Lakhimpur. Offline, or online in the digital
            classroom.
          </p>
          <a
            href={whatsapp}
            className="mt-8 inline-block rounded-full bg-[var(--gold)] px-7 py-3.5 font-semibold text-[var(--bg)]"
          >
            Book a free class
          </a>
        </div>
      </section>

      <ConceptSwitcher current={1} />
    </div>
  )
}
