"use client"

import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconCircleCheckFilled,
  IconLoader2,
} from "@tabler/icons-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useActionState, useId } from "react"

import { submitLead, type LeadState } from "@/app/actions/lead"
import { Button, ButtonAnchor } from "@/components/ui/button"
import { contact, formatPhone, offer, timings } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { enquiryCourses } from "@/lib/leads"
import { cn } from "@/lib/utils"

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

  const errors = state.status === "error" ? state.errors : {}
  const values = state.status === "error" ? state.values : {}

  const swap = {
    initial: reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(6px)" },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 md:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {state.status === "ok" ? (
          <motion.div key="done" {...swap} role="status" aria-live="polite">
            <IconCircleCheckFilled
              size={28}
              className="text-verified"
              aria-hidden
            />
            <p className="type-lede mt-4">
              Thank you, {state.name.split(" ")[0]}.
              <span className="text-muted-foreground">
                {" "}
                ICT will call you on{" "}
                <span className="tnum">
                  {formatPhone(state.phone)}
                </span> about{" "}
                {state.course === "Not sure yet"
                  ? "the right course for you"
                  : state.course}
                .
              </span>
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              Want an answer right now?
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <ButtonAnchor
                href={contactHref({
                  kind: "whatsapp-handoff",
                  name: state.name,
                  course: state.course,
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
          </motion.div>
        ) : (
          <motion.div key="form" {...swap}>
            <form action={action} noValidate className="relative">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor={nameId} className="text-sm font-medium">
                    Your name
                  </label>
                  <input
                    id={nameId}
                    name="name"
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
                  name="course"
                  legend="Which exam"
                  options={enquiryCourses}
                  defaultValue={values.course}
                  error={errors.course}
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
                  Company
                  <input name="company" tabIndex={-1} autoComplete="off" />
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
                      {offer.cta}
                      <IconArrowRight data-nudge stroke={1.75} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
