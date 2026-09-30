import { IconArrowRight } from "@tabler/icons-react"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { GrandFooter } from "../_blocks/grand-footer"
import { offer, phone, tel, whatsapp } from "../_data"
import { KitShell } from "../_kit/shell"
import { external } from "../_kit/shared"
import { Classroom, Iso, Library } from "./_iso"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Diorama", template: "%s, Diorama" },
}

function Closing() {
  return (
    <div
      data-dm-closing
      className="grid items-center gap-10 px-7 py-14 sm:px-12 md:grid-cols-12"
    >
      <div className="md:col-span-7">
        <h2 data-k-h2 className="max-w-[14ch]">
          Sit in on a class before you pay.
        </h2>
        <p className="mt-4 max-w-[42ch] text-lg text-[#DBE9FE]">
          {offer.promise}
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href={whatsapp}
            {...external}
            data-k-press
            data-dm-light
            className="group inline-flex h-12 items-center gap-2 rounded-[10px] px-6 font-semibold whitespace-nowrap"
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
            className="inline-flex h-12 items-center px-2 font-semibold tabular-nums underline decoration-white/40 underline-offset-4"
          >
            Call {phone}
          </a>
        </div>
      </div>
      <div aria-hidden data-dm-model className="md:col-span-5">
        <Iso viewBox="-100 -84 296 252">
          <g>
            <Library x={0} y={0} />
            <Classroom x={11} y={0} />
          </g>
        </Iso>
      </div>
    </div>
  )
}

export default function DioramaLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      slug="diorama"
      theme="diorama"
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
