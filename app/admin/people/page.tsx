"use client"

import { IconLock, IconUserPlus } from "@tabler/icons-react"
import { useMutation, usePaginatedQuery, useQuery } from "convex/react"
import type { ReactNode } from "react"
import { useState } from "react"

import { convexConfigured } from "@/app/providers"
import { Badge } from "@/components/ui/badge"
import { Button, ButtonLink } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
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
import { Section } from "@/components/ui/section"
import { Skeleton } from "@/components/ui/skeleton"
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
import { formatPhone } from "@/lib/brand"
import { toE164 } from "@/lib/leads"

/**
 * Who may use the admin. Owner only, both to see and to change.
 *
 * Every refusal here comes from `convex/people.ts` and is shown in the words
 * the backend chose, rather than a generic "something went wrong": an owner
 * who cannot demote somebody needs to know it is last-owner protection and
 * not a network blip.
 */
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

function Shell({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <main>
      <Section size="sm">
        <h1 className="type-display">{title}</h1>
        <div className="mt-10">{children}</div>
      </Section>
    </main>
  )
}

export default function AdminPeoplePage() {
  if (!convexConfigured)
    return <Shell title="People">Not available here.</Shell>
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

  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (allowed === undefined || status === "LoadingFirstPage")
    return (
      <Shell title={<span className="text-foreground">People.</span>}>
        <div className="flex flex-col gap-3" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-control" />
          ))}
        </div>
      </Shell>
    )

  if (!allowed)
    return (
      <Shell title={<span className="text-foreground">Owner only.</span>}>
        <Empty className="max-w-160 items-start rounded-card border border-border text-left">
          <EmptyHeader className="max-w-none items-start">
            <EmptyMedia variant="icon">
              <IconLock stroke={1.75} />
            </EmptyMedia>
            <EmptyTitle>Only an owner can manage access</EmptyTitle>
            <EmptyDescription>
              Staff can read the enquiry queue. Granting and revoking access is
              the owner&apos;s alone.
            </EmptyDescription>
          </EmptyHeader>
          <ButtonLink href="/admin/leads" size="md">
            Back to enquiries
          </ButtonLink>
        </Empty>
      </Shell>
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
    const result = await grant({ phone: e164 })
    setBusy(false)
    // The number is never cleared on failure: an owner who mistyped one digit
    // should fix that digit, not retype ten.
    if (!result.ok) {
      setError(REFUSALS[result.reason] ?? "Refused.")
      return
    }
    setPhone("")
  }

  return (
    <Shell title={<span className="text-foreground">People.</span>}>
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
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={error ? true : undefined}
                className="tnum"
              />
            </InputGroup>
            {error ? (
              <FieldError>{error}</FieldError>
            ) : (
              <FieldDescription>
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
        <Table className="min-w-160">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Role</TableHead>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      setError(null)
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
    </Shell>
  )
}
