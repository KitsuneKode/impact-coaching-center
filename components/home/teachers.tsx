import { IconArrowRight } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { Reveal } from "@/components/motion/reveal"
import { Link } from "@/i18n/navigation"
import { faculty } from "@/lib/brand"
import { TeacherCard } from "./teacher-card"

/** The teachers: tap a card to turn it over. */
export function Teachers() {
  const t = useTranslations("Pulse")
  return (
    <section
      id="teachers"
      aria-labelledby="teachers-heading"
      className="pbe-20 md:pbe-28"
    >
      <div className="container-page">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="teachers-heading" className="type-display max-w-[18ch]">
            {t("teachersHeading")}
          </h2>
          <Link
            href="/teachers"
            data-press
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-5 font-semibold"
          >
            {t("teachersAll")}
            <IconArrowRight data-nudge aria-hidden size={18} stroke={2} />
          </Link>
        </Reveal>
        <ul className="mbs-12 grid grid-cols-2 gap-4 md:grid-cols-5">
          {faculty.map((teacher) => (
            <TeacherCard key={teacher.slug} teacher={teacher} />
          ))}
        </ul>
      </div>
    </section>
  )
}
