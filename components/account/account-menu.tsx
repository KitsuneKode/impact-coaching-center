"use client"

import { useTranslations } from "next-intl"
import {
  IconInbox,
  IconLogout,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

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
import { Skeleton } from "@/components/ui/skeleton"
import { useStalled } from "@/components/ui/use-stalled"
import { authClient } from "@/lib/auth-client"
import { formatPhone } from "@/lib/brand"
import { resetAnalytics } from "@/lib/analytics"
import { initials } from "@/lib/person"
import { useViewer } from "@/hooks/use-viewer"

type Props = {
  className?: string
  /** "icon" in the header: a person icon to log in, the same size as the
   *  avatar that replaces it. "text" in the phone menu's dock. */
  variant?: "icon" | "text"
}

/** Who you are, and the way out. */
export function AccountMenu(props: Props) {
  if (!convexConfigured) return null
  return <Menu {...props} />
}

function Menu({ className, variant = "text" }: Props) {
  const t = useTranslations("Account")
  const viewer = useViewer()
  const router = useRouter()
  const [leaving, setLeaving] = useState(false)
  // A session check that never answers must not hide the way in.
  const stalled = useStalled(viewer === undefined, 3000)

  /*
   * `undefined` is "still asking", `null` is "asked, nobody is signed in".
   * Collapsing the two would flash a Log in link at someone who is already
   * signed in, on every page load.
   */
  if (viewer === undefined && !stalled)
    return (
      // As wide as what replaces it, so nothing shifts when it arrives.
      <Skeleton
        aria-hidden="true"
        className={`shrink-0 rounded-full ${variant === "icon" ? "size-10" : "h-9 w-16"} ${className ?? ""}`}
      />
    )

  if (!viewer && variant === "icon")
    return (
      <Link
        href="/login"
        aria-label={t("login")}
        title={t("login")}
        data-site-account
        data-arrive
        data-press
        className={className}
      >
        <IconUserCircle aria-hidden size={21} stroke={1.6} />
      </Link>
    )

  if (!viewer)
    return (
      <Link
        href="/login"
        className={`rounded-control px-3 py-1.5 text-sm whitespace-nowrap text-[color-mix(in_oklch,currentColor_80%,transparent)] transition-[background-color] hover:bg-secondary hover:text-foreground ${className ?? ""}`}
      >
        {t("login")}
      </Link>
    )

  const name = viewer.name.trim()
  const phone = formatPhone(viewer.phone)
  const mark = initials(name)
  /*
   * The number stands in for the name only when there is no name. It used to do
   * both at once:
   */
  const label = name || phone

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("account", { name: label })}
        data-arrive
        className={`relative inline-flex size-10 items-center justify-center rounded-full transition-colors after:absolute after:-inset-0.5 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className ?? ""}`}
      >
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">
            {mark ?? <IconUser stroke={1.75} className="size-4" />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {/*
          One group, labelled by who you are.
        */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate">{label}</span>
            {/*
              The number sits under the name: staff on a shared handset need to
              see which account is signed in.
            */}
            {name ? (
              <span className="tnum block text-xs font-normal text-muted-foreground">
                {phone}
              </span>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/account" />}>
            <IconUserCircle stroke={1.75} />
            {t("details")}
          </DropdownMenuItem>
          {viewer.role === "staff" || viewer.role === "owner" ? (
            <DropdownMenuItem render={<Link href="/admin/leads" />}>
              <IconInbox stroke={1.75} />
              {t("enquiries")}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            disabled={leaving}
            onClick={async () => {
              setLeaving(true)
              try {
                resetAnalytics()
                await authClient.signOut()
              } catch {
                setLeaving(false)
                toast.error(t("logoutFailed"))
                return
              }
              // `refresh` as well as `push`: the server components above this
              // one cached a signed-in render, and leaving them in place shows
              // a logged-out person their own name.
              router.push("/")
              router.refresh()
            }}
          >
            {leaving ? <Spinner /> : <IconLogout stroke={1.75} />}
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
