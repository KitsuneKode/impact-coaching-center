"use client"

import { IconCircleCheck } from "@tabler/icons-react"
import { useEffect, useId, useRef, useState } from "react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { deliversTo } from "@/lib/catalog"

export type Delivery = {
  pin: string
  district: string
  city: string
  line1: string
  line2: string
  landmark: string
  courierPhone: string
}

export type DeliveryField =
  | "pin"
  | "district"
  | "city"
  | "line1"
  | "courierPhone"
/** In the order they appear, so focus lands on the first one to fix. */
export const DELIVERY_FIELDS: DeliveryField[] = [
  "pin",
  "district",
  "city",
  "line1",
  "courierPhone",
]

type Lookup =
  | { state: "idle" }
  | { state: "looking" }
  | { state: "found"; district: string; places: string[] }
  | { state: "unknown" }

/** Checked here first, so the buyer fixes it in place, not after a round trip. */
export function checkDelivery(value: Delivery) {
  const errors: Partial<Record<DeliveryField, string>> = {}
  if (!/^\d{6}$/.test(value.pin)) errors.pin = "Enter the 6-digit PIN code."
  else if (!deliversTo(value.pin))
    errors.pin =
      "We deliver within Assam only (PIN codes starting 78). Choose collection, or call ICT."
  if (!value.district.trim()) errors.district = "Enter the district."
  if (!value.city.trim()) errors.city = "Enter the town, city or village."
  if (!value.line1.trim()) errors.line1 = "Enter the house number and street."
  const digits = value.courierPhone
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, "")
  if (value.courierPhone.trim() && !/^[6-9]\d{9}$/.test(digits))
    errors.courierPhone = "Enter a 10-digit mobile number, like 98765 43210."
  return errors
}

/**
 * Where a parcel goes, in the order a courier reads it: the PIN first, which
 * fills the district and offers the towns India Post has for it (the way a
 * card form fills the city from a postcode), then the house, the area and
 * a landmark, and the number the courier rings.
 */
export function DeliveryAddress({
  value,
  onChange,
  errors,
}: {
  value: Delivery
  onChange: (next: Partial<Delivery>, field: keyof Delivery) => void
  errors: Partial<Record<DeliveryField, string>>
}) {
  const [lookup, setLookup] = useState<Lookup>({ state: "idle" })
  const placesId = useId()
  // What the lookup itself put in, so a later PIN can replace it but never
  // something the buyer typed.
  const filled = useRef({ district: "", city: "" })
  const latest = useRef({ value, onChange })
  useEffect(() => {
    latest.current = { value, onChange }
  })

  const pin = value.pin
  useEffect(() => {
    if (!/^\d{6}$/.test(pin) || !deliversTo(pin)) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLookup({ state: "looking" })
      try {
        const response = await fetch(`/api/pin/${pin}`, {
          signal: controller.signal,
        })
        const data = (await response.json()) as
          | { found: true; district: string; places: string[] }
          | { found: false }
        if (!data.found) return setLookup({ state: "unknown" })
        setLookup({
          state: "found",
          district: data.district,
          places: data.places,
        })
        const { value: now, onChange: change } = latest.current
        const next: Partial<Delivery> = {}
        if (!now.district.trim() || now.district === filled.current.district)
          next.district = filled.current.district = data.district
        if (
          data.places.length === 1 &&
          (!now.city.trim() || now.city === filled.current.city)
        )
          next.city = filled.current.city = data.places[0]!
        if (next.district) change({ district: next.district }, "district")
        if (next.city) change({ city: next.city }, "city")
      } catch {
        if (!controller.signal.aborted) setLookup({ state: "unknown" })
      }
    }, 250)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [pin])

  const field =
    (name: keyof Delivery) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value
      onChange(
        { [name]: name === "pin" ? raw.replace(/\D/g, "").slice(0, 6) : raw },
        name
      )
    }
  const describe = (name: DeliveryField, hint?: string) =>
    errors[name] ? `${name}-error` : hint

  const pinHint =
    lookup.state === "found" && /^\d{6}$/.test(pin) ? (
      <span className="inline-flex items-center gap-1.5 text-foreground">
        <IconCircleCheck
          aria-hidden
          size={16}
          stroke={1.75}
          className="text-primary"
        />
        {lookup.district} district, Assam
      </span>
    ) : lookup.state === "looking" ? (
      <span className="inline-flex items-center gap-1.5">
        <Spinner className="size-3.5" />
        Finding the district
      </span>
    ) : (
      "We deliver within Assam."
    )

  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.pin)}>
          <FieldLabel htmlFor="pin">PIN code</FieldLabel>
          <Input
            id="pin"
            autoComplete="postal-code"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="787001"
            value={value.pin}
            onChange={field("pin")}
            required
            aria-invalid={Boolean(errors.pin)}
            aria-describedby={describe("pin", "pin-hint")}
          />
          {errors.pin ? (
            <FieldError id="pin-error">{errors.pin}</FieldError>
          ) : (
            <FieldDescription id="pin-hint" aria-live="polite">
              {pinHint}
            </FieldDescription>
          )}
        </Field>
        <Field data-invalid={Boolean(errors.district)}>
          <FieldLabel htmlFor="district">District</FieldLabel>
          <Input
            id="district"
            autoComplete="address-level2"
            value={value.district}
            onChange={field("district")}
            required
            aria-invalid={Boolean(errors.district)}
            aria-describedby={describe("district")}
          />
          {errors.district ? (
            <FieldError id="district-error">{errors.district}</FieldError>
          ) : null}
        </Field>
      </div>
      <Field data-invalid={Boolean(errors.city)}>
        <FieldLabel htmlFor="city">Town, city or village</FieldLabel>
        <Input
          id="city"
          autoComplete="address-level3"
          list={lookup.state === "found" ? placesId : undefined}
          value={value.city}
          onChange={field("city")}
          required
          aria-invalid={Boolean(errors.city)}
          aria-describedby={describe("city")}
        />
        {lookup.state === "found" ? (
          <datalist id={placesId}>
            {lookup.places.map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </datalist>
        ) : null}
        {errors.city ? (
          <FieldError id="city-error">{errors.city}</FieldError>
        ) : null}
      </Field>
      <Field data-invalid={Boolean(errors.line1)}>
        <FieldLabel htmlFor="line1">House number and street</FieldLabel>
        <Input
          id="line1"
          autoComplete="address-line1"
          value={value.line1}
          onChange={field("line1")}
          required
          aria-invalid={Boolean(errors.line1)}
          aria-describedby={describe("line1")}
        />
        {errors.line1 ? (
          <FieldError id="line1-error">{errors.line1}</FieldError>
        ) : null}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="line2">
            Area or locality <span className="font-normal">(optional)</span>
          </FieldLabel>
          <Input
            id="line2"
            autoComplete="address-line2"
            value={value.line2}
            onChange={field("line2")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="landmark">
            Landmark <span className="font-normal">(optional)</span>
          </FieldLabel>
          <Input
            id="landmark"
            placeholder="Near the Namghar"
            value={value.landmark}
            onChange={field("landmark")}
          />
        </Field>
      </div>
      <Field data-invalid={Boolean(errors.courierPhone)}>
        <FieldLabel htmlFor="courierPhone">Phone for the courier</FieldLabel>
        <Input
          id="courierPhone"
          type="tel"
          autoComplete="tel-national"
          inputMode="tel"
          placeholder="98765 43210"
          value={value.courierPhone}
          onChange={field("courierPhone")}
          aria-invalid={Boolean(errors.courierPhone)}
          aria-describedby={describe("courierPhone", "courierPhone-hint")}
        />
        {errors.courierPhone ? (
          <FieldError id="courierPhone-error">{errors.courierPhone}</FieldError>
        ) : (
          <FieldDescription id="courierPhone-hint">
            Someone at this address who picks up. Leave your own if that is you.
          </FieldDescription>
        )}
      </Field>
    </FieldGroup>
  )
}
