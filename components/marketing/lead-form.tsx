"use client"

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
import { Button, ButtonAnchor } from "@/components/ui/button"
import { contact, formatPhone, timings } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { enquiryTracks, HONEYPOT_FIELD, type LeadField } from "@/lib/leads"
import { cn } from "@/lib/utils"

/** Document order, so focus lands on the first thing the visitor sees. */
const FIELD_ORDER: readonly LeadField[] = ["name", "phone", "track", "timing"]

/** What the summary calls each field, matching its visible label. */
const FIELD_LABELS: Record<LeadField, string> = {
  name: "Your name",
  phone: "Mobile number",
  track: "Which exam",
  timing: "When can you study",
}

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
  const id = useId()
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="relative">
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={defaultValue === option}
              className="peer sr-only"
            />
            <span className="inline-flex h-10 cursor-pointer items-center rounded-control border border-input bg-card px-3.5 text-sm shadow-frame transition-colors select-none peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring hover:bg-secondary peer-checked:hover:bg-primary">
              {option}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}

export function LeadForm() {
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
  //
  // Adjusted during render rather than in an effect: useActionState hands back
  // a new object per submission, and comparing against the last one we showed
  // resets the panel without a second commit.
  const [again, setAgain] = useState(false)
  const [shown, setShown] = useState(state)
  if (shown !== state) {
    setShown(state)
    setAgain(false)
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
    <div className="rounded-card border border-border bg-surface p-6 md:p-8">
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
            <p className="type-lede mt-4">
              Thank you, {state.name.split(" ")[0]}.
              <span className="text-muted-foreground">
                {" "}
                {state.status === "ok"
                  ? "Your enquiry was received. Your callback number is "
                  : state.status === "throttled"
                    ? "A temporary submission limit was reached. Please try again later or contact ICT directly. Your number is "
                    : "We could not confirm receipt. Send your enquiry on WhatsApp or call ICT. Your number is "}
                <span className="tnum">{formatPhone(state.phone)}</span> about{" "}
                {state.track === "Not sure yet"
                  ? "the right course for you"
                  : state.track}
                .
              </span>
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              {state.status === "handoff"
                ? "Continue below to send your details to ICT."
                : "You can also contact ICT directly."}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
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
                Continue on WhatsApp
              </ButtonAnchor>
              <ButtonAnchor
                href={contactHref({ kind: "call" })}
                variant="secondary"
                size="lg"
              >
                Call{" "}
                <span className="tnum">{formatPhone(contact.phones[0])}</span>
              </ButtonAnchor>
            </div>
            <button
              type="button"
              onClick={() => setAgain(true)}
              className="mt-4 inline-flex min-h-11 items-center rounded-control text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Ask about another exam
            </button>
          </m.div>
        ) : (
          <m.div key="form" {...swap}>
            <form ref={formRef} action={action} noValidate className="relative">
              {invalid.length > 0 ? (
                <div
                  id={summaryId}
                  role="alert"
                  className="mb-6 rounded-control border border-destructive/40 bg-destructive/5 p-4"
                >
                  <p className="text-sm font-medium text-destructive">
                    {invalid.length === 1
                      ? "One field needs attention before we can send this:"
                      : `${invalid.length} fields need attention before we can send this:`}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {invalid.map((name) => (
                      <li key={name}>
                        <button
                          type="button"
                          onClick={() => focusField(name)}
                          className="min-h-11 text-sm text-destructive underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          {FIELD_LABELS[name]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor={nameId} className="text-sm font-medium">
                    Your name
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
                      {errors.name}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <label htmlFor={phoneId} className="text-sm font-medium">
                    Mobile number
                  </label>
                  <input
                    id={phoneId}
                    name="phone"
                    required
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="98xxx xxxxx"
                    defaultValue={values.phone}
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
                      {errors.phone}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-6">
                <ChoiceGroup
                  name="track"
                  legend="Which exam"
                  options={enquiryTracks}
                  defaultValue={values.track}
                  error={errors.track}
                />
              </div>
              <div className="mt-6">
                <ChoiceGroup
                  name="timing"
                  legend="When can you study"
                  options={timings}
                  defaultValue={values.timing}
                  error={errors.timing}
                />
              </div>

              {/* honeypot, hidden from people and assistive tech */}
              <div
                aria-hidden
                className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
              >
                <label>
                  Leave this field empty
                  <input
                    name={HONEYPOT_FIELD}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  We only use your number to call you back.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  disabled={pending}
                  className="sm:min-w-56"
                >
                  {pending ? (
                    <>
                      <IconLoader2 className="animate-spin" stroke={1.75} />
                      Sending
                    </>
                  ) : (
                    <>
                      Request a call back
                      <IconArrowRight data-nudge stroke={1.75} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
