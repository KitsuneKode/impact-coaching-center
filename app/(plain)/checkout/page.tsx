"use client"

import {
  IconCircleCheck,
  IconLock,
  IconPackage,
  IconPlugConnectedX,
  IconReceipt,
  IconTruckDelivery,
} from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useId, useState } from "react"

import { convexConfigured } from "@/app/providers"
import {
  OrderOnWhatsApp,
  useShopMode,
} from "@/components/commerce/order-on-whatsapp"
import { Button, ButtonLink } from "@/components/ui/button"
import { FieldDescription } from "@/components/ui/field"
import {
  checkDelivery,
  DELIVERY_FIELDS,
  DeliveryAddress,
  type Delivery,
  type DeliveryField,
} from "@/components/commerce/delivery-address"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { api } from "@/convex/_generated/api"
import { track } from "@/lib/analytics"
import {
  useCart,
  useCartActions,
  useCartHydrated,
  useCartSync,
} from "@/lib/cart-store"
import { inLanguage, ORDER_SETS_MAX } from "@/lib/catalog"
import { FULFILMENT_LABELS } from "@/lib/checkout"
import { formatPaise } from "@/lib/money"
import { PayButton, type Paid } from "@/components/commerce/pay-order"
import { Spinner } from "@/components/ui/spinner"
import type { Id } from "@/convex/_generated/dataModel"
import { centres, formatPhone, place } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { useViewer } from "@/hooks/use-viewer"

/*
 * Checkout (ADR-0005). The page prices nothing itself for the write: Pay
 * freezes the server cart at the server's prices, Razorpay takes the money,
 * and only a captured payment makes an order. Until then the cart is the
 * cart: closing the payment window loses nothing.
 */
/** What each server refusal means for the buyer, and what to do. */
const REFUSED_FIELD: Record<string, string> = {
  items:
    "Something in your cart is no longer available - check it and try again.",
  cart: "Your cart is empty.",
  "pin-area":
    "We deliver within Assam only (PIN codes starting 78). Choose collection at the centre, or call ICT.",
  address:
    "Check the address: PIN code, district, town, and the house and street.",
  "courier-phone": "Check the courier's number: 10 digits, like 98765 43210.",
  centre: "Choose a centre to collect from.",
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

  if (viewer === undefined || !hydrated) return <CheckoutWaiting />

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
          title="Log in to place the order"
          description="Your cart stays on this device and carries over once you're in. New here? Signing in with your number creates the account."
          action={
            <ButtonLink href="/login?next=/checkout" className="mbs-6">
              Log in with your number
            </ButtonLink>
          }
        />
      </PageShell>
    )

  if (!synced) return <CheckoutWaiting />

  return <CheckoutForm />
}

/**
 * Every wait before the form (the session, then the cart catching up) is
 * one screen: the same title and the same outline the form fills, so the
 * page does not change its mind twice on the way in.
 */
function CheckoutWaiting() {
  return (
    <PageShell title={<span className="text-foreground">Checkout.</span>}>
      <output className="sr-only">Getting your cart ready…</output>
      <ListSkeleton rows={4} className="max-w-160" />
    </PageShell>
  )
}

function CheckoutForm() {
  const lines = useCart((s) => s.lines)
  const cart = useCartActions()
  const bundles = useQuery(api.catalog.bundles)
  const shop = useQuery(api.settings.shop)
  const beginCheckout = useMutation(api.checkout.beginCheckout)
  const [fulfilment, setFulfilment] = useState<"delivery" | "collection">(
    "delivery"
  )
  const viewer = useViewer()
  const saved = useQuery(api.checkout.savedDelivery)
  const [address, setAddress] = useState<Delivery>({
    pin: "",
    district: "",
    city: "",
    line1: "",
    line2: "",
    landmark: "",
    courierPhone: "",
  })
  const [saveAddress, setSaveAddress] = useState(true)
  const [centre, setCentre] = useState(centres[0]!.id)
  // Once: the remembered address, or at least the buyer's own number.
  const [prefilled, setPrefilled] = useState(false)
  if (!prefilled && saved !== undefined && viewer !== undefined) {
    setPrefilled(true)
    const own = viewer?.phone ? formatPhone(viewer.phone) : ""
    setAddress((a) => ({
      ...a,
      ...(saved
        ? {
            pin: saved.address.pin,
            district: saved.address.district ?? "",
            city: saved.address.city,
            line1: saved.address.line1,
            line2: saved.address.line2 ?? "",
            landmark: saved.address.landmark ?? "",
          }
        : {}),
      courierPhone: saved?.courierPhone ? formatPhone(saved.courierPhone) : own,
    }))
  }
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<DeliveryField, string>>
  >({})
  const [paid, setPaid] = useState<Paid | null>(null)
  const whatsapp = useShopMode() === "whatsapp"
  const [pending, setPending] = useState<Id<"checkouts"> | null>(null)
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

  const checkAddress = () => {
    const errors = checkDelivery(address)
    setFieldErrors(errors)
    const first = DELIVERY_FIELDS.find((field) => errors[field])
    if (first) document.getElementById(first)?.focus()
    return !first
  }

  const shownTotal = itemsPaise + deliveryPaise

  /** Freeze the cart for payment, or say what to fix. */
  const prepare = async () => {
    setError(null)
    if (fulfilment === "delivery" && !checkAddress()) return null
    try {
      track({ name: "checkout_started", lines: rows.length })
      const delivery = fulfilment === "delivery"
      const result = await beginCheckout({
        fulfilment,
        address: delivery
          ? {
              line1: address.line1,
              line2: address.line2.trim() || undefined,
              landmark: address.landmark.trim() || undefined,
              city: address.city,
              district: address.district,
              pin: address.pin,
            }
          : undefined,
        courierPhone: delivery
          ? address.courierPhone.trim() || undefined
          : undefined,
        centre: delivery ? undefined : centre,
        saveAddress: delivery ? saveAddress : undefined,
      })
      if (!result.ok) {
        setError(
          result.reason === "rate-limited"
            ? "Too many tries just now. Wait a few minutes and try again."
            : result.reason === "anonymous"
              ? "Your session ended. Log in again to pay."
              : result.reason === "invalid-input"
                ? (REFUSED_FIELD[result.field ?? ""] ??
                  "Check your details and try again.")
                : "That didn't go through. Try again."
        )
        return null
      }
      // A price moved since this page loaded: show it before taking it.
      if (result.totalPaise !== shownTotal) {
        setError(
          `The total is now ${formatPaise(result.totalPaise)}. Check it and press Pay again.`
        )
        return null
      }
      return result
    } catch {
      setError("That didn't go through. Check your connection and try again.")
      return null
    }
  }

  if (paid) return <Thanks paid={paid} fulfilment={fulfilment} />
  if (pending)
    return <Confirming checkoutId={pending} fulfilment={fulfilment} />

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
              <fieldset className="grid gap-3">
                <legend className="mbe-3 text-sm font-medium">
                  Collect from
                </legend>
                {centres.map((c) => (
                  <label
                    key={c.id}
                    className={cn(
                      "flex items-start gap-3 rounded-[20px] p-4 transition-[background-color,box-shadow] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                      !c.at
                        ? "cursor-not-allowed bg-secondary/60 text-muted-foreground"
                        : centre === c.id
                          ? "cursor-pointer bg-card shadow-[inset_0_0_0_2px_var(--primary)]"
                          : "cursor-pointer bg-secondary hover:bg-secondary/70"
                    )}
                  >
                    <input
                      type="radio"
                      name="centre"
                      value={c.id}
                      checked={centre === c.id}
                      disabled={!c.at}
                      onChange={() => setCentre(c.id)}
                      className="mbs-1 size-4 accent-primary"
                    />
                    <span className="min-w-0 font-medium">
                      {c.town} centre
                      <span className="block text-sm font-normal text-muted-foreground">
                        {c.at ? (
                          <>
                            {c.at.street}, {c.town}{" "}
                            <span className="tnum">{c.at.pin}</span>.{" "}
                            <a
                              href={c.at.maps}
                              target="_blank"
                              rel="noreferrer"
                              className="link"
                            >
                              Open in Maps
                            </a>
                          </>
                        ) : (
                          "Collection opens here once the centre's address is set."
                        )}
                      </span>
                    </span>
                  </label>
                ))}
                <p className="text-sm text-muted-foreground">
                  Your account shows when it&rsquo;s ready to collect. Bring the
                  order number.
                </p>
              </fieldset>
            ) : null}

            {fulfilment === "delivery" && (
              <>
                <DeliveryAddress
                  value={address}
                  errors={fieldErrors}
                  onChange={(next, field) => {
                    setAddress((a) => ({ ...a, ...next }))
                    setFieldErrors((errors) => ({
                      ...errors,
                      [field]: undefined,
                    }))
                  }}
                />
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="mbs-0.5 size-4 accent-primary"
                  />
                  <span>
                    Save this address for my next order
                    <span className="block text-muted-foreground">
                      Kept in your account; you can change it at checkout.
                    </span>
                  </span>
                </label>
              </>
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
            {whatsapp ? (
              <>
                <OrderOnWhatsApp
                  size="lg"
                  className="w-full rounded-full"
                  sets={rows.map((row) => `${row.title} × ${row.quantity}`)}
                />
                <FieldDescription className="text-center">
                  Online payment opens soon. Until then ICT confirms the total
                  and how to pay on WhatsApp.
                </FieldDescription>
              </>
            ) : (
              <>
                <PayButton
                  amountPaise={shownTotal}
                  prepare={prepare}
                  onPaid={(result) => {
                    setPaid(result)
                    requestAnimationFrame(() => window.scrollTo({ top: 0 }))
                  }}
                  onPending={setPending}
                  disabled={rows.length === 0 || missing.length > 0}
                />
                <p
                  id={errorId}
                  role="alert"
                  className="text-sm text-destructive empty:hidden"
                >
                  {error}
                </p>
                <FieldDescription className="text-center">
                  UPI, cards or net banking, through Razorpay. Your cart stays
                  here until the payment goes through.
                </FieldDescription>
              </>
            )}
          </aside>
        </div>
      )}
    </PageShell>
  )
}

/** After the money: the order, its receipt, and where to follow it. */
function Thanks({
  paid,
  fulfilment,
}: {
  paid: Paid
  fulfilment: "delivery" | "collection"
}) {
  const next =
    fulfilment === "delivery"
      ? [
          "We pack the books and post them.",
          "WhatsApp brings the courier and the tracking number.",
          "Your order page shows each step, with the receipt.",
        ]
      : [
          "We pack the books at the centre.",
          "WhatsApp tells you when they're ready to collect.",
          "Bring the order reference to DC Bungalow Road.",
        ]
  return (
    <PageShell
      title={
        <>
          <span className="text-foreground">Paid. Thank you.</span>{" "}
          <span className="text-muted-foreground">
            Order <span className="tnum">{paid.reference}</span>.
          </span>
        </>
      }
    >
      <div className="max-w-160 space-y-6">
        <p className="flex items-start gap-3 text-lg text-pretty">
          <IconCircleCheck
            aria-hidden
            className="mbs-1 size-6 shrink-0 text-primary"
            stroke={1.75}
          />
          <span>
            Receipt <span className="tnum">{paid.receiptNumber}</span>. We send
            it on WhatsApp too, and tell you there when your books are on their
            way or ready to collect.
          </span>
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`/account/receipt/${paid.reference}`}>
            <IconReceipt aria-hidden size={18} stroke={1.75} />
            View the receipt
          </ButtonLink>
          <ButtonLink variant="secondary" href="/account">
            Follow your order
          </ButtonLink>
          <ButtonLink variant="ghost" href="/books">
            Keep browsing
          </ButtonLink>
        </div>
        <section aria-labelledby="next-heading" className="pbs-6">
          <h2 id="next-heading" className="text-lg font-semibold">
            What happens next
          </h2>
          <ol className="mbs-4 grid gap-3">
            {next.map((step, i) => (
              <li key={step} className="flex items-baseline gap-4">
                <span className="tnum font-display text-xl font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-pretty">{step}</span>
              </li>
            ))}
          </ol>
        </section>
        <p className="border-t border-border pbs-6 text-muted-foreground">
          While you wait, the{" "}
          <Link href="/resources" className="link">
            free notes and past papers
          </Link>{" "}
          are open to you.
        </p>
      </div>
    </PageShell>
  )
}

/**
 * The bank said yes but Razorpay has not captured it yet. The webhook makes
 * the order; this page is subscribed to the attempt and turns into the
 * thank-you by itself.
 */
function Confirming({
  checkoutId,
  fulfilment,
}: {
  checkoutId: Id<"checkouts">
  fulfilment: "delivery" | "collection"
}) {
  const status = useQuery(api.checkout.checkoutStatus, { checkoutId })
  if (status?.reference && status.receiptNumber)
    return (
      <Thanks
        fulfilment={fulfilment}
        paid={{
          reference: status.reference,
          receiptNumber: status.receiptNumber,
        }}
      />
    )
  return (
    <PageShell
      title={
        <>
          <span className="text-foreground">Confirming your payment.</span>{" "}
          <span className="text-muted-foreground">Don&rsquo;t pay again.</span>
        </>
      }
    >
      <div className="max-w-160 space-y-4">
        <output className="flex items-center gap-3 text-lg">
          <Spinner />
          Your bank approved it. Razorpay usually confirms within a few minutes,
          and this page updates by itself.
        </output>
        <p className="text-muted-foreground">
          You can close it: the order appears in{" "}
          <Link href="/account" className="link">
            your account
          </Link>{" "}
          and we send the receipt on WhatsApp. If money left your account and no
          order appears by tomorrow, call ICT with the time you paid.
        </p>
      </div>
    </PageShell>
  )
}
