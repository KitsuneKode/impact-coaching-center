"use client"

import { IconTrash } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { BookCover } from "@/components/commerce/book-cover"
import { QuantityStepper } from "@/components/commerce/quantity-stepper"
import { Link } from "@/i18n/navigation"
import { type CartLine, useCartActions } from "@/lib/cart-store"
import { inLanguage, type Language, type PublicBundle } from "@/lib/catalog"
import { formatPaise } from "@/lib/money"
import { cn } from "@/lib/utils"

/** Why a line cannot be bought, or "ok". */
export type LineStatus = "ok" | "gone" | "sample" | "off"

export type CartRow = {
  line: CartLine
  bundle: PublicBundle | null
  status: LineStatus
  /** Price of one copy now; 0 for a line that cannot be bought. */
  unitPaise: number
  /** The struck price of one copy, when the set has one. */
  comparePaise?: number
}

/**
 * Each cart line beside the published set it names. Lines that cannot be
 * bought stay, with the reason, so the badge never counts something the
 * shopper can neither see nor clear. The server prices the real order.
 */
export function cartRows(
  lines: readonly CartLine[],
  bundles: readonly PublicBundle[] | undefined
): CartRow[] {
  return lines.map((line) => {
    const bundle = bundles?.find((b) => b.slug === line.slug) ?? null
    const variant = bundle?.variants[line.language]
    const status: LineStatus = !bundle
      ? "gone"
      : bundle.sample
        ? "sample"
        : variant?.available
          ? "ok"
          : "off"
    return {
      line,
      bundle,
      status,
      unitPaise: status === "ok" ? variant!.pricePaise : 0,
      comparePaise:
        status === "ok" && variant!.comparePaise
          ? variant!.comparePaise
          : undefined,
    }
  })
}

/** Totals over the lines that can be bought. */
export function cartTotals(rows: readonly CartRow[]) {
  const live = rows.filter((row) => row.status === "ok")
  return {
    sets: live.reduce((n, row) => n + row.line.quantity, 0),
    itemsPaise: live.reduce(
      (n, row) => n + row.unitPaise * row.line.quantity,
      0
    ),
    savedPaise: live.reduce(
      (n, row) =>
        n +
        Math.max(0, (row.comparePaise ?? row.unitPaise) - row.unitPaise) *
          row.line.quantity,
      0
    ),
    blocked: rows.length - live.length,
  }
}

/**
 * The cart's lines, each with its cover, set and language, price, a stepper
 * and a plain Remove. The same list in the cart sheet and on checkout; it
 * reads its own width (a container query) for the cover size.
 */
export function CartLines({
  rows,
  onNavigate,
  className,
}: {
  rows: readonly CartRow[]
  /** Called when a title link is followed, e.g. to close the sheet. */
  onNavigate?: () => void
  className?: string
}) {
  const t = useTranslations("Shop")
  const { setQuantity, remove } = useCartActions()
  const setName = (language: Language) =>
    language === "as" ? t("assameseSet") : t("englishSet")

  return (
    <ul className={cn("@container divide-y divide-border", className)}>
      {rows.map(({ line, bundle, status, unitPaise, comparePaise }) => {
        const key = `${line.slug}:${line.language}`
        const title = bundle
          ? inLanguage(bundle.title, line.language)
          : line.slug
        const label = t("setOf", {
          set: title,
          language: setName(line.language),
        })
        const first = bundle?.books[0]?.editions[line.language]
        const live = status === "ok"
        return (
          <li
            key={key}
            className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-4 py-5 @lg:grid-cols-[4.5rem_minmax(0,1fr)]"
          >
            <span className={cn(!live && "opacity-50 grayscale")}>
              <BookCover title={title} cover={first?.cover} size="sm" />
            </span>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3">
              <div className="min-w-0 break-words">
                {bundle ? (
                  <Link
                    href={`/books/${bundle.slug}`}
                    onClick={onNavigate}
                    className="font-medium text-pretty hover:underline"
                  >
                    {title}
                  </Link>
                ) : (
                  <span className="font-medium">{t("unavailable")}</span>
                )}
                <p className="tnum mbs-0.5 text-sm text-muted-foreground">
                  {setName(line.language)}
                  {live ? (
                    <>
                      {" · "}
                      <span className="whitespace-nowrap">
                        {t("each", { price: formatPaise(unitPaise) })}
                      </span>
                      {comparePaise ? (
                        <s className="ms-1.5">{formatPaise(comparePaise)}</s>
                      ) : null}
                    </>
                  ) : null}
                </p>
                {live ? null : (
                  <p className="mbs-1 text-sm text-destructive">
                    {t(
                      status === "sample"
                        ? "lineSample"
                        : status === "off"
                          ? "lineOff"
                          : "lineGone"
                    )}
                  </p>
                )}
              </div>
              <span className="tnum font-semibold">
                {live ? formatPaise(unitPaise * line.quantity) : null}
              </span>
              <div className="col-span-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                {live ? (
                  <QuantityStepper
                    value={line.quantity}
                    label={label}
                    onChange={(next) => setQuantity(line, next)}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(line)}
                  aria-label={t("removeLine", { label })}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <IconTrash aria-hidden size={16} stroke={1.75} />
                  {t("remove")}
                </button>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
