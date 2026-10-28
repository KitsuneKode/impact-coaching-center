import { getTranslations } from "next-intl/server"

import { contentFor } from "@/i18n/content-server"
import { inLanguage, type Language, lowestPrice } from "@/lib/catalog"
import {
  publishedBundles,
  publishedPosts,
  publishedResources,
} from "@/lib/catalog-server"
import { inr } from "@/lib/courses"
import { liveCourses } from "@/lib/courses-server"
import { exams, pick } from "@/lib/exams"
import { formatPaise } from "@/lib/money"

/** One thing the site search can find. */
export type SearchItem = {
  kind: "course" | "set" | "book" | "notes" | "exam" | "post" | "page"
  title: string
  /** A short second line: the exam, a price, a page count. */
  detail: string
  /** Locale-free path; the client adds the language prefix. */
  href: string
  /** Extra words that should find it: English names on Assamese pages, exam names, slugs. */
  keywords: string[]
}

/**
 * Other ways people type an exam: Assamese spellings, full names, the
 * words students actually use. Added to anything filed under that exam.
 */
const EXAM_ALIASES: Record<string, string[]> = {
  apsc: ["এপিএছচি", "এ পি এছ চি", "cce", "civil services", "অসম লোকসেৱা আয়োগ"],
  adre: ["এডিআৰই", "এ ডি আৰ ই", "grade 3", "grade 4", "direct recruitment"],
  police: ["আৰক্ষী", "পুলিচ", "si", "constable", "slprb"],
  banking: ["বেংক", "ssc", "railway", "ৰেলৱে", "ibps", "sbi", "po", "clerk"],
}
function aliasesFor(...words: (string | undefined)[]) {
  const text = words.join(" ").toLowerCase()
  return Object.entries(EXAM_ALIASES).flatMap(([key, aliases]) =>
    text.includes(key) ? aliases : []
  )
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
        ...aliasesFor(course.track, course.name),
      ].filter(Boolean),
    })
  }

  /*
   * Sets as the books page shows them, placeholders included (their detail
   * says so), and each book on its own line pointing at the set that holds
   * it, so "which set has Polity?" is one search. The index follows the
   * catalogue: an admin save refreshes the "catalog" tag this reads under.
   */
  for (const bundle of bundles) {
    const setTitle = inLanguage(bundle.title, locale)
    const from = lowestPrice(bundle)
    const price = bundle.sample
      ? shop("sampleLabel")
      : from === null
        ? shop("notAvailable")
        : shop("fromPrice", { price: formatPaise(from) })
    for (const book of bundle.books) {
      const edition =
        book.editions[locale] ?? book.editions.en ?? book.editions.as
      if (!edition) continue
      items.push({
        kind: "book",
        title: edition.title,
        detail: [shop("inSet", { set: setTitle }), price].join(" · "),
        href: `/books/${bundle.slug}`,
        keywords: [
          book.editions.en?.title,
          book.editions.as?.title,
          edition.subtitle,
          book.exam,
          ...aliasesFor(book.exam),
        ].filter((word): word is string => Boolean(word)),
      })
    }
    items.push({
      kind: "set",
      title: setTitle,
      detail: [
        content.phrase(bundle.exam),
        shop("booksInSet", { count: bundle.books.length }),
        price,
      ].join(" · "),
      href: `/books/${bundle.slug}`,
      keywords: [
        bundle.title.en,
        bundle.exam,
        ...aliasesFor(bundle.exam),
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
      href: `/resources/${resource.slug}`,
      keywords: [
        resource.kind,
        resource.exam,
        resource.description,
        ...aliasesFor(resource.exam),
      ],
    })
  }

  for (const exam of exams) {
    items.push({
      kind: "exam",
      title: pick(exam.name, locale),
      detail: pick(exam.body, locale),
      href: `/exams/${exam.slug}`,
      keywords: [
        exam.name.en,
        exam.slug,
        pick(exam.summary, locale),
        ...aliasesFor(exam.slug, exam.name.en),
      ],
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
    ["/teachers", nav("teachersPage"), ["faculty", "sir", "ma'am", "teacher"]],
    ["/assist", nav("assist"), ["scholarship"]],
    ["/contact", nav("contact"), ["phone", "address", "whatsapp", "location"]],
    ["/blog", nav("blog"), ["articles", "updates"]],
  ]
  for (const [href, title, keywords] of pages)
    items.push({ kind: "page", title, detail: "", href, keywords })

  return items
}
