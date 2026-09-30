import { IconArrowRight } from "@tabler/icons-react"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { GrandFooter } from "../_blocks/grand-footer"
import { offer, phone, tel, whatsapp } from "../_data"
import { KitShell } from "../_kit/shell"
import { external } from "../_kit/shared"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Alloy", template: "%s, Alloy" },
}

function Closing() {
  return (
    <div data-al-closing className="px-6 py-20 text-center sm:px-12 md:py-28">
      <h2 data-k-h2 className="mx-auto max-w-[14ch]">
        Try a class. Then decide.
      </h2>
      <p className="mx-auto mt-5 max-w-[40ch] text-lg text-[#BED4EB]">
        {offer.promise}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <a
          href={whatsapp}
          {...external}
          data-k-press
          data-al-champ-btn
          className="group inline-flex h-12 items-center gap-2 rounded-full px-7 font-semibold whitespace-nowrap"
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
          className="inline-flex h-12 items-center rounded-full px-6 font-medium text-[#F2F4F7] shadow-[inset_0_0_0_1px_rgba(242,244,247,0.3)]"
        >
          Call {phone}
        </a>
      </div>
    </div>
  )
}

export default function AlloyLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      slug="alloy"
      theme="alloy"
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
