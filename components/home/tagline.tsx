import { useTranslations } from "next-intl"
import type { CSSProperties } from "react"

/**
 * The promise in one large line, its words lighting in reading order as the
 * section scrolls through the window (CSS scroll-driven, app/pulse.css).
 * Where that is not supported, or with reduced motion, the line is simply
 * lit. The words are spans of one paragraph, so it reads as one sentence.
 */
export function Tagline() {
  const t = useTranslations("Pulse")
  const words = t("tagline").split(" ")
  return (
    <section
      aria-label={t("tagline")}
      className="container-page pbs-6 pbe-24 md:pbe-32"
    >
      <p
        data-tagline
        className="max-w-[24ch] font-display text-[clamp(2rem,1.2rem+3.6vw,4rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance"
      >
        {words.map((word, i) => (
          <span
            key={i}
            data-tagline-word
            style={{ "--i": i, "--n": words.length } as CSSProperties}
          >
            {word}{" "}
          </span>
        ))}
      </p>
    </section>
  )
}
