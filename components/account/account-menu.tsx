"use client"

import { IconInbox, IconLogout } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { convexConfigured } from "@/app/providers"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import { authClient } from "@/lib/auth-client"
import { formatPhone } from "@/lib/brand"

/**
 * Who you are, and the way out.
 *
 * The site could sign a person in and then show them no evidence of it and no
 * way to leave - the header had no session awareness at all, and /sign-in was
 * not reachable from anywhere in the chrome. This is the missing half of the
 * log-in flow rather than an embellishment.
 *
 * Guarded on `convexConfigured` for the same reason /admin/leads is: this
 * renders in the root layout on every page, and `useQuery` throws without a
 * provider, which would take down a marketing site over a missing variable.
 */
export function AccountMenu({ className }: { className?: string }) {
  if (!convexConfigured) return null
  return <Menu className={className} />
}

/** The two letters we can honestly show when nobody has given a name yet. */
function initials(name: string, phone: string) {
  const trimmed = name.trim()
  if (!trimmed) return phone.slice(-2)
  const parts = trimmed.split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

function Menu({ className }: { className?: string }) {
  const viewer = useQuery(api.auth.getCurrentPerson)
  const router = useRouter()
  const [leaving, setLeaving] = useState(false)

  // `undefined` is "still asking", `null` is "asked, nobody is signed in".
  // Collapsing the two would flash a Log in link at someone who is already
  // signed in, on every page load.
  if (viewer === undefined) return null

  if (viewer === null)
    return (
      <Link
        href="/sign-in"
        className={`rounded-control px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ${className ?? ""}`}
      >
        Log in
      </Link>
    )

  const label = viewer.name.trim() || formatPhone(viewer.phone)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account: ${label}`}
        className={`inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className ?? ""}`}
      >
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">
            {initials(viewer.name, viewer.phone)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>
          <span className="block truncate">{label}</span>
          {/*
           * The number is shown under the name rather than instead of it,
           * because a Person is keyed by their mobile number (ADR-0001) and
           * staff on a shared handset need to see which account they are in.
           */}
          <span className="tnum block text-xs font-normal text-muted-foreground">
            {formatPhone(viewer.phone)}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {viewer.role === "staff" || viewer.role === "owner" ? (
            <DropdownMenuItem render={<Link href="/admin/leads" />}>
              <IconInbox stroke={1.75} />
              Enquiries
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            disabled={leaving}
            onClick={async () => {
              setLeaving(true)
              await authClient.signOut()
              // `refresh` as well as `push`: the server components above this
              // one cached a signed-in render, and leaving them in place shows
              // a logged-out person their own name.
              router.push("/")
              router.refresh()
            }}
          >
            {leaving ? <Spinner /> : <IconLogout stroke={1.75} />}
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
