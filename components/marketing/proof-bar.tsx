import { IconArrowUpRight } from "@tabler/icons-react"

import { AnimatedNumber } from "@/components/motion-primitives/animated-number"
import { proof } from "@/lib/brand"

/**
 * Directly under the hero, never inside it. Every number links to the public
 * page where a parent can check it, and counts up once as it arrives, which
 * pulls the eye to the four facts that carry the most trust.
 */
export function ProofBar() {
  return (
    <section aria-label="Numbers you can check" className="border-y border-border">
      <div className="container-page">
        <ul className="grid grid-cols-2 lg:grid-cols-4">
          {proof.map((item, index) => (
            <li
              key={item.label}
              className={
                "border-border " +
                (index % 2 === 1 ? "border-l " : "") +
                (index >= 2 ? "border-t lg:border-t-0 " : "") +
                (index === 2 ? "lg:border-l" : "")
              }
            >
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex h-full flex-col px-4 py-7 md:px-7 md:py-9 lg:first:pl-0"
              >
                <span className="text-[2rem] leading-none font-medium tracking-[-0.03em] md:text-[2.5rem]">
                  <AnimatedNumber
                    value={item.value}
                    compact={item.value >= 10000}
                    suffix={item.display.endsWith("+") ? "+" : ""}
                  />
                </span>
                <span className="mt-3 inline-flex items-start gap-1 text-sm leading-snug text-muted-foreground transition-colors group-hover:text-foreground">
                  {item.label}
                  <IconArrowUpRight
                    size={14}
                    stroke={1.75}
                    aria-hidden
                    className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
