import { setRequestLocale } from "next-intl/server"

import { ExamMarquee } from "@/components/home/exam-marquee"
import { ExamStack } from "@/components/home/exam-stack"
import { Hero } from "@/components/home/hero"
import { LoopWatch } from "@/components/home/loop-watch"
import { Enquire } from "@/components/marketing/enquire"
import { Faq } from "@/components/marketing/faq"
import { Results } from "@/components/marketing/results"
import { StudentVoices } from "@/components/marketing/student-voices"
import { todayIst } from "@/lib/calendar"
import { newestBatch } from "@/lib/courses"
import { liveCourses } from "@/lib/courses-server"

/** The home page, Pulse: the pitch, the three exams, then proof and help. */
export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  setRequestLocale(locale)
  const courses = await liveCourses()
  return (
    <>
      <Hero newest={newestBatch(courses)} today={todayIst(Date.now())} />
      <ExamMarquee />
      <main>
        <ExamStack courses={courses} />
        <StudentVoices limit={5} />
        <Results />
        <Faq courses={courses} />
        <Enquire />
      </main>
      <LoopWatch />
    </>
  )
}
