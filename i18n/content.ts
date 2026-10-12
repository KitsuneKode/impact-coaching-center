import { useTranslations } from "next-intl"

import {
  faculty,
  faqs,
  included,
  joining,
  place,
  proof,
  tracks,
  type FacultySlug,
} from "@/lib/brand"

/**
 * ICT's content lists in the reader's language. English lives once, in
 * lib/brand.ts; messages/as.json carries the Assamese under "Content". A list
 * missing from the Assamese file falls back to English whole, never half.
 * Works in server and client components alike.
 */
export function useContent() {
  return buildContent(useTranslations("Content"))
}

type ContentTranslator = ReturnType<typeof useTranslations<"Content">>

/** Shared by the hook above and `contentFor` in content-server.ts. */
export function buildContent(t: ContentTranslator) {
  const phrases = t.has("phrases")
    ? (t.raw("phrases") as readonly { en: string; as: string }[])
    : []
  function pick<T>(key: string, fallback: T): T {
    return t.has(key) ? (t.raw(key) as T) : fallback
  }
  return {
    faqs: pick<readonly { q: string; a: string }[]>("faqs", faqs),
    included: pick<readonly string[]>(
      "included",
      included.map((item) => item.text)
    ),
    joining: pick<readonly { verb: string; body: string }[]>(
      "joining",
      joining
    ),
    proof: pick<readonly string[]>(
      "proof",
      proof.map((item) => item.label)
    ),
    place: t.has("place") ? t("place") : place.spoken,
    /** A track's names in the reader's language. */
    track(slug: (typeof tracks)[number]["slug"]) {
      const base = tracks.find((track) => track.slug === slug)!
      const key = `tracks.${slug}`
      return {
        exam: t.has(`${key}.exam`) ? t(`${key}.exam`) : base.exam,
        full: t.has(`${key}.full`) ? t(`${key}.full`) : base.full,
        covers: t.has(`${key}.covers`) ? t(`${key}.covers`) : base.covers,
        duration: t.has(`${key}.duration`)
          ? t(`${key}.duration`)
          : base.duration,
      }
    },
    /** A short data phrase (a batch time, a course subtitle), else as is. */
    phrase(english: string) {
      return phrases.find((pair) => pair.en === english)?.as ?? english
    },
    teaches(slug: FacultySlug) {
      return t.has(`faculty.${slug}`)
        ? t(`faculty.${slug}`)
        : faculty.find((person) => person.slug === slug)!.teaches
    },
  }
}
