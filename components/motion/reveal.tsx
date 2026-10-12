"use client"

import { useInView, useReducedMotion, type HTMLMotionProps } from "motion/react"
import * as m from "motion/react-m"
import {
  Children,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"

const EASE = [0.16, 1, 0.3, 1] as const

const hidden = { opacity: 0, y: 12 }
const shown = { opacity: 1, y: 0 }

/**
 * SSR markup is always rendered visible: hiding happens only after hydration,
 * and only for a block that still sits below the fold, so a stalled bundle or
 * a no-JS render can never strand content at `opacity: 0`. The trade for that
 * guarantee is that above-the-fold blocks simply don't animate - the page is
 * already looking at them.
 */
function useScrollReveal(margin: string) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref as RefObject<Element | null>, {
    once: true,
    amount: "some",
    margin: margin as never,
  })
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (el && el.getBoundingClientRect().top >= window.innerHeight)
      setArmed(true)
  }, [])

  return { ref, animate: !reduce && armed && !inView ? hidden : shown }
}

/**
 * Fade-and-rise on scroll. No blur filter: animating `filter` repaints every
 * frame and is the one effect a budget Android phone visibly stutters on.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: "div" | "li" | "section"
}) {
  const { ref, animate } = useScrollReveal("0px 0px -64px 0px")
  const Tag = m[as] as React.ComponentType<HTMLMotionProps<"div">>

  return (
    <Tag
      ref={ref}
      className={className}
      initial={false}
      animate={animate}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </Tag>
  )
}

function RevealItem({
  children,
  delay,
  className,
  as,
}: {
  children: ReactNode
  delay: number
  className?: string
  as: "div" | "li"
}) {
  const { ref, animate } = useScrollReveal("0px 0px -48px 0px")
  const Item = (as === "div" ? m.div : m.li) as React.ComponentType<
    HTMLMotionProps<"div">
  >

  return (
    <Item
      ref={ref}
      className={className}
      initial={false}
      animate={animate}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </Item>
  )
}

/**
 * Staggers direct children. A group of peers resolving in sequence tells the
 * eye they are siblings and gives it an order. The cascade is capped so a long
 * list never keeps the visitor waiting.
 */
export function RevealGroup({
  children,
  step = 0.06,
  maxDelay = 0.36,
  className,
  itemClassName,
  as = "div",
}: {
  children: ReactNode
  step?: number
  maxDelay?: number
  className?: string
  itemClassName?: string
  as?: "div" | "ul" | "ol"
}) {
  const items = Children.toArray(children)
  const Wrapper = as

  return (
    <Wrapper className={className}>
      {items.map((child, index) => (
        <RevealItem
          key={index}
          as={as === "div" ? "div" : "li"}
          className={itemClassName}
          delay={Math.min(index * step, maxDelay)}
        >
          {child}
        </RevealItem>
      ))}
    </Wrapper>
  )
}
