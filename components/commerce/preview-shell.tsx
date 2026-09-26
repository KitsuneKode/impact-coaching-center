"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createContext, useContext, useState, type ReactNode } from "react"

import { CartButton, CartSheet } from "@/components/commerce/cart-sheet"
import { cn } from "@/lib/utils"

const OpenCart = createContext<() => void>(() => {})

/** Opens the cart sheet from anywhere inside the preview. */
export const useOpenCart = () => useContext(OpenCart)

const tabs = [
  { href: "/preview", label: "Overview" },
  { href: "/preview/books", label: "Books" },
  { href: "/preview/resources", label: "Free resources" },
] as const

/**
 * The frame for every /preview page: a plain statement that this is sample
 * content, section tabs, and the cart.
 */
export function PreviewShell({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  const pathname = usePathname()

  return (
    <OpenCart.Provider value={() => setCartOpen(true)}>
      <div className="pt-24 md:pt-28">
        <div className="container-page">
          <p className="rounded-control border border-highlight bg-highlight/20 px-4 py-2.5 text-sm">
            <span className="font-medium">Preview.</span> Sample titles, prices
            and files show how these pages will work. ICT&rsquo;s real books and
            resources replace them before launch.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-border">
            <nav aria-label="Preview sections" className="-mb-px flex gap-1">
              {tabs.map((tab) => {
                const active =
                  tab.href === "/preview"
                    ? pathname === "/preview"
                    : pathname.startsWith(tab.href)
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "border-b-2 px-3 py-2.5 text-sm transition-[color,border-color] duration-150 ease-out",
                      active
                        ? "border-foreground font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </nav>
            <div className="pb-2">
              <CartButton onOpen={() => setCartOpen(true)} />
            </div>
          </div>
        </div>
        {children}
      </div>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </OpenCart.Provider>
  )
}
