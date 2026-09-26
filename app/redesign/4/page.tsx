import type { Metadata } from "next"
import { Anton, Figtree } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import {
  campus,
  contact,
  courses,
  faculty,
  offer,
  proof,
  rupees,
  selections,
  whatsapp,
} from "../_data"
import { ConceptSwitcher } from "../_switcher"

const poster = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--c4-poster",
})
const body = Figtree({ subsets: ["latin"], variable: "--c4-body" })

export const metadata: Metadata = { title: "Poster" }

// Royal blue field, a deeper blue for depth, gold for anything you press.
const tokens = {
  "--royal": "#1638B8",
  "--deep": "#0E2477",
  "--gold": "#FFC940",
  "--white": "#F4F6FF",
  "--haze": "#B9C6F5",
} as CSSProperties

const big =
  "font-[family-name:var(--c4-poster)] uppercase leading-[0.86] font-black tracking-[-0.01em]"
const exams = [
  "APSC",
  "ADRE",
  "Assam Police SI",
  "Bank PO",
  "SSC",
  "Railway NTPC",
]

export default function Poster() {
  return (
    <div
      style={tokens}
      className={`${poster.variable} ${body.variable} min-h-[100dvh] bg-[var(--royal)] font-[family-name:var(--c4-body)] text-[var(--white)]`}
    >
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/redesign/4" className={`${big} text-2xl`}>
          ICT
        </Link>
        <nav className="hidden gap-7 text-sm font-medium md:flex">
          <a href="#courses" className="hover:text-[var(--gold)]">
            Courses
          </a>
          <a href="#faculty" className="hover:text-[var(--gold)]">
            Faculty
          </a>
          <a href="#results" className="hover:text-[var(--gold)]">
            Results
          </a>
        </nav>
        <a
          href={whatsapp}
          className="rounded-full bg-[var(--gold)] px-5 py-2.5 text-sm font-bold text-[var(--deep)] transition-transform active:scale-[0.97]"
        >
          Book a free class
        </a>
      </header>

      {/* hero: the exams, as big as the ambition */}
      <section className="relative mx-auto max-w-7xl overflow-hidden px-5 pt-10 pb-16 md:px-8">
        <h1 className={`${big} text-[clamp(4rem,14vw,12rem)]`}>
          Clear <span className="text-[var(--gold)]">APSC.</span>
          <br />
          From Lakhimpur.
        </h1>
        <div className="mt-10 grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <p className="max-w-[42ch] text-xl text-[var(--haze)]">
            {offer.promise} Classroom, night batch and the ICT app.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#courses"
              className="rounded-full bg-[var(--gold)] px-7 py-4 text-lg font-bold text-[var(--deep)]"
            >
              See the courses
            </a>
            <a
              href={`tel:${contact.phones[0]}`}
              className="rounded-full border-2 border-[var(--white)] px-7 py-4 text-lg font-bold"
            >
              Call the centre
            </a>
          </div>
        </div>
      </section>

      {/* the one marquee on the page: every exam ICT prepares for */}
      <section
        aria-label="Exams"
        className="overflow-hidden border-y-2 border-[var(--gold)] bg-[var(--deep)] py-5"
      >
        <div className="flex w-max gap-12 motion-safe:animate-[c4-marquee_28s_linear_infinite]">
          {[...exams, ...exams].map((e, i) => (
            <span
              key={i}
              aria-hidden={i >= exams.length}
              className={`${big} text-5xl whitespace-nowrap text-[var(--gold)]`}
            >
              {e} <span className="text-[var(--white)]/40">/</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes c4-marquee { to { transform: translateX(-50%) } }`}</style>
      </section>

      {/* proof: numbers as posters */}
      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-[var(--white)]/15 md:grid-cols-4">
        {proof.map((p) => (
          <div key={p.label} className="bg-[var(--royal)] px-5 py-10 md:px-8">
            <p className={`${big} text-7xl text-[var(--gold)] tabular-nums`}>
              {p.display}
            </p>
            <p className="mt-3 text-[var(--haze)]">{p.label}</p>
          </div>
        ))}
      </section>

      {/* courses: stacked full-width bands */}
      <section id="courses" className="scroll-mt-10 py-20">
        {courses.map((c) => (
          <Link
            key={c.exam}
            href={c.href}
            className={`group block border-t-2 border-[var(--white)]/20 transition-colors last:border-b-2 hover:bg-[var(--deep)]`}
          >
            <div className="mx-auto grid max-w-7xl items-center gap-4 px-5 py-8 md:grid-cols-[1fr_1.4fr_auto] md:px-8">
              <p className={`${big} text-6xl group-hover:text-[var(--gold)]`}>
                {c.exam}
              </p>
              <p className="text-lg text-[var(--haze)]">
                {c.name}. {c.covers}.
              </p>
              {c.price ? (
                <p className={`${big} text-5xl tabular-nums`}>
                  {rupees(c.price)}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </section>

      {/* faculty: tight contact sheet */}
      <section
        id="faculty"
        className="mx-auto max-w-7xl scroll-mt-10 px-5 pb-20 md:px-8"
      >
        <h2 className={`${big} text-7xl`}>The teachers</h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {faculty.map((f) => (
            <li
              key={f.slug}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--deep)]"
            >
              <Image
                src={f.portrait}
                alt={f.name}
                fill
                sizes="(max-width: 768px) 45vw, 18vw"
                className="object-cover mix-blend-luminosity transition-[mix-blend-mode] group-hover:mix-blend-normal"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--deep)] p-4 pt-12">
                <p className={`${big} text-3xl`}>{f.called}</p>
                <p className="text-sm text-[var(--haze)]">{f.teaches}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* results + campus */}
      <section
        id="results"
        className="scroll-mt-10 bg-[var(--gold)] py-20 text-[var(--deep)]"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[1fr_1fr] md:px-8">
          <div>
            <h2 className={`${big} text-7xl`}>On the APSC list.</h2>
            {selections.map((s) => (
              <p key={s.serial} className="mt-6 text-xl font-semibold">
                {s.name}.{" "}
                <span className="font-normal">
                  {s.post}, serial {s.serial}.
                </span>
              </p>
            ))}
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src={campus[5]!.src}
              alt={campus[5]!.alt}
              fill
              sizes="(max-width: 768px) 92vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 pb-36 md:px-8">
        <h2 className={`${big} text-[clamp(3rem,9vw,7rem)]`}>
          Sit in on a class. Free.
        </h2>
        <a
          href={whatsapp}
          className="mt-8 inline-block rounded-full bg-[var(--gold)] px-8 py-4 text-lg font-bold text-[var(--deep)]"
        >
          Book a free class
        </a>
      </section>

      <ConceptSwitcher current={4} />
    </div>
  )
}
