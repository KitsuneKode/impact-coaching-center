import { IconArrowRight } from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"

import { courses, examGuides, rupees } from "../../_data"
import { ExamGuide } from "../../_exam-guide"
import { Reveal } from "../../_reveal"
import { base, container, PageHead } from "../_shared"

export const metadata: Metadata = { title: "Exams" }

export default function Exams() {
  return (
    <main>
      <PageHead
        trail={[{ label: "Exams" }]}
        title="Know the exam before you pick a batch."
        lede="How each exam is set, from the conducting body's own papers. Download the official syllabus and past papers from here."
      />

      <section aria-label="Exam guide" className={`${container} pb-20`}>
        <ExamGuide guides={examGuides} />
      </section>

      <section
        aria-labelledby="prep-h"
        className="bg-[var(--lv-navy)] py-20 text-white md:py-24"
      >
        <div className={container}>
          <Reveal>
            <h2 id="prep-h" data-lv-h2 className="max-w-[16ch]">
              Where ICT prepares you for each.
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-3 md:grid-cols-3">
            {courses.map((c, i) => (
              <li key={c.slug}>
                <Reveal delay={i * 0.05} className="h-full">
                  <Link
                    href={`${base}/courses/${c.slug}`}
                    data-lv-row
                    className="group flex h-full flex-col rounded-[14px] bg-[var(--lv-navy-2)] p-6"
                  >
                    <span className="text-sm text-[var(--lv-on-navy)]">
                      {c.full}
                    </span>
                    <span data-lv-display className="mt-2 text-4xl">
                      {c.name}
                    </span>
                    <span className="mt-2 text-[var(--lv-on-navy)]">
                      {c.covers}
                    </span>
                    <span className="mt-auto flex items-center justify-between pt-8">
                      <span
                        data-lv-display
                        className="text-2xl text-[var(--lv-orange)] tabular-nums"
                      >
                        {c.price ? rupees(c.price) : "Ask us"}
                      </span>
                      <IconArrowRight
                        aria-hidden
                        size={22}
                        stroke={2.25}
                        className="transition-transform duration-200 ease-out group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
