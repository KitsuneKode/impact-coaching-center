import { IconArrowRight } from "@tabler/icons-react"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { GrandFooter } from "../_blocks/grand-footer"
import { offer, phone, tel, whatsapp } from "../_data"
import { KitShell } from "../_kit/shell"
import { external } from "../_kit/shared"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Rollcall", template: "%s, Rollcall" },
}

function Closing() {
  return (
    <div data-rc-panel data-rc-closing className="px-7 py-16 sm:px-12 md:py-24">
      <p data-rc-tag>Your first week</p>
      <h2 data-k-h2 className="mt-8 max-w-[14ch]">
        Sit in on a class. <span data-rc-dim>It&apos;s free.</span>
      </h2>
      <p className="mt-5 max-w-[42ch] text-lg">{offer.promise}</p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <a
          href={whatsapp}
          {...external}
          data-k-press
          data-k-btn
          className="group inline-flex h-12 items-center gap-2 px-6 whitespace-nowrap"
        >
          {offer.cta}
          <IconArrowRight
            aria-hidden
            size={17}
            stroke={2}
            className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          />
        </a>
        <a
          href={tel}
          data-k-press
          data-k-outline
          className="inline-flex h-12 items-center px-6 whitespace-nowrap"
        >
          Call {phone}
        </a>
      </div>
    </div>
  )
}

export default function RollcallLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      slug="rollcall"
      theme="rollcall"
      base={base}
      tokens={tokens}
      fontClass={fontClass}
      themeCss={themeCss}
      brand="Impact Career Tutorials"
      footer={<GrandFooter base={base} cta={<Closing />} />}
    >
      {children}
    </KitShell>
  )
}
