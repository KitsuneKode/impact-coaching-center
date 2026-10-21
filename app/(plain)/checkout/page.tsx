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
import {
  useCart,
  useCartActions,
  useCartHydrated,
  useCartSync,
} from "@/lib/cart-store"
import { inLanguage } from "@/lib/catalog"
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
  const [paid, setPaid] = useState(false)
  /* One key per attempt-set: a double-click or a retried submission comes
     back with the same order rather than minting a second. */
  const idempotencyKey = useRef(crypto.randomUUID())
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
    }

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
