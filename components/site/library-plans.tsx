"use client"

import { IconArrowRight, IconBrandWhatsapp } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { contactHref } from "@/lib/contact"
import { inr } from "@/lib/courses"
import {
  LIBRARY_SHIFTS,
  libraryTerms,
  type LibraryShift,
  type LibraryTerm,
  termPrice,
} from "@/lib/library"
import { cn } from "@/lib/utils"

const TERM_KEY = { 1: "libTerm1", 3: "libTerm3", 6: "libTerm6" } as const
/* The WhatsApp message is English whatever the page language. */
const TERM_EN = { 1: "monthly", 3: "3 months", 6: "6 months" } as const
const SHIFT_EN = { half: "Half day", full: "Full day" } as const

/**
 * The library's plans, the way ICT's poster sets them out: pick how long,
 * then the two seats - one shift or the whole day - side by side at that
 * length, each with its rate a month, the one payment, and what it saves
 * on paying monthly. Every plan is also in the table under it, so nothing
 * is hidden behind the switch.
 */
export function LibraryPlans() {
  const t = useTranslations("Pulse")
  const [months, setMonths] = useState<LibraryTerm["months"]>(6)
  const term = libraryTerms.find((x) => x.months === months)!

  return (
    <div className="mbs-10 grid gap-6 max-sm:pbs-2">
      <fieldset
        data-library-terms
        className="grid w-full grid-cols-3 gap-1 justify-self-start rounded-full bg-secondary p-1 sm:w-auto sm:grid-cols-[repeat(3,auto)]"
      >
        <legend className="sr-only">{t("libTermLabel")}</legend>
        {libraryTerms.map((option) => (
          <label
            key={option.months}
            className={cn(
              "relative flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full ps-3 pe-3 text-sm font-semibold whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring sm:ps-4 sm:pe-4",
              months === option.months
                ? "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_var(--border)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <input
              type="radio"
              name="library-term"
              value={option.months}
              checked={months === option.months}
              onChange={() => setMonths(option.months)}
              className="sr-only"
            />
            {t(TERM_KEY[option.months])}
            {option.bestValue ? (
              <span className="rounded-full bg-highlight px-2 py-0.5 text-[0.6875rem] font-bold text-ink max-sm:absolute max-sm:inset-e-0 max-sm:-inset-bs-2.5 max-sm:shadow-[0_0_0_2px_var(--secondary)]">
                {t("libBestValue")}
              </span>
            ) : null}
          </label>
        ))}
      </fieldset>

      <ul className="grid gap-4 md:grid-cols-2">
        {LIBRARY_SHIFTS.map((shift) => (
          <li key={shift}>
            <PlanCard term={term} shift={shift} />
          </li>
        ))}
      </ul>

      <p className="text-sm text-pretty text-muted-foreground">
        <span className="font-semibold text-foreground">{t("libLimited")}</span>{" "}
        {t("libPaidAtCentre")}
      </p>

      <PlanTable />
    </div>
  )
}

function PlanCard({ term, shift }: { term: LibraryTerm; shift: LibraryShift }) {
  const t = useTranslations("Pulse")
  const { total, saves } = termPrice(term, shift)
  const full = shift === "full"
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[28px] p-7",
        full
          ? "bg-primary text-primary-foreground"
          : "bg-card shadow-[0_0_0_1px_var(--border)]"
      )}
    >
      <span className="font-display text-xl font-semibold">
        {t(full ? "libFull" : "libHalf")}
      </span>
      <span
        className={cn(
          "text-sm",
          full ? "text-on-primary" : "text-muted-foreground"
        )}
      >
        {t(full ? "libFullBody" : "libHalfBody")}
      </span>
      {/* Keyed by the term, so the figures swap as one when it changes. */}
      <span key={term.months} data-swap className="mbs-6 grid gap-1">
        <span className="tnum flex items-baseline gap-1.5">
          <span className="font-display text-5xl font-semibold tracking-[-0.03em]">
            {inr(term.perMonth[shift])}
          </span>
          <span className={full ? "text-on-primary" : "text-muted-foreground"}>
            {t("libPerMonth")}
          </span>
        </span>
        <span className="tnum text-sm font-medium">
          {term.months === 1
            ? t("libPayMonthly")
            : t("libOnce", { total: inr(total) })}
        </span>
        <span
          className={cn(
            "tnum text-sm",
            saves
              ? full
                ? "font-semibold text-highlight"
                : "font-semibold text-verified"
              : "invisible"
          )}
          aria-hidden={saves ? undefined : true}
        >
          {t("libSaves", { amount: inr(saves) })}
        </span>
      </span>
      <a
        href={contactHref({
          kind: "library",
          plan: `${SHIFT_EN[shift]}, ${TERM_EN[term.months]}`,
        })}
        target="_blank"
        rel="noreferrer noopener"
        data-press
        data-cta={full ? "amber" : undefined}
        className={cn(
          "mbs-8 inline-flex h-12 items-center justify-center gap-2 self-start rounded-full px-6 font-semibold",
          full ? "bg-highlight text-ink" : "bg-primary text-primary-foreground"
        )}
      >
        <IconBrandWhatsapp aria-hidden size={18} stroke={1.75} />
        {t("libAskPlan")}
        <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
      </a>
    </div>
  )
}

/** Every plan at once, for comparing without the switch. */
function PlanTable() {
  const t = useTranslations("Pulse")
  return (
    <div className="overflow-x-auto rounded-[22px] shadow-[0_0_0_1px_var(--border)]">
      <table className="tnum w-full min-w-[30rem] text-sm">
        <caption className="sr-only">{t("libTableCaption")}</caption>
        <thead className="bg-secondary/60 text-start text-muted-foreground">
          <tr>
            <th
              scope="col"
              className="ps-5 pe-3 pbs-3 pbe-3 text-start font-medium"
            >
              {t("libTableTerm")}
            </th>
            {LIBRARY_SHIFTS.map((shift) => (
              <th
                key={shift}
                scope="col"
                className="ps-3 pe-5 pbs-3 pbe-3 text-end font-medium"
              >
                {t(shift === "full" ? "libFull" : "libHalf")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {libraryTerms.map((term) => (
            <tr key={term.months}>
              <th
                scope="row"
                className="ps-5 pe-3 pbs-3 pbe-3 text-start font-semibold"
              >
                {t(TERM_KEY[term.months])}
              </th>
              {LIBRARY_SHIFTS.map((shift) => (
                <td key={shift} className="ps-3 pe-5 pbs-3 pbe-3 text-end">
                  <span className="font-semibold">
                    {inr(term.perMonth[shift])}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    {t("libPerMonth")}
                  </span>
                  {term.months > 1 ? (
                    <span className="block text-xs text-muted-foreground">
                      {t("libOnce", {
                        total: inr(termPrice(term, shift).total),
                      })}
                    </span>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
