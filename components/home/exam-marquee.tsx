import { IconAsterisk } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

/** Exams and ICT's own programmes, running under the hero. Decorative. */
export function ExamMarquee() {
  const words = useTranslations("Pulse")("marquee").split("|")
  return (
    <div
      aria-hidden
      className="overflow-clip bg-foreground pbs-5 pbe-5 text-white"
    >
      <ul
        data-marquee-track
        className="flex w-max items-center gap-8 font-display text-lg font-semibold"
      >
        {[...words, ...words].map((word, i) => (
          <li key={`${word}-${i}`} className="flex items-center gap-8">
            {word}
            <IconAsterisk size={18} stroke={2} className="text-highlight" />
          </li>
        ))}
      </ul>
    </div>
  )
}
