"use client"

import {
  IconArrowRight,
  IconCheck,
  IconMoon,
  IconSun,
} from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Link from "next/link"
import {
  createContext,
  useContext,
  useId,
  useState,
  useSyncExternalStore,
  type PointerEvent,
  type ReactNode,
} from "react"
import { flushSync } from "react-dom"

import {
  AnnouncementBar,
  ReelCard,
  type Campaign,
} from "@/components/marketing/promos"

/* ------------------------------------------------------------------ */
/*  Light and dark                                                     */
/* ------------------------------------------------------------------ */

type Mode = "light" | "dark"
const KEY = "ict-mode"
let override: Mode | null = null
const listeners = new Set<() => void>()

function stored(): Mode | null {
  try {
    const v = window.localStorage.getItem(KEY)
    return v === "dark" || v === "light" ? v : null
  } catch {
    return null
  }
}
const query = () => window.matchMedia("(prefers-color-scheme: dark)")
const snapshot = (): Mode =>
  override ?? stored() ?? (query().matches ? "dark" : "light")

function subscribe(cb: () => void) {
  listeners.add(cb)
  const mq = query()
  mq.addEventListener("change", cb)
  return () => {
    listeners.delete(cb)
    mq.removeEventListener("change", cb)
  }
}
function write(mode: Mode) {
  override = mode
  try {
    window.localStorage.setItem(KEY, mode)
  } catch {
    /* a blocked store just means the choice is not remembered */
  }
  listeners.forEach((cb) => cb())
}

const ModeCtx = createContext<Mode>("light")

/** Holds the mode, and lets any card catch the light under the pointer. */
export function ModeRoot({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore<Mode>(subscribe, snapshot, () => "light")

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-k-card]")
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - r.left}px`)
    el.style.setProperty("--my", `${e.clientY - r.top}px`)
  }

  return (
    <ModeCtx.Provider value={mode}>
      <div
        data-mode={mode}
        style={{ display: "contents" }}
        onPointerMove={onMove}
      >
        {children}
      </div>
    </ModeCtx.Provider>
  )
}

/** The switch. The new mode grows as a circle from where you pressed. */
export function ModeToggle() {
  const mode = useContext(ModeCtx)
  const reduce = useReducedMotion()
  const next: Mode = mode === "dark" ? "light" : "dark"

  const icon = {
    initial: reduce ? false : { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: reduce ? undefined : { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    transition: { type: "spring", duration: 0.3, bounce: 0 } as const,
  }

  return (
    <button
      type="button"
      data-lr-toggle
      aria-label={`Switch to ${next} mode`}
      onClick={(e) => {
        const doc = document as Document & {
          startViewTransition?: (cb: () => void) => unknown
        }
        if (!doc.startViewTransition || reduce) return write(next)
        const r = e.currentTarget.getBoundingClientRect()
        doc.documentElement.style.setProperty(
          "--vt-x",
          `${r.left + r.width / 2}px`
        )
        doc.documentElement.style.setProperty(
          "--vt-y",
          `${r.top + r.height / 2}px`
        )
        doc.startViewTransition(() => flushSync(() => write(next)))
      }}
    >
      <span className="relative grid size-5 place-items-center">
        <AnimatePresence initial={false} mode="popLayout">
          {mode === "dark" ? (
            <m.span key="sun" {...icon} className="absolute">
              <IconSun aria-hidden size={19} stroke={1.75} />
            </m.span>
          ) : (
            <m.span key="moon" {...icon} className="absolute">
              <IconMoon aria-hidden size={19} stroke={1.75} />
            </m.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Announcement bar and reel                                          */
/* ------------------------------------------------------------------ */

export function TopBar({ c }: { c: Campaign }) {
  const [open, setOpen] = useState(true)
  const reduce = useReducedMotion()
  return (
    <AnimatePresence initial={false}>
      {open && (
        <m.div
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, y: -8, transition: { duration: 0.16 } }
          }
          className="mx-auto w-full max-w-[1240px] px-5 pt-4 md:px-8"
        >
          <AnnouncementBar c={c} onClose={() => setOpen(false)} />
        </m.div>
      )}
    </AnimatePresence>
  )
}

/** A reel that waits four seconds, plays on its own, and can be closed for good. */
export function SiteReel({ c }: { c: Campaign }) {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return <ReelCard c={c} delay={4000} onClose={() => setOpen(false)} />
}

/* ------------------------------------------------------------------ */
/*  First-week checklist                                               */
/* ------------------------------------------------------------------ */

/** Tick the three steps; the call to action appears when they are done. */
export function WeekPlan({
  steps,
  cta,
  href,
}: {
  steps: { verb: string; body: string }[]
  cta: string
  href: string
}) {
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false))
  const id = useId()
  const reduce = useReducedMotion()
  const count = done.filter(Boolean).length
  const all = count === steps.length

  return (
    <div>
      <ul className="grid gap-3">
        {steps.map((s, i) => (
          <li key={s.verb}>
            <label
              htmlFor={`${id}-${i}`}
              aria-label={s.verb}
              data-k-tile
              className="flex cursor-pointer items-start gap-4 p-4 transition-[box-shadow] duration-200 has-[:checked]:shadow-[inset_0_0_0_1.5px_var(--k-accent-deep)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--k-accent-deep)]"
            >
              <input
                id={`${id}-${i}`}
                type="checkbox"
                checked={done[i]}
                onChange={() =>
                  setDone((d) => d.map((v, k) => (k === i ? !v : v)))
                }
                className="peer sr-only"
              />
              <span data-lr-check aria-hidden className="mt-0.5">
                <m.span
                  initial={false}
                  animate={{
                    opacity: done[i] ? 1 : 0,
                    scale: done[i] ? 1 : 0.5,
                    filter: done[i] ? "blur(0px)" : "blur(3px)",
                  }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", duration: 0.3, bounce: 0 }
                  }
                  className="grid place-items-center"
                >
                  <IconCheck size={16} stroke={3} />
                </m.span>
              </span>
              <span className="min-w-0">
                <span
                  data-k-display
                  className="block text-xl leading-tight"
                  style={{
                    textDecorationLine: done[i] ? "line-through" : "none",
                    textDecorationThickness: "1.5px",
                    opacity: done[i] ? 0.6 : 1,
                  }}
                >
                  {s.verb}
                </span>
                <span className="mt-1 block text-sm text-[var(--k-muted)]">
                  {s.body}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-5 min-h-[52px]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {all ? (
            <m.div
              key="go"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.24 } }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              <Link
                href={href}
                data-k-press
                data-k-btn
                className="inline-flex h-12 items-center gap-2 px-6 whitespace-nowrap"
              >
                {cta}
                <IconArrowRight aria-hidden size={18} stroke={2.25} />
              </Link>
            </m.div>
          ) : (
            <m.p
              key="count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="pt-2 text-sm text-[var(--k-muted)]"
            >
              {count} of {steps.length} done. Tick them off as you go.
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
