import type { MetadataRoute } from "next"

import { listedCourseIds } from "@/lib/brand"
import { catalogue } from "@/lib/catalogue"
import { siteUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const courses = catalogue
    .filter((course) => listedCourseIds.includes(course.id))
    .map((course) => ({
      url: `${siteUrl}/courses/${course.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/courses`, changeFrequency: "weekly", priority: 0.9 },
    ...courses,
  ]
}
