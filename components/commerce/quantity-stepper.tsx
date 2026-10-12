"use client"

import { useTranslations } from "next-intl"

import { IconMinus, IconPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { MAX_QUANTITY } from "@/lib/cart-store"

/** Minus, count, plus. Going below one removes the line; the caller decides. */
export function QuantityStepper({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (next: number) => void
  label: string
}) {
  const t = useTranslations("Shop")
  return (
    <fieldset className="inline-flex items-center rounded-control border border-border">
      <legend className="sr-only">{t("quantity", { label })}</legend>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={value === 1 ? t("removeItem", { label }) : t("fewer")}
        onClick={() => onChange(value - 1)}
      >
        <IconMinus stroke={1.75} aria-hidden />
      </Button>
      <output
        aria-live="polite"
        className="tnum w-8 text-center text-sm font-medium"
      >
        {value}
      </output>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("more")}
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(value + 1)}
      >
        <IconPlus stroke={1.75} aria-hidden />
      </Button>
    </fieldset>
  )
}
