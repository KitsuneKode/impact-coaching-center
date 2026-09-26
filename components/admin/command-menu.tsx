"use client"

import { IconLogout } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { COMMERCE_NAV, NAV, OWNER_NAV } from "@/components/admin/nav"
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

/**
 * ⌘K / Ctrl+K in the admin.
 *
 * Staff live in these screens for hours; reaching for a mouse to change page
 * is the kind of friction that only shows up after the fiftieth time. The
 * destinations come from components/admin/nav.ts, the same list the sidebar
 * renders, so the palette cannot offer a page the menu does not - or miss one
 * it does.
 *
 * Deliberately navigation and account actions only. It does NOT search
 * enquiries yet, because searching leads needs a Convex query with its own
 * index and permission check, and a palette that looks like it searches but
 * quietly only matches menu labels is worse than one that does not pretend.
 * When that query exists, it becomes another CommandGroup here.
 *
 * Owner-only entries are omitted for staff rather than shown disabled - the
 * same rule the sidebar follows. This is chrome, not a gate: convex/authz.ts
 * refuses a non-owner regardless of what this renders.
 */
export function AdminCommandMenu({ isOwner }: { isOwner: boolean }) {
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

  /**
   * Close first, then act.
   *
   * Navigating with the dialog still mounted leaves it over the page it just
   * moved to, and the focus trap keeps the new page unreachable by keyboard -
   * which is exactly the audience this exists for.
   */
  function run(action: () => void) {
    setOpen(false)
    action()
  }

  const destinations = isOwner
    ? [...NAV, ...COMMERCE_NAV, ...OWNER_NAV]
    : [...NAV, ...COMMERCE_NAV]

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Admin commands"
      description="Jump to a screen, or sign out."
    >
      {/*
       * The `Command` root is the caller's job here: this project's
       * `CommandDialog` puts `children` straight into `DialogContent` without
       * one, so the parts below would look up cmdk's store, find nothing, and
       * throw "Cannot read properties of undefined (reading 'subscribe')" the
       * first time anyone pressed the shortcut. Observed, then fixed.
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
                  await authClient.signOut()
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
