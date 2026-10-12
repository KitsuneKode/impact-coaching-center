import { IconPlayerPlayFilled } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import type { CSSProperties } from "react"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { Reveal } from "@/components/motion/reveal"
import { studentReviews, thumb } from "@/lib/stories"

/** Five students fanned out like a hand of cards; each plays its Short in place. */
export function StudentFan() {
  const t = useTranslations("Pulse")
  const list = studentReviews.slice(0, 5)
  return (
    <section
      id="voices"
      aria-labelledby="voices-heading"
      className="overflow-x-clip pbe-20 md:pbe-28"
    >
      <div className="container-page text-center">
        <Reveal>
          <h2 id="voices-heading" className="type-display mx-auto max-w-[18ch]">
            {t("voicesHeading")}
          </h2>
        </Reveal>
      </div>
      <ul data-fan className="mbs-10">
        {list.map((review, n) => {
          const i = n - 2
          return (
            <li
              key={review.id}
              data-fan-card
              style={
                {
                  "--i": i,
                  "--a": Math.abs(i),
                  "--z": 10 - Math.abs(i),
                } as CSSProperties
              }
            >
              <VideoDialog
                id={review.id}
                title={review.name}
                subtitle={`${review.exam}, ${review.batch}`}
                vertical
                className="absolute inset-0"
              >
                <Image
                  src={thumb(review.id)}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 600px, 440px"
                  className="object-cover"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span
                    aria-hidden
                    className="grid size-12 place-items-center rounded-full bg-white text-foreground shadow-lift"
                  >
                    <IconPlayerPlayFilled
                      aria-hidden
                      size={18}
                      className="translate-x-px"
                    />
                  </span>
                </span>
              </VideoDialog>
            </li>
          )
        })}
      </ul>
      <p className="container-page mbs-8 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
        {list.map((review) => (
          <span key={review.id}>
            {review.name}, {review.exam}
          </span>
        ))}
      </p>
    </section>
  )
}
