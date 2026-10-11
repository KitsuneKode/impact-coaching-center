import Image from "next/image"
import type { CSSProperties } from "react"

import { reviews } from "../../_data"
import { Reveal } from "../../_reveal"
import { container, external, h2 } from "../_theme"

/**
 * Five students fanned out like a hand of cards — Rollcall's fan in Pulse's
 * colours. Each card is a YouTube Short from ICT's own channel.
 */
export function StudentFan() {
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
        {reviews.slice(0, 5).map((r, n) => {
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
              <a
                href={r.href}
                {...external}
                aria-label={`${r.name}, ${r.exam} ${r.batch}, on YouTube`}
                className="absolute inset-0 block"
              >
                <Image
                  src={r.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 600px, 440px"
                  className="object-cover"
                />
                <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(11,22,51,0.92))]" />
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span className="block text-lg leading-tight font-semibold">
                    {r.name}
                  </span>
                  <span className="text-sm text-[#C9D4EC]">
                    {r.exam}, {r.batch}
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
