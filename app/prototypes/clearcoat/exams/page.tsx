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

      <section aria-labelledby="prep-h" className={`${container} pb-20`}>
        <Reveal>
          <h2 id="prep-h" data-cc-h2 className="max-w-[20ch]">
            Where ICT prepares you for each.
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {courses.map((c, i) => (
            <li key={c.slug}>
              <Reveal delay={i * 0.05} className="h-full">
                <Link
                  href={`${base}/courses/${c.slug}`}
                  data-coat
                  data-cc-panel
                  className="group flex h-full flex-col rounded-[28px] p-6"
                >
                  <span className="text-sm text-[var(--cc-muted)]">
                    {c.full}
                  </span>
                  <span data-cc-display className="mt-2 text-2xl font-light">
                    {c.name}
                  </span>
                  <span className="mt-2 text-[var(--cc-muted)]">
                    {c.covers}
                  </span>
                  <span className="mt-auto flex items-center justify-between pt-8">
                    <span className="tabular-nums">
                      {c.price ? rupees(c.price) : "Ask us"}
                    </span>
                    <span
                      data-cc-btn
                      className="grid size-11 place-items-center rounded-full transition-transform duration-300 ease-out group-hover:translate-x-1"
                    >
                      <IconArrowRight aria-hidden size={18} stroke={2} />
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
