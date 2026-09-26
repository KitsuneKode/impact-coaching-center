"use client"

import { IconEye } from "@tabler/icons-react"
import { toast } from "sonner"

import { AddToCart } from "@/components/commerce/add-to-cart"
import { useOpenCart } from "@/components/commerce/preview-shell"
import { Button } from "@/components/ui/button"

/** Add to cart and read a sample, side by side on a book page. */
export function BookActions({ slug, title }: { slug: string; title: string }) {
  const openCart = useOpenCart()
  return (
    <div className="flex flex-wrap gap-3">
      <AddToCart slug={slug} title={title} onOpenCart={openCart} size="lg" />
      <Button
        variant="secondary"
        size="lg"
        onClick={() =>
          toast("Sample pages", {
            description:
              "The page-turning sample reader is shown from the Kitsu-Lab demo.",
          })
        }
      >
        <IconEye stroke={1.75} />
        Read a sample
      </Button>
    </div>
  )
}
