"use client"

import {
  IconArrowUpRight,
  IconPlayerPlayFilled,
  IconPlus,
} from "@tabler/icons-react"
import { m, useReducedMotion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react"

import type { Shelf } from "../_data"
import { Book3D } from "../_book"
import { PlayInPlace, usePointerFollow } from "../_fx"
import { bookTones } from "../_kit/shared"
import { chapters } from "./_chapters"

/* ------------------------------------------------------------------ */
/*  The lamp                                                           */
/* ------------------------------------------------------------------ */

/**
 * The opening section. The headline is steel until a light passes over it, so
 * the pointer becomes a reading lamp. On touch the light simply rests where
 * the intro sweep leaves it. The position is written straight to CSS, never
 * to state, so moving the mouse costs no renders.
 */
export function LitHero({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const frame = useRef(0)
  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function move(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse") return
    const hero = ref.current
    const line = hero?.querySelector<HTMLElement>("[data-vs-lit]")
    if (!hero || !line) return
    const { clientX, clientY } = e
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const r = line.getBoundingClientRect()
      hero.dataset.lit = ""
      hero.style.setProperty("--vx", `${clientX - r.left}px`)
      hero.style.setProperty("--vy", `${clientY - r.top}px`)
    })
  }

  return (
    <section
      ref={ref}
      id="opening"
      data-vs-hero
      aria-label="Introduction"
      onPointerMove={move}
      className={className}
    >
      {children}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Chapter rail                                                       */
/* ------------------------------------------------------------------ */

/** Numerals down the left edge. The chapter in view lights up; press one to jump. */
export function ChapterRail() {
  const [active, setActive] = useState("opening")

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: "-40% 0px -55% 0px" }
    )
    for (const c of chapters) {
      const el = document.getElementById(c.id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  return (
    <nav aria-label="Chapters" data-vs-rail>
      <ol>
        {chapters.map((c) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              data-on={active === c.id ? "" : undefined}
              aria-current={active === c.id ? "location" : undefined}
            >
              <span>{c.numeral}</span>
              <span data-vs-label>{c.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  Teachers                                                           */
/* ------------------------------------------------------------------ */

export type Person = {
  slug: string
  name: string
  called: string
  teaches: string
  note: string
  portrait: string
  lecture: string
  still: string
}

/**
 * The faculty as an index of names. On a mouse, a portrait follows the
 * pointer from name to name. Press a name to open the teacher's note and a
 * class to watch. One row is open at a time.
 */
export function FacultyRoll({ people }: { people: Person[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const { x, y, sx, sy } = usePointerFollow()
  const reduce = useReducedMotion()
  const uid = useId()

  function move(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !box.current) return
    const r = box.current.getBoundingClientRect()
    x.set(e.clientX - r.left + 36)
    y.set(e.clientY - r.top - 140)
  }
  const floating = hover !== null && hover !== open

  return (
    <div
      ref={box}
      onPointerMove={move}
      onPointerLeave={() => setHover(null)}
      className="relative"
    >
      <m.div
        aria-hidden
        data-vs-float
        style={{ x: sx, y: sy }}
        animate={{
          opacity: floating ? 1 : 0,
          scale: floating || reduce ? 1 : 0.94,
        }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="hidden lg:block"
      >
        {people.map((p) => (
          <Image
            key={p.slug}
            src={p.portrait}
            alt=""
            fill
            sizes="210px"
            className="object-cover object-top"
            style={{ opacity: hover === p.slug ? 1 : 0 }}
          />
        ))}
      </m.div>

      <ul>
        {people.map((p, i) => {
          const on = open === p.slug
          return (
            <li
              key={p.slug}
              className={
                i === people.length - 1 ? "border-b border-[var(--k-line)]" : ""
              }
            >
              <button
                type="button"
                data-vs-row
                id={`${uid}-${p.slug}-b`}
                aria-expanded={on}
                aria-controls={`${uid}-${p.slug}`}
                onClick={() => setOpen(on ? null : p.slug)}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setHover(p.slug)
                }}
                onFocus={() => setHover(null)}
              >
                <span data-vs-chapter>{String(i + 1).padStart(2, "0")}</span>
                <span data-vs-name>{p.name}</span>
                <span className="flex items-center gap-4 text-sm text-[var(--k-muted)]">
                  <span className="hidden text-right sm:block">
                    {p.teaches}
                  </span>
                  <IconPlus
                    aria-hidden
                    size={18}
                    stroke={1.5}
                    className={`shrink-0 text-[var(--k-accent)] transition-transform duration-300 ease-out ${on ? "rotate-45" : ""}`}
                  />
                </span>
              </button>
              <section
                id={`${uid}-${p.slug}`}
                aria-labelledby={`${uid}-${p.slug}-b`}
                data-vs-panel
                data-open={on ? "" : undefined}
                inert={!on}
              >
                <div>
                  <div className="grid gap-6 pt-2 pb-8 pl-0 sm:grid-cols-[minmax(0,180px)_1fr] sm:pl-[3.6rem] lg:grid-cols-[minmax(0,180px)_1fr_minmax(0,320px)]">
                    <span
                      data-k-photo
                      className="relative block aspect-[3/4] w-[150px] overflow-hidden rounded-[3px] sm:w-full"
                    >
                      <Image
                        src={p.portrait}
                        alt={`${p.name}, ${p.teaches}`}
                        fill
                        sizes="180px"
                        className="object-cover object-top"
                      />
                    </span>
                    <div className="max-w-[44ch]">
                      <p
                        data-k-wide
                        className="text-[0.62rem] text-[var(--k-accent-deep)]"
                      >
                        {p.teaches}
                      </p>
                      <p data-k-display className="mt-3 text-2xl leading-snug">
                        {p.note}
                      </p>
                    </div>
                    <PlayInPlace
                      id={p.lecture}
                      title={`A class by ${p.name}`}
                      data-k-photo
                      className="group relative block aspect-video w-full overflow-hidden rounded-[3px] bg-[#000820] sm:col-span-2 lg:col-span-1"
                    >
                      <Image
                        src={p.still}
                        alt=""
                        fill
                        sizes="320px"
                        className="object-cover"
                      />
                      <span className="absolute inset-0 grid place-items-center bg-[rgba(0,8,32,0.34)]">
                        <span
                          data-k-btn
                          className="grid size-12 place-items-center rounded-full transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
                        >
                          <IconPlayerPlayFilled
                            aria-hidden
                            size={17}
                            className="translate-x-px"
                          />
                        </span>
                      </span>
                      <span
                        data-k-wide
                        className="absolute bottom-3 left-3 text-[0.6rem] text-[#F8F3E6]"
                      >
                        Watch a class
                      </span>
                    </PlayInPlace>
                  </div>
                </div>
              </section>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Catalogue                                                          */
/* ------------------------------------------------------------------ */

type Book = Shelf["books"][number]

/**
 * The books as a printed catalogue: title, a dotted leader, the price. The
 * book you point at turns toward you on the plate beside the list.
 */
export function Catalogue({ books, base }: { books: Book[]; base: string }) {
  const [active, setActive] = useState(books[0]?.slug)
  const current = books.find((b) => b.slug === active) ?? books[0]
  if (!current) return null

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <ul className="lg:col-span-7">
        {books.map((b, i) => (
          <li
            key={b.slug}
            className={
              i === books.length - 1 ? "border-b border-[var(--k-line)]" : ""
            }
          >
            <Link
              href={`${base}${b.href}`}
              data-vs-cat
              data-on={b.slug === current.slug ? "" : undefined}
              onPointerEnter={() => setActive(b.slug)}
              onFocus={() => setActive(b.slug)}
            >
              <span data-vs-line>
                <span data-vs-title>{b.title}</span>
                <span data-vs-leader aria-hidden />
                <span
                  className="text-xl text-[var(--k-accent)] tabular-nums"
                  data-k-display
                >
                  {b.price}
                </span>
              </span>
              <span
                data-k-wide
                className="mt-2 block text-[0.6rem] text-[var(--k-muted)]"
              >
                {b.exam}, {b.pages} pages
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="lg:col-span-5">
        <div data-vs-stage>
          <div className="relative mx-auto aspect-[4/4.6] w-full max-w-[380px]">
            {books.map((b) => (
              <div
                key={b.slug}
                data-vs-plate
                data-bk-hover
                data-on={b.slug === current.slug ? "" : undefined}
                aria-hidden={b.slug !== current.slug}
              >
                <div className="w-[76%]">
                  <Book3D book={b} tones={bookTones} font="var(--vs-sans)" />
                </div>
              </div>
            ))}
          </div>
          <div
            key={current.slug}
            data-rise
            className="mx-auto mt-4 max-w-[380px]"
          >
            <p className="text-[var(--k-muted)]">{current.subtitle}</p>
            <Link
              href={`${base}${current.href}`}
              data-k-press
              data-k-btn
              className="group mt-5 inline-flex h-11 items-center gap-2 px-5 text-sm"
            >
              Open the book
              <IconArrowUpRight
                aria-hidden
                size={16}
                stroke={2}
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
