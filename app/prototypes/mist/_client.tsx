"use client"

import {
  IconArrowRight,
  IconAward,
  IconBook2,
  IconBooks,
  IconChevronLeft,
  IconChevronRight,
  IconFolderFilled,
  IconHelpCircle,
  IconNotes,
  IconPlayerPlay,
  IconUsers,
} from "@tabler/icons-react"
import {
  AnimatePresence,
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"
import Image from "next/image"
import Link from "next/link"
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { Book3D, type BookTones } from "../_book"
import type { Shelf } from "../_data"
import { ease } from "../_fx"

/* -------------------------------------------------------------------------- */
/*  Dock                                                                      */
/* -------------------------------------------------------------------------- */

const dockItems = [
  { href: "#exam", label: "Courses, books and notes", Icon: IconBook2 },
  { href: "#teachers", label: "Teachers", Icon: IconUsers },
  { href: "#watch", label: "Watch a class", Icon: IconPlayerPlay },
  { href: "#results", label: "Results", Icon: IconAward },
  { href: "/prototypes/mist/books", label: "Books", Icon: IconBooks },
  { href: "/prototypes/mist/notes", label: "Free notes", Icon: IconNotes },
  { href: "#questions", label: "Questions", Icon: IconHelpCircle },
] as const

/** A glass dock whose icons swell as the pointer passes, like macOS. */
export function Dock({ cta }: { cta: ReactNode }) {
  const mouseX = useMotionValue(Infinity)
  return (
    <nav aria-label="Sections" className="hidden md:block">
      <div
        onPointerMove={(e) =>
          e.pointerType === "mouse" && mouseX.set(e.clientX)
        }
        onPointerLeave={() => mouseX.set(Infinity)}
        className="flex h-[68px] items-end gap-2 rounded-[24px] px-3 pb-2.5"
        data-glass
      >
        {dockItems.map((item) => (
          <DockIcon key={item.label} mouseX={mouseX} {...item} />
        ))}
        <span aria-hidden className="mx-1 mb-2 h-8 w-px bg-[var(--ms-line)]" />
        <span className="mb-0.5">{cta}</span>
      </div>
    </nav>
  )
}

function DockIcon({
  mouseX,
  href,
  label,
  Icon,
}: {
  mouseX: MotionValue<number>
  href: string
  label: string
  Icon: (typeof dockItems)[number]["Icon"]
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduce = useReducedMotion()
  const distance = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect()
    return b ? x - b.left - b.width / 2 : Infinity
  })
  const size = useSpring(useTransform(distance, [-140, 0, 140], [42, 60, 42]), {
    mass: 0.1,
    stiffness: 170,
    damping: 13,
  })
  return (
    <m.a
      ref={ref}
      href={href}
      aria-label={label}
      style={reduce ? { width: 42, height: 42 } : { width: size, height: size }}
      className="group relative grid shrink-0 place-items-center rounded-[14px] bg-[rgba(255,255,255,0.7)] text-[var(--ms-ink)] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_4px_12px_-4px_rgba(13,27,30,0.18)]"
    >
      <Icon aria-hidden size="46%" stroke={1.6} />
      <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 translate-y-1 rounded-lg bg-[var(--ms-ink)] px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        {label}
      </span>
    </m.a>
  )
}

/* -------------------------------------------------------------------------- */
/*  Parallax scene                                                            */
/* -------------------------------------------------------------------------- */

const Pointer = createContext<{
  x: MotionValue<number>
  y: MotionValue<number>
} | null>(null)

/** Layers inside shift by their depth as the pointer moves over the scene. */
export function ParallaxScene({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const x = useSpring(0, { stiffness: 120, damping: 20 })
  const y = useSpring(0, { stiffness: 120, damping: 20 })
  return (
    <Pointer.Provider value={{ x, y }}>
      <div
        className={className}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return
          x.set(e.clientX / window.innerWidth - 0.5)
          y.set(e.clientY / window.innerHeight - 0.5)
        }}
        onPointerLeave={() => {
          x.set(0)
          y.set(0)
        }}
      >
        {children}
      </div>
    </Pointer.Provider>
  )
}

export function ParallaxLayer({
  depth,
  children,
  className,
}: {
  depth: number
  children: ReactNode
  className?: string
}) {
  const p = useContext(Pointer)!
  const reduce = useReducedMotion()
  const tx = useTransform(p.x, (v) => v * depth * 60)
  const ty = useTransform(p.y, (v) => v * depth * 40)
  return (
    <m.div className={className} style={reduce ? undefined : { x: tx, y: ty }}>
      {children}
    </m.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Exam hub                                                                  */
/* -------------------------------------------------------------------------- */

export type ExamPack = {
  exam: string
  full: string
  course: {
    name: string
    covers: string
    duration: string
    when: string | null
    days: string | null
    price: string | null
    mrp: string | null
    cover: string | null
    href: string
  }
  teachers: { name: string; teaches: string; portrait: string }[]
  books: Shelf["books"]
  folders: Shelf["folders"]
  workshop: { name: string; subtitle: string; href: string } | null
}

/**
 * Pick an exam and everything for it lines up: the course, its teachers,
 * books, free notes and the free workshop. The page aurora follows.
 */
export function ExamHub({
  packs,
  tones,
}: {
  packs: ExamPack[]
  tones: BookTones
}) {
  const [i, setI] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const p = packs[i]!

  function pick(j: number) {
    setI(j)
    root.current
      ?.closest<HTMLElement>("[data-ms]")
      ?.setAttribute("data-exam", String(j))
  }

  return (
    <div ref={root}>
      <fieldset
        className="inline-flex max-w-full [scrollbar-width:none] gap-1 overflow-x-auto rounded-full p-1"
        data-glass
      >
        <legend className="sr-only">Exam</legend>
        {packs.map((x, j) => (
          <button
            key={x.exam}
            type="button"
            aria-pressed={j === i}
            onClick={() => pick(j)}
            className="relative h-11 shrink-0 rounded-full px-5 text-sm font-medium whitespace-nowrap text-[var(--ms-muted)] transition-colors duration-200 aria-pressed:text-white"
          >
            {j === i && (
              <m.span
                layoutId="ms-exam"
                transition={{ type: "spring", duration: 0.45, bounce: 0.12 }}
                className="absolute inset-0 rounded-full bg-[var(--ms-ink)]"
              />
            )}
            <span className="relative">{x.exam}</span>
          </button>
        ))}
      </fieldset>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={p.exam}
          initial={
            reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(8px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, y: -10, filter: "blur(8px)" }
          }
          transition={{ duration: 0.32, ease }}
          className="mt-8 grid gap-4 lg:grid-cols-12"
        >
          {/* Course */}
          <div
            data-glass
            className="flex flex-col rounded-[32px] p-3 lg:col-span-5 lg:row-span-2"
          >
            {p.course.cover && (
              <span className="relative block aspect-[4/3] overflow-hidden rounded-[24px]">
                <Image
                  src={p.course.cover}
                  alt={`${p.course.name} poster`}
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-cover"
                />
              </span>
            )}
            <div className="flex flex-1 flex-col p-5">
              <p className="text-sm text-[var(--ms-muted)]">{p.full}</p>
              <h3 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">
                {p.course.name}
              </h3>
              <p className="mt-3 text-[var(--ms-muted)]">
                {p.course.covers}. {p.course.duration}.
              </p>
              {p.course.when && (
                <p className="mt-1 font-medium tabular-nums">
                  {p.course.when}
                  {p.course.days ? `, ${p.course.days}` : ""}
                </p>
              )}
              <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                {p.course.price && (
                  <p className="tabular-nums">
                    <span className="block text-3xl font-semibold tracking-[-0.02em]">
                      {p.course.price}
                    </span>
                    {p.course.mrp && (
                      <s className="text-sm text-[var(--ms-muted)]">
                        {p.course.mrp}
                      </s>
                    )}
                  </p>
                )}
                <Link
                  href={p.course.href}
                  className="group inline-flex h-11 items-center gap-1.5 rounded-full bg-[var(--ms-ink)] px-5 text-sm font-medium text-white transition-transform duration-150 active:scale-[0.97]"
                >
                  See the course
                  <IconArrowRight
                    aria-hidden
                    size={16}
                    stroke={2}
                    className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Books */}
          <div data-glass className="rounded-[32px] p-6 lg:col-span-7">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-semibold">Books</h3>
              <Link
                href="/books"
                className="text-sm font-medium text-[var(--ms-accent)]"
              >
                All books
              </Link>
            </div>
            {p.books.length ? (
              <ul className="mt-4 grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3">
                {p.books.map((b) => (
                  <li key={b.slug} className="min-w-0">
                    <Link data-bk-hover href={b.href} className="group block">
                      <Book3D book={b} tones={tones} font="var(--ms-sans)" />
                      <span className="mt-2 block truncate px-[18px] text-sm font-medium">
                        {b.title}
                      </span>
                      <span className="block px-[18px] text-sm text-[var(--ms-muted)] tabular-nums">
                        {b.price}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[var(--ms-muted)]">
                No book for this exam yet.
              </p>
            )}
          </div>

          {/* Free folders and workshop */}
          <div data-glass className="rounded-[32px] p-6 lg:col-span-4">
            <h3 className="font-semibold">Free study material</h3>
            <ul className="mt-3 grid gap-1">
              {p.folders.map((f) => (
                <li key={f.id}>
                  <Link
                    href={f.href}
                    className="group -mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors duration-150 hover:bg-white/60"
                  >
                    <IconFolderFilled
                      aria-hidden
                      size={22}
                      className="shrink-0 text-[var(--ms-accent)] transition-transform duration-200 ease-out group-hover:-rotate-6"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {f.name}
                      </span>
                      <span className="block text-xs text-[var(--ms-muted)]">
                        {f.items.length
                          ? `${f.items.length} ${f.items.length === 1 ? "file" : "files"}, free`
                          : "Nothing here yet"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {p.workshop && (
              <Link
                href={p.workshop.href}
                className="mt-4 block rounded-2xl bg-[var(--ms-ink)] p-4 text-white transition-transform duration-150 active:scale-[0.98]"
              >
                <span className="block text-sm text-white/70">
                  Free on the app
                </span>
                <span className="block font-semibold">{p.workshop.name}</span>
                <span className="block truncate text-sm text-white/70">
                  {p.workshop.subtitle}
                </span>
              </Link>
            )}
          </div>

          {/* Teachers */}
          <div data-glass className="rounded-[32px] p-6 lg:col-span-3">
            <h3 className="font-semibold">Taught by</h3>
            <ul className="mt-4 grid gap-3">
              {p.teachers.map((t) => (
                <li key={t.name} className="flex items-center gap-3">
                  <Image
                    src={t.portrait}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 rounded-[14px] object-cover object-top"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {t.name}
                    </span>
                    <span className="block truncate text-xs text-[var(--ms-muted)]">
                      {t.teaches}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </m.div>
      </AnimatePresence>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Carousel                                                                  */
/* -------------------------------------------------------------------------- */

/** A snap-scrolling row with glass previous and next buttons. */
export function Carousel({
  title,
  children,
}: {
  title: ReactNode
  children: ReactNode
}) {
  const ref = useRef<HTMLUListElement>(null)
  const by = (d: number) =>
    ref.current?.scrollBy({
      left: d * ref.current.clientWidth * 0.8,
      behavior: "smooth",
    })
  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        {title}
        <div className="hidden shrink-0 gap-2 md:flex">
          {[
            { d: -1, label: "Previous", Icon: IconChevronLeft },
            { d: 1, label: "Next", Icon: IconChevronRight },
          ].map(({ d, label, Icon }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => by(d)}
              data-glass
              className="grid size-12 place-items-center rounded-full transition-transform duration-150 active:scale-[0.94]"
            >
              <Icon aria-hidden size={20} stroke={1.75} />
            </button>
          ))}
        </div>
      </div>
      <ul
        ref={ref}
        className="mt-10 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth pb-4"
      >
        {children}
      </ul>
    </div>
  )
}
