import type { MetadataRoute } from "next"

import {
  onlySamples,
  publishedBundles,
  publishedPosts,
  publishedResources,
} from "@/lib/catalog-server"
import { liveCourses } from "@/lib/courses-server"
import { exams } from "@/lib/exams"
import { libraryApproved } from "@/lib/library"
import { policies } from "@/lib/policies"
import { localePath, siteUrl } from "@/lib/site"

type Entry = MetadataRoute.Sitemap[number]

/**
 * One public path in both languages, each pointing at the other, so search
 * engines serve the English or Assamese page to the right reader.
 */
function bothLanguages(entry: Entry): Entry[] {
  const path = entry.url.slice(siteUrl.length) || "/"
  const url = (locale: string) => {
    const p = localePath(path, locale)
    return p === "/" ? siteUrl : `${siteUrl}${p}`
  }
  const languages = { "en-IN": url("en"), "as-IN": url("as") }
  return ["en", "as"].map((locale) => ({
    ...entry,
    url: url(locale),
    alternates: { languages },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* Convex may be absent at build time; the static list still ships. */
  const posts = await publishedPosts().catch(() => [])
  // The shop and notes pages are noindex while they hold only samples, so
  // they join the sitemap with the first real set or note.
  const bundles = await publishedBundles().catch(() => [])
  const resources = await publishedResources().catch(() => [])
  const realSets = bundles.filter((bundle) => !bundle.sample)
  const courses = (await liveCourses().catch(() => []))
    .filter((course) => course.track)
    .map((course) => ({
      url: `${siteUrl}/courses/${course.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  const entries: Entry[] = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/courses`, changeFrequency: "weekly", priority: 0.9 },
    // /success-stories sets its own canonical but was missing here, so
    // nothing pointed crawlers at it.
    {
      url: `${siteUrl}/success-stories`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${siteUrl}/exams`, changeFrequency: "monthly", priority: 0.7 },
    {
      url: `${siteUrl}/exams/calendar`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...exams.map((exam) => ({
      url: `${siteUrl}/exams/${exam.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${siteUrl}/assist`, changeFrequency: "monthly", priority: 0.5 },
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
    ...(realSets.length
      ? [
          {
            url: `${siteUrl}/books`,
            changeFrequency: "weekly" as const,
            priority: 0.8,
          },
          ...realSets.map((bundle) => ({
            url: `${siteUrl}/books/${bundle.slug}`,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          })),
        ]
      : []),
    ...(resources.length && !onlySamples(resources)
      ? [
          {
            url: `${siteUrl}/resources`,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          },
        ]
      : []),
  ]
  return entries.flatMap(bothLanguages)
}
