"use client"

import {
  IconLock,
  IconPackage,
  IconPlugConnectedX,
  IconTruckDelivery,
} from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useId, useState } from "react"

import { convexConfigured } from "@/app/providers"
import { Button, ButtonLink } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"
import { track } from "@/lib/analytics"
import {
  useCart,
  useCartActions,
  useCartHydrated,
  useCartSync,
} from "@/lib/cart-store"
import { deliversTo, inLanguage, ORDER_SETS_MAX } from "@/lib/catalog"
import { FULFILMENT_LABELS } from "@/lib/checkout"
import { formatPaise } from "@/lib/money"
import { PayOrder } from "@/components/commerce/pay-order"
import { place } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { useViewer } from "@/hooks/use-viewer"

/*
 * Checkout. The page prices nothing itself for the write: the server reads
 * the shopper's cart and the published sets, so what is shown here is a
 * preview of what placeOrder will charge, not the charge.
 *
 * Placing saves the order as "awaiting payment"; the pay step that follows
 * (components/commerce/pay-order.tsx) takes the money through Razorpay, and
 * only its verified payment marks the order paid.
 */
/** "1 set", "3 sets". */
const setCount = (lines: { quantity: number }[]) => {
  const n = lines.reduce((sum, line) => sum + line.quantity, 0)
  return `${n} ${n === 1 ? "set" : "sets"}`
}

type AddressField = "line1" | "city" | "pin"
/** In the order they appear, so focus lands on the first one to fix. */
const ADDRESS_FIELDS: AddressField[] = ["line1", "city", "pin"]

/** What each server refusal means for the buyer, and what to do. */
const REFUSED_FIELD: Record<string, string> = {
  items:
    "Something in your cart is no longer available - check it and try again.",
  cart: "Your cart is empty.",
  "pin-area":
    "We deliver within Assam only (PIN codes starting 78). Choose collection at the centre, or call ICT.",
  address: "Check the address: house and street, town, and a 6-digit PIN.",
  quantity: `One order holds up to ${ORDER_SETS_MAX} sets. Remove some, or call ICT for more.`,
  name: "Add your name in your account before ordering.",
}

export default function CheckoutPage() {
  if (!convexConfigured)
    return (
      <PageShell title={<span className="text-foreground">Checkout.</span>}>
        <StatePanel
          icon={<IconPlugConnectedX stroke={1.75} />}
          title="Not available here"
          description="Ordering isn't available on this copy of the site."
        />
      </PageShell>
    )
  return <Checkout />
}

function Checkout() {
  /* Merges any guest cart into the server copy on arrival after sign-in. */
  const { synced } = useCartSync()
  const viewer = useViewer()
  const hydrated = useCartHydrated()

  if (viewer === undefined || !hydrated)
    return (
      <PageShell
        title={
          <>
            <span className="text-foreground">Checkout.</span>{" "}
            <span className="text-muted-foreground">Loading…</span>
          </>
        }
      >
        <ListSkeleton rows={3} className="max-w-160" />
      </PageShell>
    )

  if (viewer === null)
    return (
      <PageShell
        title={
          <>
            <span className="text-foreground">One step first.</span>{" "}
            <span className="text-muted-foreground">Sign in.</span>
          </>
        }
      >
        <StatePanel
          icon={<IconLock stroke={1.75} />}
          title="Sign in to place the order"
          description="Your cart stays on this device and carries over once you're in. New here? Signing in with your number creates the account."
          action={
            <ButtonLink href="/login?next=/checkout" className="mbs-6">
              Sign in with your number
            </ButtonLink>
          }
        />
      </PageShell>
    )

  if (!synced)
    return (
      <PageShell
        title={
          <>
            <span className="text-foreground">Checkout.</span>{" "}
            <span className="text-muted-foreground">Syncing your cart…</span>
          </>
        }
      >
        <ListSkeleton rows={3} className="max-w-160" />
      </PageShell>
    )

  return <CheckoutForm />
}

type Placed = { reference: string; totalPaise: number }

function CheckoutForm() {
  const lines = useCart((s) => s.lines)
  const cart = useCartActions()
  const bundles = useQuery(api.catalog.bundles)
  const shop = useQuery(api.settings.shop)
  const placeOrder = useMutation(api.checkout.placeOrder)
  /* An order saved whose answer never reached this phone (a dropped
     connection, a reload) took the cart with it. Shown here, it is paid
     rather than placed a second time. */
  const myOrders = useQuery(api.orders.myOrders)
  const unpaid = myOrders?.find((order) => order.status === "awaiting_payment")
  const [fulfilment, setFulfilment] = useState<"delivery" | "collection">(
    "delivery"
  )
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    district: "",
    pin: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<AddressField, string>>
  >({})
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState<Placed | null>(null)
  const [paid, setPaid] = useState(false)
  /* One key per attempt-set: a double-click or a retried submission comes
     back with the same order rather than minting a second. */
  const [idempotencyKey] = useState(() => crypto.randomUUID())
  const errorId = useId()

  const rows = lines.flatMap((line) => {
    const bundle = bundles?.find((b) => b.slug === line.slug)
    const variant = bundle?.variants[line.language]
    return bundle && !bundle.sample && variant?.available
      ? [
          {
            ...line,
            title: `${inLanguage(bundle.title, line.language)} (${line.language === "as" ? "Assamese" : "English"} set)`,
            unitPaise: variant.pricePaise,
          },
        ]
      : []
  })
  const shippingPaise = shop?.shippingPaise ?? 0
  const itemsPaise = rows.reduce(
    (sum, row) => sum + row.unitPaise * row.quantity,
    0
  )
  const deliveryPaise = fulfilment === "delivery" ? shippingPaise : 0

  const set =
    (field: keyof typeof address) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "pin"
          ? e.target.value.replace(/\D/g, "").slice(0, 6)
          : e.target.value
      setAddress((a) => ({ ...a, [field]: value }))
      setFieldErrors((errors) => ({ ...errors, [field]: undefined }))
    }

  /** Checked here first, so the buyer fixes it in place, not after a round trip. */
  const checkAddress = () => {
    const errors: Partial<Record<AddressField, string>> = {}
    if (!address.line1.trim()) errors.line1 = "Add the house number and street."
    if (!address.city.trim()) errors.city = "Add the town or city."
    if (!/^\d{6}$/.test(address.pin)) errors.pin = "A PIN code is 6 digits."
    else if (!deliversTo(address.pin))
      errors.pin =
        "We deliver within Assam only (PIN codes starting 78). Choose collection, or call ICT."
    setFieldErrors(errors)
    const first = ADDRESS_FIELDS.find((field) => errors[field])
    if (first) document.getElementById(first)?.focus()
    return !first
  }

  const submit = async () => {
    setError(null)
    if (fulfilment === "delivery" && !checkAddress()) return
    setPlacing(true)
    try {
      track({ name: "checkout_started", lines: rows.length })
      const result = await placeOrder({
        fulfilment,
        address:
          fulfilment === "delivery"
            ? {
                line1: address.line1,
                line2: address.line2 || undefined,
                city: address.city,
                district: address.district || undefined,
                pin: address.pin,
              }
            : undefined,
        idempotencyKey: idempotencyKey,
      })
      if (result.ok) {
        track({ name: "order_placed", fulfilment })
        setPlaced({
          reference: result.reference,
          totalPaise: result.totalPaise,
        })
        // The pay step is a shorter page: start it at the top, where Pay is,
        // not at the footer the long form had scrolled to.
        requestAnimationFrame(() => window.scrollTo({ top: 0 }))
      } else {
        setError(
          result.reason === "rate-limited"
            ? "Too many orders just now - wait a little and try again."
            : result.reason === "anonymous"
              ? "Sign in to place the order."
              : result.reason === "invalid-input"
                ? (REFUSED_FIELD[result.field ?? ""] ??
                  "Check your details and try again.")
                : "We couldn't place that order - try again."
        )
      }
    } catch {
      setError("The order didn't go through - check your connection.")
    } finally {
      setPlacing(false)
    }
  }

  if (placed)
    return (
      <PageShell
        title={
          <>
            <span className="text-foreground">Order {placed.reference}.</span>{" "}
            <span className="text-muted-foreground">
              {paid ? "Paid. Thank you." : "One step left."}
            </span>
          </>
        }
      >
        <div className="max-w-160 space-y-6">
          <p className="text-lg text-pretty">
            Pay <span className="tnum">{formatPaise(placed.totalPaise)}</span>{" "}
            to confirm it. The order is saved: if you close this, you can pay
            later from{" "}
            <Link
              href="/account"
              className="underline underline-offset-4 hover:text-foreground"
            >
              your account
            </Link>
            .
          </p>
          <PayOrder
            reference={placed.reference}
            amountPaise={placed.totalPaise}
            onPaid={() => setPaid(true)}
          />
          <div className="flex gap-3 pbs-2">
            <ButtonLink variant="secondary" href="/account">
              See your orders
            </ButtonLink>
            <ButtonLink variant="ghost" href="/books">
              Keep browsing
            </ButtonLink>
          </div>
        </div>
      </PageShell>
    )

  // Lines the shop cannot sell, each with the real reason, so the buyer
  // can remove exactly that one here instead of guessing in the cart.
  const missing = lines
    .filter(
      (line) =>
        !rows.some(
          (row) => row.slug === line.slug && row.language === line.language
        )
    )
    .map((line) => {
      const bundle = bundles?.find((b) => b.slug === line.slug)
      return {
        ...line,
        title: bundle ? inLanguage(bundle.title, line.language) : line.slug,
        reason: !bundle
          ? "is no longer sold"
          : bundle.sample
            ? "is a sample set and is not on sale yet"
            : "is not available in this language right now",
      }
    })

  return (
    <PageShell
      title={
        <>
          <span className="text-foreground">Checkout.</span>
          {/* No total for an empty cart: delivery alone is not an order. */}
          {rows.length ? (
            <span className="text-muted-foreground">
              {" "}
              {formatPaise(itemsPaise + deliveryPaise)}.
            </span>
          ) : null}
        </>
      }
    >
      {bundles === undefined ? (
        <ListSkeleton rows={4} className="max-w-160" />
      ) : lines.length === 0 && unpaid ? (
        <StatePanel
          icon={<IconPackage stroke={1.75} />}
          title={`Order ${unpaid.reference} is waiting for payment`}
          description={`${formatPaise(unpaid.totalPaise)} for ${setCount(unpaid.lines)}. Pay for it here; unpaid orders are cancelled after three days.`}
          action={
            <div className="mbs-6">
              <PayOrder
                reference={unpaid.reference}
                amountPaise={unpaid.totalPaise}
              />
            </div>
          }
        />
      ) : lines.length === 0 ? (
        <StatePanel
          icon={<IconPackage stroke={1.75} />}
          title="Your cart is empty"
          description="The sets you add wait here until you place the order."
          action={
            <ButtonLink href="/books" className="mbs-6">
              Browse the books
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-10">
            {unpaid ? (
              <p className="rounded-card border border-border bg-secondary/50 p-4 text-sm">
                Order{" "}
                <span className="tnum font-medium">{unpaid.reference}</span> (
                {formatPaise(unpaid.totalPaise)}) is still waiting for payment.{" "}
                <Link href="/account" className="link">
                  Pay for it in your account
                </Link>{" "}
                if that is the one you meant, or carry on to place a new order.
              </p>
            ) : null}
            <section aria-label="Your order">
              <h2 className="type-label">Your order</h2>
              <ul className="mbs-4 divide-y divide-border">
                {rows.map((row) => (
                  <li
                    key={`${row.slug}:${row.language}`}
                    className="flex items-baseline justify-between gap-4 py-3"
                  >
                    <span>
                      {row.title}
                      <span className="whitespace-nowrap text-muted-foreground">
                        {" "}
                        × {row.quantity}
                      </span>
                    </span>
                    <span className="tnum">
                      {formatPaise(row.unitPaise * row.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              {missing.length > 0 && (
                <ul className="mbs-3 grid gap-2" aria-live="polite">
                  {missing.map((line) => (
                    <li
                      key={`${line.slug}:${line.language}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-destructive/8 p-3 text-sm"
                    >
                      <span className="text-destructive">
                        {line.title} (
                        {line.language === "as" ? "Assamese" : "English"} set){" "}
                        {line.reason}, so it can&rsquo;t be ordered.
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          cart.remove({
                            slug: line.slug,
                            language: line.language,
                          })
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <fieldset>
              <legend className="type-label">Getting it to you</legend>
              <div className="mbs-4 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["delivery", IconTruckDelivery],
                    ["collection", IconPackage],
                  ] as const
                ).map(([value, Icon]) => (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-[20px] p-4 transition-[background-color,box-shadow] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                      fulfilment === value
                        ? "bg-card shadow-[inset_0_0_0_2px_var(--primary)]"
                        : "bg-secondary hover:bg-secondary/70"
                    )}
                  >
                    <input
                      type="radio"
                      name="fulfilment"
                      value={value}
                      checked={fulfilment === value}
                      onChange={() => setFulfilment(value)}
                      className="mbs-1 size-4 accent-primary"
                    />
                    <span>
                      <Icon
                        stroke={1.75}
                        className="mbe-2 size-5"
                        aria-hidden
                      />
                      <span className="block font-medium">
                        {FULFILMENT_LABELS[value]}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {value === "delivery"
                          ? `${formatPaise(shippingPaise)} delivery`
                          : `Free. From the centre on ${place.spoken}, when it's ready`}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {fulfilment === "collection" ? (
              <p className="text-sm text-muted-foreground">
                Collect at Impact Career Tutorials, {place.street}, {place.city}
                , {place.region} <span className="tnum">{place.pin}</span>. Your
                account shows when it&rsquo;s ready to collect.{" "}
                <a
                  href={place.maps}
                  target="_blank"
                  rel="noreferrer"
                  className="link"
                >
                  Open in Maps
                </a>
              </p>
            ) : null}

            {fulfilment === "delivery" && (
              <FieldGroup>
                <Field data-invalid={Boolean(fieldErrors.line1)}>
                  <FieldLabel htmlFor="line1">Address</FieldLabel>
                  <Input
                    id="line1"
                    autoComplete="address-line1"
                    value={address.line1}
                    onChange={set("line1")}
                    required
                    aria-invalid={Boolean(fieldErrors.line1)}
                    aria-describedby={
                      fieldErrors.line1 ? "line1-error" : undefined
                    }
                  />
                  {fieldErrors.line1 ? (
                    <FieldError id="line1-error">
                      {fieldErrors.line1}
                    </FieldError>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor="line2">
                    Landmark or street{" "}
                    <span className="font-normal">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="line2"
                    autoComplete="address-line2"
                    value={address.line2}
                    onChange={set("line2")}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={Boolean(fieldErrors.city)}>
                    <FieldLabel htmlFor="city">Town or city</FieldLabel>
                    <Input
                      id="city"
                      autoComplete="address-level2"
                      value={address.city}
                      onChange={set("city")}
                      required
                      aria-invalid={Boolean(fieldErrors.city)}
                      aria-describedby={
                        fieldErrors.city ? "city-error" : undefined
                      }
                    />
                    {fieldErrors.city ? (
                      <FieldError id="city-error">
                        {fieldErrors.city}
                      </FieldError>
                    ) : null}
                  </Field>
                  <Field data-invalid={Boolean(fieldErrors.pin)}>
                    <FieldLabel htmlFor="pin">PIN code</FieldLabel>
                    <Input
                      id="pin"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      value={address.pin}
                      onChange={set("pin")}
                      required
                      aria-invalid={Boolean(fieldErrors.pin)}
                      aria-describedby={
                        fieldErrors.pin ? "pin-error" : "pin-hint"
                      }
                    />
                    {fieldErrors.pin ? (
                      <FieldError id="pin-error">{fieldErrors.pin}</FieldError>
                    ) : (
                      <FieldDescription id="pin-hint">
                        We deliver within Assam.
                      </FieldDescription>
                    )}
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="district">
                    District <span className="font-normal">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="district"
                    autoComplete="address-level3"
                    value={address.district}
                    onChange={set("district")}
                  />
                </Field>
              </FieldGroup>
            )}
          </div>

          <aside
            aria-label="Total"
            className="h-fit space-y-4 rounded-[28px] bg-card p-6 shadow-lift lg:sticky lg:inset-bs-[calc(var(--header-height)+var(--strip-height)+1.5rem)]"
          >
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Books</dt>
                <dd className="tnum">{formatPaise(itemsPaise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="tnum">
                  {fulfilment === "delivery"
                    ? formatPaise(deliveryPaise)
                    : "Free"}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pbs-3 text-base font-medium">
                <dt>Total</dt>
                <dd className="tnum">
                  {formatPaise(itemsPaise + deliveryPaise)}
                </dd>
              </div>
            </dl>
            <Button
              size="lg"
              className="w-full"
              disabled={placing || missing.length > 0}
              onClick={() => void submit()}
              aria-describedby={error ? errorId : undefined}
            >
              {placing ? "Saving your order…" : "Continue to payment"}
            </Button>
            {error && (
              <FieldError id={errorId} className="text-left">
                {error}
              </FieldError>
            )}
            <FieldDescription className="text-center">
              Your order is saved first, then you pay securely with Razorpay:
              UPI, cards or net banking. If a payment fails, the order waits in
              your account to try again.
            </FieldDescription>
          </aside>
        </div>
      )}
    </PageShell>
  )
}
