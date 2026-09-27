import type { MetadataRoute } from "next"

import { listedCourseIds } from "@/lib/brand"
import { publishedPosts } from "@/lib/catalog-server"
import { catalogue } from "@/lib/catalogue"
import { libraryApproved } from "@/lib/library"
import { policies } from "@/lib/policies"
import { siteUrl } from "@/lib/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* Convex may be absent at build time; the static list still ships. */
  const posts = await publishedPosts().catch(() => [])
  const courses = catalogue
    .filter((course) => listedCourseIds.has(course.id))
    .map((course) => ({
      url: `${siteUrl}/courses/${course.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/courses`, changeFrequency: "weekly", priority: 0.9 },
    // /success-stories sets its own canonical but was missing here, so
    // nothing pointed crawlers at it.
    {
      url: `${siteUrl}/success-stories`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.6 },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.6 },
    // Only documents ICT has signed off. An unapproved policy is also
    // noindex, so listing it here would ask crawlers to fetch a page that
    // tells them to go away.
    ...policies
      .filter((policy) => policy.approved)
      .map((policy) => ({
        url: `${siteUrl}/${policy.slug}`,
        changeFrequency: "yearly" as const,
        priority: 0.3,
      })),
    ...(libraryApproved
      ? [
          {
            url: `${siteUrl}/library`,
            changeFrequency: "monthly" as const,
            priority: 0.6,
          },
        ]
      : []),
    ...courses,
  ]
}
