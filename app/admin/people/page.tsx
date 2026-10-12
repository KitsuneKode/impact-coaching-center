"use client"

import { IconLock, IconUserPlus } from "@tabler/icons-react"
import { useMutation, usePaginatedQuery, useQuery } from "convex/react"
import { useState } from "react"

import { convexConfigured } from "@/app/providers"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button, ButtonLink } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { ListSkeleton, PageShell, StatePanel } from "@/components/ui/page-shell"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import { GRANT_LABELS, GRANTS } from "@/lib/grants"
import { formatPhone } from "@/lib/brand"
import { nationalMobileDraft, toE164 } from "@/lib/leads"

/** Who may use the admin. Owner only, both to see and to change. */
const REFUSALS: Record<string, string> = {
  anonymous: "Log in to continue.",
  forbidden:
    "Refused. You are the last owner, or your own access changed while this page was open.",
  "missing-record": "No Person with that number has verified yet.",
  "invalid-input":
    "That number has not verified, or already has access. Check it and try again.",
  "revision-conflict":
    "Somebody else changed this person while this page was open. Reload to see the current state.",
}

export default function AdminPeoplePage() {
  if (!convexConfigured)
    return (
      <PageShell density="working" title="People">
        Not available here.
      </PageShell>
    )
  return <People />
}

function People() {
  const allowed = useQuery(api.people.canManagePeople)
  const {
    results: admins,
    status,
    loadMore,
  } = usePaginatedQuery(api.people.listAdmins, {}, { initialNumItems: 25 })

  const grant = useMutation(api.people.grantStaffByPhone)
  const setRole = useMutation(api.people.setRole)
  const setGrants = useMutation(api.people.setGrants)

  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (allowed === undefined || status === "LoadingFirstPage")
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">People.</span>}
      >
        <ListSkeleton rows={4} />
      </PageShell>
    )

  if (!allowed)
    return (
      <PageShell
        density="working"
        title={<span className="text-foreground">Owner only.</span>}
      >
        <StatePanel
          icon={<IconLock stroke={1.75} />}
          title="Only an owner can manage access"
          description="Staff can read the enquiry queue. Granting and revoking access is the owner's alone."
          action={
            <ButtonLink href="/admin/leads" size="md">
              {" "}
              Back to enquiries{" "}
            </ButtonLink>
          }
        />
      </PageShell>
    )

  async function onGrant(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    const e164 = toE164(phone)
    if (!e164) {
      setError("Enter a valid Indian mobile number.")
      return
    }
    setBusy(true)
    let result: Awaited<ReturnType<typeof grant>>
    try {
      result = await grant({ phone: e164 })
    } catch {
      setError("Could not reach the server. Try again.")
      return
    } finally {
      setBusy(false)
    }
    // The number is never cleared on failure: an owner who mistyped one digit
    // should fix that digit, not retype ten.
    if (!result.ok) {
      setError(REFUSALS[result.reason] ?? "Refused.")
      return
    }
    setPhone("")
  }

  return (
    <PageShell
      density="working"
      title={<span className="text-foreground">People.</span>}
    >
      <form onSubmit={onGrant} noValidate className="max-w-112">
        <FieldGroup>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="grant-phone">Give staff access</FieldLabel>
            <InputGroup>
              <InputGroupAddon className="pl-3.5">
                <InputGroupText className="tnum border-r border-border pr-3 text-[0.9375rem] text-foreground">
                  +91
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="grant-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(nationalMobileDraft(e.target.value))}
                aria-invalid={error ? true : undefined}
                aria-describedby={
                  error ? "grant-phone-error" : "grant-phone-hint"
                }
                className="tnum"
              />
            </InputGroup>
            {error ? (
              <FieldError id="grant-phone-error">{error}</FieldError>
            ) : (
              <FieldDescription id="grant-phone-hint">
                They must already have verified this number. Access is never
                created on somebody&apos;s behalf.
              </FieldDescription>
            )}
          </Field>
          <Field>
            <Button type="submit" size="md" disabled={busy}>
              {busy ? <Spinner /> : <IconUserPlus stroke={1.75} />}
              Give access
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <div className="mt-12 overflow-x-auto">
        <Table className="min-w-200">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Areas</TableHead>
              <TableHead>Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((person) => (
              <TableRow key={person.id}>
                <TableCell>
                  {person.name || (
                    <span className="text-muted-foreground">Not given</span>
                  )}
                </TableCell>
                <TableCell className="tnum">
                  {formatPhone(person.phone)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={person.role === "owner" ? "solid" : "neutral"}
                  >
                    {person.role === "owner" ? "Owner" : "Staff"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {person.role === "owner" ? (
                    <span className="text-sm text-muted-foreground">
                      Everything
                    </span>
                  ) : (
                    <div className="grid gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Enquiries and orders, plus:
                      </span>
                      {GRANTS.map((grant) => (
                        <label
                          key={grant}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={person.grants.includes(grant)}
                            onCheckedChange={async (on) => {
                              setError(null)
                              const grants = on
                                ? [...person.grants, grant]
                                : person.grants.filter((g) => g !== grant)
                              try {
                                const result = await setGrants({
                                  personId: person.id as never,
                                  grants,
                                  expectedRevision: person.revision,
                                })
                                if (!result.ok)
                                  setError(
                                    REFUSALS[result.reason] ?? "Refused."
                                  )
                              } catch {
                                setError(
                                  "Could not reach the server. Try again."
                                )
                              }
                            }}
                          />
                          {GRANT_LABELS[grant]}
                        </label>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      setError(null)
                      try {
                        const result = await setRole({
                          personId: person.id as never,
                          role: "student",
                          // The revision the row was read at. If somebody else
                          // changed this person meanwhile, the mutation refuses
                          // rather than overwriting their change.
                          expectedRevision: person.revision,
                        })
                        if (!result.ok)
                          setError(REFUSALS[result.reason] ?? "Refused.")
                      } catch {
                        setError("Could not reach the server. Try again.")
                      }
                    }}
                  >
                    Remove access
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <div className="mt-6">
          <Button
            variant="secondary"
            size="md"
            disabled={status === "LoadingMore"}
            onClick={() => loadMore(25)}
          >
            {status === "LoadingMore" ? <Spinner /> : null}
            Load more
          </Button>
        </div>
      ) : null}
    </PageShell>
  )
}
