import { getTranslations, setRequestLocale } from "next-intl/server"

import { Ask } from "@/components/home/ask"
import { Books } from "@/components/home/books"
import { ExamMarquee } from "@/components/home/exam-marquee"
import { ExamStack } from "@/components/home/exam-stack"
import { StudentVoices } from "@/components/marketing/student-voices"
import { Faq } from "@/components/home/faq"
import { FreeFirst } from "@/components/home/free-first"
import { Hero } from "@/components/home/hero"
import { JoinBand } from "@/components/home/join-band"
import { LoopWatch } from "@/components/home/loop-watch"
import { Results } from "@/components/home/results"
import { Teachers } from "@/components/home/teachers"
import { publishedBundles, publishedResources } from "@/lib/catalog-server"
import { newestBatch } from "@/lib/courses"
import { liveCourses, todayInIndia } from "@/lib/courses-server"

/* Catalogue data is cached for five minutes (lib/catalog-server.ts); the
   page is static and rebuilt in the background on the same beat. */
export const revalidate = 300

/** The home page, Pulse: the pitch, the three exams, proof, free, books, help. */
export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  setRequestLocale(locale)
  const pulse = await getTranslations("Pulse")
  const [courses, bundles, resources, today] = await Promise.all([
    liveCourses(),
    publishedBundles().catch(() => []),
    publishedResources().catch(() => []),
    todayInIndia(),
  ])
  return (
    <>
      <Hero newest={newestBatch(courses)} today={today} />
      <ExamMarquee />
      <main>
        <ExamStack courses={courses} />
        <StudentVoices limit={8} heading={pulse("voicesHeading")} />
        <FreeFirst resources={resources} courses={courses} />
        <Books bundles={bundles} />
        <Teachers />
        <Results />
        <Faq courses={courses} />
        <Ask />
        <JoinBand />
      </main>
      <LoopWatch />
    </>
  )
}
