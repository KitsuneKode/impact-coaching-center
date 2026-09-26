import type { Metadata } from "next"
import { EB_Garamond, Public_Sans } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import {
  campus,
  courses,
  faculty,
  joining,
  links,
  proof,
  rupees,
  selections,
  whatsapp,
} from "../_data"
import { ConceptSwitcher } from "../_switcher"

const serif = EB_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--c3-serif",
})
const sans = Public_Sans({ subsets: ["latin"], variable: "--c3-sans" })

export const metadata: Metadata = { title: "Ledger" }

// Cool paper white, navy ink, a gold dark enough to read on white.
const tokens = {
  "--paper": "#F6F8FC",
  "--ink": "#13224A",
  "--soft": "#4A5878",
  "--rule": "#D5DCEA",
  "--gold": "#A67C1B",
  "--wash": "#EAF0FA",
} as CSSProperties

const serifCls = "font-[family-name:var(--c3-serif)]"

export default function Ledger() {
  return (
    <div
      style={tokens}
      className={`${serif.variable} ${sans.variable} min-h-[100dvh] bg-[var(--paper)] font-[family-name:var(--c3-sans)] text-[var(--ink)]`}
    >
      {/* masthead */}
      <header className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex h-16 items-center justify-between border-b border-[var(--ink)]">
          <Link
            href="/redesign/3"
            className={`${serifCls} text-2xl font-semibold tracking-tight`}
          >
            Impact Career Tutorials
          </Link>
          <nav className="hidden gap-6 text-sm text-[var(--soft)] md:flex">
            <a href="#courses" className="hover:text-[var(--ink)]">
              Courses
            </a>
            <a href="#results" className="hover:text-[var(--ink)]">
              Results
            </a>
            <a href="#join" className="hover:text-[var(--ink)]">
              How to join
            </a>
          </nav>
          <a
            href={whatsapp}
            className="bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--paper)]"
          >
            Book a free class
          </a>
        </div>
      </header>

      {/* front page: lead story left, photo right */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pt-12 pb-16 md:grid-cols-[1.15fr_1fr] md:px-8">
        <div className="flex flex-col">
          <h1
            className={`${serifCls} text-5xl leading-[1.02] font-semibold tracking-tight text-balance md:text-[4.6rem]`}
          >
            Two officers on the APSC list prepared in this classroom.
          </h1>
          <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-[var(--soft)]">
            ICT coaches APSC, ADRE, Assam Police and banking aspirants in North
            Lakhimpur, with every lecture on YouTube before you pay.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#courses"
              className="bg-[var(--gold)] px-6 py-3 font-semibold text-white"
            >
              See the courses
            </a>
            <a
              href={links.apscResultPdf}
              className="border-b-2 border-[var(--ink)] py-3 font-medium"
            >
              Read the result
            </a>
          </div>
        </div>
        <figure>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={campus[3]!.src}
              alt={campus[3]!.alt}
              fill
              priority
              sizes="(max-width: 768px) 92vw, 45vw"
              className="object-cover grayscale-[35%]"
            />
          </div>
          <figcaption className="mt-2 border-t border-[var(--rule)] pt-2 text-sm text-[var(--soft)]">
            An ordinary class day at the centre, DC Bungalow Road.
          </figcaption>
        </figure>
      </section>

      {/* ticker of figures, set in columns */}
      <section className="border-y-2 border-[var(--ink)] bg-[var(--wash)]">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-[var(--rule)] md:grid-cols-4">
          {proof.map((p) => (
            <div key={p.label} className="px-5 py-6 md:px-8">
              <dt className="sr-only">{p.label}</dt>
              <dd className={`${serifCls} text-4xl font-semibold tabular-nums`}>
                {p.display}
              </dd>
              <dd className="mt-1 text-sm text-[var(--soft)]">{p.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* results as a pull-quote spread */}
      <section
        id="results"
        className="mx-auto max-w-6xl scroll-mt-10 px-5 py-20 md:px-8"
      >
        <div className="grid gap-12 md:grid-cols-2">
          {selections.map((s) => (
            <figure
              key={s.serial}
              className="border-t-4 border-[var(--gold)] pt-6"
            >
              <blockquote
                className={`${serifCls} text-3xl leading-snug italic`}
              >
                &ldquo;{s.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-sm tracking-wide text-[var(--soft)] uppercase">
                {s.name}, {s.post}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* courses: three newspaper columns */}
      <section
        id="courses"
        className="scroll-mt-10 bg-[var(--ink)] py-20 text-[var(--paper)]"
      >
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <h2 className={`${serifCls} text-4xl font-semibold md:text-5xl`}>
            The courses
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-white/15">
            {courses.map((c) => (
              <Link
                key={c.exam}
                href={c.href}
                className="group flex flex-col gap-3 md:px-8 md:first:pl-0 md:last:pr-0"
              >
                <p className="text-sm tracking-wide text-[#C9A551] uppercase">
                  {c.exam}
                </p>
                <p
                  className={`${serifCls} text-3xl font-semibold group-hover:underline`}
                >
                  {c.name}
                </p>
                <p className="text-white/70">
                  {c.covers}. {c.duration}.
                </p>
                {c.price ? (
                  <p className="mt-2 text-2xl font-semibold tabular-nums">
                    {rupees(c.price)}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* faculty: a staff box */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <h2 className={`${serifCls} text-4xl font-semibold md:text-5xl`}>
          Who teaches
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5">
          {faculty.map((f) => (
            <li key={f.slug}>
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={f.portrait}
                  alt={f.name}
                  fill
                  sizes="(max-width: 768px) 45vw, 18vw"
                  className="object-cover grayscale transition-[filter] duration-300 hover:grayscale-0"
                />
              </div>
              <p className={`${serifCls} mt-3 text-xl font-semibold`}>
                {f.name}
              </p>
              <p className="text-sm text-[var(--soft)]">{f.teaches}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* how to join: numbered because it is a real sequence */}
      <section
        id="join"
        className="mx-auto max-w-6xl scroll-mt-10 px-5 pb-36 md:px-8"
      >
        <div className="grid gap-10 border-t-2 border-[var(--ink)] pt-10 md:grid-cols-[1fr_2fr]">
          <h2 className={`${serifCls} text-4xl font-semibold`}>
            Joining takes three steps.
          </h2>
          <ol className="grid gap-8">
            {joining.map((j, i) => (
              <li key={j.verb} className="grid grid-cols-[3rem_1fr] gap-4">
                <span className={`${serifCls} text-4xl text-[var(--gold)]`}>
                  {i + 1}
                </span>
                <div>
                  <p className="text-lg font-semibold">{j.verb}</p>
                  <p className="text-[var(--soft)]">{j.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ConceptSwitcher current={3} />
    </div>
  )
}
