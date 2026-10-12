import { useTranslations } from "next-intl"

import { Reveal } from "@/components/motion/reveal"
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
        <Reveal>
          <h2 id="teachers-heading" className="type-display max-w-[18ch]">
            {t("teachersHeading")}
          </h2>
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
