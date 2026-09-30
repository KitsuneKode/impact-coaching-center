"use client"

import { IconPlayerPlayFilled, IconX } from "@tabler/icons-react"
import { m, useReducedMotion } from "motion/react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

type Lecture = {
  id: string
  title: string
  by: string
  views: string
  image: string
}

/**
 * Lectures in a grid. Pressing one grows its frame into a centred player
 * (shared layout), and the YouTube embed loads once the frame has landed.
 */
export function LectureGrid({ items }: { items: Lecture[] }) {
  const [open, setOpen] = useState<Lecture | null>(null)
  const [landed, setLanded] = useState(false)
  const close = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement | null>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const currentDialog = dialog.current
    const currentOpener = opener.current
    currentDialog?.showModal()
    close.current?.focus()
    return () => {
      currentDialog?.close()
      currentOpener?.focus()
    }
  }, [open])

  return (
    <>
      <ul className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
        {items.map((l, i) => (
          <li
            key={l.id}
            className={i === 0 ? "md:col-span-2 md:row-span-2" : undefined}
          >
            <button
              type="button"
              onClick={(e) => {
                opener.current = e.currentTarget
                setLanded(false)
                setOpen(l)
              }}
              className="group block w-full text-left"
            >
              <m.span
                layoutId={`st-lec-${l.id}`}
                transition={{ type: "spring", duration: 0.55, bounce: 0.12 }}
                className="relative block aspect-video overflow-hidden rounded-[18px] bg-[var(--st-raised)]"
              >
                <Image
                  src={l.image}
                  alt=""
                  fill
                  sizes={
                    i === 0
                      ? "(min-width: 768px) 620px, 100vw"
                      : "(min-width: 768px) 300px, 100vw"
                  }
                  className="object-cover transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.03] group-hover:brightness-110"
                />
                <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,13,15,0.55),transparent_50%)]" />
                <span
                  className={`absolute bottom-4 left-4 grid place-items-center rounded-full bg-[var(--st-red)] text-[var(--st-bg)] transition-transform duration-300 ease-out group-hover:scale-110 ${
                    i === 0 ? "size-14" : "size-10"
                  }`}
                >
                  <IconPlayerPlayFilled
                    aria-hidden
                    size={i === 0 ? 20 : 15}
                    className="translate-x-px"
                  />
                </span>
              </m.span>
              <span
                className={`mt-3 block font-medium ${i === 0 ? "text-xl" : ""}`}
              >
                {l.title}
              </span>
              <span className="block text-sm text-[var(--st-muted)] tabular-nums">
                {l.by}, {l.views} views
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <m.dialog
          ref={dialog}
          aria-label={open.title}
          onCancel={(event) => {
            event.preventDefault()
            setOpen(null)
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(null)
          }}
          className="fixed inset-0 z-50 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[min(1100px,calc(100vw-2rem))] flex-col overflow-y-auto bg-transparent p-0 text-[var(--st-text)] backdrop:bg-[rgba(8,8,10,0.82)] backdrop:backdrop-blur-md open:flex"
        >
          <m.div
            layoutId={`st-lec-${open.id}`}
            transition={{ type: "spring", duration: 0.55, bounce: 0.12 }}
            onLayoutAnimationComplete={() => setLanded(true)}
            className="relative aspect-video overflow-hidden rounded-[22px] bg-black shadow-[0_40px_120px_-20px_rgba(240,89,47,0.25)]"
          >
            {landed || reduce ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${open.id}?autoplay=1&rel=0`}
                title={open.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            ) : (
              <Image
                src={open.image}
                alt=""
                fill
                sizes="1100px"
                className="object-cover"
              />
            )}
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="mt-4 flex items-start justify-between gap-6"
          >
            <p>
              <span className="block text-lg font-medium">{open.title}</span>
              <span className="text-sm text-[var(--st-muted)]">{open.by}</span>
            </p>
            <button
              ref={close}
              type="button"
              onClick={() => setOpen(null)}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium shadow-[inset_0_0_0_1px_var(--st-line-hi)] transition-colors duration-150 hover:bg-white/5"
            >
              <IconX aria-hidden size={16} stroke={2} />
              Close
            </button>
          </m.div>
        </m.dialog>
      )}
    </>
  )
}
