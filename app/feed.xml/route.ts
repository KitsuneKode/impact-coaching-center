import { brand } from "@/lib/brand"
import { publishedPosts } from "@/lib/catalog-server"
import { localePath, siteUrl } from "@/lib/site"

/* Rebuilt on the blog's beat; posts change a few times a month. */
export const revalidate = 3600

const escape = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")

/**
 * The blog as RSS 2.0: every published post, newest first, each at its
 * own language's address, so feed readers and aggregators pick posts up
 * without a visit.
 */
export async function GET() {
  const posts = await publishedPosts()
  const items = posts
    .map((post) => {
      const url = `${siteUrl}${localePath(`/blog/${post.slug}`, post.language)}`
      const date = new Date(post.publishedAt ?? post.updatedAt).toUTCString()
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${escape(post.excerpt)}</description>${post.exam ? `\n      <category>${escape(post.exam)}</category>` : ""}
    </item>`
    })
    .join("\n")
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(brand.legalName)} blog</title>
    <link>${siteUrl}/blog</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Exam notes, syllabus guides and news for APSC, ADRE, Assam Police, banking, SSC and railway exams, from ${escape(brand.legalName)}, North Lakhimpur.</description>
    <language>en-IN</language>
${items}
  </channel>
</rss>
`
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}
