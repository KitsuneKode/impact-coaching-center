"use client"

import { useTranslations } from "next-intl"
import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconCircleCheckFilled,
  IconInfoCircle,
  IconLoader2,
} from "@tabler/icons-react"
import { AnimatePresence, useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import { useActionState, useEffect, useId, useRef, useState } from "react"

import { submitLead, type LeadState } from "@/app/actions/lead"
import { Turnstile } from "@/components/marketing/turnstile"
import { ButtonAnchor } from "@/components/ui/button"
import { contact, formatPhone, timings } from "@/lib/brand"
import { track } from "@/lib/analytics"
import { visitAttribution } from "@/lib/attribution"
import { publicEnv } from "@/lib/public-env"
import { contactHref } from "@/lib/contact"
import {
  enquiryTracks,
  HONEYPOT_FIELD,
  nationalMobileDraft,
  type LeadField,
} from "@/lib/leads"
import { cn } from "@/lib/utils"

/** Document order, so focus lands on the first thing the visitor sees. */
const FIELD_ORDER: readonly LeadField[] = ["name", "phone", "track", "timing"]

const field =
  "h-12 w-full rounded-control border border-input bg-card px-3.5 text-[0.9375rem] text-foreground shadow-frame transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring aria-[invalid=true]:border-destructive"

/** Tappable chips backed by real radio inputs, so the form works without JS. */
function ChoiceGroup({
  name,
  legend,
  options,
  defaultValue,
  error,
}: {
  name: string
  legend: string
  options: readonly string[]
  defaultValue?: string
  error?: string
}) {
  const t = useTranslations("Lead")
  const id = useId()
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mbs-2.5 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="relative">
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={defaultValue === option}
              className="peer sr-only"
            />
            <span
              data-choice
              className="inline-flex h-10 cursor-pointer items-center rounded-full border border-input bg-card px-4 text-sm select-none peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
            >
              {/* The value sent stays English so the staff inbox does not change. */}
              {t.has(`options.${option}`) ? t(`options.${option}`) : option}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mbs-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}

/** `bare` drops the form's own panel, for a card that already provides one. */
export function LeadForm({
  bare = false,
  defaultTrack,
}: {
  bare?: boolean
  /** Pre-selects the exam, e.g. on a course page, so asking is one tap shorter. */
  defaultTrack?: string
}) {
  const t = useTranslations("Lead")
  const [state, action, pending] = useActionState<LeadState, FormData>(
    submitLead,
    {
      status: "idle",
    }
  )
  const reduce = useReducedMotion()
  const nameId = useId()
  const phoneId = useId()
  const summaryId = useId()
  const formRef = useRef<HTMLFormElement>(null)

  // A Person may enquire about a second course; the server records that as a
  // real enquiry rather than a duplicate. Without this the form is replaced by
  // the success panel and there is no way back to it.
  const [again, setAgain] = useState(false)
  const [shown, setShown] = useState(state)
  const [turnstileEpoch, setTurnstileEpoch] = useState(0)
  if (shown !== state) {
    setShown(state)
    setAgain(false)
    /* A submission consumes the widget token; a rejected form must mint a
       fresh one or the retry fails verification with the spent token. */
    if (state.status === "error") setTurnstileEpoch((epoch) => epoch + 1)
  }

  const errors = state.status === "error" ? state.errors : {}
  const values = state.status === "error" ? state.values : {}
  const invalid = FIELD_ORDER.filter((f) => errors[f])

  // Submitting moves focus to the button, so a rejected form announces nothing
  // and a screen-reader user is left with no idea what failed. Send focus to
  // the first field at fault; the summary above it carries the whole list.
  const focusField = (name: LeadField) =>
    formRef.current
      ?.querySelector<HTMLElement>(`[name="${name}"]`)
      ?.focus({ preventScroll: false })

  useEffect(() => {
    if (state.status === "ok")
      track({ name: "enquiry_submitted", track: state.track })
    if (state.status !== "error") return
    const first = FIELD_ORDER.find((f) => state.errors[f])
    if (first) focusField(first)
  }, [state])

  const swap = {
    initial: reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(6px)" },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  }

  return (
    <div
      className={
        bare
          ? undefined
          : "rounded-card border border-border bg-surface p-6 md:p-8"
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {state.status !== "idle" && state.status !== "error" && !again ? (
          <m.div key="done" {...swap} role="status" aria-live="polite">
            {state.status === "ok" ? (
              <IconCircleCheckFilled
                size={28}
                className="text-verified"
                aria-hidden
              />
            ) : (
              <IconInfoCircle
                size={28}
                className="text-muted-foreground"
                aria-hidden
              />
            )}
            <p className="type-lede mbs-4">
              {t("thanks", { name: state.name.split(" ")[0] ?? "" })}
              <span className="text-muted-foreground">
                {" "}
                {state.status === "ok"
                  ? t("ok")
                  : state.status === "throttled"
                    ? t("throttled")
                    : t("unconfirmed")}{" "}
                <span className="tnum">{formatPhone(state.phone)}</span>{" "}
                {t("about", {
                  track:
                    state.track === "Not sure yet"
                      ? t("rightCourse")
                      : t.has(`options.${state.track}`)
                        ? t(`options.${state.track}`)
                        : state.track,
                })}
              </span>
            </p>
            <p className="mbs-6 text-sm text-muted-foreground">
              {state.status === "handoff" ? t("handoff") : t("direct")}
            </p>
            <div className="mbs-3 flex flex-wrap gap-3">
              <ButtonAnchor
                href={contactHref({
                  kind: "whatsapp-handoff",
                  name: state.name,
                  track: state.track,
                  timing: state.timing,
                  phone: state.phone,
                })}
                target="_blank"
                size="lg"
              >
                <IconBrandWhatsapp stroke={1.6} />
                {t("whatsapp")}
              </ButtonAnchor>
              <ButtonAnchor
                href={contactHref({ kind: "call" })}
                variant="secondary"
                size="lg"
              >
                {t("call")}{" "}
                <span className="tnum">{formatPhone(contact.phones[0])}</span>
              </ButtonAnchor>
            </div>
            <button
              type="button"
              onClick={() => setAgain(true)}
              className="mbs-4 inline-flex min-h-11 items-center rounded-control text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t("again")}
            </button>
          </m.div>
        ) : (
          <m.div key="form" {...swap}>
            <form
              ref={formRef}
              action={(data) => {
                // Where this enquiry came from, read at submit time.
                const visit = visitAttribution()
                data.set("page", window.location.pathname)
                data.set("utmSource", visit.utmSource)
                if (visit.utmMedium) data.set("utmMedium", visit.utmMedium)
                if (visit.utmCampaign)
                  data.set("utmCampaign", visit.utmCampaign)
                return action(data)
              }}
              noValidate
              className="relative"
            >
              {invalid.length > 0 ||
              (state.status === "error" && state.formError) ? (
                <div
                  id={summaryId}
                  role="alert"
                  className="mbe-6 rounded-control border border-destructive/40 bg-destructive/5 p-4"
                >
                  <p className="text-sm font-medium text-destructive">
                    {state.status === "error" && state.formError
                      ? t("errors.verification")
                      : invalid.length === 1
                        ? t("oneField")
                        : t("manyFields", { count: invalid.length })}
                  </p>
                  <ul className="mbs-2 flex flex-wrap gap-x-4 gap-y-1">
                    {invalid.map((name) => (
                      <li key={name}>
                        <button
                          type="button"
                          onClick={() => focusField(name)}
                          className="min-h-11 text-sm text-destructive underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          {t(`fields.${name}`)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor={nameId} className="text-sm font-medium">
                    {t("fields.name")}
                  </label>
                  <input
                    id={nameId}
                    name="name"
                    required
                    autoComplete="name"
                    defaultValue={values.name}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? `${nameId}-error` : undefined
                    }
                    className={field}
                  />
                  {errors.name ? (
                    <p
                      id={`${nameId}-error`}
                      className="text-sm text-destructive"
                    >
                      {t("errors.name")}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <label htmlFor={phoneId} className="text-sm font-medium">
                    {t("fields.phone")}
                  </label>
                  <input
                    id={phoneId}
                    name="phone"
                    required
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="98765 43210"
                    defaultValue={nationalMobileDraft(values.phone ?? "")}
                    onInput={(event) => {
                      const next = nationalMobileDraft(
                        event.currentTarget.value
                      )
                      if (next !== event.currentTarget.value)
                        event.currentTarget.value = next
                    }}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={
                      errors.phone ? `${phoneId}-error` : undefined
                    }
                    className={cn(field, "tnum")}
                  />
                  {errors.phone ? (
                    <p
                      id={`${phoneId}-error`}
                      className="text-sm text-destructive"
                    >
                      {t("errors.phone")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mbs-6">
                <ChoiceGroup
                  name="track"
                  legend={t("fields.track")}
                  options={enquiryTracks}
                  defaultValue={values.track ?? defaultTrack}
                  error={errors.track ? t("errors.track") : undefined}
                />
              </div>
              <div className="mbs-6">
                <ChoiceGroup
                  name="timing"
                  legend={t("fields.timing")}
                  options={timings}
                  defaultValue={values.timing}
                  error={errors.timing ? t("errors.timing") : undefined}
                />
              </div>

              {/* honeypot, hidden from people and assistive tech */}
              <div
                aria-hidden
                className="absolute -inset-s-[9999px] h-0 w-0 overflow-clip"
              >
                <label>
                  {t("honeypot")}
                  <input
                    name={HONEYPOT_FIELD}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>

              {publicEnv.turnstileSiteKey ? (
                <div className="mbs-6">
                  <Turnstile
                    siteKey={publicEnv.turnstileSiteKey}
                    resetKey={turnstileEpoch}
                  />
                </div>
              ) : null}

              <div className="mbs-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">{t("privacy")}</p>
                <button
                  type="submit"
                  data-press
                  data-cta="amber"
                  disabled={pending}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink disabled:opacity-70 sm:min-w-56"
                >
                  {pending ? (
                    <>
                      <IconLoader2 className="animate-spin" stroke={1.75} />
                      {t("sending")}
                    </>
                  ) : (
                    <>
                      {t("submit")}
                      <IconArrowRight data-nudge size={18} stroke={2} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
