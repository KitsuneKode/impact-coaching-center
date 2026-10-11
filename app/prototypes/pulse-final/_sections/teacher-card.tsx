"use client"

import { IconPlayerPlayFilled, IconRotate } from "@tabler/icons-react"
import Image from "next/image"
import { useRef, useState } from "react"

import { VideoDialog } from "@/components/marketing/video-dialog"
import type { faculty } from "../../_data"

type Teacher = (typeof faculty)[number]

/**
 * One teacher card. It turns over on click or tap — every device, keyboard
 * included — never on hover. The hidden face is `inert` so focus cannot fall
 * into it, and focus follows the flip so keyboard users never lose their place.
 */
export function TeacherCard({ f }: { f: Teacher }) {
  const [flipped, setFlipped] = useState(false)
  const frontRef = useRef<HTMLButtonElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)

  const flip = (to: boolean) => {
    setFlipped(to)
    requestAnimationFrame(() => (to ? backRef : frontRef).current?.focus())
  }

  return (
    <li data-flip data-flipped={flipped || undefined}>
      <div data-flip-inner>
        <div
          data-flip-face
          inert={flipped}
          className="overflow-hidden rounded-[24px] bg-[var(--pu-blue)]"
        >
          <button
            ref={frontRef}
            type="button"
            data-pf-cardbtn
            aria-expanded={flipped}
            aria-label={`Turn over: ${f.name}`}
            onClick={() => flip(true)}
            className="block w-full text-left"
          >
            <span data-pf-frame className="relative block aspect-[4/5]">
              <Image
                src={f.portrait}
                alt={`${f.name}, ${f.teaches}`}
                fill
                sizes="(min-width: 768px) 230px, 50vw"
                className="object-cover object-top"
              />
            </span>
            <span className="flex items-center justify-between gap-2 bg-[var(--pu-card)] p-4">
              <span className="min-w-0">
                <span className="block font-semibold">{f.name}</span>
                <span className="block truncate text-sm text-[var(--pu-muted)]">
                  {f.teaches}
                </span>
              </span>
              <IconRotate
                aria-hidden
                size={18}
                stroke={1.5}
                className="shrink-0 text-[var(--pu-muted)]"
              />
            </span>
          </button>
        </div>
        <div
          data-flip-face
          data-flip-back
          inert={!flipped}
          className="flex flex-col rounded-[24px] bg-[var(--pu-ink)] p-5 text-white"
        >
          <span className="text-sm text-[#AEB9D3]">{f.called}</span>
          <span className="mt-1 font-[family-name:var(--pu-display)] text-lg leading-tight font-semibold">
            {f.name}
          </span>
          <span className="mt-3 text-sm text-[#D5DCEB]">{f.note}</span>
          <span className="mt-auto flex flex-col gap-2 pt-3">
            <VideoDialog
              id={f.lecture}
              title={f.name}
              subtitle={f.teaches}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--pu-amber)] text-sm font-semibold text-[var(--pu-ink)]"
            >
              <IconPlayerPlayFilled aria-hidden size={14} />
              Watch a class
            </VideoDialog>
            <button
              ref={backRef}
              type="button"
              onClick={() => flip(false)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]"
            >
              <IconRotate
                aria-hidden
                size={15}
                stroke={1.5}
                className="-scale-x-100"
              />
              Turn back
            </button>
          </span>
        </div>
      </div>
    </li>
  )
}
