import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import {
  campus,
  contact,
  courses,
  faculty,
  joining,
  proof,
  reviews,
  rupees,
  selections,
  whatsapp,
} from "../_data"
import { ConceptSwitcher } from "../_switcher"

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--c6-sans" })

export const metadata: Metadata = { title: "Campus" }

// Bright white, navy for type and depth, gold for the one thing to press.
const tokens = {
  "--bg": "#FAFBFF",
  "--navy": "#0F2A5C",
  "--sky": "#EAF0FF",
  "--gold": "#E0A91B",
  "--soft": "#52607D",
  "--line": "#DFE5F2",
} as CSSProperties

const tile = "relative overflow-hidden rounded-[28px]"

export default function Campus() {
  return (
    <div
      style={tokens}
      className={`${sans.variable} min-h-[100dvh] bg-[var(--bg)] font-[family-name:var(--c6-sans)] text-[var(--navy)]`}
    >
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link
            href="/redesign/6"
            className="flex items-center gap-2.5 font-bold"
          >
            <Image src="/brand/ict-mark.png" alt="" width={30} height={30} />
            Impact Career Tutorials
          </Link>
          <nav className="hidden gap-7 text-sm font-medium text-[var(--soft)] md:flex">
            <a href="#courses" className="hover:text-[var(--navy)]">
              Courses
            </a>
            <a href="#campus" className="hover:text-[var(--navy)]">
              Campus
            </a>
            <a href="#students" className="hover:text-[var(--navy)]">
              Students
            </a>
          </nav>
          <a
            href={whatsapp}
            className="rounded-full bg-[var(--gold)] px-5 py-2.5 text-sm font-bold text-[var(--navy)] transition-transform active:scale-[0.97]"
          >
            Book a free class
          </a>
        </div>
      </header>

      {/* hero: headline over a full photo tile */}
      <section className="mx-auto max-w-7xl px-5 pt-8 md:px-8">
        <div className={`${tile} min-h-[560px] md:min-h-[620px]`}>
          <Image
            src={campus[1]!.src}
            alt={campus[1]!.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy)]/92 via-[var(--navy)]/60 to-transparent" />
          <div className="relative flex min-h-[560px] max-w-2xl flex-col justify-end p-7 text-white md:min-h-[620px] md:p-14">
            <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight text-balance md:text-6xl">
              A full hall, every mock test. Join them.
            </h1>
            <p className="mt-5 max-w-[42ch] text-lg text-white/80">
              APSC, ADRE, Assam Police and banking coaching in North Lakhimpur,
              offline or on the ICT app.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#courses"
                className="rounded-full bg-[var(--gold)] px-6 py-3.5 font-bold text-[var(--navy)]"
              >
                See the courses
              </a>
              <a
                href={`tel:${contact.phones[0]}`}
                className="rounded-full bg-white/15 px-6 py-3.5 font-semibold backdrop-blur hover:bg-white/25"
              >
                Call the centre
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* proof row */}
      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-10 md:grid-cols-4 md:px-8">
        {proof.map((p) => (
          <div key={p.label} className="rounded-3xl bg-[var(--sky)] p-6">
            <p className="text-4xl font-extrabold tracking-tight tabular-nums">
              {p.display}
            </p>
            <p className="mt-1 text-sm text-[var(--soft)]">{p.label}</p>
          </div>
        ))}
      </section>

      {/* courses with their real posters */}
      <section
        id="courses"
        className="mx-auto max-w-7xl scroll-mt-20 px-5 py-14 md:px-8"
      >
        <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
          Choose your exam
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {courses.map((c) => (
            <Link
              key={c.exam}
              href={c.href}
              className="group overflow-hidden rounded-3xl border border-[var(--line)] bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgb(15_42_92/0.35)]"
            >
              <div className="relative aspect-square bg-[var(--sky)]">
                {c.cover ? (
                  <Image
                    src={c.cover}
                    alt={`${c.name} course poster`}
                    fill
                    sizes="(max-width: 768px) 92vw, 30vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-[var(--soft)]">
                  {c.exam}
                </p>
                <p className="mt-1 text-xl font-bold">{c.name}</p>
                <div className="mt-4 flex items-center justify-between">
                  {c.price ? (
                    <span className="text-2xl font-extrabold tabular-nums">
                      {rupees(c.price)}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="rounded-full bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white">
                    View course
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* campus bento: five photos, five cells */}
      <section
        id="campus"
        className="mx-auto max-w-7xl scroll-mt-20 px-5 py-14 md:px-8"
      >
        <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
          Inside the centre
        </h2>
        <div className="mt-8 grid auto-rows-[200px] gap-4 md:grid-cols-4">
          {campus.slice(0, 5).map((p, i) => (
            <figure
              key={p.src}
              className={`${tile} ${i === 0 ? "md:col-span-2 md:row-span-2" : ""} ${i === 3 ? "md:col-span-2" : ""}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(max-width: 768px) 92vw, 40vw"
                className="object-cover"
              />
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">
                {p.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* teachers */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
          Your teachers
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {faculty.map((f) => (
            <li key={f.slug} className="rounded-3xl bg-[var(--sky)] p-3">
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <Image
                  src={f.portrait}
                  alt={f.name}
                  fill
                  sizes="(max-width: 768px) 45vw, 18vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 px-1 font-bold">{f.called}</p>
              <p className="px-1 pb-1 text-sm text-[var(--soft)]">
                {f.teaches}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* student reviews + officers */}
      <section
        id="students"
        className="scroll-mt-20 bg-[var(--navy)] py-20 text-white"
      >
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Students say it better
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-6">
            {reviews.map((r) => (
              <li key={r.id}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  className="relative block aspect-[9/14] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={r.image}
                    alt={`${r.name} reviewing ICT`}
                    fill
                    sizes="(max-width: 768px) 45vw, 15vw"
                    className="object-cover"
                  />
                </a>
                <p className="mt-2 text-sm font-semibold">{r.name}</p>
              </li>
            ))}
          </ul>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {selections.map((s) => (
              <figure
                key={s.serial}
                className="rounded-3xl bg-white/[0.06] p-7"
              >
                <blockquote className="text-lg">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm text-white/70">
                  <span className="font-bold text-[var(--gold)]">{s.name}</span>
                  , {s.post}, APSC CCE 2022
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* joining */}
      <section className="mx-auto max-w-7xl px-5 py-20 pb-36 md:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
          Start this week
        </h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {joining.map((j, i) => (
            <li
              key={j.verb}
              className="rounded-3xl border border-[var(--line)] bg-white p-7"
            >
              <span className="grid size-10 place-items-center rounded-full bg-[var(--gold)] font-extrabold">
                {i + 1}
              </span>
              <p className="mt-5 text-xl font-bold">{j.verb}</p>
              <p className="mt-2 text-[var(--soft)]">{j.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <ConceptSwitcher current={6} />
    </div>
  )
}
