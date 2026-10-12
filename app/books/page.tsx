import {
  IconBook,
  IconBooks,
  IconBuildingStore,
  IconTruckDelivery,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { Suspense } from "react"

import { BookGrid } from "@/components/commerce/book-grid"
import { CatalogSkeleton } from "@/components/commerce/catalog-skeleton"
import { SampleNotice, ShopCartButton } from "@/components/commerce/shop-shell"
import { StatePanel } from "@/components/ui/page-shell"
import { Section } from "@/components/ui/section"
import { onlySamples, publishedBooks } from "@/lib/catalog-server"

export async function generateMetadata(): Promise<Metadata> {
  const books = await publishedBooks()
  return {
    title: "Books",
    description:
      "Study books from Impact Career Tutorials, delivered to your door or collected from the centre in North Lakhimpur.",
    alternates: { canonical: "/books" },
    ...(onlySamples(books) ? { robots: { index: false, follow: false } } : {}),
  }
}

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

export default async function BooksPage() {
  const books = await publishedBooks()

  return (
    <Section size="sm" className="pt-10 md:pt-12">
      {books.length && onlySamples(books) ? (
        <div className="mb-8">
          <SampleNotice>
            These titles and prices show how the shop works. ICT&rsquo;s own
            books replace them before launch.
          </SampleNotice>
        </div>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-5">
          <h1 className="type-display max-w-[20ch]">
            Books for the exams we teach.
          </h1>
          <div>
            <ShopCartButton />
          </div>
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
      {books.length ? (
        /* The filter reads the URL; this keeps the rest of the page static. */
        <Suspense fallback={<CatalogSkeleton kind="books" />}>
          <BookGrid books={books} />
        </Suspense>
      ) : (
        <StatePanel
          className="mt-10"
          icon={<IconBooks stroke={1.75} />}
          title="No books yet"
          description="New titles appear here as soon as they are published."
        />
      )}
    </Section>
  )
}
