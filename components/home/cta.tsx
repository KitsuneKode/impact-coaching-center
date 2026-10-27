import { IconArrowRight } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { contactHref } from "@/lib/contact"
import { cn } from "@/lib/utils"
import { Magnetic } from "./magnetic"

/** The one primary action everywhere: join a free workshop on WhatsApp. */
export function PrimaryCta({ className }: { className?: string }) {
  const t = useTranslations("Offer")
  return (
    <Magnetic className={className}>
      <a
        data-press
        data-cta="amber"
        href={contactHref({ kind: "workshop" })}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
      >
        {t("cta")}
        <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
      </a>
    </Magnetic>
  )
}

/** The quieter action beside it; `tone` is the field it sits on. */
export function WhatsFree({
  tone,
  className,
}: {
  tone: "blue" | "paper"
  className?: string
}) {
  const t = useTranslations("Pulse")
  return (
    <a
      data-press
      data-cta={tone === "blue" ? "ghost-blue" : "ghost-paper"}
      href="#free"
      className={cn(
        "inline-flex h-12 items-center rounded-full px-6 font-semibold",
        className
      )}
    >
      {t("whatsFree")}
    </a>
  )
}
