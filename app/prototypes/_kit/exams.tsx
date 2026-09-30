import { IconArrowRight } from "@tabler/icons-react"
import Link from "next/link"

import { courses, examGuides, rupees } from "../_data"
import { ExamGuide } from "../_exam-guide"
import { Reveal } from "../_reveal"
import { container, type KitProps } from "./shared"
import { PageHead } from "./head"

export function KitExams({ base }: KitProps) {
  return (
    <main>
      <PageHead
        base={base}
        trail={[{ label: "Exams" }]}
        title="Know the exam before you pick a batch."
        lede="How each exam is set, from the conducting body's own papers. Download the official syllabus and past papers from here."
      />

      <section aria-label="Exam guide" className={`${container} pb-20`}>
        <ExamGuide guides={examGuides} />
      </section>

      <section aria-labelledby="prep-h" className={`${container} pb-20`}>
        <Reveal>
          <h2 id="prep-h" data-k-h2 className="max-w-[20ch]">
            Where ICT prepares you for each.
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {courses.map((c, i) => (
            <li key={c.slug}>
              <Reveal delay={i * 0.05} className="h-full">
                <Link
                  href={`${base}/courses/${c.slug}`}
                  data-k-card
                  className="group flex h-full flex-col rounded-[var(--k-radius)] p-6"
                >
                  <span className="text-sm text-[var(--k-muted)]">
                    {c.full}
                  </span>
                  <span data-k-display className="mt-2 text-2xl font-light">
                    {c.name}
                  </span>
                  <span className="mt-2 text-[var(--k-muted)]">{c.covers}</span>
                  <span className="mt-auto flex items-center justify-between pt-8">
                    <span className="tabular-nums">
                      {c.price ? rupees(c.price) : "Ask us"}
                    </span>
                    <span
                      data-k-btn
                      className="grid size-11 place-items-center rounded-[var(--k-pill)] transition-transform duration-300 ease-out group-hover:translate-x-1"
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
