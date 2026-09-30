"use client"

import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconCircleCheckFilled,
  IconInfoCircle,
  IconLoader2,
} from "@tabler/icons-react"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import { useActionState, useEffect, useId, useRef, useState } from "react"

import type { LeadField, LeadState } from "@/app/actions/lead"
import { Turnstile } from "@/components/marketing/turnstile"
import { track } from "@/lib/analytics"
import { contact, formatPhone, timings } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { clientEnv } from "@/lib/env.client"
import { enquiryTracks, HONEYPOT_FIELD } from "@/lib/leads"

import { previewLead } from "./_preview-lead"

const ORDER: readonly LeadField[] = ["name", "phone", "track", "timing"]
const LABELS: Record<LeadField, string> = {
  name: "Your name",
  phone: "Mobile number",
  track: "Which exam",
  timing: "When can you study",
}

function Choice({
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
    <fieldset aria-describedby={error ? `${id}-e` : undefined}>
      <legend data-eq-label>{legend}</legend>
      <div data-eq-choices>
        {options.map((o) => (
          <label key={o} data-eq-choice>
            <input
              type="radio"
              name={name}
              value={o}
              defaultChecked={defaultValue === o}
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-e`} data-eq-error>
          {error}
        </p>
      )}
    </fieldset>
  )
}

/**
 * The real enquiry form: the same server action, validation and WhatsApp
 * handoff the live site uses, dressed by the page through `--eq-*` variables
 * and `enquiryCss`.
 */
export function EnquiryForm() {
  const [state, action, pending] = useActionState<LeadState, FormData>(
    previewLead,
    { status: "idle" }
  )
  const reduce = useReducedMotion()
  const nameId = useId()
  const phoneId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [again, setAgain] = useState(false)
  const [shown, setShown] = useState(state)
  const [epoch, setEpoch] = useState(0)
  if (shown !== state) {
    setShown(state)
    setAgain(false)
    if (state.status === "error") setEpoch((n) => n + 1)
  }

  const errors = state.status === "error" ? state.errors : {}
  const values = state.status === "error" ? state.values : {}
  const invalid = ORDER.filter((f) => errors[f])

  const focusField = (name: LeadField) =>
    formRef.current?.querySelector<HTMLElement>(`[name="${name}"]`)?.focus()

  useEffect(() => {
    if (state.status === "ok")
      track({ name: "enquiry_submitted", track: state.track })
    if (state.status !== "error") return
    const first = ORDER.find((f) => state.errors[f])
    if (first) focusField(first)
  }, [state])

  const swap = {
    initial: reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(6px)" },
    transition: { duration: 0.32, ease: [0.23, 1, 0.32, 1] as const },
  }

  const done = state.status !== "idle" && state.status !== "error" && !again

  return (
    <div data-eq>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <m.div key="done" {...swap} aria-live="polite">
            {state.status === "ok" ? (
              <IconCircleCheckFilled size={30} data-eq-ok aria-hidden />
            ) : (
              <IconInfoCircle size={30} aria-hidden />
            )}
            <p data-eq-thanks>
              Thank you, {state.name.split(" ")[0]}.{" "}
              <span>
                {state.status === "ok"
                  ? "This is a design preview, so nothing was sent. Your number would be "
                  : "We could not confirm receipt. Send it on WhatsApp or call ICT. Your number is "}
                <b>{formatPhone(state.phone)}</b> about{" "}
                {state.track === "Not sure yet"
                  ? "the right course for you"
                  : state.track}
                .
              </span>
            </p>
            <div data-eq-actions>
              <a
                data-eq-btn
                href={contactHref({
                  kind: "whatsapp-handoff",
                  name: state.name,
                  track: state.track,
                  timing: state.timing,
                  phone: state.phone,
                })}
                target="_blank"
                rel="noreferrer noopener"
              >
                <IconBrandWhatsapp size={18} stroke={1.75} aria-hidden />
                Continue on WhatsApp
              </a>
              <a data-eq-btn data-quiet href={contactHref({ kind: "call" })}>
                Call {formatPhone(contact.phones[0])}
              </a>
            </div>
            <button type="button" data-eq-again onClick={() => setAgain(true)}>
              Ask about another exam
            </button>
          </m.div>
        ) : (
          <m.div key="form" {...swap}>
            <form ref={formRef} action={action} noValidate data-eq-form>
              {(invalid.length > 0 ||
                (state.status === "error" && state.formError)) && (
                <div role="alert" data-eq-summary>
                  <p>
                    {state.status === "error" && state.formError
                      ? state.formError
                      : invalid.length === 1
                        ? "One field needs attention before we can send this:"
                        : `${invalid.length} fields need attention before we can send this:`}
                  </p>
                  <ul>
                    {invalid.map((n) => (
                      <li key={n}>
                        <button type="button" onClick={() => focusField(n)}>
                          {LABELS[n]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div data-eq-pair>
                <div>
                  <label htmlFor={nameId} data-eq-label>
                    Your name
                  </label>
                  <input
                    id={nameId}
                    name="name"
                    required
                    autoComplete="name"
                    defaultValue={values.name}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? `${nameId}-e` : undefined}
                    data-eq-input
                  />
                  {errors.name && (
                    <p id={`${nameId}-e`} data-eq-error>
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor={phoneId} data-eq-label>
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
                    aria-describedby={errors.phone ? `${phoneId}-e` : undefined}
                    data-eq-input
                  />
                  {errors.phone && (
                    <p id={`${phoneId}-e`} data-eq-error>
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <Choice
                name="track"
                legend="Which exam"
                options={enquiryTracks}
                defaultValue={values.track}
                error={errors.track}
              />
              <Choice
                name="timing"
                legend="When can you study"
                options={timings}
                defaultValue={values.timing}
                error={errors.timing}
              />

              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: -9999,
                  width: 0,
                  height: 0,
                  overflow: "hidden",
                }}
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

              {clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                <Turnstile
                  siteKey={clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  resetKey={epoch}
                />
              ) : null}

              <div data-eq-foot>
                <p>We only use your number to call you back.</p>
                <button type="submit" data-eq-btn disabled={pending}>
                  {pending ? (
                    <>
                      <IconLoader2 size={18} data-eq-spin aria-hidden />
                      Sending
                    </>
                  ) : (
                    <>
                      Request a call back
                      <IconArrowRight size={18} stroke={2} aria-hidden />
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
