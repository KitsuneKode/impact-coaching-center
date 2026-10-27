"use client"

import { IconBrandWhatsapp, IconCheck, IconLink } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

/**
 * Passing a post on, the way ICT's students do: WhatsApp first, then the
 * plain link for anywhere else. The copy says so in a polite status line.
 */
export function PostShare({ title, url }: { title: string; url: string }) {
  const t = useTranslations("BlogPage")
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2400)
    } catch {
      // No clipboard (an old browser, a denied permission): the WhatsApp
      // link and the address bar still work.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noreferrer noopener"
        data-press
        data-cta="ghost-paper"
        className="inline-flex h-11 w-fit items-center gap-2 rounded-full px-5 text-[0.9375rem] font-semibold"
      >
        <IconBrandWhatsapp aria-hidden size={18} stroke={1.75} />
        {t("shareWhatsapp")}
      </a>
      <button
        type="button"
        onClick={copy}
        data-press
        className="inline-flex min-h-11 items-center gap-2 rounded-full ps-4 pe-5 text-sm font-semibold shadow-[inset_0_0_0_1px_var(--border)] transition-colors duration-150 hover:bg-secondary"
      >
        {copied ? (
          <IconCheck aria-hidden size={18} stroke={2} />
        ) : (
          <IconLink aria-hidden size={18} stroke={1.75} />
        )}
        {t("copyLink")}
      </button>
      <output className="text-sm text-muted-foreground">
        {copied ? t("copied") : ""}
      </output>
    </div>
  )
}
