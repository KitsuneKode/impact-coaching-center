import { IconPlayerPlayFilled } from "@tabler/icons-react"
import Image from "next/image"

import { faculty } from "../../_data"
import { Reveal } from "../../_reveal"
import { container, external, h2 } from "../_theme"

/** Teachers: flip a card for their note and a class to watch. */
export function Teachers() {
  return (
    <section
      id="teachers"
      aria-labelledby="teachers-h"
      className="pb-20 md:pb-28"
    >
      <div className={container}>
        <Reveal>
          <h2 id="teachers-h" className={`${h2} max-w-[18ch]`}>
            Turn a card over to meet a teacher.
          </h2>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5">
          {faculty.map((f) => (
            <li key={f.slug} data-flip>
              <div data-flip-inner>
                <div
                  data-flip-face
                  className="overflow-hidden rounded-[24px] bg-[var(--pu-blue)]"
                >
                  <span className="relative block aspect-[4/5]">
                    <Image
                      src={f.portrait}
                      alt={`${f.name}, ${f.teaches}`}
                      fill
                      sizes="(min-width: 768px) 230px, 50vw"
                      className="object-cover object-top"
                    />
                  </span>
                  <span className="block bg-[var(--pu-card)] p-4">
                    <span className="block font-semibold">{f.name}</span>
                    <span className="block truncate text-sm text-[var(--pu-muted)]">
                      {f.teaches}
                    </span>
                  </span>
                </div>
                <div
                  data-flip-face
                  data-flip-back
                  className="flex flex-col rounded-[24px] bg-[var(--pu-ink)] p-5 text-white"
                >
                  <span className="text-sm text-[#AEB9D3]">{f.called}</span>
                  <span className="mt-1 font-[family-name:var(--pu-display)] text-lg leading-tight font-semibold">
                    {f.name}
                  </span>
                  <span className="mt-3 text-sm text-[#D5DCEB]">{f.note}</span>
                  <a
                    href={`https://www.youtube.com/watch?v=${f.lecture}`}
                    {...external}
                    className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--pu-amber)] text-sm font-semibold text-[var(--pu-ink)]"
                  >
                    <IconPlayerPlayFilled aria-hidden size={14} />
                    Watch a class
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
