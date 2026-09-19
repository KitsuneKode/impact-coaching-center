"use client"

import {
  IconArrowRight,
  IconMenu2,
  IconPhone,
  IconX,
} from "@tabler/icons-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useId, useRef, useState } from "react"

import { ButtonAnchor } from "@/components/ui/button"
import { brand, offer } from "@/lib/brand"
import { contactHref } from "@/lib/contact"

const nav = [
  { href: "/courses", label: "Courses" },
  { href: "/#results", label: "Results" },
  { href: "/#classes", label: "Free classes" },
  { href: "/#questions", label: "Questions" },
  { href: "/#enquire", label: "Contact" },
] as const

/**
 * Floating nav in two grouped pills, after kobbe.io: identity on the left,
 * navigation plus the one CTA on the right. The CTA stays on screen the whole
 * way down on desktop, which is why the page does not need a floating button.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const panelId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKeyDown)
    panelRef.current?.querySelector<HTMLElement>("a")?.focus()
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const group =
    "rounded-[0.75rem] border border-border bg-background/75 shadow-frame backdrop-blur-xl"

  return (
    <header className="fixed inset-x-0 top-0 z-40 pt-3 md:pt-4">
      <div className="container-page flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label={`${brand.legalName}, home`}
          className={`${group} flex h-12 items-center gap-2.5 pr-3.5 pl-1.5`}
        >
          <span className="grid size-9 place-items-center rounded-[0.5rem] bg-white ring-1 ring-border">
            <Image
              src={brand.mark}
              alt=""
              width={28}
              height={28}
              className="size-7"
              priority
            />
          </span>
          <span className="text-sm font-medium tracking-tight">
            Impact{" "}
            <span className="hidden text-muted-foreground sm:inline">
              Career Tutorials
            </span>
          </span>
        </Link>

        <nav
          aria-label="Sections"
          className={`${group} hidden h-12 items-center gap-0.5 p-1.5 pl-2 lg:flex`}
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[0.5rem] px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <ButtonAnchor
            href={contactHref({ kind: "workshop" })}
            target="_blank"
            size="sm"
            className="ml-1 rounded-[0.5rem]"
          >
            {offer.short}
          </ButtonAnchor>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={contactHref({ kind: "call" })}
            aria-label="Call Impact Career Tutorials"
            className={`${group} inline-flex size-12 items-center justify-center`}
          >
            <IconPhone size={19} stroke={1.6} />
          </a>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className={`${group} inline-flex size-12 items-center justify-center`}
          >
            {open ? (
              <IconX size={20} stroke={1.6} />
            ) : (
              <IconMenu2 size={20} stroke={1.6} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            ref={panelRef}
            initial={
              reduce ? false : { opacity: 0, y: -8, filter: "blur(6px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: -8, filter: "blur(6px)" }
            }
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="container-page mt-2 lg:hidden"
          >
            <div className="rounded-card border border-border bg-card p-2 shadow-lift">
              <ul>
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-control px-3 py-3.5 text-[1.0625rem] font-medium transition-colors hover:bg-secondary"
                    >
                      {item.label}
                      <IconArrowRight
                        size={16}
                        stroke={1.6}
                        className="text-muted-foreground"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonAnchor
                href={contactHref({ kind: "workshop" })}
                target="_blank"
                size="lg"
                className="mt-2 w-full"
                onClick={() => setOpen(false)}
              >
                {offer.cta}
              </ButtonAnchor>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
