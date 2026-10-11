import Image from "next/image"

import { phone, tel } from "../../_data"
import { HomeMenu } from "../../_kit/home-extras"
import { islandTokens } from "../../pulse/_island"
import { navItems } from "../_content"
import { container } from "../_theme"

/**
 * Pulse's header, in three tones: `blue` sits on the blue field, `overlay`
 * floats white over the photo wall, `paper` reads in ink on the light page.
 */
export function SiteHeader({ tone }: { tone: "blue" | "paper" | "overlay" }) {
  const light = tone !== "paper"
  return (
    <header
      data-pf-hdr={light ? "light" : undefined}
      className={`${container} relative z-10 flex h-[76px] items-center gap-8`}
    >
      <a href="#top" className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-white">
          <Image
            src="/brand/ict-mark.png"
            alt=""
            width={30}
            height={30}
            className="size-[30px]"
          />
        </span>
        <span className="hidden font-[family-name:var(--pu-display)] text-sm font-semibold sm:inline">
          Impact Career Tutorials
        </span>
      </a>
      <nav
        aria-label="Sections"
        className={`ml-auto hidden items-center gap-7 text-sm md:flex ${
          light ? "text-[var(--pu-on-blue)]" : "text-[var(--pu-muted)]"
        }`}
      >
        {navItems.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className={`transition-colors duration-150 ${
              light ? "hover:text-white" : "hover:text-[var(--pu-ink)]"
            }`}
          >
            {label}
          </a>
        ))}
      </nav>
      <a
        href={tel}
        className="ml-auto text-sm font-medium whitespace-nowrap tabular-nums md:ml-0"
      >
        {phone}
      </a>
      {/* The menu opens Pulse's sub-pages, which are the live ones. */}
      <HomeMenu slug="pulse" tokens={islandTokens} />
    </header>
  )
}
