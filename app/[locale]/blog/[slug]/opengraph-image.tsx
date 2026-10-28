import { publishedPost } from "@/lib/catalog-server"
import { OG_SIZE, ogCard } from "@/lib/og/card"

/* A post's share card on WhatsApp and search: its title on ICT's blue. */
export const revalidate = 3600
export const size = OG_SIZE
export const contentType = "image/png"
export const alt = "A post from the Impact Career Tutorials blog"

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await params
  const post = await publishedPost(slug)
  // Assamese posts link the photo card instead (lib/og/card.tsx says why).
  const latin = post && post.language !== "as"
  return ogCard({
    eyebrow: "The ICT blog",
    title: latin ? post.title : "Impact Career Tutorials",
    footer: "Impact Career Tutorials · North Lakhimpur, Assam",
  })
}
