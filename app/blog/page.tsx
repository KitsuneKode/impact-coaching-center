import { IconNews } from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"

import { StatePanel } from "@/components/ui/page-shell"
import { Section } from "@/components/ui/section"
import { publishedPosts } from "@/lib/catalog-server"
import { openGraphFor } from "@/lib/site"

const title = "Blog"
const description =
  "Notes, updates and study pieces from Impact Career Tutorials, North Lakhimpur."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: openGraphFor("/blog", title, description),
}

function readableDate(at: number) {
  return new Date(at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
}

export default async function BlogPage() {
  const posts = await publishedPosts()

  return (
    <Section size="sm" className="pt-26 md:pt-30">
      <div className="grid gap-5">
        <h1 className="type-display max-w-[20ch]">Notes and updates.</h1>
        <p className="type-lede max-w-160 text-muted-foreground">
          Written at the centre, about the exams we teach.
        </p>
      </div>

      {posts.length === 0 ? (
        <StatePanel
          className="mt-14"
          icon={<IconNews stroke={1.75} />}
          title="No posts yet"
          description="When ICT publishes something, it appears here."
        />
      ) : (
        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col gap-3 rounded-card border border-border bg-card p-6 shadow-frame transition-shadow hover:shadow-lift"
              >
                {post.publishedAt ? (
                  <time
                    dateTime={new Date(post.publishedAt).toISOString()}
                    className="text-xs text-muted-foreground"
                  >
                    {readableDate(post.publishedAt)}
                  </time>
                ) : null}
                <span className="text-lg leading-snug font-medium text-foreground underline-offset-4 group-hover:underline">
                  {post.title}
                </span>
                {post.excerpt ? (
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
