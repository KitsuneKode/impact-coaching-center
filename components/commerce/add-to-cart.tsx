"use client"

import { IconCheck, IconShoppingBag } from "@tabler/icons-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-store"
import { cn } from "@/lib/utils"

/**
 * Adds one copy and confirms twice: the label briefly reads "Added" where the
 * eye already is, and a toast offers the cart without taking the page away.
 */
export function AddToCart({
  slug,
  title,
  onOpenCart,
  className,
  size = "md",
}: {
  slug: string
  title: string
  onOpenCart?: () => void
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const add = useCart((state) => state.add)
  const [added, setAdded] = useState(false)

  return (
    <Button
      size={size}
      className={cn("min-w-36", className)}
      onClick={() => {
        add(slug)
        setAdded(true)
        window.setTimeout(() => setAdded(false), 1400)
        toast.success(`${title} added to your cart`, {
          action: onOpenCart
            ? { label: "View cart", onClick: onOpenCart }
            : undefined,
        })
      }}
    >
      {added ? (
        <>
          <IconCheck stroke={2} aria-hidden />
          Added
        </>
      ) : (
        <>
          <IconShoppingBag stroke={1.75} aria-hidden />
          Add to cart
        </>
      )}
    </Button>
  )
}
