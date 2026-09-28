import { setRequestLocale } from "next-intl/server"
import { Campus } from "@/components/marketing/campus"
import { Classes } from "@/components/marketing/classes"
import { Courses } from "@/components/marketing/courses"
import { Enquire } from "@/components/marketing/enquire"
import { Faq } from "@/components/marketing/faq"
import { Fees } from "@/components/marketing/fees"
import { Hero } from "@/components/marketing/hero"
import { Podcast } from "@/components/marketing/podcast"
import { Posters } from "@/components/marketing/posters"
import { ProofBar } from "@/components/marketing/proof-bar"
import { Results } from "@/components/marketing/results"
import { StudentVoices } from "@/components/marketing/student-voices"

/* The order follows the decision a visitor actually makes: */
export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <main id="top">
      <Hero />
      <ProofBar />
      <Results />
      <StudentVoices limit={5} />
      <Posters />
      <Courses />
      <Fees />
      <Campus />
      <Classes />
      <Podcast />
      <Faq />
      <Enquire />
    </main>
  )
}
