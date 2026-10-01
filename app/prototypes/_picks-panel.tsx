"use client"

import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconCopy,
  IconHeart,
  IconHeartFilled,
  IconX,
} from "@tabler/icons-react"
import Link from "next/link"
import { useState } from "react"

import { MAX_PICKS, usePicks } from "./_picks"

type Item = { slug: string; name: string }

/** A heart on a card that likes or unlikes that design. */
export function PickButton({ slug, name }: Item) {
  const picks = usePicks()
  const liked = picks.has(slug)
  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? `Remove ${name} from your picks` : `Pick ${name}`}
      disabled={!liked && picks.full}
      onClick={() => picks.toggle(slug)}
      className="absolute top-3 right-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-[background-color,transform] duration-150 hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-white active:scale-90 disabled:opacity-40"
    >
      {liked ? (
        <IconHeartFilled aria-hidden size={20} className="text-[#FF6B7A]" />
      ) : (
        <IconHeart aria-hidden size={20} />
      )}
    </button>
  )
}

/** The visitor's picks in order, with a note each and a message to send. */
export function PicksPanel({ items }: { items: Item[] }) {
  const picks = usePicks()
  const [copied, setCopied] = useState(false)
  const chosen = picks.slugs
    .map((slug) => items.find((i) => i.slug === slug))
    .filter((i): i is Item => Boolean(i))

  if (chosen.length === 0) {
    return (
      <p className="mt-10 flex items-center gap-2 text-[#A5A9B4]">
        <IconHeart aria-hidden size={18} />
        Tap the heart on a design to pick it. Choose up to {MAX_PICKS}.
      </p>
    )
  }

  const message = () =>
    [
      "My picks for the ICT website:",
      ...chosen.map((c, i) => {
        const note = picks.notes[c.slug]?.trim()
        return `${i + 1}. ${c.name}${note ? `: ${note}` : ""} (${window.location.origin}/prototypes/${c.slug})`
      }),
    ].join("\n")

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt("Copy your picks", message())
    }
  }

  return (
    <section
      aria-labelledby="picks-title"
      className="mt-10 rounded-2xl border border-white/15 bg-white/[0.04] p-5 md:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="picks-title" className="text-xl font-semibold">
          Your picks
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={picks.clear}
            className="h-11 rounded-full px-4 text-sm text-[#A5A9B4] transition-colors hover:text-white"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ECEDF1] px-5 text-sm font-semibold text-[#0F1115] transition-transform active:scale-95"
          >
            {copied ? (
              <IconCheck aria-hidden size={18} />
            ) : (
              <IconCopy aria-hidden size={18} />
            )}
            {copied ? "Copied" : "Copy my picks"}
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-[#A5A9B4]">
        Best first. Add a line on why, then paste the copy into WhatsApp or
        email.
      </p>
      <ol className="mt-5 grid gap-3">
        {chosen.map((c, i) => (
          <li
            key={c.slug}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 rounded-xl bg-white/[0.05] p-3 sm:grid-cols-[auto_10rem_1fr_auto]"
          >
            <span className="grid size-9 place-items-center rounded-full bg-white/10 text-sm font-semibold tabular-nums">
              {i + 1}
            </span>
            <Link
              href={`/prototypes/${c.slug}`}
              className="font-semibold underline-offset-4 hover:underline"
            >
              {c.name}
            </Link>
            <div className="flex items-center gap-1 sm:order-last">
              <button
                type="button"
                aria-label={`Move ${c.name} up`}
                disabled={i === 0}
                onClick={() => picks.move(c.slug, -1)}
                className="grid size-11 place-items-center rounded-full hover:bg-white/10 disabled:opacity-30"
              >
                <IconArrowUp aria-hidden size={18} />
              </button>
              <button
                type="button"
                aria-label={`Move ${c.name} down`}
                disabled={i === chosen.length - 1}
                onClick={() => picks.move(c.slug, 1)}
                className="grid size-11 place-items-center rounded-full hover:bg-white/10 disabled:opacity-30"
              >
                <IconArrowDown aria-hidden size={18} />
              </button>
              <button
                type="button"
                aria-label={`Remove ${c.name}`}
                onClick={() => picks.toggle(c.slug)}
                className="grid size-11 place-items-center rounded-full hover:bg-white/10"
              >
                <IconX aria-hidden size={18} />
              </button>
            </div>
            <input
              type="text"
              aria-label={`Why ${c.name}?`}
              placeholder="What you like about it"
              maxLength={280}
              value={picks.notes[c.slug] ?? ""}
              onChange={(e) => picks.setNote(c.slug, e.target.value)}
              className="col-span-3 h-11 rounded-lg border border-white/15 bg-transparent px-3 text-base placeholder:text-[#7C8190] sm:col-span-1"
            />
          </li>
        ))}
      </ol>
    </section>
  )
}
