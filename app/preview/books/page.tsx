import {
  IconBook,
  IconBuildingStore,
  IconTruckDelivery,
} from "@tabler/icons-react"
import type { Metadata } from "next"

import { BookGrid } from "@/components/commerce/book-grid"
import { Section } from "@/components/ui/section"

export const metadata: Metadata = { title: "Books" }

const promises = [
  { icon: IconBook, text: "Read sample pages before you buy" },
  {
    icon: IconTruckDelivery,
    text: "Delivered to your door, one charge per order",
  },
  {
    icon: IconBuildingStore,
    text: "Or collect from the centre on DC Bungalow Road",
  },
] as const

export default function PreviewBooks() {
  return (
    <Section size="sm" className="pt-10 md:pt-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className="type-display max-w-[20ch]">
            Books written by the faculty who teach them.
          </h1>
        </div>
        <ul className="grid gap-2.5 text-sm text-muted-foreground">
          {promises.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5">
              <Icon
                stroke={1.5}
                className="size-[18px] text-foreground"
                aria-hidden
              />
              {text}
            </li>
          ))}
        </ul>
      </div>
      <BookGrid />
    </Section>
  )
}
