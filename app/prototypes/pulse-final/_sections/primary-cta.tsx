import { IconArrowRight } from "@tabler/icons-react"

import { offer, whatsapp } from "../../_data"
import { Magnetic } from "../../_fx"
import { external } from "../_theme"

/** The one primary action everywhere: join a free workshop on WhatsApp. */
export function PrimaryCta() {
  return (
    <Magnetic>
      <a
        data-press
        data-amber
        href={whatsapp}
        {...external}
        className="group inline-flex h-12 items-center gap-2 rounded-full bg-[var(--pu-amber)] px-6 font-semibold text-[var(--pu-ink)]"
      >
        {offer.cta}
        <IconArrowRight
          aria-hidden
          size={18}
          stroke={2}
          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        />
      </a>
    </Magnetic>
  )
}

/** The secondary action beside it; `tone` is the field it sits on. */
export function WhatsFree({ tone }: { tone: "blue" | "paper" }) {
  return (
    <a
      data-press
      href="#free"
      className={`inline-flex h-12 items-center rounded-full px-6 font-semibold ${
        tone === "paper"
          ? "shadow-[inset_0_0_0_1.5px_rgba(11,22,51,0.35)] hover:bg-black/5"
          : "shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45)] hover:bg-white/10"
      }`}
    >
      What&apos;s free
    </a>
  )
}
