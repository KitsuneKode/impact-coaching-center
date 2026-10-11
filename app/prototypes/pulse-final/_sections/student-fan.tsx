import { IconPlayerPlayFilled } from "@tabler/icons-react"
import Image from "next/image"
import type { CSSProperties } from "react"

import { VideoDialog } from "@/components/marketing/video-dialog"
import { reviews } from "../../_data"
import { Reveal } from "../../_reveal"
import { container, h2 } from "../_theme"

/**
 * Five students fanned out like a hand of cards — Rollcall's fan in Pulse's
 * colours. Each card plays its YouTube Short in place, in a vertical dialog.
 */
export function StudentFan() {
  const list = reviews.slice(0, 5)
  return (
    <section
      id="voices"
      aria-labelledby="voices-h"
      className="overflow-x-clip pb-20 md:pb-28"
    >
      <div className={`${container} text-center`}>
        <Reveal>
          <h2 id="voices-h" className={`${h2} mx-auto max-w-[18ch]`}>
            Students, in their own words.
          </h2>
        </Reveal>
      </div>
      <ul data-pf-fan className="mt-10">
        {list.map((r, n) => {
          const i = n - 2
          return (
            <li
              key={r.id}
              data-pf-card
              style={
                {
                  "--i": i,
                  "--a": Math.abs(i),
                  "--z": 10 - Math.abs(i),
                } as CSSProperties
              }
            >
              <VideoDialog
                id={r.id}
                title={r.name}
                subtitle={`${r.exam}, ${r.batch}`}
                vertical
                className="absolute inset-0"
              >
                <Image
                  src={r.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 600px, 440px"
                  className="object-cover"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-12 place-items-center rounded-full bg-white text-[var(--pu-ink)] shadow-lg transition-transform duration-200 group-active:scale-95">
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
      <p
        className={`${container} mt-8 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-[var(--pu-muted)]`}
      >
        {list.map((r) => (
          <span key={r.id}>
            {r.name}, {r.exam}
          </span>
        ))}
      </p>
    </section>
  )
}
