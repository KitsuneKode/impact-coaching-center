"use client"

import {
  IconLock,
  IconPackage,
  IconPlugConnectedX,
  IconTruckDelivery,
} from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useId, useRef, useState } from "react"

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
import { useCart, useCartHydrated, useCartSync } from "@/lib/cart-store"
import { DELIVERY_CHARGE_PAISE, FULFILMENT_LABELS } from "@/lib/checkout"
import { formatPaise } from "@/lib/money"
import { cn } from "@/lib/utils"

/*
 * Checkout. The page prices nothing itself for the write: the server reads
 * the shopper's cart and the books table, so what is shown here is a
 * preview of what placeOrder will charge, not the charge.
 *
 * Payment is deliberately not taken. Until Razorpay is approved and wired
 * (KIT-60), an order lands as "awaiting payment" and ICT confirms it with
 * the buyer - the copy says so rather than pretending a click moved money.
 */
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
  const viewer = useQuery(api.auth.getCurrentPerson)
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
        >
          <ButtonLink href="/login?next=/checkout" className="mt-6">
            Sign in with your number
          </ButtonLink>
        </StatePanel>
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
  const books = useQuery(api.catalog.books)
  const placeOrder = useMutation(api.checkout.placeOrder)
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
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState<Placed | null>(null)
  /* One key per attempt-set: a double-click or a retried submission comes
     back with the same order rather than minting a second. */
  const idempotencyKey = useRef(crypto.randomUUID())
  const errorId = useId()

  const rows = lines.flatMap((line) => {
    const book = books?.find((b) => b.slug === line.slug)
    return book && !book.sample
      ? [{ ...line, title: book.title, unitPaise: book.pricePaise }]
      : []
  })
  const itemsPaise = rows.reduce(
    (sum, row) => sum + row.unitPaise * row.quantity,
    0
  )
  const deliveryPaise = fulfilment === "delivery" ? DELIVERY_CHARGE_PAISE : 0

  const set =
    (field: keyof typeof address) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddress((a) => ({ ...a, [field]: e.target.value }))

  const submit = async () => {
    setPlacing(true)
    setError(null)
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
        idempotencyKey: idempotencyKey.current,
      })
      if (result.ok) {
        track({ name: "order_placed", fulfilment })
        setPlaced({
          reference: result.reference,
          totalPaise: result.totalPaise,
        })
      } else {
        setError(
          result.reason === "rate-limited"
            ? "Too many orders just now - wait a little and try again."
            : result.reason === "invalid-input" && result.field === "items"
              ? "Something in your cart is no longer available - check it and try again."
              : result.reason === "invalid-input" && result.field === "cart"
                ? "Your cart is empty."
                : result.reason === "invalid-input"
                  ? `Check the ${result.field ?? "details"} and try again.`
                  : result.reason === "anonymous"
                    ? "Sign in to place the order."
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
            <span className="text-muted-foreground">Placed.</span>
          </>
        }
      >
        <div className="max-w-160 space-y-6">
          <p className="text-lg text-pretty">
            That's {formatPaise(placed.totalPaise)} including delivery. No
            payment has been taken - ICT will call your number to confirm the
            order and arrange it.
          </p>
          <p className="text-sm text-muted-foreground">
            The order is on{" "}
            <Link
              href="/account"
              className="underline underline-offset-4 hover:text-foreground"
            >
              your account page
            </Link>{" "}
            with its reference and status.
          </p>
          <div className="flex gap-3">
            <ButtonLink href="/account">See your orders</ButtonLink>
            <ButtonLink variant="secondary" href="/books">
              Keep browsing
            </ButtonLink>
          </div>
        </div>
      </PageShell>
    )

  const missing = lines.filter(
    (line) => !rows.some((row) => row.slug === line.slug)
  )

  return (
    <PageShell
      title={
        <>
          <span className="text-foreground">Checkout.</span>{" "}
          <span className="text-muted-foreground">
            {formatPaise(itemsPaise + deliveryPaise)}.
          </span>
        </>
      }
    >
      {rows.length === 0 ? (
        <StatePanel
          icon={<IconPackage stroke={1.75} />}
          title={books === undefined ? "Loading…" : "Your cart is empty"}
          description="The books you add wait here until you place the order."
        >
          <ButtonLink href="/books" className="mt-6">
            Browse the books
          </ButtonLink>
        </StatePanel>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-10">
            <section aria-label="Your order">
              <h2 className="type-label">Your order</h2>
              <ul className="mt-4 divide-y divide-border">
                {rows.map((row) => (
                  <li
                    key={row.slug}
                    className="flex items-baseline justify-between gap-4 py-3"
                  >
                    <span>
                      {row.title}
                      <span className="text-muted-foreground">
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
                <output className="mt-3 block text-sm text-destructive">
                  {missing.length === 1 ? "One title is" : "Some titles are"} no
                  longer available and won't be ordered. Remove{" "}
                  {missing.length === 1 ? "it" : "them"} in the cart to go on.
                </output>
              )}
            </section>

            <fieldset>
              <legend className="type-label">Getting it to you</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["delivery", IconTruckDelivery],
                    ["collection", IconPackage],
                  ] as const
                ).map(([value, Icon]) => (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-control border p-4",
                      fulfilment === value
                        ? "border-foreground"
                        : "border-border hover:border-foreground/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="fulfilment"
                      value={value}
                      checked={fulfilment === value}
                      onChange={() => setFulfilment(value)}
                      className="mt-1 size-4 accent-foreground"
                    />
                    <span>
                      <Icon stroke={1.75} className="mb-2 size-5" aria-hidden />
                      <span className="block font-medium">
                        {FULFILMENT_LABELS[value]}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {value === "delivery"
                          ? `${formatPaise(DELIVERY_CHARGE_PAISE)} delivery, shown at checkout`
                          : "From the centre, when it's ready - free"}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {fulfilment === "delivery" && (
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="line1">Address</FieldLabel>
                  <Input
                    id="line1"
                    autoComplete="address-line1"
                    value={address.line1}
                    onChange={set("line1")}
                    required
                  />
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
                  <Field>
                    <FieldLabel htmlFor="city">Town or city</FieldLabel>
                    <Input
                      id="city"
                      autoComplete="address-level2"
                      value={address.city}
                      onChange={set("city")}
                      required
                    />
                  </Field>
                  <Field>
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
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="district">
                    District <span className="font-normal">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="district"
                    autoComplete="address-level1"
                    value={address.district}
                    onChange={set("district")}
                  />
                </Field>
              </FieldGroup>
            )}
          </div>

          <aside
            aria-label="Total"
            className="h-fit space-y-4 rounded-card border border-border bg-card p-6"
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
              <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
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
              {placing ? "Placing…" : "Place order"}
            </Button>
            {error && (
              <FieldError id={errorId} className="text-left">
                {error}
              </FieldError>
            )}
            <FieldDescription className="text-center">
              No payment is taken yet. Placing the order saves it under{" "}
              <span className="text-foreground">awaiting payment</span>, and ICT
              calls your number to confirm - online payment arrives with
              Razorpay.
            </FieldDescription>
          </aside>
        </div>
      )}
    </PageShell>
  )
}
