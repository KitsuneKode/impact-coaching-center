"use client"

import { IconArrowRight, IconCheck, IconCopy, IconX } from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { flushSync } from "react-dom"
import { toast } from "sonner"
import {
  createContext,
  useContext,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react"

/* ------------------------------------------------------------------ */
/*  Finish: the paint the whole page wears                             */
/* ------------------------------------------------------------------ */

export type Finish = "midnight" | "portimao" | "gentian"

const finishes: { id: Finish; name: string; note: string }[] = [
  { id: "midnight", name: "Midnight Sapphire", note: "Matte, nearly black" },
  { id: "portimao", name: "Portimao Metallic", note: "Bright, deep flake" },
  { id: "gentian", name: "Gentian Satin", note: "Grey-blue, stately" },
]

const FinishCtx = createContext<{
  finish: Finish
  set: (f: Finish, from?: { x: number; y: number }) => void
}>({ finish: "midnight", set: () => {} })

/** Holds the chosen finish and lets any `[data-coat]` panel catch the light under the pointer. */
export function FinishRoot({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  const [finish, setFinish] = useState<Finish>("midnight")
  const root = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  /** Repaints as a circle growing from the chosen orb; instant where View Transitions are missing. */
  const set = (next: Finish, from?: { x: number; y: number }) => {
    if (next === finish) return
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> }
    }
    if (!doc.startViewTransition || reduce || !from) {
      setFinish(next)
      return
    }
    const el = root.current
    el?.setAttribute("data-vt", "")
    doc.documentElement.style.setProperty("--vt-x", `${from.x}px`)
    doc.documentElement.style.setProperty("--vt-y", `${from.y}px`)
    doc
      .startViewTransition(() => flushSync(() => setFinish(next)))
      .finished.finally(() => el?.removeAttribute("data-vt"))
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-coat]")
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - r.left}px`)
    el.style.setProperty("--my", `${e.clientY - r.top}px`)
  }

  return (
    <FinishCtx.Provider value={{ finish, set }}>
      <div
        ref={root}
        data-cc
        data-finish={finish}
        onPointerMove={onMove}
        className={className}
        style={style}
      >
        {children}
      </div>
    </FinishCtx.Provider>
  )
}

export function FinishPicker() {
  const { finish, set } = useContext(FinishCtx)
  const from = useRef<{ x: number; y: number } | null>(null)

  return (
    <fieldset className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
      <legend className="sr-only">Page finish</legend>
      {finishes.map((f) => {
        const on = f.id === finish
        return (
          <label
            key={f.id}
            htmlFor={`finish-${f.id}`}
            aria-label={`${f.name}, ${f.note}`}
            data-finish-option={f.id}
            data-on={on ? "" : undefined}
            onPointerDown={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              from.current = { x: r.left + 28, y: r.top + r.height / 2 }
            }}
            data-cc-press
            data-cc-option
            className="flex min-h-14 cursor-pointer items-center gap-3 rounded-full py-2 pr-6 pl-2 text-left"
          >
            <input
              id={`finish-${f.id}`}
              type="radio"
              name="finish"
              value={f.id}
              checked={on}
              onChange={() => {
                set(f.id, from.current ?? undefined)
                from.current = null
              }}
              className="sr-only"
            />
            <span
              aria-hidden
              data-orb={f.id}
              className="size-10 shrink-0 rounded-full"
            />
            <span className="min-w-0">
              <span className="block truncate text-[0.95rem] font-medium">
                {f.name}
              </span>
              <span className="block truncate text-xs text-[var(--cc-muted)]">
                {f.note}
              </span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}

/* ------------------------------------------------------------------ */
/*  Announcement bar                                                   */
/* ------------------------------------------------------------------ */

export function Announce({
  tag,
  children,
  action,
  href,
}: {
  tag: string
  children: ReactNode
  action: string
  href: string
}) {
  const [open, setOpen] = useState(true)
  return (
    <AnimatePresence initial={false}>
      {open && (
        <m.div
          data-coat
          exit={{ opacity: 0, y: -8, transition: { duration: 0.16 } }}
          data-cc-panel
          className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[28px] py-3 pr-3 pl-4 sm:flex-nowrap"
        >
          <span
            data-cc-tag
            className="shrink-0 rounded-full px-3 py-1.5 text-[0.68rem]"
          >
            {tag}
          </span>
          <p className="min-w-0 flex-1 basis-56 text-[0.95rem] text-balance">
            {children}
          </p>
          <Link
            href={href}
            data-cc-press
            data-cc-btn
            className="inline-flex h-11 shrink-0 items-center rounded-full px-5 text-sm font-semibold"
          >
            {action}
          </Link>
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => setOpen(false)}
            data-cc-press
            data-cc-ghost
            className="grid size-11 shrink-0 place-items-center rounded-full"
          >
            <IconX aria-hidden size={18} stroke={1.5} />
          </button>
        </m.div>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

export function CopyButton({
  text,
  label,
  done,
}: {
  text: string
  label: string
  done: string
}) {
  const [copied, setCopied] = useState(false)
  const reduce = useReducedMotion()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopied(true)
    toast(`${text} copied`)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }

  const icon = {
    initial: reduce ? false : { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: reduce ? undefined : { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    transition: { type: "spring", duration: 0.3, bounce: 0 } as const,
  }

  return (
    <button
      type="button"
      onClick={copy}
      data-cc-press
      data-cc-outline
      className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium"
    >
      <span className="relative grid size-4 place-items-center">
        <AnimatePresence initial={false} mode="popLayout">
          {copied ? (
            <m.span key="ok" {...icon} className="absolute">
              <IconCheck aria-hidden size={16} stroke={2} />
            </m.span>
          ) : (
            <m.span key="cp" {...icon} className="absolute">
              <IconCopy aria-hidden size={16} stroke={1.5} />
            </m.span>
          )}
        </AnimatePresence>
      </span>
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Batch configurator                                                 */
/* ------------------------------------------------------------------ */

export type Trim = {
  slug: string
  exam: string
  full: string
  covers: string
  duration: string
  name: string
  price: string | null
  mrp: string | null
  when: string | null
  days: string | null
  note: string | null
  href: string
  faculty: { name: string; portrait: string; teaches: string }[]
}

export function Configurator({ trims }: { trims: Trim[] }) {
  const [i, setI] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const reduce = useReducedMotion()
  const t = trims[i]!

  const onKey = (e: KeyboardEvent, at: number) => {
    const step =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? -1
          : 0
    if (!step) return
    e.preventDefault()
    const next = (at + step + trims.length) % trims.length
    setI(next)
    refs.current[next]?.focus()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div
        role="tablist"
        aria-label="Batches"
        aria-orientation="vertical"
        className="grid gap-2 lg:col-span-4 lg:content-start"
      >
        {trims.map((x, at) => {
          const on = at === i
          return (
            <button
              key={x.slug}
              ref={(el) => {
                refs.current[at] = el
              }}
              type="button"
              role="tab"
              id={`trim-tab-${x.slug}`}
              aria-selected={on}
              aria-controls="trim-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setI(at)}
              onKeyDown={(e) => onKey(e, at)}
              data-cc-press
              data-cc-tab
              className="relative flex min-h-[4.5rem] items-center justify-between gap-4 rounded-[20px] px-5 py-3 text-left"
              data-on={on ? "" : undefined}
            >
              {on && (
                <m.span
                  layoutId="cc-trim"
                  aria-hidden
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", duration: 0.4, bounce: 0.12 }
                  }
                  data-cc-tab-fill
                  className="absolute inset-0 rounded-[20px]"
                />
              )}
              <span className="relative">
                <span
                  data-cc-wide
                  className="block text-[0.7rem] text-[var(--cc-muted)]"
                >
                  {x.exam}
                </span>
                <span className="mt-1 block text-lg font-medium tracking-[-0.01em]">
                  {x.name}
                </span>
              </span>
              <span className="relative text-sm whitespace-nowrap text-[var(--cc-muted)] tabular-nums">
                {x.when ?? x.duration}
              </span>
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id="trim-panel"
        aria-labelledby={`trim-tab-${t.slug}`}
        data-coat
        data-cc-panel
        className="relative overflow-hidden rounded-[28px] p-6 sm:p-8 lg:col-span-8"
      >
        <AnimatePresence initial={false} mode="wait">
          <m.div
            key={t.slug}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] },
            }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
          >
            <p className="text-sm text-[var(--cc-muted)]">{t.full}</p>
            <h3
              data-cc-display
              className="mt-3 text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.1] font-light tracking-[-0.02em] text-balance"
            >
              {t.name}
            </h3>
            <p className="mt-4 max-w-[52ch] text-[var(--cc-muted)]">
              {t.covers}
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Timing", t.when ?? "Ask us"],
                ["Days", t.days ?? "See the batch"],
                ["Length", t.duration],
                ["Fee", t.price ?? "Ask us"],
              ].map(([k, v]) => (
                <div key={k} data-cc-tile className="rounded-2xl p-4">
                  <dt
                    data-cc-wide
                    className="text-[0.62rem] text-[var(--cc-muted)]"
                  >
                    {k}
                  </dt>
                  <dd className="mt-2 text-[0.95rem] leading-snug font-medium tabular-nums">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            {t.note && (
              <p className="mt-5 text-sm text-[var(--cc-muted)]">{t.note}</p>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
              <ul className="flex items-center" aria-label="Faculty">
                {t.faculty.map((f, k) => (
                  <li key={f.name} className={k ? "-ml-2.5" : ""}>
                    <span
                      data-cc-avatar
                      className="relative block size-11 overflow-hidden rounded-full"
                      title={`${f.name}, ${f.teaches}`}
                    >
                      <Image
                        src={f.portrait}
                        alt={`${f.name}, ${f.teaches}`}
                        fill
                        sizes="44px"
                        className="object-cover object-top"
                      />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-4">
                {t.mrp && (
                  <s className="text-sm text-[var(--cc-muted)] tabular-nums">
                    {t.mrp}
                  </s>
                )}
                <Link
                  href={t.href}
                  data-cc-press
                  data-cc-btn
                  className="group inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold"
                >
                  See the batch
                  <IconArrowRight
                    aria-hidden
                    size={18}
                    stroke={2}
                    className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
