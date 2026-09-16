import { IconPlayerPlayFilled } from "@tabler/icons-react"
import Image from "next/image"

import { Reveal } from "@/components/motion/reveal"
import { Lede, Section } from "@/components/ui/section"
import { VideoDialog } from "@/components/marketing/video-dialog"
import { studentReviews, thumb } from "@/lib/stories"

/**
 * ICT's own student review videos, with the name and batch they print on each
 * card. Real faces saying real things beat any quote we could typeset.
 *
 * The source thumbnails are 16:9 frames with a vertical video centred in them,
 * so the tiles are 3:4 and object-cover crops the blurred sides away.
 */
export function StudentVoices({
  limit,
  heading = "Students, in their own words.",
  lead = "Every one of these is a review ICT published on their channel, with the student's name and batch.",
}: {
  limit?: number
  heading?: string
  lead?: string
}) {
  const list = limit ? studentReviews.slice(0, limit) : studentReviews

  return (
    <Section id="students">
      <Reveal>
        <Lede label="Student voices" claim={heading} rest={lead} />
      </Reveal>

      <Reveal delay={0.08}>
        <ul className="-mx-5 mt-10 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-5">
          {list.map((student) => (
            <li
              key={student.id}
              className="w-[52vw] shrink-0 snap-start sm:w-[32vw] md:w-auto"
            >
              <VideoDialog
                id={student.id}
                title={`${student.name}, ${student.batch}`}
                subtitle={`Student review, ${student.exam}`}
                vertical
                className="w-full"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-surface ring-1 ring-border">
                  <Image
                    src={thumb(student.id)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 52vw, 20vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute right-2.5 bottom-2.5 grid size-9 place-items-center rounded-full bg-white/95 text-foreground shadow-frame transition-transform duration-300 group-hover:scale-105">
                    <IconPlayerPlayFilled className="size-3.5" />
                  </span>
                </div>
                <p className="mt-3 text-[0.9375rem] font-medium">
                  {student.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {student.batch}, {student.exam}
                </p>
              </VideoDialog>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
