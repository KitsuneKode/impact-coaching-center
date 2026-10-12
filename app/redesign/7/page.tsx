import type { Metadata } from "next"
import { Fraunces, Instrument_Sans } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { contact, formatPhone } from "@/lib/brand"

import {
  campus,
  courses,
  faculty,
  joining,
  links,
  offer,
  proof,
  rupees,
  selections,
  whatsapp,
} from "../_data"
import { ConceptSwitcher } from "../_switcher"

const serif = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
  variable: "--c7-serif",
})
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--c7-sans" })

export const metadata: Metadata = { title: "Roll Number" }

/*
 * Roll Number. The idea: the only numbers that matter to an aspirant are the
 * ones printed on a result sheet. The serials from the real APSC CCE 2022
 * list (46 and 31) become the structural motif - set huge, in hairline gold -
 * and everything else is quiet ink on warm paper. Gold is never text on the
 * light ground; it appears as rules, numerals on navy, and one underline.
 */
const tokens = {
  "--paper": "#F4F1EA",
  "--paper-2": "#EAE5DA",
  "--ink": "#0E1A2E",
  "--ink-2": "#1A2A45",
  "--soft": "#5A6275",
  "--rule": "rgb(14 26 46 / 0.14)",
  "--gold": "#C9A24B",
  "--gold-ink": "#8A6A1F",
} as CSSProperties

const display = "font-[family-name:var(--c7-serif)] [font-optical-sizing:auto]"
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"

export default function RollNumber() {
  const [lead, second] = selections
  return (
    <div
      style={tokens}
      className={`${serif.variable} ${sans.variable} min-h-[100dvh] bg-[var(--paper)] font-[family-name:var(--c7-sans)] text-[var(--ink)] antialiased selection:bg-[var(--gold)]/40`}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Masthead: a thin rule of facts above a quiet nav                 */}
      {/* ---------------------------------------------------------------- */}
      <div className="bg-[var(--ink)] text-[0.8125rem] text-white/70">
        <div className="mx-auto flex h-9 max-w-[88rem] items-center justify-between gap-6 px-5 md:px-10">
          <p className="truncate">
            DC Bungalow Road, North Lakhimpur
            <span className="mx-2 text-[var(--gold)]">/</span>
            APSC · ADRE · Assam Police · Banking
          </p>
          <a
            href={`tel:${contact.phones[0]}`}
            className={`hidden tabular-nums hover:text-white sm:block ${focus}`}
          >
            {formatPhone(contact.phones[0])}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[var(--paper)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between px-5 md:px-10">
          <Link
            href="/redesign/7"
            className={`flex items-baseline gap-2 ${focus}`}
          >
            <span
              className={`${display} text-2xl font-semibold tracking-tight`}
            >
              Impact
            </span>
            <span className="hidden text-xs tracking-[0.2em] text-[var(--soft)] uppercase sm:inline">
              Career Tutorials
            </span>
          </Link>
          <nav
            aria-label="Concept sections"
            className="hidden items-center gap-8 text-sm text-[var(--soft)] md:flex"
          >
            {[
              ["#results", "Results"],
              ["#courses", "Courses"],
              ["#faculty", "Faculty"],
              ["#free", "Free material"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={`transition-colors hover:text-[var(--ink)] ${focus}`}
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            href={whatsapp}
            className={`inline-flex h-11 items-center rounded-full bg-[var(--ink)] px-5 text-sm font-medium whitespace-nowrap text-[var(--paper)] transition-colors hover:bg-[var(--ink-2)] ${focus}`}
          >
            {offer.cta}
          </a>
        </div>
      </header>

      <main>
        {/* -------------------------------------------------------------- */}
        {/* Hero: the headline left, a tall documentary frame right, the   */}
        {/* result serial set as architecture behind both                  */}
        {/* -------------------------------------------------------------- */}
        <section className="relative overflow-hidden">
          <span
            aria-hidden
            className={`${display} pointer-events-none absolute -top-10 right-[-4vw] hidden text-[34vw] leading-none font-light text-transparent opacity-60 select-none [-webkit-text-stroke:1px_var(--gold)] md:block md:text-[26vw]`}
          >
            {lead?.serial}
          </span>
          <div className="relative mx-auto grid max-w-[88rem] gap-12 px-5 pt-14 pb-20 md:grid-cols-12 md:px-10 md:pt-24 md:pb-28">
            <div className="md:col-span-7 md:pt-6">
              <p className="flex items-center gap-3 text-xs tracking-[0.22em] text-[var(--soft)] uppercase">
                <span className="h-px w-10 bg-[var(--gold)]" />
                APSC CCE 2022 · published 17 January 2024
              </p>
              <h1
                className={`${display} mt-7 text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] font-normal tracking-[-0.03em] text-balance`}
              >
                Your roll number, on{" "}
                <em className="font-light italic">the list</em>.
              </h1>
              <p className="mt-8 max-w-[44ch] text-lg leading-relaxed text-[var(--soft)] md:text-xl">
                Two officers on the APSC CCE 2022 list prepared in this
                classroom. Watch every teacher on YouTube before you pay a
                rupee.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <a
                  href="#courses"
                  className={`group inline-flex h-13 items-center gap-3 rounded-full bg-[var(--ink)] pr-2 pl-7 text-[0.9375rem] font-medium text-[var(--paper)] transition-colors hover:bg-[var(--ink-2)] ${focus}`}
                >
                  See the three tracks
                  <span className="grid size-9 place-items-center rounded-full bg-[var(--gold)] text-[var(--ink)] transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
                <a
                  href={links.apscResultPdf}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`border-b border-[var(--gold-ink)] pb-1 text-[0.9375rem] font-medium ${focus}`}
                >
                  Read the commission&rsquo;s result
                </a>
              </div>
            </div>

            <figure className="md:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[var(--paper-2)] shadow-[0_40px_80px_-40px_rgb(14_26_46/0.45)]">
                <Image
                  src={campus[1]?.src ?? campus[0]!.src}
                  alt={campus[1]?.alt ?? campus[0]!.alt}
                  fill
                  priority
                  sizes="(max-width: 768px) 92vw, 38vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--ink)]/85 to-transparent p-5 pt-16 text-white">
                  <p className="text-xs tracking-[0.2em] text-white/70 uppercase">
                    Frame from ICT&rsquo;s own footage
                  </p>
                </div>
              </div>
              <figcaption className="mt-3 flex justify-between text-xs text-[var(--soft)]">
                <span>The centre, on an ordinary week</span>
                <span className="tabular-nums">Fig. 01</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Proof, as a printed ledger row                                  */}
        {/* -------------------------------------------------------------- */}
        <section
          aria-label="ICT in numbers"
          className="border-y border-[var(--rule)]"
        >
          <dl className="mx-auto grid max-w-[88rem] grid-cols-2 md:grid-cols-4">
            {proof.map((p, i) => (
              <div
                key={p.label}
                className={`flex flex-col px-5 py-8 md:px-10 md:py-10 ${i % 2 ? "border-l border-[var(--rule)]" : ""} ${i > 1 ? "border-t border-[var(--rule)] md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
              >
                <dt className="order-2 mt-2 text-sm text-[var(--soft)]">
                  {p.label}
                </dt>
                <dd
                  className={`${display} text-5xl font-light tracking-tight tabular-nums md:text-6xl`}
                >
                  {p.display}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Results: navy spread, serials in gold, quotes in serif italic  */}
        {/* -------------------------------------------------------------- */}
        <section
          id="results"
          className="scroll-mt-16 bg-[var(--ink)] text-[var(--paper)]"
        >
          <div className="mx-auto max-w-[88rem] px-5 py-24 md:px-10 md:py-32">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2
                className={`${display} max-w-[16ch] text-4xl leading-[1.02] font-normal tracking-tight md:text-6xl`}
              >
                Two names, both in the commission&rsquo;s own result.
              </h2>
              <p className="max-w-[36ch] text-white/60">
                We print serials, not &ldquo;top rankers&rdquo;. Each one links
                back to the published list.
              </p>
            </div>
            <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-2">
              {[lead, second].filter(Boolean).map((s) => (
                <figure
                  key={s!.serial}
                  className="grid gap-8 bg-[var(--ink)] p-0 md:p-12 md:first:pl-0"
                >
                  <div className="flex items-baseline gap-4">
                    <span
                      className={`${display} text-8xl leading-none font-light text-[var(--gold)] tabular-nums md:text-9xl`}
                    >
                      {s!.serial}
                    </span>
                    <span className="text-xs tracking-[0.2em] text-white/50 uppercase">
                      Serial
                    </span>
                  </div>
                  <blockquote
                    className={`${display} text-2xl leading-snug font-light italic md:text-[1.75rem]`}
                  >
                    &ldquo;{s!.quote}&rdquo;
                  </blockquote>
                  <figcaption className="border-t border-white/15 pt-5">
                    <p className="font-medium">{s!.name}</p>
                    <p className="text-sm text-white/60">{s!.post}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Courses: an index, not a card grid                             */}
        {/* -------------------------------------------------------------- */}
        <section id="courses" className="scroll-mt-16">
          <div className="mx-auto max-w-[88rem] px-5 py-24 md:px-10 md:py-32">
            <div className="grid gap-6 md:grid-cols-12">
              <p className="text-xs tracking-[0.22em] text-[var(--soft)] uppercase md:col-span-3">
                The tracks
              </p>
              <h2
                className={`${display} text-4xl leading-[1.02] font-normal tracking-tight md:col-span-9 md:text-6xl`}
              >
                Three tracks. One classroom, recorded the same day.
              </h2>
            </div>
            <ol className="mt-16 border-t border-[var(--ink)]">
              {courses.map((c, i) => (
                <li key={c.exam} className="border-b border-[var(--rule)]">
                  <Link
                    href={c.href}
                    className={`group grid items-center gap-4 py-8 md:grid-cols-12 md:gap-6 md:py-10 ${focus}`}
                  >
                    <span className="text-sm text-[var(--soft)] tabular-nums md:col-span-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="md:col-span-5">
                      <span
                        className={`${display} block text-3xl tracking-tight transition-transform duration-300 ease-out group-hover:translate-x-2 md:text-5xl`}
                      >
                        {c.exam}
                      </span>
                      <span className="mt-2 block text-[var(--soft)]">
                        {c.covers}
                      </span>
                    </span>
                    <span className="text-sm text-[var(--soft)] md:col-span-3">
                      {c.name}
                      <span className="mx-2">·</span>
                      {c.duration}
                    </span>
                    <span className="flex items-center justify-between gap-4 md:col-span-3 md:justify-end">
                      {c.price ? (
                        <span className="flex items-baseline gap-2">
                          <span className={`${display} text-3xl tabular-nums`}>
                            {rupees(c.price)}
                          </span>
                          {c.mrp && c.mrp > c.price ? (
                            <s className="text-sm text-[var(--soft)] tabular-nums">
                              {rupees(c.mrp)}
                            </s>
                          ) : null}
                        </span>
                      ) : null}
                      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--rule)] transition-colors group-hover:border-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)]">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Faculty: portraits large, names set like a playbill            */}
        {/* -------------------------------------------------------------- */}
        <section id="faculty" className="scroll-mt-16 bg-[var(--paper-2)]">
          <div className="mx-auto max-w-[88rem] px-5 py-24 md:px-10 md:py-32">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2
                className={`${display} max-w-[18ch] text-4xl leading-[1.02] font-normal tracking-tight md:text-6xl`}
              >
                The people at the front of the room.
              </h2>
              <a
                href={links.youtube}
                target="_blank"
                rel="noreferrer noopener"
                className={`border-b border-[var(--gold-ink)] pb-1 text-sm font-medium ${focus}`}
              >
                Watch them teach on YouTube
              </a>
            </div>
            <ul className="-mx-5 mt-14 flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
              {faculty.map((f, i) => (
                <li
                  key={f.slug}
                  className={`w-[62vw] shrink-0 snap-start sm:w-[38vw] md:w-auto ${i % 2 ? "md:mt-16" : ""}`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-[var(--paper)]">
                    <Image
                      src={f.portrait}
                      alt={`${f.name}, ${f.teaches} faculty`}
                      fill
                      sizes="(max-width: 768px) 62vw, 18vw"
                      className="object-cover object-top grayscale-[0.25] transition-[filter,scale] duration-500 ease-out hover:scale-[1.02] hover:grayscale-0"
                    />
                  </div>
                  <p className={`${display} mt-4 text-2xl tracking-tight`}>
                    {f.called}
                  </p>
                  <p className="text-sm text-[var(--soft)]">{f.teaches}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Free material: the brief's second CTA, given its own band      */}
        {/* -------------------------------------------------------------- */}
        <section id="free" className="scroll-mt-16">
          <div className="mx-auto grid max-w-[88rem] gap-12 px-5 py-24 md:grid-cols-12 md:px-10 md:py-32">
            <div className="md:col-span-5">
              <p className="text-xs tracking-[0.22em] text-[var(--soft)] uppercase">
                Free, after one sign-in
              </p>
              <h2
                className={`${display} mt-5 text-4xl leading-[1.02] font-normal tracking-tight md:text-6xl`}
              >
                Notes, past papers and current affairs.
              </h2>
              <Link
                href="/resources"
                className={`mt-10 inline-flex h-12 items-center rounded-full border border-[var(--ink)] px-6 text-sm font-medium transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] ${focus}`}
              >
                Open the free library
              </Link>
            </div>
            <ul className="grid gap-px self-end bg-[var(--rule)] sm:grid-cols-2 md:col-span-7">
              {[
                ["APSC notes", "Read in the browser, on any phone"],
                ["Assam current affairs", "Published as ICT adds them"],
                ["MCQs", "Practice sets by exam"],
                ["Previous-year questions", "Grouped by exam and year"],
              ].map(([title, body]) => (
                <li key={title} className="bg-[var(--paper)] p-7">
                  <p className={`${display} text-2xl tracking-tight`}>
                    {title}
                  </p>
                  <p className="mt-2 text-sm text-[var(--soft)]">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Joining: a real sequence, so it is numbered                    */}
        {/* -------------------------------------------------------------- */}
        <section className="bg-[var(--ink)] text-[var(--paper)]">
          <div className="mx-auto grid max-w-[88rem] gap-14 px-5 py-24 md:grid-cols-12 md:px-10 md:py-32">
            <h2
              className={`${display} text-4xl leading-[1.02] font-normal tracking-tight md:col-span-5 md:text-6xl`}
            >
              Joining takes{" "}
              <em className="font-light text-[var(--gold)] italic">
                three steps
              </em>
              .
            </h2>
            <ol className="grid gap-10 md:col-span-7">
              {joining.map((j, i) => (
                <li
                  key={j.verb}
                  className="grid grid-cols-[4rem_1fr] gap-4 border-t border-white/15 pt-6"
                >
                  <span
                    className={`${display} text-5xl leading-none font-light text-[var(--gold)] tabular-nums`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-lg font-medium">{j.verb}</p>
                    <p className="mt-1 text-white/60">{j.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-4 md:col-span-12 md:justify-end">
              <a
                href={whatsapp}
                className={`inline-flex h-13 items-center rounded-full bg-[var(--gold)] px-7 font-medium text-[var(--ink)] transition-[filter] hover:brightness-105 ${focus}`}
              >
                {offer.cta} on WhatsApp
              </a>
              <a
                href={`tel:${contact.phones[0]}`}
                className={`inline-flex h-13 items-center rounded-full border border-white/25 px-7 font-medium tabular-nums transition-colors hover:border-white/60 ${focus}`}
              >
                Call {formatPhone(contact.phones[0])}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--rule)] pb-28">
        <div className="mx-auto flex max-w-[88rem] flex-wrap justify-between gap-4 px-5 py-10 text-sm text-[var(--soft)] md:px-10">
          <p>Impact Career Tutorials, North Lakhimpur</p>
          <p>
            Serials from the APSC CCE 2022 result, published 17 January 2024.
          </p>
        </div>
      </footer>

      <ConceptSwitcher current={7} />
    </div>
  )
}
