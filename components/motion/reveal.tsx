"use client"

import { useReducedMotion, type HTMLMotionProps } from "motion/react"
import * as m from "motion/react-m"
import { Children, type ReactNode } from "react"

const EASE = [0.16, 1, 0.3, 1] as const

const hidden = { opacity: 0, y: 14, filter: "blur(8px)" }
const shown = { opacity: 1, y: 0, filter: "blur(0px)" }

/**
 * Blur-in on scroll, the way kobbe.io brings each section into focus.
 *
 * Children are server-rendered and passed through as a slot, so only this thin
 * wrapper hydrates. Motivation: on a long conversion page, each section coming
 * into focus as it arrives marks it as its own beat instead of one continuous
 * wall of content.
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
  const reduce = useReducedMotion()
  const Tag = m[as] as React.ComponentType<HTMLMotionProps<"div">>

  return (
    <Tag
      className={className}
      initial={reduce ? false : hidden}
      whileInView={shown}
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -64px 0px" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </Tag>
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
  const reduce = useReducedMotion()
  const items = Children.toArray(children)
  const Wrapper = as
  const Item = as === "div" ? m.div : m.li

  return (
    <Wrapper className={className}>
      {items.map((child, index) => (
        <Item
          key={index}
          className={itemClassName}
          initial={reduce ? false : hidden}
          whileInView={shown}
          viewport={{ once: true, amount: 0.2, margin: "0px 0px -48px 0px" }}
          transition={{
            duration: 0.7,
            delay: Math.min(index * step, maxDelay),
            ease: EASE,
          }}
        >
          {child}
        </Item>
      ))}
    </Wrapper>
  )
}
