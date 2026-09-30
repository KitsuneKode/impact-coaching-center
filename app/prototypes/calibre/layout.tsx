import { IconArrowRight } from "@tabler/icons-react"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { GrandFooter } from "../_blocks/grand-footer"
import { offer, phone, tel, whatsapp } from "../_data"
import { KitShell } from "../_kit/shell"
import { external } from "../_kit/shared"
import { LightSource } from "./_client"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Calibre", template: "%s, Calibre" },
}

function Closing() {
  return (
    <div data-cb-closing className="px-6 py-20 text-center sm:px-12 md:py-28">
      <p data-cb-label>Your first week</p>
      <h2 data-k-h2 className="mx-auto mt-6 max-w-[16ch]">
        Sit in on a class, <span data-cb-gilt>free.</span>
      </h2>
      <p className="mx-auto mt-5 max-w-[46ch] text-[var(--k-muted)]">
        {offer.promise}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <a
          href={whatsapp}
          {...external}
          data-k-press
          data-k-btn
          className="group inline-flex h-12 items-center gap-2 px-7 whitespace-nowrap"
        >
          {offer.cta}
          <IconArrowRight
            aria-hidden
            size={18}
            stroke={2}
            className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          />
        </a>
        <a
          href={tel}
          data-k-press
          data-k-outline
          className="inline-flex h-12 items-center px-6 tabular-nums"
        >
          Call {phone}
        </a>
      </div>
    </div>
  )
}

export default function CalibreLayout({ children }: { children: ReactNode }) {
  return (
    <LightSource>
      <KitShell
        slug="calibre"
        theme="calibre"
        base={base}
        tokens={tokens}
        fontClass={fontClass}
        themeCss={themeCss}
        brand="Impact Career Tutorials"
        footer={<GrandFooter base={base} cta={<Closing />} />}
      >
        {children}
      </KitShell>
    </LightSource>
  )
}
