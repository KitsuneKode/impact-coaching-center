"use client"

import { useTranslations } from "next-intl"

import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { MAX_QUANTITY } from "@/lib/cart-store"
import { cn } from "@/lib/utils"

/**
 * Minus, count, plus. The count is also a field, because there is no order
 * cap: twelve copies for a class is a typed "12", not eleven taps. At one,
 * minus becomes a bin and removes the line; the caller decides what that
 * means. A typed value lands on Enter or when the field loses focus.
 */
export function QuantityStepper({
  value,
  onChange,
  label,
  className,
}: {
  value: number
  onChange: (next: number) => void
  label: string
  className?: string
}) {
  const t = useTranslations("Shop")
  /* What is being typed, or null while the field shows the cart's count. */
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft === null) return
    setDraft(null)
    const next = Number.parseInt(draft, 10)
    // An empty or unchanged field is not a request to change the cart.
    if (Number.isNaN(next) || next === value) return
    onChange(Math.max(0, next))
  }

  return (
    <fieldset
      className={cn(
        "inline-flex items-center rounded-full bg-secondary p-0.5",
        className
      )}
    >
      <legend className="sr-only">{t("quantity", { label })}</legend>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full"
        aria-label={value === 1 ? t("removeItem", { label }) : t("fewer")}
        onClick={() => onChange(value - 1)}
      >
        {value === 1 ? (
          <IconTrash stroke={1.75} aria-hidden />
        ) : (
          <IconMinus stroke={1.75} aria-hidden />
        )}
      </Button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        aria-label={t("quantity", { label })}
        value={draft ?? String(value)}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) =>
          setDraft(
            e.target.value
              .replace(/\D/g, "")
              .slice(0, String(MAX_QUANTITY).length)
          )
        }
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur()
          if (e.key === "Escape") {
            setDraft(null)
            e.currentTarget.blur()
          }
        }}
        className="tnum h-8 w-9 rounded-md bg-transparent text-center text-sm font-semibold outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full"
        aria-label={t("more")}
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(value + 1)}
      >
        <IconPlus stroke={1.75} aria-hidden />
      </Button>
    </fieldset>
  )
}
