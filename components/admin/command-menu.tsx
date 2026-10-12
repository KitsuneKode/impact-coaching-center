"use client"

import { IconLogout } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import {
  COMMERCE_NAV,
  contentNavFor,
  NAV,
  OWNER_NAV,
} from "@/components/admin/nav"
import type { Grant } from "@/lib/grants"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { authClient } from "@/lib/auth-client"

/** ⌘K / Ctrl+K in the admin. */
export function AdminCommandMenu({
  viewer,
}: {
  viewer: { role: "student" | "staff" | "owner"; grants: Grant[] }
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "k" || !(event.metaKey || event.ctrlKey)) return
      // Browsers bind Ctrl+K to the address bar, so this has to claim it.
      event.preventDefault()
      setOpen((previous) => !previous)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  /** Close first, then act. */
  function run(action: () => void) {
    setOpen(false)
    action()
  }

  const destinations = [
    ...NAV,
    ...COMMERCE_NAV,
    ...contentNavFor(viewer),
    ...(viewer.role === "owner" ? OWNER_NAV : []),
  ]

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Admin commands"
      description="Jump to a screen, or sign out."
    >
      {/*
        The `Command` root is the caller's job here:
      */}
      <Command>
        <CommandInput placeholder="Go to a screen…" />
        <CommandList>
          <CommandEmpty>Nothing matched.</CommandEmpty>
          <CommandGroup heading="Go to">
            {destinations.map((item) => (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => run(() => router.push(item.href))}
              >
                <item.icon stroke={1.75} />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Account">
            <CommandItem
              value="Log out"
              onSelect={() =>
                run(async () => {
                  try {
                    await authClient.signOut()
                  } catch {
                    toast.error("Couldn't log you out. Try again.")
                    return
                  }
                  // refresh as well as push: server components above this one
                  // cached a signed-in render.
                  router.push("/")
                  router.refresh()
                })
              }
            >
              <IconLogout stroke={1.75} />
              Log out
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

/** The hint in the admin header, so the shortcut is discoverable at all. */
export function CommandHint() {
  return (
    <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
      <CommandShortcut>⌘K</CommandShortcut>
    </span>
  )
}
