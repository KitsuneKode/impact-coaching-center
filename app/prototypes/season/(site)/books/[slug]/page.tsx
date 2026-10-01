import type { Metadata } from "next"

import { publishedBook } from "@/app/prototypes/_catalog"

import { KitBook } from "../../../../_kit/book"
import { base } from "../../../_site"

export async function generateMetadata({
  params,
}: PageProps<"/prototypes/season/books/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const book = await publishedBook(slug).catch(() => null)
  return { title: book ? book.title : "Book" }
}

export default async function Page({
  params,
}: PageProps<"/prototypes/season/books/[slug]">) {
  const { slug } = await params
  return <KitBook base={base} slug={slug} />
}
