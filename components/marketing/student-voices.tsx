import { IconPlayerPlayFilled } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { studentReviews, thumb } from "@/lib/stories"

/**
 * ICT's own student review videos, with the name and batch they print on each
 * card. A swipeable row on a phone, a grid once there is room.
 */
export function StudentVoices({
  limit,
  heading,
  lead,
}: {
  limit?: number
  heading?: string
  lead?: string
}) {
  const t = useTranslations("Voices")
  const list = limit ? studentReviews.slice(0, limit) : studentReviews

  return (
    <section
      id="voices"
      aria-labelledby="voices-heading"
      className="pbe-20 md:pbe-28"
    >
      <div className="container-page">
        <Reveal>
          <h2 id="voices-heading" className="type-display max-w-[18ch]">
            {heading ?? t("claim")}
          </h2>
          <p className="mbs-3 max-w-[52ch] text-lg text-muted-foreground">
            {lead ?? t("rest")}
          </p>
        </Reveal>
      </div>
      <ul data-voices className="mbs-10">
        {list.map((student) => (
          <li key={student.id}>
            <VideoDialog
              id={student.id}
              title={`${student.name}, ${student.batch}`}
              subtitle={t("subtitle", { exam: student.exam })}
              vertical
              className="group block w-full text-start"
            >
              <span className="relative block aspect-[3/4] overflow-clip rounded-[22px] bg-secondary">
                <Image
                  src={thumb(student.id)}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 58vw"
                  className="object-cover"
                />
                <span
                  data-play
                  className="absolute inset-e-3 inset-bs-3 grid size-10 place-items-center rounded-full bg-highlight text-foreground"
                >
                  <IconPlayerPlayFilled
                    aria-hidden
                    size={15}
                    className="translate-x-px"
                  />
                </span>
              </span>
              <span className="mbs-3 block font-semibold">{student.name}</span>
              <span className="block text-sm text-muted-foreground">
                {student.batch}, {student.exam}
              </span>
            </VideoDialog>
          </li>
        ))}
      </ul>
    </section>
  )
}
