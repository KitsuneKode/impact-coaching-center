import {
  IconArrowUpRight,
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconBrandYoutube,
  IconFileText,
  IconPhone,
  IconPlus,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { Anek_Bangla, Anek_Latin } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

import { Book3D, bookCss } from "../_book"
import {
  classes,
  compact,
  contact,
  courses,
  faculty,
  links,
  place,
  proof,
  rupees,
  selections,
  shelf,
  tel,
  whatsapp,
} from "../_data"
import { Folder, folderCss } from "../_folder"
import { css as lampCss, bookTones, folderTones, tokens } from "../lamp/_chrome"
import { Reveal } from "../_reveal"
import { PrototypeSwitcher } from "../_switcher"
import { HomeMenu, HomePromos } from "../_kit/home-extras"
import { tokens as siteTokens } from "./_site"
import { as } from "./_as"

/**
 * Prototype 12: Sandhya (evening, when the lamp is lit). Lamp, rebuilt for a
 * phone first and read in Assamese first. Colour: Lamp's committed dark, amber
 * the only light. Type: the production pair, Anek Bangla and Anek Latin, at
 * two weights only, 700 for what is claimed and 400 for everything else.
 * Every action sits in thumb reach: stacked full-width buttons in the hero,
 * then a bar at the bottom of the screen once the hero has scrolled away.
 */

const bangla = Anek_Bangla({
  subsets: ["bengali"],
  weight: ["400", "700"],
  variable: "--sd-as",
})
const latin = Anek_Latin({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--sd-en",
})

export const metadata: Metadata = { title: "Sandhya" }

const css = `
[data-sd] { font-family: var(--sd-en), var(--sd-as), sans-serif; }
[data-sd] :lang(as) { line-height: 1.6; letter-spacing: 0; }
[data-sd] [data-claim] { line-height: 1.3; text-wrap: balance; }
[data-sd] [data-strip] { scrollbar-width: none; scroll-padding-inline: 20px; }

@keyframes sd-bar { from { transform: translateY(140%); opacity: 0; } }
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-sd-bar] { animation: sd-bar linear both; animation-timeline: scroll(root); animation-range: 45vh 70vh; }
  }
}
[data-sd] details::details-content { block-size: 0; overflow: hidden; transition: block-size 0.3s var(--lp-ease), content-visibility 0.3s allow-discrete; }
[data-sd] details[open]::details-content { block-size: auto; }
[data-sd] summary::-webkit-details-marker { display: none; }
[data-sd] details [data-plus] { transition: transform 0.25s var(--lp-ease); }
[data-sd] details[open] [data-plus] { transform: rotate(45deg); }
`

const container = "mx-auto w-full max-w-[1100px] px-5 md:px-8"
const external = { target: "_blank", rel: "noreferrer noopener" } as const
const claim = "text-[1.75rem] font-bold text-[var(--lp-text)] md:text-[2.6rem]"
const rest = "mt-3 max-w-[40ch] text-[var(--lp-muted)] md:text-lg"
const strip =
  "-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0"

export default async function Sandhya() {
  const { books, folders, samples } = await shelf()

  return (
    <div
      data-lp
      data-sd
      lang="as"
      style={tokens as CSSProperties}
      className={`${bangla.variable} ${latin.variable} min-h-[100dvh] bg-[var(--lp-bg)] text-[var(--lp-text)] antialiased`}
    >
      <style>{lampCss + bookCss + folderCss + css}</style>

      <HomePromos slug="sandhya" tokens={siteTokens} />

      <header className="sticky top-0 z-40 border-b border-[var(--lp-line)] bg-[rgba(7,9,14,0.78)] backdrop-blur-xl">
        <div className={`${container} flex h-14 items-center gap-3`}>
          <Link
            href="/prototypes/sandhya"
            className="flex items-center gap-2.5"
          >
            <span className="grid size-9 place-items-center rounded-[10px] bg-[#F4F6FA]">
              <Image
                src="/brand/ict-mark.png"
                alt="Impact Career Tutorials"
                width={26}
                height={26}
                className="size-[26px]"
              />
            </span>
            <span lang="en" className="font-bold">
              ICT
            </span>
          </Link>
          <nav
            aria-label="বিভাগসমূহ"
            className="ml-6 hidden items-center gap-6 text-[15px] text-[var(--lp-muted)] md:flex"
          >
            <a data-quiet href="#free">
              {as.notes}
            </a>
            <a data-quiet href="#books">
              কিতাপ
            </a>
            <a data-quiet href="#courses">
              পাঠ্যক্ৰম
            </a>
            <a data-quiet href="#questions">
              প্ৰশ্ন
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <nav
              aria-label="ভাষা"
              className="flex h-10 items-center rounded-full p-1 shadow-[inset_0_0_0_1px_var(--lp-line-hi)]"
            >
              <Link
                href="/prototypes/lamp"
                lang="en"
                hrefLang="en"
                className="grid h-8 place-items-center rounded-full px-3 text-sm text-[var(--lp-muted)] transition-colors hover:text-[var(--lp-text)]"
              >
                EN
              </Link>
              <span
                aria-current="true"
                className="grid h-8 place-items-center rounded-full bg-[var(--lp-amber)] px-3 text-sm font-bold text-[var(--lp-bg)]"
              >
                অ
              </span>
            </nav>
            <a
              data-press
              data-ghost
              href={tel}
              aria-label={as.call}
              className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--lp-line-hi)]"
            >
              <IconPhone aria-hidden size={19} stroke={1.75} />
            </a>
          </div>
          <HomeMenu slug="sandhya" tokens={siteTokens} />
        </div>
      </header>

      <main>
        {/* Hero: the lamp, one claim, two thumb-sized actions. */}
        <section aria-label="পৰিচয়" className="relative overflow-hidden">
          <div data-lp-dots aria-hidden />
          <div data-lamp="hero" aria-hidden>
            <div data-lamp-on>
              <div data-lamp-glow />
              <div data-lamp-cone />
              <div data-lamp-bar />
            </div>
          </div>
          <div
            className={`${container} relative pt-36 pb-12 text-center md:pt-44 md:pb-20`}
          >
            <h1
              data-rise
              data-claim
              className="mx-auto max-w-[16ch] text-[clamp(2.2rem,9vw,4rem)] font-bold"
            >
              {as.heroClaim}
            </h1>
            <p
              data-rise
              style={{ animationDelay: "0.12s" }}
              className="mx-auto mt-5 max-w-[34ch] text-lg text-[var(--lp-muted)] md:text-xl"
            >
              {as.heroRest}
            </p>
            <div
              data-rise
              style={{ animationDelay: "0.22s" }}
              className="mx-auto mt-9 grid max-w-sm gap-3 md:max-w-md md:grid-cols-2"
            >
              <a
                data-press
                data-primary
                href={whatsapp}
                {...external}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--lp-amber)] px-5 text-[17px] font-bold text-[var(--lp-bg)]"
              >
                <IconBrandWhatsapp aria-hidden size={20} stroke={1.75} />
                {as.ctaShort}
              </a>
              <a
                data-press
                data-ghost
                href="#free"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-5 text-[17px] font-bold shadow-[inset_0_0_0_1px_var(--lp-line-hi)]"
              >
                <IconFileText aria-hidden size={20} stroke={1.75} />
                {as.notes}
              </a>
            </div>
            <p
              data-rise
              style={{ animationDelay: "0.3s" }}
              className="mx-auto mt-4 max-w-[34ch] text-sm text-[var(--lp-muted)]"
            >
              {as.promise}
            </p>
          </div>

          {/* What can be checked, in two by two. */}
          <div className={`${container} relative pb-16`}>
            <dl className="grid grid-cols-2 overflow-hidden rounded-3xl bg-[var(--lp-card)] shadow-[inset_0_0_0_1px_var(--lp-line)] md:grid-cols-4">
              {proof.map((p, i) => (
                <a
                  key={p.label}
                  href={p.href}
                  {...(p.href.startsWith("http") ? external : {})}
                  className="border-[var(--lp-line)] p-5 transition-colors odd:border-r hover:bg-white/[0.03] md:border-r md:last:border-r-0 max-md:[&:nth-child(-n+2)]:border-b"
                >
                  <dt className="sr-only">{as.proof[i]}</dt>
                  <dd
                    lang="en"
                    className="text-3xl font-bold text-[var(--lp-amber)] tabular-nums"
                  >
                    {p.display}
                  </dd>
                  <dd className="mt-1 text-sm leading-snug text-[var(--lp-muted)]">
                    {as.proof[i]}
                  </dd>
                </a>
              ))}
            </dl>
          </div>
        </section>

        {/* Free material first: the six folders. */}
        <section
          id="free"
          aria-labelledby="free-h"
          className="scroll-mt-16 py-14 md:py-24"
        >
          <div className={container}>
            <h2 id="free-h" data-claim className={claim}>
              {as.freeClaim}
            </h2>
            <p className={rest}>{as.freeRest}</p>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-6">
              {folders.map((f, i) => (
                <li key={f.id}>
                  <Reveal delay={i * 0.04}>
                    <Link
                      data-fd-hover
                      href="/prototypes/lamp/notes"
                      aria-label={`${as.folders[f.id]}, ${as.files(f.items.length)}`}
                      className="block rounded-[14px]"
                    >
                      <Folder
                        folder={f}
                        tones={folderTones}
                        name={as.folders[f.id]}
                        count={as.files(f.items.length)}
                      />
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
            {samples ? (
              <p className="mt-6 text-sm text-[var(--lp-muted)]">
                {as.freeSample}
              </p>
            ) : null}
          </div>
        </section>

        {/* Books on a shelf you swipe. */}
        <section
          id="books"
          aria-labelledby="books-h"
          className="scroll-mt-16 border-t border-[var(--lp-line)] py-14 md:py-24"
        >
          <div className={container}>
            <h2 id="books-h" data-claim className={claim}>
              {as.booksClaim}
            </h2>
            <p className={rest}>{as.booksRest}</p>
            <ul
              data-strip
              className={`${strip} mt-8 md:grid md:grid-cols-4 md:overflow-visible`}
            >
              {books.map((b) => (
                <li
                  key={b.slug}
                  className="w-[46vw] max-w-[230px] shrink-0 snap-start md:w-auto md:max-w-none"
                >
                  <Link
                    data-bk-hover
                    href={`/prototypes/lamp/books/${b.slug}`}
                    className="block"
                  >
                    <Book3D book={b} tones={bookTones} font="var(--sd-en)" />
                    <span lang="en" className="mt-3 block px-[18px] font-bold">
                      {b.title}
                    </span>
                    <span className="block px-[18px] text-sm text-[var(--lp-muted)] tabular-nums">
                      {b.price} · {as.pages(b.pages)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {samples ? (
              <p className="mt-6 text-sm text-[var(--lp-muted)]">
                {as.booksSample}
              </p>
            ) : null}
          </div>
        </section>

        {/* Watch the teachers first. */}
        <section
          id="classes"
          aria-labelledby="classes-h"
          className="scroll-mt-16 border-t border-[var(--lp-line)] py-14 md:py-24"
        >
          <div className={container}>
            <h2 id="classes-h" data-claim className={claim}>
              {as.classesClaim}
            </h2>
            <p className={rest}>{as.classesRest}</p>
            <ul
              data-strip
              className={`${strip} mt-8 md:grid md:grid-cols-3 md:overflow-visible`}
            >
              {classes.slice(0, 6).map((c) => (
                <li
                  key={c.id}
                  className="w-[80vw] max-w-sm shrink-0 snap-start md:w-auto md:max-w-none"
                >
                  <a
                    href={c.href}
                    {...external}
                    data-lp-thumb-link
                    className="group block"
                  >
                    <span
                      data-lp-thumb
                      className="relative block aspect-video overflow-hidden rounded-2xl bg-black shadow-[0_0_0_1px_var(--lp-line)]"
                    >
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 340px, 80vw"
                        className="object-cover"
                      />
                    </span>
                    <span
                      lang="en"
                      className="mt-3 line-clamp-2 block leading-snug font-bold"
                    >
                      {c.title}
                    </span>
                    <span className="mt-1 block text-sm text-[var(--lp-muted)]">
                      <span lang="en">{c.by}</span> ·{" "}
                      {as.views(compact(c.views))}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Batches, one card each, the time as the headline. */}
        <section
          id="courses"
          aria-labelledby="courses-h"
          className="scroll-mt-16 border-t border-[var(--lp-line)] py-14 md:py-24"
        >
          <div className={container}>
            <h2 id="courses-h" data-claim className={claim}>
              {as.coursesClaim}
            </h2>
            <p className={rest}>{as.coursesRest}</p>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {courses.map((c) => {
                const t = as.tracks[c.slug]!
                return (
                  <li
                    key={c.slug}
                    className="flex flex-col overflow-hidden rounded-3xl bg-[var(--lp-card)] shadow-[inset_0_0_0_1px_var(--lp-line)]"
                  >
                    {c.cover ? (
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={c.cover}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 340px, 100vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-sm text-[var(--lp-muted)]">{t.full}</p>
                      <h3 lang="en" className="mt-1 text-xl font-bold">
                        {c.name}
                      </h3>
                      {c.when ? (
                        <p className="mt-3 font-bold text-[var(--lp-amber)]">
                          {as.times[c.when] ?? c.when}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm text-[var(--lp-muted)]">
                        {t.covers} · {t.duration}
                      </p>
                      {c.price ? (
                        <p className="mt-4 mb-5 flex items-baseline gap-2 tabular-nums">
                          <span className="text-2xl font-bold">
                            {rupees(c.price)}
                          </span>
                          {c.mrp ? (
                            <s className="text-sm text-[var(--lp-muted)]">
                              {rupees(c.mrp)}
                            </s>
                          ) : null}
                          <span className="text-sm text-[var(--lp-muted)]">
                            {as.oneFee}
                          </span>
                        </p>
                      ) : null}
                      <a
                        data-press
                        data-ghost
                        href={whatsapp}
                        {...external}
                        className="mt-auto inline-flex h-12 items-center justify-center rounded-2xl font-bold shadow-[inset_0_0_0_1px_var(--lp-line-hi)]"
                      >
                        {as.enrol}
                      </a>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* Results and the teachers. */}
        <section
          aria-labelledby="results-h"
          className="border-t border-[var(--lp-line)] py-14 md:py-24"
        >
          <div className={container}>
            <h2 id="results-h" data-claim className={`${claim} max-w-[24ch]`}>
              {as.resultsClaim}
            </h2>
            <p className={rest}>{as.resultsRest}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {selections.map((s) => (
                <figure
                  key={s.name}
                  className="flex flex-col rounded-3xl bg-[var(--lp-card)] p-6 shadow-[inset_0_0_0_1px_var(--lp-line)]"
                >
                  <blockquote lang="en" className="text-lg leading-snug">
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-auto flex items-end justify-between gap-4 pt-6">
                    <span lang="en">
                      <span className="block font-bold">{s.name}</span>
                      <span className="block text-sm text-[var(--lp-muted)]">
                        {s.post}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-xs text-[var(--lp-muted)]">
                        {as.serial}
                      </span>
                      <span className="text-3xl font-bold text-[var(--lp-amber)] tabular-nums">
                        {s.serial}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <a
              href={links.apscResultPdf}
              {...external}
              className="mt-4 inline-flex items-center gap-1 text-sm text-[var(--lp-muted)] underline hover:text-[var(--lp-text)]"
            >
              {as.openResult}
              <IconArrowUpRight aria-hidden size={14} stroke={1.75} />
            </a>

            <h3 data-claim className="mt-16 text-xl font-bold md:text-2xl">
              {as.teachersClaim}
            </h3>
            <ul
              data-strip
              className={`${strip} mt-6 md:grid md:grid-cols-5 md:overflow-visible`}
            >
              {faculty.map((f) => (
                <li key={f.slug} className="w-40 shrink-0 snap-start md:w-auto">
                  <div className="relative aspect-[38/42] overflow-hidden rounded-2xl bg-[#14285A]">
                    <Image
                      src={f.portrait}
                      alt={f.name}
                      fill
                      sizes="(min-width: 768px) 200px, 160px"
                      className="object-cover object-top"
                    />
                  </div>
                  <p lang="en" className="mt-3 font-bold">
                    {f.called}
                  </p>
                  <p className="text-sm leading-snug text-[var(--lp-muted)]">
                    {as.teaches[f.slug]}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Questions */}
        <section
          id="questions"
          aria-labelledby="faq-h"
          className="scroll-mt-16 border-t border-[var(--lp-line)] py-14 md:py-24"
        >
          <div
            className={`${container} grid gap-8 md:grid-cols-[1fr_1.6fr] md:gap-14`}
          >
            <h2 id="faq-h" data-claim className={claim}>
              {as.faqClaim}
            </h2>
            <div className="divide-y divide-[var(--lp-line)] border-y border-[var(--lp-line)]">
              {as.faqs.map((f) => (
                <details key={f.q}>
                  <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-4 text-[17px] font-bold">
                    {f.q}
                    <IconPlus
                      data-plus
                      aria-hidden
                      size={20}
                      stroke={1.75}
                      className="shrink-0 text-[var(--lp-amber)]"
                    />
                  </summary>
                  <p className="pb-5 text-[var(--lp-muted)]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Enquire, under the lamp again. */}
        <section
          aria-labelledby="enquire-h"
          className="relative overflow-hidden border-t border-[var(--lp-line)]"
        >
          <div data-lamp="end" aria-hidden>
            <div data-lamp-on>
              <div data-lamp-glow />
              <div data-lamp-cone />
              <div data-lamp-bar />
            </div>
          </div>
          <div className={`${container} relative pt-36 pb-20 md:pb-28`}>
            <h2
              id="enquire-h"
              data-claim
              className={`${claim} mx-auto max-w-[18ch] text-center`}
            >
              {as.enquireClaim}
            </h2>
            <ol className="mx-auto mt-10 grid max-w-3xl gap-3 md:grid-cols-3">
              {as.joining.map((j, i) => (
                <li
                  key={j.verb}
                  className="rounded-3xl bg-[var(--lp-card)] p-5 shadow-[inset_0_0_0_1px_var(--lp-line)]"
                >
                  <span className="text-sm font-bold text-[var(--lp-amber)] tabular-nums">
                    {i + 1}
                  </span>
                  <p className="mt-1 font-bold">{j.verb}</p>
                  <p className="mt-1 text-sm text-[var(--lp-muted)]">
                    {j.body}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mx-auto mt-8 grid max-w-sm gap-3 md:max-w-md md:grid-cols-2">
              <a
                data-press
                data-primary
                href={whatsapp}
                {...external}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--lp-amber)] px-5 text-[17px] font-bold text-[var(--lp-bg)]"
              >
                <IconBrandWhatsapp aria-hidden size={20} stroke={1.75} />
                {as.cta}
              </a>
              <a
                data-press
                data-ghost
                href={tel}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-5 text-[17px] font-bold shadow-[inset_0_0_0_1px_var(--lp-line-hi)]"
              >
                <IconPhone aria-hidden size={20} stroke={1.75} />
                {as.call}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--lp-line)] pt-10 pb-44 text-sm text-[var(--lp-muted)] md:pb-28">
        <div className={`${container} grid gap-6 md:grid-cols-12`}>
          <div className="md:col-span-6">
            <p lang="en" className="font-bold text-[var(--lp-text)]">
              Impact Career Tutorials
            </p>
            <address className="mt-2 not-italic">{as.address}</address>
            <a
              href={place.maps}
              {...external}
              className="mt-2 inline-block underline"
            >
              {as.maps}
            </a>
          </div>
          <div lang="en" className="grid gap-1 md:col-span-3">
            {contact.phones.map((p) => (
              <a
                key={p}
                href={`tel:${p}`}
                className="tabular-nums hover:text-[var(--lp-text)]"
              >
                {p.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}
              </a>
            ))}
            <a
              href={`mailto:${contact.email}`}
              className="hover:text-[var(--lp-text)]"
            >
              {contact.email}
            </a>
          </div>
          <div className="flex gap-2 md:col-span-3 md:justify-end">
            {[
              { href: links.youtube, label: "YouTube", Icon: IconBrandYoutube },
              {
                href: links.instagram,
                label: "Instagram",
                Icon: IconBrandInstagram,
              },
              {
                href: links.facebook,
                label: "Facebook",
                Icon: IconBrandFacebook,
              },
              {
                href: links.play,
                label: "Google Play",
                Icon: IconBrandGooglePlay,
              },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                {...external}
                aria-label={label}
                data-press
                data-ghost
                className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--lp-line)]"
              >
                <Icon aria-hidden size={18} stroke={1.75} />
              </a>
            ))}
          </div>
          <p className="md:col-span-12">{as.prototype}</p>
        </div>
      </footer>

      {/* The thumb bar: arrives once the hero's own buttons have scrolled away.
          Sits above the review switcher here; on the live site it is the bottom edge. */}
      <nav
        data-sd-bar
        aria-label="দ্ৰুত কাৰ্য"
        className="fixed inset-x-3 bottom-[4.75rem] z-40 flex items-center gap-2 rounded-[22px] bg-[rgba(13,17,24,0.92)] p-2 shadow-[inset_0_0_0_1px_var(--lp-line-hi),0_20px_50px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl md:hidden"
      >
        <a
          data-press
          data-ghost
          href={tel}
          aria-label={as.call}
          className="grid size-12 shrink-0 place-items-center rounded-2xl"
        >
          <IconPhone aria-hidden size={20} stroke={1.75} />
        </a>
        <a
          data-press
          data-primary
          href={whatsapp}
          {...external}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--lp-amber)] font-bold text-[var(--lp-bg)]"
        >
          <IconBrandWhatsapp aria-hidden size={19} stroke={1.75} />
          {as.ctaShort}
        </a>
        <a
          data-press
          data-ghost
          href="#free"
          aria-label={as.notes}
          className="grid size-12 shrink-0 place-items-center rounded-2xl"
        >
          <IconFileText aria-hidden size={20} stroke={1.75} />
        </a>
      </nav>

      <PrototypeSwitcher current="sandhya" />
    </div>
  )
}
