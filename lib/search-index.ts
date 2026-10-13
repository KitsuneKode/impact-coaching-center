import { getTranslations } from "next-intl/server"

import { contentFor } from "@/i18n/content-server"
import { inLanguage, type Language } from "@/lib/catalog"
import {
  publishedBundles,
  publishedPosts,
  publishedResources,
} from "@/lib/catalog-server"
import { inr } from "@/lib/courses"
import { liveCourses } from "@/lib/courses-server"
import { exams, pick } from "@/lib/exams"

/** One thing the site search can find. */
export type SearchItem = {
  kind: "course" | "set" | "notes" | "exam" | "post" | "page"
  title: string
  /** A short second line: the exam, a price, a page count. */
  detail: string
  /** Locale-free path; the client adds the language prefix. */
  href: string
  /** Extra words that should find it: English names on Assamese pages, exam names, slugs. */
  keywords: string[]
}

/**
 * Everything worth finding, in one language, small enough to search in the
 * browser as the visitor types (a few dozen to a few hundred rows). Built on
 * the server from the same sources the pages read.
 */
export async function buildSearchIndex(
  locale: Language
): Promise<SearchItem[]> {
  const [courses, bundles, resources, posts] = await Promise.all([
    liveCourses(),
    publishedBundles().catch(() => []),
    publishedResources().catch(() => []),
    publishedPosts().catch(() => []),
  ])
  const content = await contentFor(locale)
  const t = await getTranslations({ locale, namespace: "Pulse" })
  const nav = await getTranslations({ locale, namespace: "Nav" })
  const shop = await getTranslations({ locale, namespace: "Shop" })

  const items: SearchItem[] = []

  for (const course of courses) {
    if (!course.track) continue
    items.push({
      kind: "course",
      title: course.short,
      detail: [
        content.phrase(course.track),
        course.free ? t("free") : inr(course.price),
      ].join(" · "),
      href: `/courses/${course.slug}`,
      keywords: [
        course.name,
        course.track,
        course.subtitle,
        ...course.tags,
      ].filter(Boolean),
    })
  }

  for (const bundle of bundles) {
    if (bundle.sample) continue
    items.push({
      kind: "set",
      title: inLanguage(bundle.title, locale),
      detail: [
        content.phrase(bundle.exam),
        shop("booksInSet", { count: bundle.books.length }),
      ].join(" · "),
      href: `/books/${bundle.slug}`,
      keywords: [
        bundle.title.en,
        bundle.exam,
        ...bundle.books.flatMap((book) =>
          [book.editions.en?.title, book.editions.as?.title].filter(
            (title): title is string => Boolean(title)
          )
        ),
      ],
    })
  }

  for (const resource of resources) {
    items.push({
      kind: "notes",
      title: resource.title,
      detail: [
        content.phrase(resource.kind),
        content.phrase(resource.exam),
      ].join(" · "),
      href: `/resources?open=${resource.slug}`,
      keywords: [resource.kind, resource.exam, resource.description],
    })
  }

  for (const exam of exams) {
    items.push({
      kind: "exam",
      title: pick(exam.name, locale),
      detail: pick(exam.body, locale),
      href: `/exams/${exam.slug}`,
      keywords: [exam.name.en, exam.slug, pick(exam.summary, locale)],
    })
  }

  for (const post of posts) {
    items.push({
      kind: "post",
      title: post.title,
      detail: post.excerpt.slice(0, 90),
      href: `/blog/${post.slug}`,
      keywords: [],
    })
  }

  const pages: [string, string, string[]][] = [
    ["/courses", nav("courses"), ["fees", "batches", "admission"]],
    ["/books", nav("books"), ["shop", "buy"]],
    ["/resources", nav("notes"), ["free", "pdf", "papers"]],
    ["/exams", nav("exams"), ["syllabus", "pattern"]],
    ["/exams/calendar", t("searchCalendar"), ["dates", "calendar"]],
    ["/success-stories", nav("results"), ["selections", "toppers"]],
    ["/library", nav("library"), ["study room", "seat", "wifi"]],
    ["/assist", nav("assist"), ["scholarship"]],
    ["/contact", nav("contact"), ["phone", "address", "whatsapp", "location"]],
    ["/blog", nav("blog"), ["articles", "updates"]],
  ]
  for (const [href, title, keywords] of pages)
    items.push({ kind: "page", title, detail: "", href, keywords })

  return items
}
