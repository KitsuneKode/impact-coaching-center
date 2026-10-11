import { IconAsterisk } from "@tabler/icons-react"

import { marqueeWords } from "../_content"

/** The one marquee: exams and ICT's own programmes, straight from Pulse. */
export function ExamMarquee() {
  return (
    <div
      aria-hidden
      className="overflow-hidden bg-[var(--pu-ink)] py-5 text-white"
    >
      <ul
        data-pf-track
        className="flex w-max items-center gap-8 font-[family-name:var(--pu-display)] text-lg font-semibold"
      >
        {[...marqueeWords, ...marqueeWords].map((w, i) => (
          <li key={`${w}-${i}`} className="flex items-center gap-8">
            {w}
            <IconAsterisk
              size={18}
              stroke={2}
              className="text-[var(--pu-amber)]"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
