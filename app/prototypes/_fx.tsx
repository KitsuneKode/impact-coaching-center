"use client"

import {
  animate,
  domMax,
  LazyMotion,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"
import {
  Children,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react"

/** Shared motion pieces for the second round of prototypes. Styling stays in each page. */

export const ease = [0.23, 1, 0.32, 1] as const

/** The prototypes use layout animations, which the site's lighter bundle leaves out. */
export function MotionScope({ children }: { children: ReactNode }) {
  return <LazyMotion features={domMax}>{children}</LazyMotion>
}

/**
 * Tracks the pointer across a group and hands every `[data-spot]` child its
 * own `--sx`/`--sy`, so borders light up across neighbouring cards.
 */
export function SpotlightGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  function move(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return
    for (const el of e.currentTarget.querySelectorAll<HTMLElement>(
      "[data-spot]"
    )) {
      const r = el.getBoundingClientRect()
      el.style.setProperty("--sx", `${e.clientX - r.left}px`)
      el.style.setProperty("--sy", `${e.clientY - r.top}px`)
    }
  }
  return (
    <div className={className} onPointerMove={move}>
      {children}
    </div>
  )
}

/** Counts up to a display figure such as "16.2K", "1,000+" or "150+". */
export function CountUp({ display }: { display: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    const match = /^([\d.,]+)(.*)$/.exec(display)
    if (!el || !match || !inView || reduce) return
    const [, raw, suffix] = match
    const target = Number(raw!.replaceAll(",", ""))
    const decimals = raw!.split(".")[1]?.length ?? 0
    const format = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: raw!.includes(","),
    })
    const controls = animate(0, target, {
      duration: 1.4,
      ease,
      onUpdate: (v) => {
        el.textContent = `${format.format(v)}${suffix}`
      },
    })
    return () => controls.stop()
  }, [inView, reduce, display])

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  )
}

/** Tilts toward the pointer on a spring. Mouse only. */
export function Tilt({
  children,
  className,
  max = 6,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const reduce = useReducedMotion()
  const rx = useSpring(0, { stiffness: 180, damping: 18 })
  const ry = useSpring(0, { stiffness: 180, damping: 18 })
  return (
    <m.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return
        const r = e.currentTarget.getBoundingClientRect()
        ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2)
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
    >
      {children}
    </m.div>
  )
}

/** Pulls its child a few pixels toward the pointer. */
export function Magnetic({
  children,
  className,
  strength = 0.2,
}: {
  children: ReactNode
  className?: string
  strength?: number
}) {
  const reduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 220, damping: 16 })
  const y = useSpring(0, { stiffness: 220, damping: 16 })
  return (
    <m.span
      className={className}
      style={{ x, y, display: "inline-flex" }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * strength)
        y.set((e.clientY - r.top - r.height / 2) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </m.span>
  )
}

/**
 * A frame that starts tipped back and lies flat as it scrolls up the screen,
 * the way a laptop lid opens.
 */
export function ScrollTilt({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.25"],
  })
  const rotateX = useTransform(scrollYProgress, [0, 1], [24, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1])
  return (
    <div ref={ref} className={className} style={{ perspective: 1200 }}>
      <m.div
        style={
          reduce
            ? undefined
            : { rotateX, scale, transformOrigin: "50% 0%" as const }
        }
      >
        {children}
      </m.div>
    </div>
  )
}

/** Cards that pin one after another and shrink as the next one covers them. */
export function StickyStack({
  children,
  top = 96,
  step = 20,
  gap = "45vh",
}: {
  children: ReactNode
  top?: number
  step?: number
  gap?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const items = Children.toArray(children)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })
  return (
    <div ref={ref}>
      {items.map((child, i) => (
        <StackItem
          key={i}
          index={i}
          count={items.length}
          progress={scrollYProgress}
          style={{
            top: top + i * step,
            marginBottom: i === items.length - 1 ? 0 : gap,
          }}
        >
          {child}
        </StackItem>
      ))}
    </div>
  )
}

function StackItem({
  children,
  index,
  count,
  progress,
  style,
}: {
  children: ReactNode
  index: number
  count: number
  progress: MotionValue<number>
  style: CSSProperties
}) {
  const reduce = useReducedMotion()
  const target = 1 - (count - 1 - index) * 0.04
  const scale = useTransform(progress, [index / count, 1], [1, target])
  return (
    <div className="sticky" style={style}>
      <m.div
        style={
          reduce ? undefined : { scale, transformOrigin: "50% 0%" as const }
        }
      >
        {children}
      </m.div>
    </div>
  )
}

/** A pointer position on springs, for previews that follow the cursor. */
export function usePointerFollow() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 26 })
  const sy = useSpring(y, { stiffness: 260, damping: 26 })
  return { x, y, sx, sy }
}

/** A thumbnail button that swaps itself for the YouTube player when pressed. */
export function PlayInPlace({
  id,
  title,
  children,
  className,
}: {
  id: string
  title: string
  children: ReactNode
  className?: string
}) {
  const [playing, setPlaying] = useState(false)
  if (playing)
    return (
      <iframe
        className={className}
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    )
  return (
    <button
      type="button"
      className={className}
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
    >
      {children}
    </button>
  )
}

/** A paragraph whose words light up one by one as it scrolls through view. */
export function ScrollWords({
  parts,
  className,
}: {
  parts: { text: string; strong?: boolean }[]
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.5"],
  })
  const words = parts.flatMap((p) =>
    p.text
      .split(" ")
      .filter(Boolean)
      .map((w) => ({ w, strong: p.strong }))
  )
  return (
    <p ref={ref} className={className}>
      {words.map((x, i) => (
        <Word
          key={i}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          strong={x.strong}
        >
          {x.w}
        </Word>
      ))}
    </p>
  )
}

function Word({
  children,
  progress,
  range,
  strong,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
  strong?: boolean
}) {
  const reduce = useReducedMotion()
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <>
      <m.span
        data-strong={strong || undefined}
        style={{ opacity: reduce ? 1 : opacity }}
      >
        {children}
      </m.span>{" "}
    </>
  )
}
