import type { Metadata } from "next"

import { BookCard } from "@/components/commerce/book-card"
import { Section } from "@/components/ui/section"
import { previewBooks } from "@/lib/preview-catalogue"

export const metadata: Metadata = { title: "Books" }

export default function PreviewBooks() {
  return (
    <Section size="sm" className="pt-10 md:pt-12">
      <h1 className="type-display-sm">Books by ICT faculty.</h1>
      <p className="type-lede mt-3 max-w-160 text-muted-foreground">
        Delivered anywhere in India, or collect from the centre.
      </p>
      <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {previewBooks.map((book) => (
          <li key={book.slug}>
            <BookCard book={book} />
          </li>
        ))}
      </ul>
    </Section>
  )
}
