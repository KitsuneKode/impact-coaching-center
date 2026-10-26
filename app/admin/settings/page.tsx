"use client"

import { IconLock } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import { useState } from "react"
import { toast } from "sonner"

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
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { CATALOG_REFUSALS } from "@/components/admin/catalog-fields"
import { rupeeDraft, rupeesToPaise } from "@/lib/catalog"

/** Shop and business details the owner can change without a developer. */
export default function AdminSettingsPage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="Settings.">
        Not available here.
      </PageShell>
    )
  return <Settings />
}

const FIELD_NAMES: Record<string, string> = {
  shipping: "Shipping charge",
  pickupAddress: "Pickup address",
  legalName: "Business name",
  gstin: "GSTIN",
  receiptPrefix: "Receipt prefix",
  deskPhone: "Order alerts number",
}

function Settings() {
  const settings = useQuery(api.settings.adminSettings)
  if (settings === undefined)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Settings.</span>}
      >
        <ListSkeleton rows={4} />
      </PageShell>
    )
  if (settings === null)
    return (
      <PageShell density="working" title="Owner only.">
        <StatePanel
          icon={<IconLock stroke={1.75} />}
          title="Only the owner changes shop settings"
          description="If you are the owner, log in with your own number."
          action={
            <ButtonLink href="/admin" size="md">
              Back to the overview
            </ButtonLink>
          }
        />
      </PageShell>
    )
  return <SettingsForm key={settings.revision} settings={settings} />
}

function SettingsForm({
  settings,
}: {
  settings: NonNullable<
    ReturnType<typeof useQuery<typeof api.settings.adminSettings>>
  >
}) {
  const save = useMutation(api.settings.saveSettings)
  const [draft, setDraft] = useState({
    shipping: `${settings.shippingPaise / 100}`,
    pickupAddress: settings.pickupAddress,
    legalName: settings.legalName,
    gstin: settings.gstin ?? "",
    receiptPrefix: settings.receiptPrefix,
    deskPhone: settings.deskPhone?.replace(/^\+91/, "") ?? "",
  })
  const [error, setError] = useState<{
    field?: string
    message: string
  } | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (key: keyof typeof draft) => (value: string) =>
    setDraft((d) => ({ ...d, [key]: value }))

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    const shippingPaise = rupeesToPaise(draft.shipping)
    if (shippingPaise === null) {
      setError({ field: "shipping", message: "A charge in rupees, like 60." })
      return
    }
    setBusy(true)
    try {
      const result = await save({
        shippingPaise,
        pickupAddress: draft.pickupAddress,
        legalName: draft.legalName,
        gstin: draft.gstin || undefined,
        receiptPrefix: draft.receiptPrefix,
        deskPhone: draft.deskPhone || undefined,
        expectedRevision: settings.revision,
      })
      if (result.ok) toast.success("Saved")
      else
        setError(
          result.reason === "invalid-input" && result.field
            ? {
                field: result.field,
                message: `Check the ${FIELD_NAMES[result.field]?.toLowerCase() ?? result.field}.`,
              }
            : { message: CATALOG_REFUSALS[result.reason] ?? "Not saved." }
        )
    } catch {
      setError({ message: "Could not reach the server. Try again." })
    } finally {
      setBusy(false)
    }
  }

  const invalid = (field: string) => error?.field === field

  return (
    <PageShell
      density="working"
      title={<span className="text-foreground">Settings.</span>}
    >
      <form onSubmit={onSave} noValidate className="max-w-xl">
        <FieldGroup>
          <Field data-invalid={invalid("shipping") || undefined}>
            <FieldLabel htmlFor="settings-shipping">
              Shipping charge per order (₹)
            </FieldLabel>
            <Input
              id="settings-shipping"
              inputMode="decimal"
              value={draft.shipping}
              onChange={(e) => set("shipping")(rupeeDraft(e.target.value))}
              aria-invalid={invalid("shipping")}
            />
            <FieldDescription>
              Charged once per delivered order. Pickup is free.
            </FieldDescription>
          </Field>
          <Field data-invalid={invalid("pickupAddress") || undefined}>
            <FieldLabel htmlFor="settings-pickup">Pickup address</FieldLabel>
            <Textarea
              id="settings-pickup"
              rows={3}
              value={draft.pickupAddress}
              onChange={(e) => set("pickupAddress")(e.target.value)}
              aria-invalid={invalid("pickupAddress")}
            />
          </Field>
          <Field data-invalid={invalid("legalName") || undefined}>
            <FieldLabel htmlFor="settings-name">
              Business name on receipts
            </FieldLabel>
            <Input
              id="settings-name"
              value={draft.legalName}
              onChange={(e) => set("legalName")(e.target.value)}
              aria-invalid={invalid("legalName")}
            />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field data-invalid={invalid("gstin") || undefined}>
              <FieldLabel htmlFor="settings-gstin">GSTIN</FieldLabel>
              <Input
                id="settings-gstin"
                value={draft.gstin}
                onChange={(e) => set("gstin")(e.target.value.toUpperCase())}
                aria-invalid={invalid("gstin")}
                spellCheck={false}
                autoComplete="off"
              />
            </Field>
            <Field data-invalid={invalid("receiptPrefix") || undefined}>
              <FieldLabel htmlFor="settings-prefix">Receipt prefix</FieldLabel>
              <Input
                id="settings-prefix"
                value={draft.receiptPrefix}
                onChange={(e) =>
                  set("receiptPrefix")(e.target.value.toUpperCase())
                }
                aria-invalid={invalid("receiptPrefix")}
              />
              <FieldDescription>
                Receipts read {draft.receiptPrefix || "ICT"}/26-27/0001.
              </FieldDescription>
            </Field>
          </div>
          <Field data-invalid={invalid("deskPhone") || undefined}>
            <FieldLabel htmlFor="settings-desk">
              Order alerts number{" "}
              <span className="font-normal">(optional)</span>
            </FieldLabel>
            <Input
              id="settings-desk"
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              placeholder="98765 43210"
              value={draft.deskPhone}
              onChange={(e) => set("deskPhone")(e.target.value)}
              aria-invalid={invalid("deskPhone")}
              aria-describedby="settings-desk-hint"
            />
            <FieldDescription id="settings-desk-hint">
              Each paid order is sent here on WhatsApp, with a link to it. Use
              the desk phone, not a personal one. Leave empty for no alerts.
            </FieldDescription>
          </Field>
          {error ? <FieldError>{error.message}</FieldError> : null}
          <div>
            <Button type="submit" size="md" disabled={busy}>
              {busy ? <Spinner /> : null}
              Save settings
            </Button>
          </div>
        </FieldGroup>
      </form>
    </PageShell>
  )
}
