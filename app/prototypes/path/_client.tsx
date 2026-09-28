"use client"

import { IconArrowRight, IconFileText } from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { Book3D, type BookTones } from "../_book"
import type { Shelf } from "../_data"
import { Folder, type FolderTones } from "../_folder"
import { ease, usePointerFollow } from "../_fx"

/**
 * The year at ICT as a scroll story: the step text stays pinned on the left
 * while each step's picture scrolls past on the right.
 */
export function PathStory({
  steps,
}: {
  steps: { verb: string; body: string; visual: ReactNode }[]
}) {
  const [active, setActive] = useState(0)
  const panels = useRef<(HTMLDivElement | null)[]>([])
  const reduce = useReducedMotion()

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting)
            setActive(Number((e.target as HTMLElement).dataset.step))
      },
      { rootMargin: "-45% 0px -45% 0px" }
    )
    for (const el of panels.current) if (el) io.observe(el)
    return () => io.disconnect()
  }, [])

  const step = steps[active]!
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-[calc(50vh-10rem)]">
          <ol className="flex gap-2" aria-hidden>
            {steps.map((s, i) => (
              <li
                key={s.verb}
                className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--pt-line)]"
              >
                <span
                  className="block h-full origin-left rounded-full bg-[var(--pt-forest)] transition-transform duration-500 ease-out"
                  style={{ transform: `scaleX(${i <= active ? 1 : 0})` }}
                />
              </li>
            ))}
          </ol>
          <div className="relative mt-10 min-h-[15rem]">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={step.verb}
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: 14, filter: "blur(6px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: -10, filter: "blur(6px)" }
                }
                transition={{ duration: 0.35, ease }}
              >
                <p className="text-sm font-medium text-[var(--pt-muted)] tabular-nums">
                  {active + 1} of {steps.length}
                </p>
                <h3 className="mt-3 text-[clamp(2rem,3.4vw,3rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
                  {step.verb}
                </h3>
                <p className="mt-5 max-w-[40ch] text-lg text-[var(--pt-muted)]">
                  {step.body}
                </p>
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="grid gap-16 lg:col-span-7 lg:gap-0">
        {steps.map((s, i) => (
          <div
            key={s.verb}
            data-step={i}
            ref={(el) => {
              panels.current[i] = el
            }}
            className="lg:flex lg:min-h-[85vh] lg:items-center"
          >
            <div className="w-full">
              <div className="mb-6 lg:hidden">
                <h3 className="text-3xl font-semibold tracking-[-0.035em]">
                  {s.verb}
                </h3>
                <p className="mt-3 text-[var(--pt-muted)]">{s.body}</p>
              </div>
              {s.visual}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Pick your exam; the shelf shows its books and its free notes. */
export function ShelfByExam({
  exams,
  shelf,
  tones,
  folderTones,
}: {
  exams: string[]
  shelf: Pick<Shelf, "books" | "resources" | "folders">
  tones: BookTones
  folderTones: FolderTones
}) {
  const [exam, setExam] = useState(exams[0]!)
  const reduce = useReducedMotion()
  const books = shelf.books.filter((b) => b.exam === exam)
  const notes = shelf.resources.filter((r) => r.exam === exam)
  const folders = shelf.folders.filter((f) => f.exam === exam || !f.exam)
  return (
    <div>
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Exam</legend>
        {exams.map((e) => (
          <button
            key={e}
            type="button"
            aria-pressed={e === exam}
            onClick={() => setExam(e)}
            className="relative h-11 rounded-full px-5 text-sm font-medium text-[var(--pt-ink)] shadow-[inset_0_0_0_1px_var(--pt-line)] transition-colors duration-200 aria-pressed:text-[var(--pt-paper)]"
          >
            {e === exam && (
              <m.span
                layoutId="pt-exam"
                transition={{ type: "spring", duration: 0.4, bounce: 0.12 }}
                className="absolute inset-0 rounded-full bg-[var(--pt-forest)]"
              />
            )}
            <span className="relative">{e}</span>
          </button>
        ))}
      </fieldset>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={exam}
          initial={
            reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(6px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(6px)" }
          }
          transition={{ duration: 0.3, ease }}
          className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12"
        >
          <div className="lg:col-span-6">
            <h3 className="text-sm font-medium text-[var(--pt-muted)]">
              Books
            </h3>
            {books.length ? (
              <ul className="mt-4 grid grid-cols-2 gap-x-2 gap-y-8">
                {books.map((b) => (
                  <li key={b.slug} className="min-w-0">
                    <Link data-bk-hover href={b.href} className="group block">
                      <Book3D book={b} tones={tones} font="var(--pt-sans)" />
                      <span className="mt-3 block px-[18px] font-semibold">
                        {b.title}
                      </span>
                      <span className="block px-[18px] text-sm text-[var(--pt-muted)] tabular-nums">
                        {b.pages} pages, {b.price}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-[20px] bg-[var(--pt-paper)] p-6 text-[var(--pt-muted)]">
                No book for this exam yet. The free material is alongside.
              </p>
            )}
          </div>
          <div className="lg:col-span-6">
            <h3 className="text-sm font-medium text-[var(--pt-muted)]">
              Free study material
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3">
              {folders.map((f) => (
                <li key={f.id}>
                  <Link
                    data-fd-hover
                    href={f.href}
                    aria-label={`${f.name}, ${f.items.length} files`}
                    className="block rounded-[14px]"
                  >
                    <Folder folder={f} tones={folderTones} />
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-6 grid gap-2">
              {notes.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={r.href}
                    className="group flex items-center gap-4 rounded-[20px] bg-[var(--pt-paper)] p-4 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-20px_rgba(16,38,28,0.35)]"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[var(--pt-lime)] text-[var(--pt-ink)]">
                      <IconFileText aria-hidden size={20} stroke={1.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {r.title}
                      </span>
                      <span className="block text-sm text-[var(--pt-muted)]">
                        {r.kind}, {r.pages} pages
                      </span>
                    </span>
                    <IconArrowRight
                      aria-hidden
                      size={18}
                      stroke={1.75}
                      className="text-[var(--pt-muted)] transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
              {!notes.length && (
                <li className="rounded-[20px] bg-[var(--pt-paper)] p-6 text-[var(--pt-muted)]">
                  Free notes for this exam are on the way.
                </li>
              )}
            </ul>
            <p className="mt-4 text-sm text-[var(--pt-muted)]">
              Log in once with your mobile number to open any of them.
            </p>
          </div>
        </m.div>
      </AnimatePresence>
    </div>
  )
}

/** Teacher rows; on a mouse, a portrait card trails the pointer. */
export function TeacherRows({
  people,
}: {
  people: {
    slug: string
    name: string
    teaches: string
    note: string
    portrait: string
    href: string
  }[]
}) {
  const [hover, setHover] = useState<number | null>(null)
  const box = useRef<HTMLUListElement>(null)
  const { x, y, sx, sy } = usePointerFollow()
  const reduce = useReducedMotion()
  const person = hover === null ? null : people[hover]!

  return (
    <div className="relative">
      <ul
        ref={box}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || !box.current) return
          const r = box.current.getBoundingClientRect()
          x.set(e.clientX - r.left)
          y.set(e.clientY - r.top)
        }}
        onPointerLeave={() => setHover(null)}
        className="border-t border-[var(--pt-line)]"
      >
        {people.map((p, i) => (
          <li key={p.slug} className="border-b border-[var(--pt-line)]">
            <a
              href={p.href}
              target="_blank"
              rel="noreferrer noopener"
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse" || !box.current) return
                const r = box.current.getBoundingClientRect()
                x.set(e.clientX - r.left)
                y.set(e.clientY - r.top)
                // First entry: appear at the pointer instead of flying in.
                if (hover === null) {
                  sx.jump(e.clientX - r.left)
                  sy.jump(e.clientY - r.top)
                }
                setHover(i)
              }}
              className="group grid grid-cols-[56px_1fr_auto] items-center gap-4 py-5 md:grid-cols-[1fr_1fr_auto] md:gap-8 md:py-7"
            >
              <span className="relative size-14 overflow-hidden rounded-2xl bg-[#0E2A57] md:hidden">
                <Image
                  src={p.portrait}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover object-top"
                />
              </span>
              <span className="text-[clamp(1.4rem,3vw,2.6rem)] leading-none font-semibold tracking-[-0.035em] transition-transform duration-300 ease-out md:group-hover:translate-x-2">
                {p.name}
              </span>
              <span className="hidden text-[var(--pt-muted)] md:block">
                {p.teaches}
                <span className="block text-sm">{p.note}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap">
                <span className="hidden sm:inline">Watch a class</span>
                <IconArrowRight
                  aria-hidden
                  size={18}
                  stroke={1.75}
                  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                />
              </span>
            </a>
          </li>
        ))}
      </ul>
      {!reduce && (
        <m.div
          aria-hidden
          style={{ x: sx, y: sy }}
          className="pointer-events-none absolute top-0 left-0 z-10 hidden md:block"
        >
          <AnimatePresence>
            {person && (
              <m.div
                key={person.slug}
                initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                className="absolute -top-28 left-10 aspect-[4/5] w-48 overflow-hidden rounded-[22px] bg-[#0E2A57] shadow-[0_30px_60px_-20px_rgba(16,38,28,0.5)]"
              >
                <Image
                  src={person.portrait}
                  alt=""
                  fill
                  sizes="192px"
                  className="object-cover object-top"
                />
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      )}
    </div>
  )
}
