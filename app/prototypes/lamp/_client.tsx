"use client"

import { IconArrowRight } from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react"

import type { Shelf } from "../_data"
import { Folder, type FolderTones } from "../_folder"
import { ease } from "../_fx"

export type CourseTab = {
  slug: string
  label: string
  name: string
  full: string
  covers: string
  duration: string
  when: string | null
  days: string | null
  price: string | null
  mrp: string | null
  cover: string | null
  href: string
  faculty: { name: string; portrait: string }[]
}

/** Three tracks behind one sliding tab bar; the panel cross-fades with a blur. */
export function CourseTabs({ courses }: { courses: CourseTab[] }) {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const reduce = useReducedMotion()
  const course = courses[active]!

  function onKey(e: KeyboardEvent) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (active + step + courses.length) % courses.length
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Courses"
        tabIndex={-1}
        onKeyDown={onKey}
        className="inline-flex max-w-full [scrollbar-width:none] gap-1 overflow-x-auto rounded-full bg-[var(--lp-card)] p-1 shadow-[inset_0_0_0_1px_var(--lp-line)]"
      >
        {courses.map((c, i) => (
          <button
            key={c.slug}
            ref={(el) => {
              tabs.current[i] = el
            }}
            role="tab"
            id={`lp-tab-${c.slug}`}
            aria-selected={i === active}
            aria-controls="lp-course-panel"
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className="relative h-11 shrink-0 rounded-full px-5 text-sm font-medium whitespace-nowrap text-[var(--lp-muted)] transition-colors duration-200 aria-selected:text-[var(--lp-bg)]"
          >
            {i === active && (
              <m.span
                layoutId="lp-tab"
                transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
                className="absolute inset-0 rounded-full bg-[var(--lp-amber)]"
              />
            )}
            <span className="relative">{c.label}</span>
          </button>
        ))}
      </div>

      <div
        id="lp-course-panel"
        role="tabpanel"
        aria-labelledby={`lp-tab-${course.slug}`}
        className="mt-10"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={course.slug}
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: 10, filter: "blur(6px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: -6, filter: "blur(6px)" }
            }
            transition={{ duration: 0.28, ease }}
            className="grid gap-10 md:grid-cols-[1.15fr_1fr] md:items-center lg:gap-16"
          >
            {course.cover && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[var(--lp-card)] shadow-[0_30px_80px_-30px_rgba(245,181,68,0.25),0_0_0_1px_var(--lp-line)]">
                <Image
                  src={course.cover}
                  alt={`${course.name} course poster`}
                  fill
                  sizes="(min-width: 768px) 560px, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="text-[var(--lp-muted)]">{course.full}</p>
              <h3 className="mt-2 font-[family-name:var(--lp-sans)] text-4xl font-semibold tracking-[-0.03em] [font-stretch:112%] md:text-5xl">
                {course.name}
              </h3>
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
                <div className="col-span-2">
                  <dt className="text-[var(--lp-muted)]">Covers</dt>
                  <dd className="mt-1 text-base">{course.covers}</dd>
                </div>
                <div>
                  <dt className="text-[var(--lp-muted)]">Duration</dt>
                  <dd className="mt-1 text-base">{course.duration}</dd>
                </div>
                {course.when && (
                  <div>
                    <dt className="text-[var(--lp-muted)]">Timing</dt>
                    <dd className="mt-1 text-base tabular-nums">
                      {course.when}
                      {course.days && (
                        <span className="block text-[var(--lp-muted)]">
                          {course.days}
                        </span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
              {course.price && (
                <p className="mt-8 flex items-baseline gap-3 tabular-nums">
                  <span className="text-4xl font-semibold tracking-[-0.02em]">
                    {course.price}
                  </span>
                  {course.mrp && (
                    <s className="text-[var(--lp-muted)]">{course.mrp}</s>
                  )}
                  <span className="text-sm text-[var(--lp-muted)]">
                    one time
                  </span>
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  data-press
                  href={course.href}
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-[var(--lp-text)] px-6 font-medium text-[var(--lp-bg)]"
                >
                  See {course.name}
                  <IconArrowRight
                    aria-hidden
                    size={18}
                    stroke={1.75}
                    className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {course.faculty.map((f) => (
                      <Image
                        key={f.name}
                        src={f.portrait}
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 rounded-full object-cover object-top ring-2 ring-[var(--lp-bg)]"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--lp-muted)]">
                    {course.faculty.map((f) => f.name.split(" ")[0]).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** A slim bar that slides down under the header once the target has scrolled away. */
export function EnrolBar({
  watch,
  children,
}: {
  /** id of the element whose disappearance shows the bar */
  watch: string
  children: ReactNode
}) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = document.getElementById(watch)
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShown(!e!.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    })
    io.observe(el)
    return () => io.disconnect()
  }, [watch])
  return (
    <div
      aria-hidden={!shown}
      inert={!shown}
      className={`fixed inset-x-0 top-16 z-30 border-b border-[var(--lp-line)] bg-[rgba(12,16,23,0.86)] backdrop-blur-xl transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        shown ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      {children}
    </div>
  )
}

/** The six free folders; pick one and its files open beneath. */
export function FolderBrowser({
  folders,
  tones,
}: {
  folders: Shelf["folders"]
  tones: FolderTones
}) {
  const [picked, setOpen] = useState<string | null>(null)
  const reduce = useReducedMotion()
  // Deep links from the home page: /prototypes/lamp/notes#mock-apsc
  const hash = useSyncExternalStore(
    (on) => {
      window.addEventListener("hashchange", on)
      return () => window.removeEventListener("hashchange", on)
    },
    () => window.location.hash.slice(1),
    () => ""
  )
  const open =
    picked ?? (folders.some((f) => f.id === hash) ? hash : folders[0]!.id)

  const folder = folders.find((f) => f.id === open)!
  return (
    <div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
        {folders.map((f) => (
          <li key={f.id} id={f.id} className="scroll-mt-28">
            <button
              type="button"
              data-fd-hover
              data-fd-open={f.id === open ? "" : undefined}
              aria-pressed={f.id === open}
              onClick={() => setOpen(f.id)}
              className="block w-full rounded-[14px] text-left transition-opacity duration-200 hover:opacity-100 aria-[pressed=false]:opacity-75"
            >
              <Folder folder={f} tones={tones} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-12 min-h-[16rem]">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={folder.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease }}
          >
            <h2 className="text-2xl font-semibold tracking-[-0.02em]">
              {folder.name}
            </h2>
            {folder.items.length ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {folder.items.map((n) => (
                  <li key={n.slug}>
                    <Link
                      href={n.href}
                      className="group flex h-full flex-col rounded-[24px] bg-[var(--lp-card)] p-6 shadow-[inset_0_0_0_1px_var(--lp-line)] transition-shadow duration-200 hover:shadow-[inset_0_0_0_1px_rgba(245,181,68,0.45)]"
                    >
                      <span className="text-sm text-[var(--lp-amber)]">
                        {n.kind}
                      </span>
                      <span className="mt-3 text-lg font-semibold">
                        {n.title}
                      </span>
                      <span className="mt-1 text-sm text-[var(--lp-muted)]">
                        {n.exam}, {n.pages} pages
                      </span>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-medium">
                        Read free
                        <IconArrowRight
                          aria-hidden
                          size={16}
                          stroke={2}
                          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 max-w-[48ch] rounded-[24px] bg-[var(--lp-card)] p-6 text-[var(--lp-muted)] shadow-[inset_0_0_0_1px_var(--lp-line)]">
                Nothing in this folder yet. New material appears here as soon as
                ICT publishes it.
              </p>
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
